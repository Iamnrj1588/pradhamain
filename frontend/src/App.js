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
    if (!formData.name || !formData.price || !formData.sizes || !formData.colors || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

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
        <TabsList className="hidden md:grid w-full max-w-3xl mx-auto grid-cols-5">
          <TabsTrigger value="products" data-testid="products-tab">Products</TabsTrigger>
          <TabsTrigger value="rentals" data-testid="rentals-tab">Rentals</TabsTrigger>
          <TabsTrigger value="feedback" data-testid="feedback-tab">Reviews</TabsTrigger>
          <TabsTrigger value="hero" data-testid="hero-tab">Hero Content</TabsTrigger>
          <TabsTrigger value="inquiries" data-testid="inquiries-tab">Inquiries</TabsTrigger>
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
                      <Input required placeholder="S, M, L, XL" value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })} />
                    </div>
                    <div>
                      <Label>Colors (comma separated) *</Label>
                      <Input required placeholder="Red, Blue, Green" value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} />
                    </div>
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

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('subtitle', formData.subtitle);
    submitData.append('displayOrder', formData.displayOrder);
    submitData.append('isActive', formData.isActive);
    if (imageFile) {
      submitData.append('backgroundImage', imageFile);
    }

    try {
      if (editingHero) {
        await axios.put(`${API}/admin/hero-content/${editingHero.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Hero section updated!');
      } else {
        await axios.post(`${API}/admin/hero-content`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Hero section created!');
      }
      resetForm();
      fetchHeroSections();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error('Failed to save hero section');
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
                <Label>Background Image</Label>
                <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
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

const AdminMobileNav = ({ currentTab, onTabChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const tabs = [
    { value: 'products', label: 'Products', icon: '📦' },
    { value: 'rentals', label: 'Rentals', icon: '👗' },
    { value: 'feedback', label: 'Reviews', icon: '⭐' },
    { value: 'hero', label: 'Hero Content', icon: '🖼️' },
    { value: 'inquiries', label: 'Inquiries', icon: '📧' }
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

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [heroSections, setHeroSections] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchHeroSections();
  }, []);

  useEffect(() => {
    if (heroSections.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % heroSections.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroSections]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      const products = response.data;
      setFeaturedProducts(products.filter(p => p.featured).slice(0, 4));
      setNewArrivals(products.filter(p => p.newArrival).slice(0, 4));
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
          backgroundImageUrl: 'https://images.unsplash.com/photo-1756483510837-e79455e52188?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0cmFkaXRpb25hbCUyMGZhc2hpb258ZW58MHx8fHwxNzYwMDIyODcxfDA&ixlib=rb-4.1.0&q=85'
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

  const ProductCard = ({ product }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
      if (product.images && product.images.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
        }, 2000);
        return () => clearInterval(interval);
      }
    }, [product.images]);

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          {product.images && product.images.length > 0 ? (
            <>
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
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

  return (
    <div className="home-page">
      {heroSections.length > 0 && (
        <section className="hero-section relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed transition-all duration-1000" 
            style={{backgroundImage: `url(${heroSections[currentHeroIndex]?.backgroundImageUrl})`}} 
          />
          <div className="hero-overlay relative z-10">
            <div className="hero-content">
              <h1 className="hero-title animate-fade-in">{heroSections[currentHeroIndex]?.title}</h1>
              <p className="hero-subtitle animate-fade-in-delay">{heroSections[currentHeroIndex]?.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 px-4">
                <Button onClick={() => navigate('/products')} className="hero-btn w-full sm:w-auto">Shop Now</Button>
                <Button onClick={() => navigate('/contact')} variant="outline" className="hero-btn-outline w-full sm:w-auto">Customize Your Outfit</Button>
              </div>
              {heroSections.length > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  {heroSections.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentHeroIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        idx === currentHeroIndex ? 'bg-white' : 'bg-white/50'
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#8B1538]">Shop by Collection</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="collection-card women-collection" onClick={() => navigate('/products?category=Women')}>
              <div className="collection-overlay">
                <h3 className="collection-title">Women's Collection</h3>
                <p className="collection-subtitle">Lehenga • Blouses • Dresses</p>
              </div>
            </div>
            <div className="collection-card men-collection" onClick={() => navigate('/products?category=Men')}>
              <div className="collection-overlay">
                <h3 className="collection-title">Men's Collection</h3>
                <p className="collection-subtitle">Khadi • Kurta • T-Shirts</p>
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
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setSelectedCategory(category);
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

  const ProductCard = ({ product }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
      if (product.images && product.images.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
        }, 2000);
        return () => clearInterval(interval);
      }
    }, [product.images]);

    const addToCart = async () => {
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
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-64">
          {product.images && product.images.length > 0 ? (
            <>
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
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
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{product.category} - {product.subcategory}</p>
          <p className="text-lg font-bold text-[#8B1538] mb-2">₹{product.price}</p>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="text-xs text-gray-500">Sizes: {product.sizes.join(', ')}</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="text-xs text-gray-500">Colors: {product.colors.join(', ')}</span>
          </div>
          {product.customizable && (
            <Badge variant="outline" className="mb-3 text-xs">Customizable</Badge>
          )}
          <Button 
            onClick={addToCart}
            className="w-full bg-[#8B1538] hover:bg-[#6B0F2A] text-white"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/inquiries`, formData);
      toast.success('Thank you! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
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
            <CardDescription>Have a question or want to discuss customization? Send us a message!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea id="message" required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
              </div>
              <Button type="submit" className="w-full bg-[#8B1538] hover:bg-[#6B0F2A] text-white">Send Message</Button>
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
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
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