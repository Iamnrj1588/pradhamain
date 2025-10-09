from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

# Pydantic Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # Women or Men
    subcategory: str  # Lehenga, Blouse, Dresses, Khadi, Kurta, T-Shirt
    description: str
    price: float
    sizes: List[str]
    colors: List[str]
    images: List[str]
    customizable: bool = True
    featured: bool = False
    new_arrival: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    category: str
    subcategory: str
    description: str
    price: float
    sizes: List[str]
    colors: List[str]
    images: List[str] = []
    customizable: bool = True
    featured: bool = False
    new_arrival: bool = False

class CartItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_id: str
    quantity: int
    size: str
    color: str
    customization_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = 1
    size: str
    color: str
    customization_notes: Optional[str] = None

class Inquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    product_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InquiryCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    product_id: Optional[str] = None

# Helper Functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

# Auth Routes
@api_router.post("/auth/signup", response_model=Token)
async def signup(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone
    )
    
    user_dict = user.model_dump()
    user_dict['password_hash'] = get_password_hash(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(login_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    user_obj = User(**user)
    access_token = create_access_token(data={"sub": user_obj.id})
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Product Routes
@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    featured: Optional[bool] = None,
    new_arrival: Optional[bool] = None
):
    query = {}
    if category:
        query['category'] = category
    if subcategory:
        query['subcategory'] = subcategory
    if featured is not None:
        query['featured'] = featured
    if new_arrival is not None:
        query['new_arrival'] = new_arrival
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return Product(**product)

# Admin Product Routes
@api_router.post("/admin/products", response_model=Product)
async def create_product(product_data: ProductCreate):
    product = Product(**product_data.model_dump())
    product_dict = product.model_dump()
    product_dict['created_at'] = product_dict['created_at'].isoformat()
    await db.products.insert_one(product_dict)
    return product

@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate):
    existing_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_data.model_dump()
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated_product.get('created_at'), str):
        updated_product['created_at'] = datetime.fromisoformat(updated_product['created_at'])
    return Product(**updated_product)

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@api_router.post("/admin/upload-image")
async def upload_image(file: UploadFile = File(...)):
    # Read file content
    content = await file.read()
    # Convert to base64
    base64_image = base64.b64encode(content).decode('utf-8')
    # Return data URL
    image_url = f"data:{file.content_type};base64,{base64_image}"
    return {"url": image_url}

# Cart Routes
@api_router.get("/cart")
async def get_cart(current_user: User = Depends(get_current_user)):
    cart_items = await db.cart_items.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    
    # Get product details for each cart item
    enriched_items = []
    for item in cart_items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
        product = await db.products.find_one({"id": item['product_id']}, {"_id": 0})
        if product:
            enriched_items.append({
                **item,
                "product": product
            })
    
    return enriched_items

@api_router.post("/cart", response_model=CartItem)
async def add_to_cart(cart_data: CartItemCreate, current_user: User = Depends(get_current_user)):
    # Check if product exists
    product = await db.products.find_one({"id": cart_data.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    existing_item = await db.cart_items.find_one({
        "user_id": current_user.id,
        "product_id": cart_data.product_id,
        "size": cart_data.size,
        "color": cart_data.color
    }, {"_id": 0})
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item['quantity'] + cart_data.quantity
        await db.cart_items.update_one(
            {"id": existing_item['id']},
            {"$set": {"quantity": new_quantity}}
        )
        existing_item['quantity'] = new_quantity
        if isinstance(existing_item.get('created_at'), str):
            existing_item['created_at'] = datetime.fromisoformat(existing_item['created_at'])
        return CartItem(**existing_item)
    
    # Create new cart item
    cart_item = CartItem(
        user_id=current_user.id,
        **cart_data.model_dump()
    )
    cart_dict = cart_item.model_dump()
    cart_dict['created_at'] = cart_dict['created_at'].isoformat()
    await db.cart_items.insert_one(cart_dict)
    return cart_item

@api_router.put("/cart/{cart_item_id}")
async def update_cart_item(
    cart_item_id: str,
    quantity: int,
    current_user: User = Depends(get_current_user)
):
    result = await db.cart_items.update_one(
        {"id": cart_item_id, "user_id": current_user.id},
        {"$set": {"quantity": quantity}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Cart updated successfully"}

@api_router.delete("/cart/{cart_item_id}")
async def remove_from_cart(cart_item_id: str, current_user: User = Depends(get_current_user)):
    result = await db.cart_items.delete_one({"id": cart_item_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Item removed from cart"}

# Inquiry Routes
@api_router.post("/inquiries", response_model=Inquiry)
async def create_inquiry(inquiry_data: InquiryCreate):
    inquiry = Inquiry(**inquiry_data.model_dump())
    inquiry_dict = inquiry.model_dump()
    inquiry_dict['created_at'] = inquiry_dict['created_at'].isoformat()
    await db.inquiries.insert_one(inquiry_dict)
    return inquiry

@api_router.get("/admin/inquiries", response_model=List[Inquiry])
async def get_inquiries():
    inquiries = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for inquiry in inquiries:
        if isinstance(inquiry.get('created_at'), str):
            inquiry['created_at'] = datetime.fromisoformat(inquiry['created_at'])
    return inquiries

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()