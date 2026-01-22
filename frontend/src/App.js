import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
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
import AdminProfile from './components/ui/AdminProfile';
import RefundPolicyPage from './components/ui/RefundPolicy';
import ShippingPolicyPage from './components/ui/ShippingPolicy';
import OffersPage from './components/ui/OffersPage';
import ProductDetail from './components/ui/ProductDetail';
import RentalDetail from './components/ui/RentalDetail';
import Loader from './components/ui/Loader';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://localhost:8081';
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
            <Link to="/offers" className="nav-link">Offers</Link>
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
            <Link to="/offers" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Offers</Link>
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

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
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

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchProducts();
    fetchInquiries();
  }, [user, navigate]);

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

  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    toast.info('Compressing images...');
    const compressedFiles = [];
    
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) { // If file > 2MB, compress it
        const compressed = await compressImage(file);
        compressedFiles.push(new File([compressed], file.name, { type: 'image/jpeg' }));
      } else {
        compressedFiles.push(file);
      }
    }
    
    setFormData({
      ...formData,
      imageFiles: [...(formData.imageFiles || []), ...compressedFiles]
    });
    toast.success(`${files.length} image(s) added. Total: ${(formData.imageFiles || []).length + compressedFiles.length}`);
    e.target.value = '';
  };

  const removeImageFile = (index) => {
    const newFiles = formData.imageFiles.filter((_, i) => i !== index);
    setFormData({ ...formData, imageFiles: newFiles });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isJewellery = formData.subcategory === 'Jewellery';
    if (!formData.name || !formData.price || (!isJewellery && (!formData.sizes || !formData.colors)) || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    const productData = {
      name: formData.name,
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description,
      price: parseFloat(formData.price),
      sizes: isJewellery ? ['One Size'] : formData.sizes.split(',').map(s => s.trim()),
      colors: isJewellery ? ['Gold', 'Silver'] : formData.colors.split(',').map(c => c.trim()),
      customizable: formData.customizable,
      featured: formData.featured,
      newArrival: formData.new_arrival,
      images: formData.images
    };

    try {
      let savedProduct;
      if (editingProduct) {
        const response = await axios.put(`${API}/admin/products/${editingProduct.id}`, productData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        savedProduct = response.data;
        toast.success('Product updated!');
      } else {
        const response = await axios.post(`${API}/admin/products`, productData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        savedProduct = response.data;
        toast.success('Product created!');
      }
      
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
          if (imageError.response?.status === 403 || imageError.response?.status === 401) {
            toast.error('Session expired. Please login again to upload images.');
            logout();
            navigate('/login');
          } else {
            toast.error('Product saved but image upload failed: ' + (imageError.response?.data?.error || imageError.message));
          }
        }
      }
      
      resetForm();
      fetchProducts();
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error';
        toast.error(`Failed to save product: ${errorMessage}`);
      }
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
      images: product.images || [],
      imageFiles: [],
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
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Product deleted!');
      fetchProducts();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error('Failed to delete product');
      }
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden md:grid w-full max-w-5xl mx-auto grid-cols-7">
          <TabsTrigger value="products" data-testid="products-tab">Products</TabsTrigger>
          <TabsTrigger value="rentals" data-testid="rentals-tab">Rentals</TabsTrigger>
          <TabsTrigger value="coupons" data-testid="coupons-tab">Coupons</TabsTrigger>
          <TabsTrigger value="feedback" data-testid="feedback-tab">Reviews</TabsTrigger>
          <TabsTrigger value="hero" data-testid="hero-tab">Hero Content</TabsTrigger>
          <TabsTrigger value="inquiries" data-testid="inquiries-tab">Inquiries</TabsTrigger>
          <TabsTrigger value="profile" data-testid="profile-tab">Profile</TabsTrigger>
        </TabsList>
        
        <div className="md:hidden mb-6">
          <AdminMobileNav currentTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
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
                      <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Price (₹) *</Label>
                      <Input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Women">Women</SelectItem>
                          <SelectItem value="Men">Men</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Subcategory *</Label>
                      <Select value={formData.subcategory} onValueChange={(value) => setFormData({ ...formData, subcategory: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {formData.category === 'Women' ? (
                            <>
                              <SelectItem value="Lehenga">Lehenga</SelectItem>
                              <SelectItem value="Blouse">Blouse</SelectItem>
                              <SelectItem value="Dresses">Dresses</SelectItem>
                              <SelectItem value="Jewellery">Jewellery</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="Khadi">Khadi</SelectItem>
                              <SelectItem value="Kurta">Kurta</SelectItem>
                              <SelectItem value="T-Shirt">T-Shirt</SelectItem>
                              <SelectItem value="Jewellery">Jewellery</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.subcategory !== 'Jewellery' && (
                      <>
                        <div>
                          <Label>Sizes (comma separated) *</Label>
                          <Input required placeholder="S, M, L, XL" value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })} />
                        </div>
                        <div>
                          <Label>Colors (comma separated) *</Label>
                          <Input required placeholder="Red, Blue, Green" value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} />
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <Label>Description *</Label>
                    <Textarea required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div>
                    <Label>Product Images</Label>
                    <Input type="file" accept="image/*" multiple onChange={handleImageUpload} className="mt-2" />
                    
                    {/* Existing Images */}
                    {(formData.images && formData.images.length > 0) && (
                      <div className="mt-4">
                        <Label className="text-sm text-gray-600">Current Images:</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {formData.images.map((imageUrl, idx) => (
                            <div key={idx} className="relative">
                              <img src={imageUrl} alt={`Current ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                              <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* New Images to Upload */}
                    {(formData.imageFiles && formData.imageFiles.length > 0) && (
                      <div className="mt-4">
                        <Label className="text-sm text-gray-600">New Images to Upload:</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {formData.imageFiles.map((file, idx) => (
                            <div key={idx} className="relative">
                              <img src={URL.createObjectURL(file)} alt={`New ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                              <button type="button" onClick={() => removeImageFile(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={formData.customizable} onChange={(e) => setFormData({ ...formData, customizable: e.target.checked })} />
                      <span>Customizable</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
                      <span>Featured</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={formData.new_arrival} onChange={(e) => setFormData({ ...formData, new_arrival: e.target.checked })} />
                      <span>New Arrival</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-[#8B1538] hover:bg-[#6B0F2A]">{editingProduct ? 'Update Product' : 'Create Product'}</Button>
                    <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                {product.images && product.images.length > 0 && (
                  <div className="relative h-48">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        +{product.images.length - 1} more
                      </div>
                    )}
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category} - {product.subcategory}</p>
                  <p className="text-lg font-bold text-[#8B1538] mb-3">₹{product.price}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rentals">
          <AdminRentalDashboard />
        </TabsContent>

        <TabsContent value="coupons">
          <CouponManagement />
        </TabsContent>

        <TabsContent value="feedback">
          <ReviewsManagement />
        </TabsContent>

        <TabsContent value="hero">
          <HeroContentManagement />
        </TabsContent>

        <TabsContent value="inquiries">
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                  <CardDescription>{inquiry.email} {inquiry.phone && `• ${inquiry.phone}`}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{inquiry.message}</p>
                  <p className="text-sm text-gray-500 mt-2">{new Date(inquiry.created_at).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
            {inquiries.length === 0 && (
              <div className="text-center py-12 text-gray-500">No inquiries yet</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <AdminProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/feedback`);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`${API}/feedback/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Review deleted!');
      fetchReviews();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error('Failed to delete review');
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#8B1538]">Customer Reviews Management</h2>
      {reviews.length > 0 ? (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{review.name}</h3>
                    <p className="text-sm text-gray-600">{review.email}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                    </div>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => deleteReview(review.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-gray-700 mb-3">{review.comment}</p>
                {review.imageUrl && (
                  <img src={review.imageUrl} alt="Review" className="w-32 h-32 object-cover rounded" />
                )}
                <p className="text-xs text-gray-500 mt-2">{new Date(review.createdAt).toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">No reviews yet</div>
      )}
    </div>
  );
};

const HeroContentManagement = () => {
  const [heroSections, setHeroSections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [formData, setFormData] = useState({ title: '', subtitle: '', displayOrder: 0, isActive: true });
  const [imageFile, setImageFile] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHeroSections();
  }, []);

  const fetchHeroSections = async () => {
    try {
      const response = await axios.get(`${API}/hero-content`);
      setHeroSections(response.data);
    } catch (error) {
      console.error('Failed to fetch hero sections:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.subtitle) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create FormData for form parameters
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('subtitle', formData.subtitle);
    formDataToSend.append('displayOrder', formData.displayOrder || 0);
    formDataToSend.append('isActive', formData.isActive);
    if (imageFile) {
      formDataToSend.append('backgroundImage', imageFile);
    }

    try {
      let savedHero;
      if (editingHero) {
        const response = await axios.put(`${API}/admin/hero-content/${editingHero.id}`, formDataToSend, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        savedHero = response.data;
        toast.success('Hero section updated!');
      } else {
        const response = await axios.post(`${API}/admin/hero-content`, formDataToSend, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        savedHero = response.data;
        toast.success('Hero section created!');
      }
      

      
      resetForm();
      fetchHeroSections();
    } catch (error) {
      console.error('Hero section error:', error.response?.data);
      if (error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to save hero section';
        toast.error(errorMsg);
      }
    }
  };

  const handleEdit = (hero) => {
    setEditingHero(hero);
    setFormData({
      title: hero.title,
      subtitle: hero.subtitle,
      displayOrder: hero.displayOrder,
      isActive: hero.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero section?')) return;
    try {
      await axios.delete(`${API}/admin/hero-content/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Hero section deleted!');
      fetchHeroSections();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error('Failed to delete hero section');
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', subtitle: '', displayOrder: 0, isActive: true });
    setImageFile(null);
    setEditingHero(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#8B1538]">Hero Section Management</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#8B1538] hover:bg-[#6B0F2A]">
          <Plus className="w-4 h-4 mr-2" />
          Add Hero Section
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingHero ? 'Edit Hero Section' : 'Add New Hero Section'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input type="number" value={formData.displayOrder} onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <Label>Subtitle *</Label>
                <Input required value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} />
              </div>
              <div>
                <Label>Background Image (Optional)</Label>
                <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use default background</p>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                  <span>Active</span>
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#8B1538] hover:bg-[#6B0F2A]">{editingHero ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {heroSections.map((hero) => (
          <Card key={hero.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{hero.title}</h3>
                  <p className="text-gray-600">{hero.subtitle}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={hero.isActive ? "default" : "secondary"}>
                      {hero.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-gray-500">Order: {hero.displayOrder}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(hero)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(hero.id)}>Delete</Button>
                </div>
              </div>
              {hero.backgroundImageUrl && (
                <div className="relative h-32 rounded-lg overflow-hidden">
                  <img src={hero.backgroundImageUrl} alt={hero.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h4 className="font-bold">{hero.title}</h4>
                      <p className="text-sm">{hero.subtitle}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {heroSections.length === 0 && (
          <div className="text-center py-12 text-gray-500">No hero sections yet</div>
        )}
      </div>
    </div>
  );
};

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    applicableTo: 'ALL',
    specificProductId: '',
    specificCategory: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    validFrom: '',
    validUntil: '',
    isActive: true
  });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${API}/admin/coupons`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setCoupons(response.data);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      toast.error('Please fill in all required fields');
      return;
    }

    const couponData = {
      ...formData,
      discountValue: parseFloat(formData.discountValue),
      minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      validFrom: formData.validFrom ? formData.validFrom + 'T00:00:00' : null,
      validUntil: formData.validUntil ? formData.validUntil + 'T23:59:59' : null
    };

    try {
      if (editingCoupon) {
        await axios.put(`${API}/admin/coupons/${editingCoupon.id}`, couponData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Coupon updated!');
      } else {
        await axios.post(`${API}/admin/coupons`, couponData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Coupon created!');
      }
      resetForm();
      fetchCoupons();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error('Failed to save coupon');
      }
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      applicableTo: coupon.applicableTo || 'ALL',
      specificProductId: coupon.specificProductId || '',
      specificCategory: coupon.specificCategory || '',
      minOrderAmount: coupon.minOrderAmount?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      validFrom: coupon.validFrom?.split('T')[0] || '',
      validUntil: coupon.validUntil?.split('T')[0] || '',
      isActive: coupon.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await axios.delete(`${API}/admin/coupons/${couponId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Coupon deleted!');
      fetchCoupons();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      applicableTo: 'ALL',
      specificProductId: '',
      specificCategory: '',
      minOrderAmount: '',
      maxDiscount: '',
      usageLimit: '',
      validFrom: '',
      validUntil: '',
      isActive: true
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#8B1538]">Coupon Management</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#8B1538] hover:bg-[#6B0F2A]">
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Coupon Code *</Label>
                  <Input required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="FIRST10" />
                </div>
                <div>
                  <Label>Applicable To *</Label>
                  <Select value={formData.applicableTo || 'ALL'} onValueChange={(value) => setFormData({...formData, applicableTo: value, specificProductId: '', specificCategory: ''})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Products</SelectItem>
                      <SelectItem value="PURCHASE_ONLY">Purchase Items Only</SelectItem>
                      <SelectItem value="RENTAL_ONLY">Rental Items Only</SelectItem>
                      <SelectItem value="SPECIFIC_CATEGORY">Specific Category</SelectItem>
                      <SelectItem value="SPECIFIC_PRODUCT">Specific Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Discount Type *</Label>
                  <Select value={formData.discountType} onValueChange={(value) => setFormData({...formData, discountType: value})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Discount Value *</Label>
                  <Input type="number" required value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: e.target.value})} placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '100'} />
                </div>
                
                {/* Conditional fields for specific applicability */}
                {formData.applicableTo === 'SPECIFIC_CATEGORY' && (
                  <div>
                    <Label>Select Category *</Label>
                    <Select value={formData.specificCategory} onValueChange={(value) => setFormData({...formData, specificCategory: value})}>
                      <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Women">Women (Purchase)</SelectItem>
                        <SelectItem value="Men">Men (Purchase)</SelectItem>
                        <SelectItem value="Lehenga">Lehenga (Purchase)</SelectItem>
                        <SelectItem value="Blouse">Blouse (Purchase)</SelectItem>
                        <SelectItem value="Dresses">Dresses (Purchase)</SelectItem>
                        <SelectItem value="Jewellery">Jewellery (Purchase)</SelectItem>
                        <SelectItem value="Khadi">Khadi (Purchase)</SelectItem>
                        <SelectItem value="Kurta">Kurta (Purchase)</SelectItem>
                        <SelectItem value="T-Shirt">T-Shirt (Purchase)</SelectItem>
                        <SelectItem value="Navratri">Navratri (Rental)</SelectItem>
                        <SelectItem value="Wedding">Wedding (Rental)</SelectItem>
                        <SelectItem value="Pre-Wedding">Pre-Wedding (Rental)</SelectItem>
                        <SelectItem value="Reception">Reception (Rental)</SelectItem>
                        <SelectItem value="Sangam">Sangam (Rental)</SelectItem>
                        <SelectItem value="Party">Party (Rental)</SelectItem>
                        <SelectItem value="Designer Blouses">Designer Blouses (Rental)</SelectItem>
                        <SelectItem value="Maternity Outfits">Maternity Outfits (Rental)</SelectItem>
                        <SelectItem value="Wedding Outfit">Wedding Outfit (Rental)</SelectItem>
                        <SelectItem value="Reception Outfit">Reception Outfit (Rental)</SelectItem>
                        <SelectItem value="Party Wears">Party Wears (Rental)</SelectItem>
                        <SelectItem value="Traditional Outfits">Traditional Outfits (Rental)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {formData.applicableTo === 'SPECIFIC_PRODUCT' && (
                  <div>
                    <Label>Product ID *</Label>
                    <Input 
                      value={formData.specificProductId} 
                      onChange={(e) => setFormData({...formData, specificProductId: e.target.value})} 
                      placeholder="Enter product ID"
                    />
                  </div>
                )}
                <div>
                  <Label>Min Order Amount</Label>
                  <Input type="number" value={formData.minOrderAmount} onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})} placeholder="500" />
                </div>
                <div>
                  <Label>Max Discount (for %)</Label>
                  <Input type="number" value={formData.maxDiscount} onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})} placeholder="200" />
                </div>
                <div>
                  <Label>Usage Limit</Label>
                  <Input type="number" value={formData.usageLimit} onChange={(e) => setFormData({...formData, usageLimit: e.target.value})} placeholder="100" />
                </div>
                <div>
                  <Label>Valid From</Label>
                  <Input type="date" value={formData.validFrom} onChange={(e) => setFormData({...formData, validFrom: e.target.value})} />
                </div>
                <div>
                  <Label>Valid Until</Label>
                  <Input type="date" value={formData.validUntil} onChange={(e) => setFormData({...formData, validUntil: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="First booking discount" />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                  <span>Active</span>
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#8B1538] hover:bg-[#6B0F2A]">{editingCoupon ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {coupons.map((coupon) => (
          <Card key={coupon.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{coupon.code}</h3>
                  <p className="text-gray-600">{coupon.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-[#8B1538] font-medium">
                      {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} OFF
                    </span>
                    {coupon.minOrderAmount && <span className="text-gray-500">Min: ₹{coupon.minOrderAmount}</span>}
                    {coupon.usageLimit && <span className="text-gray-500">Limit: {coupon.usageLimit}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(coupon)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(coupon.id)}>Delete</Button>
                </div>
              </div>
              {(coupon.validFrom || coupon.validUntil) && (
                <div className="text-xs text-gray-500">
                  Valid: {coupon.validFrom ? new Date(coupon.validFrom).toLocaleDateString() : 'Always'} - {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'Forever'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {coupons.length === 0 && (
          <div className="text-center py-12 text-gray-500">No coupons created yet</div>
        )}
      </div>
    </div>
  );
};

const AdminMobileNav = ({ currentTab, onTabChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const tabs = [
    { value: 'products', label: 'Products', icon: '📦' },
    { value: 'rentals', label: 'Rentals', icon: '👗' },
    { value: 'coupons', label: 'Coupons', icon: '🎫' },
    { value: 'feedback', label: 'Reviews', icon: '⭐' },
    { value: 'hero', label: 'Hero Content', icon: '🖼️' },
    { value: 'inquiries', label: 'Inquiries', icon: '📧' },
    { value: 'profile', label: 'Profile', icon: '👤' }
  ];
  
  const activeTabData = tabs.find(tab => tab.value === currentTab);
  
  const handleTabClick = (tabValue) => {
    onTabChange(tabValue);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#8B1538] text-white py-3 px-4 rounded-lg flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <span>{activeTabData?.icon}</span>
          <span>{activeTabData?.label}</span>
        </span>
        <Menu className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className={`w-full text-left py-3 px-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                currentTab === tab.value ? 'bg-[#8B1538]/10 text-[#8B1538] font-medium' : 'text-gray-700'
              } ${tab.value === tabs[tabs.length - 1].value ? '' : 'border-b border-gray-100'}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Footer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <footer className="bg-gradient-to-br from-[#8B1538] via-[#A0185A] to-[#8B1538] text-white mt-20 rounded-t-3xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold mb-2 sm:mb-3 lg:mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Pradha Fashion Outlet</h3>
            <p className="text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg font-medium italic">Where Tradition Meets Elegance</p>
            {!user ? (
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-[#DAA520] hover:bg-[#B8860B] text-white text-sm font-semibold shadow-lg"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white hover:text-[#8B1538] text-sm font-semibold"
                >
                  Sign Up
                </Button>
              </div>
            ) : (
              <div className="text-gray-100">
                <p className="text-sm font-medium">Welcome, {user.name}!</p>
                <Link to="/orders" className="text-[#DAA520] hover:underline text-sm font-semibold">My Orders</Link>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <h4 className="font-bold mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-[#DAA520]">Visit Our Store</h4>
            <div className="space-y-1 sm:space-y-2 text-gray-100 text-xs sm:text-sm lg:text-base">
              <p className="font-semibold text-white">📞 Contact:</p>
              <a href="tel:+918308721599" className="hover:text-[#DAA520] transition-colors font-medium block">+91 83087 21599</a>
              <p className="font-semibold mt-2 text-white">🕒 Store Hours:</p>
              <p className="leading-relaxed font-medium text-xs sm:text-sm">Mon-Sat: 10AM-8PM<br />Sunday: 11AM-6PM</p>
              <a 
                href="https://maps.app.goo.gl/gDQApHp49eYyBtGj8?g_st=ac" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block mt-2 text-[#DAA520] hover:underline font-semibold text-sm"
              >
                📍 Get Directions
              </a>
            </div>
          </div>
          
          <div className="text-center">
            <h4 className="font-bold mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-[#DAA520]">Quick Links</h4>
            <div className="grid grid-cols-2 gap-1 sm:space-y-0 sm:grid-cols-1 sm:gap-0 sm:space-y-2 text-xs sm:text-sm lg:text-base">
              <Link to="/" className="hover:text-[#DAA520] transition-colors font-medium" onClick={() => window.scrollTo(0, 0)}>Home</Link>
              <Link to="/products" className="hover:text-[#DAA520] transition-colors font-medium" onClick={() => window.scrollTo(0, 0)}>Collections</Link>
              <Link to="/rentals" className="hover:text-[#DAA520] transition-colors font-medium" onClick={() => window.scrollTo(0, 0)}>Rentals</Link>
              <Link to="/offers" className="hover:text-[#DAA520] transition-colors font-medium" onClick={() => window.scrollTo(0, 0)}>Offers</Link>
              <Link to="/reviews" className="hover:text-[#DAA520] transition-colors font-medium" onClick={() => window.scrollTo(0, 0)}>Reviews</Link>
              <Link to="/about" className="hover:text-[#DAA520] transition-colors font-medium" onClick={() => window.scrollTo(0, 0)}>About</Link>
              <Link to="/contact" className="hover:text-[#DAA520] transition-colors font-medium" onClick={() => window.scrollTo(0, 0)}>Contact</Link>
            </div>
          </div>
          
          <div className="text-center">
            <h4 className="font-bold mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-[#DAA520]">Follow Us</h4>
            <div className="flex justify-center space-x-6 mb-3 sm:mb-4">
              <a href="https://www.instagram.com/pradha_fashion_outlet?igsh=cXplemF6eTZxYnY1" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#DAA520] transition-colors">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://wa.me/917972177226" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#DAA520] transition-colors">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </a>
              <a href="mailto:pradhafashionoutlet@gmail.com" className="text-white hover:text-[#DAA520] transition-colors">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.91L12 10.09l9.455-6.269h.909c.904 0 1.636.732 1.636 1.636z"/>
                </svg>
              </a>
            </div>
            <div className="text-gray-100 text-xs sm:text-sm lg:text-base">
              <p className="font-semibold text-white">💳 We Accept:</p>
              <p className="font-medium">Cash, UPI, Cards<br />Online Payments</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 lg:pt-8">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:text-left">
            <p className="text-gray-100 text-xs sm:text-sm lg:text-base font-medium">© 2025 Pradha Fashion Outlet. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm font-medium">
              <Link to="/privacy-policy" className="hover:text-[#DAA520] transition-colors" onClick={() => window.scrollTo(0, 0)}>Privacy</Link>
              <Link to="/terms-of-service" className="hover:text-[#DAA520] transition-colors" onClick={() => window.scrollTo(0, 0)}>Terms</Link>
              <Link to="/refund-policy" className="hover:text-[#DAA520] transition-colors" onClick={() => window.scrollTo(0, 0)}>Refund</Link>
              <Link to="/shipping-policy" className="hover:text-[#DAA520] transition-colors" onClick={() => window.scrollTo(0, 0)}>Shipping</Link>
              <Link to="/developer" className="hover:text-[#DAA520] transition-colors" onClick={() => window.scrollTo(0, 0)}>Developer</Link>
            </div>
          </div>
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

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [rentalDresses, setRentalDresses] = useState([]);
  const [heroSections, setHeroSections] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchProducts(), fetchHeroSections(), fetchRentalDresses()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (heroSections.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % heroSections.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroSections]);

  const fetchRentalDresses = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/rental/dresses`);
      const dresses = await response.json();
      if (Array.isArray(dresses)) {
        const jewellery = dresses.filter(d => d.subcategory === 'Jewellery').slice(0, 2);
        const blouses = dresses.filter(d => d.subcategory === 'Designer Blouses').slice(0, 2);
        const mixed = [...jewellery, ...blouses];
        setRentalDresses(mixed);
      }
    } catch (error) {
      console.error('Failed to fetch rental dresses:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      const products = response.data;
      setFeaturedProducts(products.filter(p => p.featured).slice(0, 3));
      setNewArrivals(products.filter(p => p.newArrival).slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchHeroSections = async () => {
    try {
      const response = await axios.get(`${API}/hero-content`);
      if (response.data.length > 0) {
        setHeroSections(response.data);
      } else {
        setHeroSections([{
          title: 'Pradha Fashion Outlet',
          subtitle: 'Where Tradition Meets Elegance',
          backgroundImageUrl: '/images/hero-default.jpg'
        }]);
      }
    } catch (error) {
      console.error('Failed to fetch hero sections:', error);
      setHeroSections([{
        title: 'Pradha Fashion Outlet',
        subtitle: 'Where Tradition Meets Elegance',
        backgroundImageUrl: 'https://images.unsplash.com/photo-1756483510837-e79455e52188?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0cmFkaXRpb25hbCUyMGZhc2hpb258ZW58MHx8fHwxNzYwMDIyODcxfDA&ixlib=rb-4.1.0&q=85'
      }]);
    }
  };

  const RentalCard = ({ dress }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
      if (dress.imageUrls && dress.imageUrls.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % dress.imageUrls.length);
        }, 3000);
        return () => clearInterval(interval);
      }
    }, [dress.imageUrls]);

    return (
      <Card 
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate(`/rental/${dress.id}`)}
      >
        <div className="relative h-48">
          {dress.imageUrls && dress.imageUrls.length > 0 ? (
            <>
              <img
                src={dress.imageUrls[currentImageIndex]}
                alt={dress.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {dress.imageUrls.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {dress.imageUrls.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1">{dress.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{dress.category} • {dress.subcategory}</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-pink-600">₹{dress.pricePerDay}</p>
            <span className="text-sm text-gray-500">per day</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProductCard = ({ product }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
      if (product.images && product.images.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
        }, 3000);
        return () => clearInterval(interval);
      }
    }, [product.images]);

    return (
      <Card 
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <div className="relative h-48">
          {product.images && product.images.length > 0 ? (
            <>
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {product.images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {product.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{product.category} - {product.subcategory}</p>
          <p className="text-lg font-bold text-[#8B1538]">₹{product.price}</p>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="hero-section relative overflow-hidden bg-gray-200" style={{height: '500px'}}>
          <div className="hero-overlay relative z-10">
            <div className="hero-content">
              <div className="h-12 bg-gray-300 rounded mb-4 mx-auto max-w-md animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded mb-8 mx-auto max-w-sm animate-pulse"></div>
              <div className="flex gap-4 justify-center">
                <div className="h-10 w-32 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-10 w-40 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {heroSections.length > 0 && (
        <section className="hero-section relative overflow-hidden">
          <div 
            key={`hero-bg-${currentHeroIndex}`}
            className="absolute inset-0 bg-cover bg-center bg-fixed transition-all duration-1000 animate-ken-burns" 
            style={{
              backgroundImage: heroSections[currentHeroIndex]?.backgroundImageUrl 
                ? `url("${heroSections[currentHeroIndex].backgroundImageUrl.replace(/&#39;/g, "'")}")` 
                : 'linear-gradient(135deg, #8B1538 0%, #DAA520 100%)'
            }} 
          />
          <div className="hero-overlay relative z-10">
            <div className="hero-content">
              <h1 key={`title-${currentHeroIndex}`} className="hero-title animate-fade-in transform transition-all duration-1000 translate-y-0 opacity-100">{heroSections[currentHeroIndex]?.title}</h1>
              <p key={`subtitle-${currentHeroIndex}`} className="hero-subtitle animate-fade-in-delay transform transition-all duration-1000 delay-300 translate-y-0 opacity-100">{heroSections[currentHeroIndex]?.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 px-4 transform transition-all duration-1000 delay-500 translate-y-0 opacity-100">
                <Button onClick={() => navigate('/products')} className="hero-btn w-full sm:w-auto transform hover:scale-105 transition-transform duration-200">Shop Now</Button>
                <Button onClick={() => navigate('/contact')} variant="outline" className="hero-btn-outline w-full sm:w-auto transform hover:scale-105 transition-transform duration-200">Customize Your Outfit</Button>
              </div>
              {heroSections.length > 1 && (
                <div className="flex justify-center mt-6 space-x-2 animate-fade-in delay-700">
                  {heroSections.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentHeroIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${
                        idx === currentHeroIndex ? 'bg-white scale-110' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#8B1538]">Featured Products</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#8B1538]">New Arrivals</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {rentalDresses.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-pink-600">Featured Rentals</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {rentalDresses.map((dress) => (
                <RentalCard key={dress.id} dress={dress} />
              ))}
            </div>
            <div className="text-center">
              <Button 
                onClick={() => navigate('/rentals')} 
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 text-lg"
              >
                Explore All Rentals
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#8B1538]">Shop by Collection</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div 
              className="h-80 rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-105 relative" 
              onClick={() => navigate('/products?category=Women')}
            >
              <img 
                src="/images/categories/womens-collection.jpeg" 
                alt="Women's Collection"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white text-center p-8">
                <h3 className="text-3xl font-bold mb-2">Women's Collection</h3>
                <p className="text-lg opacity-90">Lehenga • Blouses • Dresses</p>
              </div>
            </div>
            <div 
              className="h-80 rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-105 relative" 
              onClick={() => navigate('/products?category=Men')}
            >
              <img 
                src="/images/categories/mens-collection.jpeg" 
                alt="Men's Collection"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white text-center p-8">
                <h3 className="text-3xl font-bold mb-2">Men's Collection</h3>
                <p className="text-lg opacity-90">Khadi • Kurta • T-Shirts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#8B1538]">Rental Collections</h2>
          
          {/* Women's Rental Categories */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-center mb-6 text-pink-600">Women's Rental Collection</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[
                { name: 'Navratri', image: '/images/categories/womens-navratri-outfit.jpeg' },
                { name: 'Wedding', image: '/images/categories/womens-wedding-outfit.jpeg' },
                { name: 'Pre-Wedding', image: '/images/categories/womens-pre-wedding.jpeg' },
                { name: 'Reception', image: '/images/categories/womens-reception.jpeg' },
                { name: 'Sangam', image: '/images/categories/womens-sangam.jpeg' },
                { name: 'Party', image: '/images/categories/womens-party-wear.jpeg' },
                { name: 'Designer Blouses', image: '/images/categories/womens-designer-blouses.jpeg' },
                { name: 'Maternity Outfits', image: '/images/categories/womens-maternity-outfits.jpeg' },
                { name: 'Jewellery', image: '/images/categories/womens-jewellery.jpeg' }
              ].map((category) => (
                <div 
                  key={category.name}
                  onClick={() => navigate(`/rentals?subcategory=${encodeURIComponent(category.name)}`)}
                  className="rental-category-card cursor-pointer group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="aspect-square relative">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h4 className="text-white font-semibold text-center px-2 text-sm">{category.name}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Men's Rental Categories */}
          <div>
            <h3 className="text-2xl font-semibold text-center mb-6 text-blue-600">Men's Rental Collection</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { name: 'Wedding Outfit', image: '/images/categories/mens-wedding-outfit.jpeg' },
                { name: 'Reception Outfit', image: '/images/categories/mens-reception-outfit.jpeg' },
                { name: 'Party Wears', image: '/images/categories/mens-party-wear.jpeg' },
                { name: 'Traditional Outfits', image: '/images/categories/mens-traditional-outfit.jpeg' }
              ].map((category) => (
                <div 
                  key={category.name}
                  onClick={() => navigate(`/rentals?subcategory=${encodeURIComponent(category.name)}`)}
                  className="rental-category-card cursor-pointer group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="aspect-square relative">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h4 className="text-white font-semibold text-center px-2 text-sm">{category.name}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const subcategory = params.get('subcategory');
    if (category) {
      setSelectedCategory(category);
    }
    if (subcategory) {
      setSelectedSubcategory(subcategory);
    }
  }, [location]);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, selectedSubcategory]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (selectedSubcategory !== 'All') {
      filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
    }
    setFilteredProducts(filtered);
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const subcategories = selectedCategory === 'All' 
    ? ['All', ...new Set(products.map(p => p.subcategory))]
    : ['All', ...new Set(products.filter(p => p.category === selectedCategory).map(p => p.subcategory))];

  if (loading) return <Loader />;

  const ProductCard = ({ product }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (product.images && product.images.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
        }, 2000);
        return () => clearInterval(interval);
      }
    }, [product.images]);

    const addToCart = async (e) => {
      e.stopPropagation(); // Prevent card click when clicking add to cart
      if (!user) {
        toast.error('Please login to add items to cart');
        return;
      }
      try {
        await axios.post(`${API}/cart`, {
          product_id: product.id,
          quantity: 1
        });
        toast.success('Added to cart!');
      } catch (error) {
        toast.error('Failed to add to cart');
      }
    };

    return (
      <Card 
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <div className="relative h-48 sm:h-64">
          {product.images && product.images.length > 0 ? (
            <>
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {product.images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {product.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-[#DAA520] text-white">Featured</Badge>
          )}
          {product.newArrival && (
            <Badge className="absolute top-2 right-2 bg-[#8B1538] text-white">New</Badge>
          )}
        </div>
        <CardContent className="p-3 sm:p-4">
          <h3 className="font-semibold text-sm sm:text-lg mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-2">{product.category} - {product.subcategory}</p>
          <p className="text-sm sm:text-lg font-bold text-[#8B1538] mb-2">₹{product.price}</p>
          {product.subcategory !== 'Jewellery' && (
            <>
              <div className="flex flex-wrap gap-1 mb-2 hidden sm:block">
                <span className="text-xs text-gray-500">Sizes: {product.sizes.join(', ')}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3 hidden sm:block">
                <span className="text-xs text-gray-500">Colors: {product.colors.join(', ')}</span>
              </div>
            </>
          )}
          {product.customizable && (
            <Badge variant="outline" className="mb-3 text-xs hidden sm:inline-flex">Customizable</Badge>
          )}
          <Button 
            onClick={addToCart}
            className="w-full bg-[#8B1538] hover:bg-[#6B0F2A] text-white text-xs sm:text-sm py-2"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Our Collections</h1>
      
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Subcategory" />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map(subcategory => (
                <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            <Button 
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSubcategory('All');
              }}
              className="mt-4 bg-[#8B1538] hover:bg-[#6B0F2A]"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState('fashion');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <h1 className="page-title">About Pradha Fashion Outlet</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto">
          <TabsTrigger value="fashion" className="text-xs sm:text-sm p-2 sm:p-3">About Fashion Outlet</TabsTrigger>
          <TabsTrigger value="rental" className="text-xs sm:text-sm p-2 sm:p-3">About Rental Outlet</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fashion" className="space-y-6 text-gray-700 leading-relaxed mt-6 text-left">
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
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-xl mb-2 text-[#8B1538]">Women's Collection</h3>
              <ul className="space-y-2 text-sm">
                <li>• Lehenga for festivals and weddings with customization</li>
                <li>• Designer blouses tailored to your requirements</li>
                <li>• One-piece and three-piece dresses</li>
                <li>• Traditional and contemporary ethnic wear</li>
              </ul>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
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
        </TabsContent>
        
        <TabsContent value="rental" className="space-y-6 text-gray-700 leading-relaxed mt-6 text-left">
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Rental Collection – Look Stunning Without the Stress!</h2>
          <p className="text-lg">
            At Pradha Fashion Outlet, we understand that every occasion deserves a special look—without always needing to buy and store expensive outfits. That's why we bring you our exclusive Rental Collection for both women and men. Enjoy premium designer wear at a fraction of the cost, perfectly maintained and ready to make you shine.
          </p>
          
          <h3 className="text-xl font-semibold text-[#8B1538] mt-6 mb-4">Why Choose Our Rental Wear?</h3>
          <ul className="space-y-2">
            <li><strong>Affordable luxury</strong> – Wear high-end outfits without spending big.</li>
            <li><strong>Wide variety</strong> – From bridal to festive, traditional to modern.</li>
            <li><strong>Perfect fittings</strong> – Alterations available to ensure a flawless look.</li>
            <li><strong>Hassle-free process</strong> – Easy selection, quick pickup, and smooth return.</li>
            <li><strong>Premium quality</strong> – Every outfit is cleaned, refreshed, and handled with care.</li>
          </ul>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-xl mb-2 text-[#8B1538]">Women's Rental Collection</h3>
              <ul className="space-y-2 text-sm">
                <li>• Designer lehengas for weddings, receptions & festive events</li>
                <li>• Premium sarees with stylish ready-to-wear blouses</li>
                <li>• Cocktail gowns, evening dresses & party-wear</li>
                <li>• Bridal wear for a grand yet budget-friendly look</li>
              </ul>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-xl mb-2 text-[#8B1538]">Men's Rental Collection</h3>
              <ul className="space-y-2 text-sm">
                <li>• Traditional sherwanis for weddings and cultural events</li>
                <li>• Classic kurtas for ceremonies and festivals</li>
                <li>• Indo-western outfits for receptions & parties</li>
                <li>• Premium suits and tuxedos for formal occasions</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-8 p-6 bg-gradient-to-r from-[#8B1538]/10 to-[#DAA520]/10 rounded-lg">
            <p className="text-lg font-semibold text-[#8B1538] mb-2">✨ Dress like royalty without the heavy price tag. Your dream outfit is just a rental away!</p>
            <p className="text-[#8B1538] font-medium">Pradha Fashion Outlet – Style that fits every moment.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  
  if (pageLoading) return <Loader />;
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // Real-time validation
    if (name === 'email' && value) {
      if (!validateEmail(value)) {
        setErrors({ ...errors, email: 'Please enter a valid email address' });
      }
    }
    
    if (name === 'phone' && value) {
      if (!validatePhone(value)) {
        setErrors({ ...errors, phone: 'Please enter a valid 10-digit Indian mobile number' });
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      await axios.post(`${API}/inquiries`, formData);
      toast.success('Thank you! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Failed to submit inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Contact Us</h1>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>Have a question or want to discuss customization? Send us a message!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="block text-left mb-1">Name *</Label>
                <Input 
                  id="name" 
                  name="name"
                  required 
                  value={formData.name} 
                  onChange={handleChange}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="email" className="block text-left mb-1">Email *</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="phone" className="block text-left mb-1">Phone (10 digits)</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  type="tel"
                  maxLength="10"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone} 
                  onChange={handleChange}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="message" className="block text-left mb-1">Message *</Label>
                <Textarea 
                  id="message" 
                  name="message"
                  required 
                  rows={5} 
                  value={formData.message} 
                  onChange={handleChange}
                  className={errors.message ? '' : ''}
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#8B1538] hover:bg-[#6B0F2A] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-4">
          <h3 className="text-xl font-semibold text-[#8B1538]">Connect With Us</h3>
          <div className="flex justify-center space-x-6">
            <a href="https://www.instagram.com/pradha_fashion_outlet?igsh=cXplemF6eTZxYnY1" target="_blank" rel="noopener noreferrer" className="text-[#8B1538] hover:text-[#DAA520] transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://wa.me/917972177226" target="_blank" rel="noopener noreferrer" className="text-[#8B1538] hover:text-[#DAA520] transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </a>
            <a href="mailto:pradhafashionoutlet@gmail.com" className="text-[#8B1538] hover:text-[#DAA520] transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.91L12 10.09l9.455-6.269h.909c.904 0 1.636.732 1.636 1.636z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrivacyPolicyPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <h1 className="page-title">Privacy Policy</h1>
      <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed text-left">
        <p className="text-sm text-gray-500">Last Updated: 09/12/2025</p>
        
        <p className="text-lg">
          At Pradha Fashion Outlet, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you visit our website, make a purchase, or contact us.
        </p>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Information We Collect</h2>
          <p className="mb-3">We may collect the following details:</p>
          <ul className="space-y-2 list-disc pl-6">
            <li>Name, email address, phone number</li>
            <li>Delivery and billing address</li>
            <li>Order details and measurements for customization</li>
            <li>Payment information (processed securely by our payment partners)</li>
            <li>Website usage data to improve your experience</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">How We Use Your Information</h2>
          <p className="mb-3">Your information is used to:</p>
          <ul className="space-y-2 list-disc pl-6">
            <li>Process and deliver orders</li>
            <li>Provide customization & fitting services</li>
            <li>Send order updates and customer support</li>
            <li>Improve our products and website experience</li>
            <li>Send promotions/offers (only if you opt-in)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">How We Protect Your Data</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>We use secure servers and SSL encryption</li>
            <li>Payment details are handled by trusted payment gateways (e.g., Razorpay)</li>
            <li>We never sell or share your personal information with third parties, except for order processing (couriers, payment partners)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Your Rights</h2>
          <p className="mb-3">You can:</p>
          <ul className="space-y-2 list-disc pl-6">
            <li>Request to update or delete your personal data</li>
            <li>Opt-out of promotional messages anytime</li>
            <li>Contact us for any privacy-related concerns</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Contact Us</h2>
          <p className="mb-3">If you have questions about this Privacy Policy, reach us at:</p>
          <div className="space-y-2">
            <p>📧 <a href="mailto:pradhafashionoutlet@gmail.com" className="text-[#8B1538] hover:underline">pradhafashionoutlet@gmail.com</a></p>
            <p>📞 <a href="tel:+918308721599" className="text-[#8B1538] hover:underline">8308721599</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TermsOfServicePage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <h1 className="page-title">Terms of Service</h1>
      <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed text-left">
        <p className="text-sm text-gray-500">Last Updated: 09/12/2025</p>
        
        <p className="text-lg">
          Welcome to Pradha Fashion Outlet. By using our website, placing an order, or using our services, you agree to follow these Terms of Service.
        </p>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Use of Our Website</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>You agree not to misuse our website or attempt to harm our systems.</li>
            <li>All product images, designs, and text belong to Pradha Fashion Outlet and cannot be copied without permission.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Orders & Payments</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>Prices are shown in INR and may change anytime.</li>
            <li>Orders are confirmed only after payment is successfully received.</li>
            <li>Customization orders may require additional time; we will keep you updated.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Rentals (If applicable)</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>Rental items must be returned on or before the due date.</li>
            <li>Damage charges may apply if the product is torn, stained, or heavily altered.</li>
            <li>Advance payment and ID verification may be required for rentals.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Refunds & Cancellation</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>Customized products are non-refundable and non-returnable.</li>
            <li>Standard products may be eligible for return based on our return policy.</li>
            <li>Rental fees are non-refundable once the item is collected.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Shipping & Delivery</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>Delivery timelines may vary based on location.</li>
            <li>We are not responsible for delays caused by courier/logistics providers.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Limitation of Liability</h2>
          <p className="mb-3">Pradha Fashion Outlet is not responsible for:</p>
          <ul className="space-y-2 list-disc pl-6">
            <li>Incorrect measurements provided by the customer</li>
            <li>Damage after the product has been delivered</li>
            <li>Delays due to unavoidable events (weather, courier issues, holidays)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Changes to Terms</h2>
          <p>We may update these Terms occasionally. Continued use of the website means you accept the updated terms.</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Contact Us</h2>
          <p className="mb-3">For inquiries related to these Terms, contact:</p>
          <div className="space-y-2">
            <p>📧 <a href="mailto:pradhafashionoutlet@gmail.com" className="text-[#8B1538] hover:underline">pradhafashionoutlet@gmail.com</a></p>
            <p>📞 <a href="tel:+918308721599" className="text-[#8B1538] hover:underline">8308721599</a></p>
          </div>
        </div>
      </div>
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
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
          <Route path="/orders" element={<Layout><Orders /></Layout>} />
          <Route path="/feedback" element={<Layout><CustomerFeedback /></Layout>} />
          <Route path="/developer" element={<Layout><Developer /></Layout>} />
          <Route path="/rentals" element={<Layout><RentalDresses /></Layout>} />
          <Route path="/reviews" element={<Layout><CustomerReviews /></Layout>} />
          <Route path="/offers" element={<Layout><OffersPage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="/privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />
          <Route path="/terms-of-service" element={<Layout><TermsOfServicePage /></Layout>} />
          <Route path="/refund-policy" element={<Layout><RefundPolicyPage /></Layout>} />
          <Route path="/shipping-policy" element={<Layout><ShippingPolicyPage /></Layout>} />
          <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/rental/:id" element={<Layout><RentalDetail /></Layout>} />
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