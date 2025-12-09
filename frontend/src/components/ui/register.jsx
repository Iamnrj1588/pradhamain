import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../App";
import { ShoppingCart, Menu, X, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081'}/api/auth`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(139, 21, 56, 0.1)'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img 
              src="/logo.png" 
              alt="Pradha Fashion Outlet" 
              style={{ height: '48px', width: 'auto', maxWidth: '120px' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#8B1538' }}>Pradha</span>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Fashion</span>
            </div>
          </Link>

          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '32px' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Home</Link>
            <Link to="/products" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Collections</Link>
            <Link to="/rental" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Rentals</Link>
            <Link to="/about" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>About</Link>
            <Link to="/contact" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Contact</Link>
            {user && user.role === 'ADMIN' && <Link to="/admin" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Admin</Link>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Menu style={{ width: '24px', height: '24px', color: '#8B1538' }} />
            </button>
            {user ? (
              <>
                <button onClick={() => navigate('/cart')} style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <ShoppingCart style={{ width: '20px', height: '20px', color: '#8B1538' }} />
                </button>
                <button onClick={logout} style={{ padding: '8px 16px', backgroundColor: 'transparent', border: 'none', color: '#8B1538', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} style={{ padding: '8px 16px', backgroundColor: '#8B1538', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Login</button>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 60
        }} onClick={() => setMobileMenuOpen(false)}>
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: '280px',
            backgroundColor: 'white',
            boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3 style={{ margin: 0, color: '#8B1538', fontSize: '18px' }}>Menu</h3>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '24px', height: '24px', color: '#666' }} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Link 
                to="/" 
                style={{ textDecoration: 'none', color: '#374151', fontWeight: '500', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                style={{ textDecoration: 'none', color: '#374151', fontWeight: '500', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Collections
              </Link>
              <Link 
                to="/rental" 
                style={{ textDecoration: 'none', color: '#374151', fontWeight: '500', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Rentals
              </Link>
              <Link 
                to="/about" 
                style={{ textDecoration: 'none', color: '#374151', fontWeight: '500', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                style={{ textDecoration: 'none', color: '#374151', fontWeight: '500', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {user && user.role === 'ADMIN' && (
                <Link 
                  to="/admin" 
                  style={{ textDecoration: 'none', color: '#374151', fontWeight: '500', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer style={{ backgroundColor: '#8B1538', color: 'white', marginTop: '80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Pradha Fashion Outlet</h3>
            <p style={{ color: '#d1d5db', marginBottom: '16px' }}>Where Tradition Meets Elegance</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => navigate('/login')}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: '#DAA520',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/register')}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '1px solid white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
          
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Visit Our Store</h4>
            <div style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.5' }}>
              <p style={{ fontWeight: '500', margin: '0 0 8px 0' }}>📍 Shop Address:</p>
              <p style={{ margin: '0 0 12px 0' }}>Shop No.3, 1st Floor<br />Youth Arcade, Cidco Waluj<br />Mahanagar - 1, Bajajnagar<br />Chh.Sambhajinagar</p>
              <p style={{ fontWeight: '500', margin: '12px 0 4px 0' }}>📞 Contact:</p>
              <a href="tel:+918308721599" style={{ color: '#DAA520', textDecoration: 'none' }}>+91 83087 21599</a>
              <p style={{ fontWeight: '500', margin: '12px 0 4px 0' }}>🕒 Store Hours:</p>
              <p style={{ margin: '0 0 12px 0' }}>Mon-Sat: 10:00 AM - 8:00 PM<br />Sunday: 11:00 AM - 6:00 PM</p>
              <a 
                href="https://maps.app.goo.gl/gDQApHp49eYyBtGj8?g_st=ac" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#DAA520', textDecoration: 'none', fontSize: '14px' }}
              >
                📍 Get Directions
              </a>
            </div>
          </div>
          
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
              <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>Collections</Link>
              <Link to="/rentals" style={{ color: 'white', textDecoration: 'none' }}>Rentals</Link>
              <Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>About</Link>
              <Link to="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</Link>
            </div>
          </div>
          
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Follow Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="https://www.instagram.com/pradha_fashion_outlet?igsh=cXplemF6eTZxYnY1" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>📱 Instagram</a>
              <a href="https://wa.me/917972177226" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>💬 WhatsApp</a>
              <a href="mailto:pradhafashionoutlet@gmail.com" style={{ color: 'white', textDecoration: 'none' }}>✉️ Email Us</a>
            </div>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', marginTop: '32px', paddingTop: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#d1d5db', fontSize: '14px', textAlign: 'center' }}>
            <p style={{ margin: 0 }}>© 2025 Pradha Fashion Outlet. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/" style={{ color: '#DAA520', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link to="/" style={{ color: '#DAA520', textDecoration: 'none' }}>Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", phone: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await axios.post(`${API_URL}/signup`, user);

      setMessage({ text: "OTP sent to email! Redirecting to verification...", type: "success" });
      setTimeout(() => {
        navigate(`/verify-email?email=${user.email}&name=${encodeURIComponent(user.name)}&phone=${encodeURIComponent(user.phone)}&password=${encodeURIComponent(user.password)}`);
      }, 2000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Registration failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-logo">
              <img 
                src="/logo.png" 
                alt="Pradha Fashion Outlet"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{display: 'none', fontSize: '24px', fontWeight: 'bold', color: '#8B1538'}}>Pradha</div>
            </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <h3 className="auth-title">Sign Up</h3>
            <input 
              name="name" 
              placeholder="Name" 
              onChange={handleChange} 
              required 
              className="auth-input"
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              onChange={handleChange} 
              required 
              className="auth-input"
            />
            <input 
              name="phone" 
              placeholder="Phone" 
              onChange={handleChange} 
              required 
              className="auth-input"
            />
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"}
                name="password" 
                placeholder="Password" 
                onChange={handleChange} 
                required 
                className="auth-input"
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {message.text && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '4px',
                backgroundColor: message.type === 'success' ? '#f0f9ff' : '#fef2f2',
                border: `1px solid ${message.type === 'success' ? '#3b82f6' : '#ef4444'}`,
                color: message.type === 'success' ? '#1e40af' : '#dc2626',
                fontSize: '14px'
              }}>
                {message.type === 'success' ? 
                  <CheckCircle size={16} /> : 
                  <XCircle size={16} />
                }
                {message.text}
              </div>
            )}
            <button 
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
            <p style={{ margin: 0, color: '#666', textAlign: 'center' }}>
              Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
