import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../App";
import { ShoppingCart } from 'lucide-react';

const API_URL = "http://18.205.19.24:8081/api/auth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B1538' }}>Pradha</span>
            <span style={{ fontSize: '18px', color: '#6b7280' }}>Fashion Outlet</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Home</Link>
            <Link to="/products" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Collections</Link>
            <Link to="/about" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>About</Link>
            <Link to="/contact" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Contact</Link>
            {user && user.role === 'ADMIN' && <Link to="/admin" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Admin</Link>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
    </nav>
  );
};

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#8B1538', color: 'white', marginTop: '80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Pradha Fashion Outlet</h3>
            <p style={{ color: '#d1d5db' }}>Where Tradition Meets Elegance</p>
          </div>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
              <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>Collections</Link>
              <Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>About</Link>
              <Link to="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Follow Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>Instagram</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>Facebook</a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>WhatsApp</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', marginTop: '32px', paddingTop: '32px', textAlign: 'center', color: '#d1d5db' }}>
          <p>© 2025 Pradha Fashion Outlet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", phone: "", password: "" });

  const handleChange = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/signup`, user);

      alert("OTP sent to email! Verify to activate account");
      navigate(`/verify-email?email=${user.email}&name=${encodeURIComponent(user.name)}&phone=${encodeURIComponent(user.phone)}&password=${encodeURIComponent(user.password)}`);
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '20px' }}>
          <form onSubmit={handleSubmit} style={{
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%',
            padding: '40px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            backgroundColor: 'white'
          }}>
            <h3 style={{ marginBottom: '30px', color: '#8B1538', fontSize: '24px' }}>Sign Up</h3>
            <input 
              name="name" 
              placeholder="Name" 
              onChange={handleChange} 
              required 
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              onChange={handleChange} 
              required 
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <input 
              name="phone" 
              placeholder="Phone" 
              onChange={handleChange} 
              required 
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              onChange={handleChange} 
              required 
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '20px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <button 
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#8B1538',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '20px'
              }}
            >
              Register
            </button>
            <p style={{ margin: 0, color: '#666' }}>
              Already have an account? <Link to="/login" style={{ color: '#8B1538', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
