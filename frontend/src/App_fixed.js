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

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  return (
    <div className="page-container" data-testid="admin-dashboard">
      <h1 className="page-title">Admin Dashboard</h1>
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="hidden md:grid w-full max-w-3xl mx-auto grid-cols-5">
          <TabsTrigger value="products" data-testid="products-tab">Products</TabsTrigger>
          <TabsTrigger value="rentals" data-testid="rentals-tab">Rentals</TabsTrigger>
          <TabsTrigger value="feedback" data-testid="feedback-tab">Reviews</TabsTrigger>
          <TabsTrigger value="hero" data-testid="hero-tab">Hero Content</TabsTrigger>
          <TabsTrigger value="inquiries" data-testid="inquiries-tab">Inquiries</TabsTrigger>
        </TabsList>
        
        <div className="md:hidden mb-6">
          <AdminMobileNav />
        </div>

        <TabsContent value="products">
          <div>Products content here</div>
        </TabsContent>

        <TabsContent value="rentals">
          <AdminRentalDashboard />
        </TabsContent>

        <TabsContent value="feedback">
          <div>Feedback content here</div>
        </TabsContent>

        <TabsContent value="hero">
          <div>Hero content here</div>
        </TabsContent>

        <TabsContent value="inquiries">
          <div>Inquiries content here</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AdminMobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  
  const tabs = [
    { value: 'products', label: 'Products', icon: '📦' },
    { value: 'rentals', label: 'Rentals', icon: '👗' },
    { value: 'feedback', label: 'Reviews', icon: '⭐' },
    { value: 'hero', label: 'Hero Content', icon: '🖼️' },
    { value: 'inquiries', label: 'Inquiries', icon: '📧' }
  ];
  
  const currentTab = tabs.find(tab => tab.value === activeTab);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#8B1538] text-white py-3 px-4 rounded-lg flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <span>{currentTab?.icon}</span>
          <span>{currentTab?.label}</span>
        </span>
        <Menu className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setIsOpen(false);
                const tabTrigger = document.querySelector(`[data-testid="${tab.value}-tab"]`);
                if (tabTrigger) tabTrigger.click();
              }}
              className={`w-full text-left py-3 px-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                activeTab === tab.value ? 'bg-[#8B1538]/10 text-[#8B1538] font-medium' : 'text-gray-700'
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
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