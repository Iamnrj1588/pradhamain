import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ShoppingCart, Heart, User, Menu, X, Plus, Minus, Trash2, Upload, Star } from 'lucide-react';
import '@/App.css';

import Register from './components/ui/register';
import VerifyEmail from './components/ui/verifyEmail';
import Login from './components/ui/login';
import ForgotPassword from './components/ui/forgotPassword';
import RentalDresses from './components/ui/RentalDresses';
import AdminRentalDashboard from './components/ui/AdminRentalDashboard';
import Checkout from './components/ui/Checkout';
import Orders from './components/ui/Orders';
import Cart from './components/ui/Cart';
import Developer from './components/ui/Developer';
import CustomerFeedback from './components/ui/CustomerFeedback';
import CustomerReviews from './components/ui/CustomerReviews';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081';
const API = `${BACKEND_URL}/api`;

// Add axios interceptor to ensure token is always sent
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Sending request with token:', token.substring(0, 20) + '...');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AuthContext = createContext(null);

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token && !user) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    }
  };

  const login = (tokenVal, userData) => {
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenVal);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenVal}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth };

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const response = await axios.get(`${API}/cart`);
      setCartCount(Array.isArray(response.data) ? response.data.length : 0);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#8B1538]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Pradha Fashion Outlet" 
              className="h-12 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="flex items-center space-x-2" style={{display: 'none'}}>
              <span className="text-2xl font-bold text-[#8B1538]">Pradha</span>
              <span className="text-lg text-gray-600">Fashion Outlet</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/products" className="nav-link">Collections</Link>
            <Link to="/rentals" className="nav-link">Rentals</Link>
            <Link to="/reviews" className="nav-link">Reviews</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            {user && user.role === 'ADMIN' && <Link to="/admin" className="nav-link">Admin</Link>}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/cart')}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                  data-testid="cart-icon-btn"
                >
                  <ShoppingCart className="w-5 h-5 text-[#8B1538]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#DAA520] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <User className="w-5 h-5 text-[#8B1538]" />
                </button>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="text-[#8B1538]"
                  data-testid="logout-btn"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="bg-[#8B1538] hover:bg-[#6B0F2A] text-white"
                data-testid="login-btn"
              >
                Login
              </Button>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link to="/" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/products" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Collections</Link>
            <Link to="/rentals" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Rentals</Link>
            <Link to="/reviews" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Reviews</Link>
            <Link to="/about" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            {user && user.role === 'ADMIN' && <Link to="/admin" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Admin</Link>}
            {user ? (
              <>
                <Link to="/cart" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Cart ({cartCount})</Link>
                <button onClick={logout} className="block nav-link text-left w-full">Logout</button>
              </>
            ) : (
              <Link to="/login" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [currentHero, setCurrentHero] = useState(0);
  const [heroPages, setHeroPages] = useState([]);

  const defaultHeroPages = [
    {
      title: "Pradha Fashion Outlet",
      subtitle: "Where Tradition Meets Elegance",
      image: "https://images.unsplash.com/photo-1756483510837-e79455e52188?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0cmFkaXRpb25hbCUyMGZhc2hpb258ZW58MHx8fHwxNzYwMDIyODcxfDA&ixlib=rb-4.1.0&q=85"
    }
  ];

  useEffect(() => {
    fetchFeaturedProducts();
    fetchNewArrivals();
    fetchHeroContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHeroContent = async () => {
    try {
      const response = await axios.get(`${API}/hero-content`);
      setHeroPages(Array.isArray(response.data) && response.data.length > 0 ? response.data : defaultHeroPages);
    } catch (error) {
      setHeroPages(defaultHeroPages);
    }
  };

  useEffect(() => {
    if (heroPages.length > 0) {
      const interval = setInterval(() => {
        setCurrentHero((prev) => (prev + 1) % heroPages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [heroPages.length]);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API}/products?featured=true`);
      setFeaturedProducts(Array.isArray(response.data) ? response.data.slice(0, 4) : []);
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    }
  };

  const fetchNewArrivals = async () => {
    try {
      const response = await axios.get(`${API}/products?new_arrival=true`);
      setNewArrivals(Array.isArray(response.data) ? response.data.slice(0, 4) : []);
    } catch (error) {
      console.error('Failed to fetch new arrivals:', error);
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section relative overflow-hidden">
        {/* Background Images with Fade Animation */}
        {(heroPages.length > 0 ? heroPages : defaultHeroPages).map((page, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-fixed transition-opacity duration-1000 ${
              index === currentHero ? 'opacity-100' : 'opacity-0'
            }`}
            style={{backgroundImage: `url(${page.image})`}}
          />
        ))}
        
        <div className="hero-overlay relative z-10">
          <div className="hero-content">
            <h1 className="hero-title animate-fade-in">{heroPages[currentHero]?.title || defaultHeroPages[0].title}</h1>
            <p className="hero-subtitle animate-fade-in-delay">{heroPages[currentHero]?.subtitle || defaultHeroPages[0].subtitle}</p>
            <div className="flex gap-4 justify-center mt-8">
              <Button
                onClick={() => navigate('/products')}
                className="hero-btn"
                data-testid="shop-now-btn"
              >
                Shop Now
              </Button>
              <Button
                onClick={() => navigate('/contact')}
                variant="outline"
                className="hero-btn-outline"
                data-testid="customize-btn"
              >
                Customize Your Outfit
              </Button>
            </div>
            <div className="flex justify-center mt-6 space-x-2">
              {(heroPages.length > 0 ? heroPages : defaultHeroPages).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentHero(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                    index === currentHero ? 'bg-white scale-110' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="section-container">
          <h2 className="section-title">Featured Products</h2>
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="section-container bg-[#F5F5DC]/20">
          <h2 className="section-title">New Arrivals</h2>
          <div className="product-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="section-container">
        <h2 className="section-title">Our Collections</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div
            className="collection-card women-collection"
            onClick={() => navigate('/products?category=Women')}
          >
            <div className="collection-overlay">
              <h3 className="collection-title">Women's Collection</h3>
              <p className="collection-subtitle">Lehenga • Blouses • Dresses</p>
            </div>
          </div>
          <div
            className="collection-card men-collection"
            onClick={() => navigate('/products?category=Men')}
          >
            <div className="collection-overlay">
              <h3 className="collection-title">Men's Collection</h3>
              <p className="collection-subtitle">Khadi • Kurta • T-Shirts</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
// Unified Product Image Component
const ProductImage = ({ src, alt, className = "", showHover = false, badges = [] }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className={`relative overflow-hidden bg-[#F5F5DC] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!imageError ? (
        <img
          src={src || 'https://via.placeholder.com/400x400/F5F5DC/8B1538?text=No+Image'}
          alt={alt}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            showHover && isHovered ? 'scale-105' : ''
          }`}
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[#8B1538] bg-[#F5F5DC]">
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">No Image</div>
          </div>
        </div>
      )}
      {badges.map((badge, index) => (
        <Badge key={index} className={badge.className}>
          {badge.text}
        </Badge>
      ))}
    </div>
  );
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const badges = [];
  if (product.new_arrival) {
    badges.push({ text: 'New', className: 'absolute top-2 left-2 bg-[#DAA520] hover:bg-[#B8860B]' });
  }
  if (product.featured) {
    badges.push({ text: 'Featured', className: 'absolute top-2 right-2 bg-[#8B1538] hover:bg-[#6B0F2A]' });
  }

  return (
    <Card
      className="product-card cursor-pointer"
      onClick={() => navigate(`/products/${product.id}`)}
      data-testid={`product-card-${product.id}`}
    >
      <ProductImage
        src={product.images?.[0] || product.imageUrls?.[0]}
        alt={product.name}
        className="h-80"
        showHover={true}
        badges={badges}
      />
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <CardDescription>{product.subcategory}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <span className="text-xl font-bold text-[#8B1538]">₹{product.price}</span>
        {product.customizable && (
          <Badge variant="outline" className="text-[#DAA520] border-[#DAA520]">
            Customizable
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [subcategory, setSubcategory] = useState('All');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, category, subcategory]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    }
  };

  const filterProducts = () => {
    let filtered = products;
    if (category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (subcategory !== 'All') {
      filtered = filtered.filter(p => p.subcategory === subcategory);
    }
    setFilteredProducts(filtered);
  };

  const subcategories = category === 'Women'
    ? ['All', 'Lehenga', 'Blouse', 'Dresses']
    : category === 'Men'
    ? ['All', 'Khadi', 'Kurta', 'T-Shirt']
    : ['All'];

  return (
    <div className="page-container">
      <h1 className="page-title">Our Collections</h1>

      <div className="filters-container">
        <div className="filter-group">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="category-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Women">Women</SelectItem>
              <SelectItem value="Men">Men</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="filter-group">
          <Label>Subcategory</Label>
          <Select value={subcategory} onValueChange={setSubcategory}>
            <SelectTrigger data-testid="subcategory-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map(sub => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="product-grid">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      )}
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customizationNotes, setCustomizationNotes] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
      if (response.data.sizes.length > 0) setSelectedSize(response.data.sizes[0]);
      if (response.data.colors.length > 0) setSelectedColor(response.data.colors[0]);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Product not found');
      navigate('/products');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${API}/cart`, {
        product_id: product.id,
        quantity,
        size: selectedSize,
        color: selectedColor,
        customization_notes: customizationNotes || null
      });
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (!product) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <div className="space-y-4">
          <ProductImage
            src={product.images?.[0] || product.imageUrls?.[0]}
            alt={product.name}
            className="h-[600px] rounded-2xl shadow-lg"
          />
          {(product.images?.length > 1 || product.imageUrls?.length > 1) && (
            <div className="grid grid-cols-4 gap-2">
              {(product.images || product.imageUrls)?.slice(1, 5).map((img, idx) => (
                <ProductImage
                  key={idx}
                  src={img}
                  alt={`${product.name} ${idx + 2}`}
                  className="h-24 rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <Badge className="mb-2">{product.category}</Badge>
            <h1 className="text-4xl font-bold text-[#8B1538] mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-[#DAA520]">₹{product.price}</p>
          </div>

          <p className="text-gray-600">{product.description}</p>

          {user ? (
            <>
              <div className="space-y-4">
                <div>
                  <Label>Size</Label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger data-testid="size-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Color</Label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger data-testid="color-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {product.colors.map(color => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Quantity</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      data-testid="decrease-quantity-btn"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      data-testid="increase-quantity-btn"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {product.customizable && (
                  <div>
                    <Label>Customization Notes (Optional)</Label>
                    <Textarea
                      placeholder="Any specific stitching requirements or design preferences..."
                      value={customizationNotes}
                      onChange={(e) => setCustomizationNotes(e.target.value)}
                      className="mt-2"
                      data-testid="customization-notes"
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full bg-[#8B1538] hover:bg-[#6B0F2A] text-white py-6 text-lg"
                data-testid="add-to-cart-btn"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">Please login to customize and purchase this item</p>
              <Button
                onClick={() => navigate('/login')}
                className="bg-[#8B1538] hover:bg-[#6B0F2A] text-white"
              >
                Login to Shop
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API}/cart`);
      setCartItems(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(`${API}/cart/${itemId}?quantity=${newQuantity}`);
      fetchCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`${API}/cart/${itemId}`);
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    }
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <Button onClick={() => navigate('/products')} className="bg-[#8B1538] hover:bg-[#6B0F2A]">
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} data-testid={`cart-item-${item.id}`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <ProductImage
                      src={item.product?.images?.[0] || item.product?.imageUrls?.[0]}
                      alt={item.product?.name}
                      className="w-24 h-24 rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.product?.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Size: {item.size} | Color: {item.color}
                      </p>
                      {item.customization_notes && (
                        <p className="text-sm text-gray-500 italic">Notes: {item.customization_notes}</p>
                      )}
                      <p className="text-lg font-bold text-[#8B1538] mt-2">₹{item.product?.price}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        data-testid={`remove-item-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{total}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Items:</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold text-[#8B1538]">
                    <span>Total:</span>
                    <span>₹{total}</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-[#DAA520] hover:bg-[#B8860B] text-white py-6 text-lg"
                  onClick={() => navigate('/checkout')}
                  data-testid="checkout-btn"
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

const AboutPage = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">About Pradha Fashion Outlet</h1>
      <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          Welcome to <span className="font-semibold text-[#8B1538]">Pradha Fashion Outlet</span>, where tradition meets elegance.
          We are a premier boutique dedicated to providing exquisite traditional and modern fashion wear for both women and men.
        </p>
        <p>
          Our boutique specializes in customization, ensuring that every piece of clothing reflects your unique style and personality.
          Whether you're looking for a stunning lehenga for a wedding, a perfectly tailored blouse, or elegant ethnic wear for men,
          we have you covered.
        </p>
        <h2 className="text-2xl font-semibold text-[#8B1538] mt-8 mb-4">Our Mission</h2>
        <p>
          At Pradha Fashion Outlet, our mission is to blend traditional Indian craftsmanship with contemporary fashion sensibilities.
          We believe that every garment tells a story, and we're here to help you tell yours with elegance and grace.
        </p>
        <h2 className="text-2xl font-semibold text-[#8B1538] mt-8 mb-4">What We Offer</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-[#F5F5DC]/30 rounded-lg">
            <h3 className="font-semibold text-xl mb-2 text-[#8B1538]">Women's Collection</h3>
            <ul className="space-y-2 text-sm">
              <li>• Lehenga for festivals and weddings with customization</li>
              <li>• Designer blouses tailored to your requirements</li>
              <li>• One-piece and three-piece dresses</li>
              <li>• Traditional and contemporary ethnic wear</li>
            </ul>
          </div>
          <div className="p-6 bg-[#F5DEB3]/30 rounded-lg">
            <h3 className="font-semibold text-xl mb-2 text-[#8B1538]">Men's Collection</h3>
            <ul className="space-y-2 text-sm">
              <li>• Premium Khadi wear collection</li>
              <li>• Traditional kurtas for all occasions</li>
              <li>• Modern printed t-shirts</li>
              <li>• Ethnic and casual outfits</li>
            </ul>
          </div>
        </div>
        <p className="text-center italic mt-8 text-[#8B1538]">
          "Your satisfaction is our success. Let us help you look your best!"
        </p>
      </div>
    </div>
  );
};

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/inquiries`, formData);
      toast.success('Thank you! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      toast.error('Failed to submit inquiry');
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Contact Us</h1>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>
              Have a question or want to discuss customization? Send us a message!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="contact-name-input"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="contact-email-input"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="contact-phone-input"
                />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  data-testid="contact-message-input"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#8B1538] hover:bg-[#6B0F2A] text-white"
                data-testid="contact-submit-btn"
              >
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-4">
          <h3 className="text-xl font-semibold text-[#8B1538]">Connect With Us</h3>
          <div className="flex justify-center space-x-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              Facebook
            </a>
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="social-icon">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminFeedbackManager = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get(`${API}/feedback`);
      setFeedbacks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await axios.delete(`${API}/feedback/${feedbackId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Review deleted successfully');
      fetchFeedbacks();
    } catch (error) {
      console.error('Failed to delete feedback:', error);
      toast.error('Failed to delete review');
    }
  };

  const StarDisplay = ({ rating }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Reviews Management</h2>
        <div className="text-sm text-gray-600">
          Total Reviews: {feedbacks.length}
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No customer reviews yet
        </div>
      ) : (
        <div className="grid gap-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{feedback.name}</h3>
                    <StarDisplay rating={feedback.rating} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{feedback.email}</p>
                  <p className="text-gray-700 mb-3">{feedback.comment}</p>
                  
                  {feedback.imageUrls && feedback.imageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {feedback.imageUrls.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`Review ${index}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString()} at {new Date(feedback.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteFeedback(feedback.id)}
                  className="ml-4"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const HeroContentManager = () => {
  const [heroSlides, setHeroSlides] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({ title: '', subtitle: '', image: '' });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchHeroSlides();
  }, []);

  const fetchHeroSlides = async () => {
    try {
      const response = await axios.get(`${API}/hero-content`);
      setHeroSlides(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch hero slides:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const slideData = {
        title: formData.title,
        subtitle: formData.subtitle,
        image: formData.image || 'https://images.unsplash.com/photo-1756483510837-e79455e52188?w=1200'
      };
      
      if (editingSlide) {
        await axios.put(`${API}/admin/hero-content/${editingSlide.id}`, slideData);
      } else {
        await axios.post(`${API}/admin/hero-content`, slideData);
      }
      
      fetchHeroSlides();
      setFormData({ title: '', subtitle: '', image: '' });
      setImageFile(null);
      setShowForm(false);
      setEditingSlide(null);
    } catch (error) {
      console.error('Failed to save hero slide:', error);
      alert('Error saving hero slide. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hero slide?')) return;
    try {
      await axios.delete(`${API}/admin/hero-content/${id}`);
      fetchHeroSlides();
    } catch (error) {
      console.error('Failed to delete hero slide:', error);
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({ title: slide.title, subtitle: slide.subtitle, image: slide.image });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hero Content Management</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#8B1538] hover:bg-[#6B0F2A]">
          <Plus className="w-4 h-4 mr-2" />
          Add Hero Slide
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  required
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>
              <div>
                <Label>Hero Image</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const uploadFormData = new FormData();
                        uploadFormData.append('images', file);
                        try {
                          const response = await axios.post(`${API}/admin/hero-content/upload`, uploadFormData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          setFormData({ ...formData, image: response.data.imageUrl });
                        } catch (error) {
                          console.error('Upload failed:', error);
                          alert('Image upload failed. Please try again.');
                        }
                      }
                    }}
                  />
                  <div className="text-xs text-gray-500">
                    Or use sample URLs:
                    <button type="button" className="block text-blue-600 hover:underline" onClick={() => setFormData({ ...formData, image: 'https://images.unsplash.com/photo-1756483510837-e79455e52188?w=1200' })}>Traditional Fashion</button>
                    <button type="button" className="block text-blue-600 hover:underline" onClick={() => setFormData({ ...formData, image: 'https://images.unsplash.com/photo-1711130388758-2ccf44bb735c?w=1200' })}>Lehenga Collection</button>
                  </div>
                </div>
                {formData.image && <img src={formData.image} alt="Preview" className="w-full h-32 object-cover rounded mt-2" />}
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#8B1538] hover:bg-[#6B0F2A]">
                  {editingSlide ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingSlide(null); setFormData({ title: '', subtitle: '', image: '' }); setImageFile(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {heroSlides.map((slide) => (
          <Card key={slide.id}>
            <CardContent className="p-4">
              <img src={slide.image} alt={slide.title} className="w-full h-32 object-cover rounded mb-3" />
              <h3 className="font-semibold mb-1">{slide.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{slide.subtitle}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(slide)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(slide.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
  }, [user, navigate]);
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Women',
    subcategory: 'Lehenga',
    description: '',
    price: '',
    sizes: '',
    colors: '',
    images: [],
    imageFiles: [],
    customizable: true,
    featured: false,
    new_arrival: false
  });
  const [hoveredProduct, setHoveredProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchInquiries();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchInquiries = async () => {
    try {
      const response = await axios.get(`${API}/admin/inquiries`);
      setInquiries(response.data);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Store files temporarily, will upload after product creation
    setFormData({
      ...formData,
      imageFiles: files
    });
    
    toast.success(`${files.length} image(s) selected for upload`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description,
      price: parseFloat(formData.price),
      sizes: formData.sizes.split(',').map(s => s.trim()),
      colors: formData.colors.split(',').map(c => c.trim()),
      customizable: formData.customizable,
      featured: formData.featured,
      newArrival: formData.new_arrival,
      images: formData.images
    };

    try {
      let savedProduct;
      if (editingProduct) {
        const response = await axios.put(`${API}/admin/products/${editingProduct.id}`, productData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        savedProduct = response.data;
        toast.success('Product updated!');
      } else {
        const response = await axios.post(`${API}/admin/products`, productData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        savedProduct = response.data;
        toast.success('Product created!');
      }
      
      // Upload images if any
      if (formData.imageFiles && formData.imageFiles.length > 0) {
        const imageFormData = new FormData();
        formData.imageFiles.forEach(file => {
          imageFormData.append('images', file);
        });
        
        try {
          await axios.post(`${API}/admin/products/${savedProduct.id}/images`, imageFormData, {
            headers: { 
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          toast.success('Images uploaded successfully!');
        } catch (imageError) {
          console.error('Failed to upload images:', imageError);
          toast.error('Product saved but image upload failed');
        }
      }
      
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error';
      toast.error(`Failed to save product: ${errorMessage}`);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      price: product.price.toString(),
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      images: product.images,
      customizable: product.customizable,
      featured: product.featured,
      new_arrival: product.newArrival
    });
    setShowProductForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API}/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Product deleted!');
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Women',
      subcategory: 'Lehenga',
      description: '',
      price: '',
      sizes: '',
      colors: '',
      images: [],
      imageFiles: [],
      customizable: true,
      featured: false,
      new_arrival: false
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  return (
    <div className="page-container" data-testid="admin-dashboard">
      <h1 className="page-title">Admin Dashboard</h1>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5">
          <TabsTrigger value="products" data-testid="products-tab">Products</TabsTrigger>
          <TabsTrigger value="rentals" data-testid="rentals-tab">Rentals</TabsTrigger>
          <TabsTrigger value="feedback" data-testid="feedback-tab">Reviews</TabsTrigger>
          <TabsTrigger value="hero" data-testid="hero-tab">Hero Content</TabsTrigger>
          <TabsTrigger value="inquiries" data-testid="inquiries-tab">Inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  logout();
                  toast.info('Please login again to refresh your session');
                  navigate('/login');
                }}
                variant="outline"
                className="text-sm bg-yellow-100 text-yellow-800"
              >
                Refresh Session
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await axios.get(`${API}/admin/auth-test`);
                    toast.success('Admin authentication successful!');
                  } catch (error) {
                    toast.error('Please refresh your session - JWT expired');
                  }
                }}
                variant="outline"
                className="text-sm"
              >
                Test Auth
              </Button>
            </div>
            <Button
              onClick={() => setShowProductForm(!showProductForm)}
              className="bg-[#8B1538] hover:bg-[#6B0F2A]"
              data-testid="add-product-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {showProductForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Product Name *</Label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        data-testid="product-name-input"
                      />
                    </div>
                    <div>
                      <Label>Price (₹) *</Label>
                      <Input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        data-testid="product-price-input"
                      />
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger data-testid="product-category-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Women">Women</SelectItem>
                          <SelectItem value="Men">Men</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Subcategory *</Label>
                      <Select
                        value={formData.subcategory}
                        onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                      >
                        <SelectTrigger data-testid="product-subcategory-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.category === 'Women' ? (
                            <>
                              <SelectItem value="Lehenga">Lehenga</SelectItem>
                              <SelectItem value="Blouse">Blouse</SelectItem>
                              <SelectItem value="Dresses">Dresses</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="Khadi">Khadi</SelectItem>
                              <SelectItem value="Kurta">Kurta</SelectItem>
                              <SelectItem value="T-Shirt">T-Shirt</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Sizes (comma separated) *</Label>
                      <Input
                        required
                        placeholder="S, M, L, XL"
                        value={formData.sizes}
                        onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                        data-testid="product-sizes-input"
                      />
                    </div>
                    <div>
                      <Label>Colors (comma separated) *</Label>
                      <Input
                        required
                        placeholder="Red, Blue, Green"
                        value={formData.colors}
                        onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                        data-testid="product-colors-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      data-testid="product-description-input"
                    />
                  </div>

                  <div>
                    <Label>Product Images</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="flex-1"
                        data-testid="product-image-upload"
                      />
                    </div>
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-4">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img src={img} alt={`Product ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.customizable}
                        onChange={(e) => setFormData({ ...formData, customizable: e.target.checked })}
                        data-testid="product-customizable-checkbox"
                      />
                      <span>Customizable</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        data-testid="product-featured-checkbox"
                      />
                      <span>Featured</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.new_arrival}
                        onChange={(e) => setFormData({ ...formData, new_arrival: e.target.checked })}
                        data-testid="product-newarrival-checkbox"
                      />
                      <span>New Arrival</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-[#8B1538] hover:bg-[#6B0F2A]" data-testid="save-product-btn">
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} data-testid="cancel-product-btn">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} data-testid={`admin-product-${product.id}`} className="group">
                <CardContent className="p-4">
                  <div className="relative mb-3">
                    <ProductImage
                      src={product.images?.[0] || product.imageUrls?.[0]}
                      alt={product.name}
                      className="w-full h-48 rounded-lg"
                      showHover={true}
                    />
                    {/* Hover preview for full image */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                      <ProductImage
                        src={product.images?.[0] || product.imageUrls?.[0]}
                        alt={product.name}
                        className="w-64 h-64 rounded-lg shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 bg-white p-2"
                      />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category} - {product.subcategory}</p>
                  <p className="text-lg font-bold text-[#8B1538] mb-3">₹{product.price}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      data-testid={`edit-product-${product.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                      data-testid={`delete-product-${product.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rentals">
          <AdminRentalDashboard />
        </TabsContent>

        <TabsContent value="feedback">
          <AdminFeedbackManager />
        </TabsContent>

        <TabsContent value="hero">
          <HeroContentManager />
        </TabsContent>

        <TabsContent value="inquiries">
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id} data-testid={`inquiry-${inquiry.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                  <CardDescription>
                    {inquiry.email} {inquiry.phone && `• ${inquiry.phone}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{inquiry.message}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(inquiry.created_at).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
            {inquiries.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No inquiries yet
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#8B1538] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Pradha Fashion Outlet</h3>
            <p className="text-gray-200">Where Tradition Meets Elegance</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block hover:text-[#DAA520] transition-colors">Home</Link>
              <Link to="/products" className="block hover:text-[#DAA520] transition-colors">Collections</Link>
              <Link to="/about" className="block hover:text-[#DAA520] transition-colors">About</Link>
              <Link to="/contact" className="block hover:text-[#DAA520] transition-colors">Contact</Link>
              <Link to="/developer" className="block hover:text-[#DAA520] transition-colors">Developer</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="space-y-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="block hover:text-[#DAA520] transition-colors">Instagram</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="block hover:text-[#DAA520] transition-colors">Facebook</a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="block hover:text-[#DAA520] transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-gray-200">
          <p>© 2025 Pradha Fashion Outlet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="App">
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
          <Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />
          <Route path="/rentals" element={<Layout><RentalDresses /></Layout>} />
          <Route path="/feedback" element={<Layout><CustomerFeedback /></Layout>} />
          <Route path="/reviews" element={<Layout><CustomerReviews /></Layout>} />
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
          <Route path="/orders" element={<Layout><Orders /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="/developer" element={<Layout><Developer /></Layout>} />
          <Route path="/admin" element={<Layout><AdminPage /></Layout>} />

          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
