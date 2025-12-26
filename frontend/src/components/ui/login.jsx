import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../App";
import { GoogleLogin } from '@react-oauth/google';
import { ShoppingCart, Menu, X, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081'}/api/auth`;



export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      const res = await axios.post(`${API_URL}/login`, form);

      login(res.data.accessToken, res.data.user);

      setMessage({ text: "Login successful! Redirecting...", type: "success" });
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        setMessage({ text: "Please verify your email to continue.", type: "error" });
        setTimeout(() => navigate(`/verify-email?email=${form.email}`), 2000);
        return;
      }

      setMessage({ text: "Your username or password is incorrect", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/google`, {
        token: credentialResponse.credential
      });
      
      login(response.data.accessToken, response.data.user);
      setMessage({ text: "Google login successful! Redirecting...", type: "success" });
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      setMessage({ text: "Google login failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#FDF9F3] to-[#F5F1E8] flex items-center justify-center p-4 relative overflow-hidden"
         style={{
           backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23DAA520' fill-opacity='0.05'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           backgroundSize: '120px 120px'
         }}>
      {/* Fashion Product Silhouettes */}
      <div className="absolute inset-0 opacity-8">
        {/* Left side fashion items */}
        <div className="absolute top-16 left-8 w-24 h-32 bg-gradient-to-b from-[#8B1538]/20 to-[#DAA520]/20 rounded-full transform rotate-12"></div>
        <div className="absolute top-40 left-16 w-16 h-20 bg-[#8B1538]/15 rounded-lg transform -rotate-6"></div>
        <div className="absolute bottom-32 left-12 w-20 h-24 bg-gradient-to-t from-[#DAA520]/20 to-[#8B1538]/15 rounded-full"></div>
        
        {/* Right side fashion items */}
        <div className="absolute top-24 right-12 w-18 h-28 bg-gradient-to-b from-[#DAA520]/20 to-[#8B1538]/20 rounded-full transform -rotate-12"></div>
        <div className="absolute top-52 right-8 w-14 h-18 bg-[#8B1538]/15 rounded-lg transform rotate-8"></div>
        <div className="absolute bottom-24 right-16 w-22 h-26 bg-gradient-to-t from-[#8B1538]/20 to-[#DAA520]/15 rounded-full transform rotate-6"></div>
        
        {/* Fashion icons */}
        <div className="absolute top-20 left-20 text-4xl opacity-30">👗</div>
        <div className="absolute bottom-20 right-20 text-4xl opacity-30">👜</div>
        <div className="absolute top-1/3 right-1/4 text-3xl opacity-30">⭐</div>
        <div className="absolute bottom-1/3 left-1/4 text-3xl opacity-30">👠</div>
        
        {/* Decorative circles */}
        <div className="absolute top-1/4 left-1/3 w-32 h-32 border border-[#8B1538]/10 rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/3 w-24 h-24 border border-[#DAA520]/15 rounded-full"></div>
        
        {/* Fashion pattern dots */}
        <div className="absolute top-12 right-1/3 w-2 h-2 bg-[#8B1538]/20 rounded-full"></div>
        <div className="absolute top-16 right-1/3 w-1 h-1 bg-[#DAA520]/25 rounded-full"></div>
        <div className="absolute bottom-12 left-1/3 w-2 h-2 bg-[#8B1538]/20 rounded-full"></div>
        <div className="absolute bottom-16 left-1/3 w-1 h-1 bg-[#DAA520]/25 rounded-full"></div>
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <img 
              src="/logo.png" 
              alt="Pradha Fashion Outlet"
              className="h-16 mx-auto mb-4"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="hidden text-2xl font-bold text-[#8B1538]">Pradha Fashion Outlet</div>
            <h2 className="text-2xl font-bold text-[#8B1538] mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input 
                name="email" 
                type="email"
                placeholder="Email Address" 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                name="password" 
                placeholder="Password" 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {message.text && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? 
                  <CheckCircle size={16} /> : 
                  <XCircle size={16} />
                }
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B1538] hover:bg-[#6B0F2A] text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or continue with</span>
              </div>
            </div>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMessage({ text: 'Google login failed', type: 'error' })}
              theme="outline"
              size="large"
              width="100%"
            />

            <div className="text-center space-y-2">
              <Link 
                to="/forgot-password" 
                className="text-[#8B1538] hover:text-[#6B0F2A] text-sm font-medium"
              >
                Forgot your password?
              </Link>
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-[#8B1538] hover:text-[#6B0F2A] font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>

        <footer className="mt-8 relative z-50">
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-6">
              <a 
                href="https://www.instagram.com/pradha_fashion_outlet?igsh=cXplemF6eTZxYnY1" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-[#8B1538] transition-colors cursor-pointer underline hover:bg-gray-100 rounded"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
              <a 
                href="https://wa.me/917972177226" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-[#8B1538] transition-colors cursor-pointer underline hover:bg-gray-100 rounded"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                </svg>
                WhatsApp
              </a>
              <a 
                href="mailto:pradhafashionoutlet@gmail.com" 
                className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-[#8B1538] transition-colors cursor-pointer underline hover:bg-gray-100 rounded"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Email Us
              </a>
            </div>
            <p className="text-gray-500 text-sm">© 2025 Pradha Fashion Outlet. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
