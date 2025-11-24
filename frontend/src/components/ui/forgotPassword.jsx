import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081'}/api/auth`;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await axios.post(`${API_URL}/forgot-password`, { email });
      setMessage({ text: "OTP sent to your email!", type: "success" });
      setStep(2);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Failed to send OTP", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await axios.post(`${API_URL}/verify-reset-otp`, { email, otp });
      setMessage({ text: "OTP verified! Now set your new password.", type: "success" });
      setOtpVerified(true);
      setStep(3);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Invalid OTP", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await axios.post(`${API_URL}/reset-password`, { email, otp, newPassword });
      setMessage({ text: "Password reset successfully! Redirecting to login...", type: "success" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Failed to reset password", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '20px' }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#8B1538', fontSize: '24px' }}>
          {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}
        </h2>

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center' }}>
              Enter your email address and we'll send you an OTP to reset your password.
            </p>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                {message.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {message.text}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#ccc' : '#8B1538',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '20px'
              }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : step === 2 ? (
          <form onSubmit={handleOtpVerify}>
            <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center' }}>
              Enter the OTP sent to {email}
            </p>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength="6"
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                textAlign: 'center',
                letterSpacing: '2px'
              }}
            />
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
                {message.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {message.text}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#ccc' : '#8B1538',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '20px'
              }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset}>

            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '45px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
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
                {message.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {message.text}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#ccc' : '#8B1538',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '20px'
              }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#8B1538', textDecoration: 'none', fontSize: '14px' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}