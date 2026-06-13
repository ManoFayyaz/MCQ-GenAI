import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import API_URL from '../config';
import { Mail, Lock, LogIn, Brain } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) navigate("/prepwise");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Welcome back! 👋");
      setTimeout(() => navigate("/prepwise"), 1000);
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0f0f1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <Toaster position="top-right" toastOptions={{
        style: { background: "#1e1e2e", color: "#fff", border: "1px solid #2a2a3e" }
      }} />

      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px", height: "64px",
            backgroundColor: "rgba(212, 245, 66, 0.1)",
            borderRadius: "16px",
            marginBottom: "16px",
            border: "1px solid rgba(212, 245, 66, 0.2)"
          }}>
            <Brain size={32} color="#d4f542" />
          </div>
          <h1 style={{
            color: "#ffffff",
            fontSize: "28px",
            fontWeight: "800",
            margin: 0,
            fontFamily: "Raleway, sans-serif"
          }}>PrepWise</h1>
          <p style={{ color: "#a0a0b0", fontSize: "14px", marginTop: "6px" }}>
            AI-Powered Quiz Preparation
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: "#1e1e2e",
          borderRadius: "20px",
          padding: "36px",
          border: "1px solid #2a2a3e",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
        }}>
          <h2 style={{ color: "#ffffff", fontSize: "22px", fontWeight: "700", marginBottom: "6px" }}>
            Welcome back
          </h2>
          <p style={{ color: "#a0a0b0", fontSize: "14px", marginBottom: "28px" }}>
            Sign in to continue your quiz preparation
          </p>

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ color: "#a0a0b0", fontSize: "13px", fontWeight: "500", display: "block", marginBottom: "8px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="#a0a0b0" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{
                    width: "100%",
                    backgroundColor: "#2a2a3e",
                    border: "1px solid #3a3a4e",
                    borderRadius: "10px",
                    padding: "12px 14px 12px 40px",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={e => e.target.style.borderColor = "#d4f542"}
                  onBlur={e => e.target.style.borderColor = "#3a3a4e"}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "28px" }}>
              <label style={{ color: "#a0a0b0", fontSize: "13px", fontWeight: "500", display: "block", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="#a0a0b0" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    backgroundColor: "#2a2a3e",
                    border: "1px solid #3a3a4e",
                    borderRadius: "10px",
                    padding: "12px 14px 12px 40px",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={e => e.target.style.borderColor = "#d4f542"}
                  onBlur={e => e.target.style.borderColor = "#3a3a4e"}
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                backgroundColor: loading ? "#2a2a3e" : "#d4f542",
                color: loading ? "#a0a0b0" : "#0f0f1a",
                border: "none",
                borderRadius: "10px",
                padding: "13px",
                fontWeight: "700",
                fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: "16px", height: "16px",
                    border: "2px solid #a0a0b0",
                    borderTop: "2px solid #d4f542",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>

          </form>

          {/* Register Link */}
          <p style={{ textAlign: "center", marginTop: "24px", color: "#a0a0b0", fontSize: "14px" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#d4f542", fontWeight: "600", textDecoration: "none" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Login;

