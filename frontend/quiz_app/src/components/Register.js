import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../config';
import { Mail, Lock, UserPlus, Brain, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Account created successfully!");
        setTimeout(() => navigate("/"), 1000);
      } else {
        toast.error(data.error || "Registration failed. Try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    backgroundColor: "#2a2a3e",
    border: "1px solid #3a3a4e",
    borderRadius: "10px",
    padding: "12px 14px 12px 40px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s"
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
            Create account
          </h2>
          <p style={{ color: "#a0a0b0", fontSize: "14px", marginBottom: "28px" }}>
            Start your AI-powered quiz journey today
          </p>

          <form onSubmit={handleRegister}>

            {/* Email */}
            <div style={{ marginBottom: "18px" }}>
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
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#d4f542"}
                  onBlur={e => e.target.style.borderColor = "#3a3a4e"}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "18px" }}>
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
                  placeholder="Min. 6 characters"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#d4f542"}
                  onBlur={e => e.target.style.borderColor = "#3a3a4e"}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: "28px" }}>
              <label style={{ color: "#a0a0b0", fontSize: "13px", fontWeight: "500", display: "block", marginBottom: "8px" }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <ShieldCheck size={16} color="#a0a0b0" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter your password"
                  style={inputStyle}
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
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Account
                </>
              )}
            </button>

          </form>

          <p style={{ textAlign: "center", marginTop: "24px", color: "#a0a0b0", fontSize: "14px" }}>
            Already have an account?{" "}
            <Link to="/" style={{ color: "#d4f542", fontWeight: "600", textDecoration: "none" }}>
              Sign in
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

export default Register;





// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import API_URL from '../config';


// function Register() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const navigate = useNavigate();

// const handleRegister = async (e) => {
//   e.preventDefault();

//   if (password !== confirmPassword) {
//     alert("Passwords do not match!");
//     return;
//   }

//   try {
//     const response = await fetch(`${API_URL}/register`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email: email,
//         password: password,
//       }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       alert("Registration successful!");
//       navigate("/"); // redirect to login page
//     } else {
//       alert(data.error || "Registration failed. Try again.");
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     alert("Something went wrong while registering!");
//   }
// };

//   return (
//     <div className="container mt-5">
//       <div className="row justify-content-center">
//         <div className="col-md-5">
//           <div className="card shadow-sm">
//             <div className="card-body">
//               <h3 className="card-title text-center mb-4">Register</h3>
//               <form onSubmit={handleRegister}>
//                 <div className="mb-3">
//                   <label className="form-label">Email</label>
//                   <input
//                     type="email"
//                     className="form-control"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">Password</label>
//                   <input
//                     type="password"
//                     className="form-control"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">Confirm Password</label>
//                   <input
//                     type="password"
//                     className="form-control"
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <button type="submit" className="btn btn-success w-100 imp_button">Register</button>
//               </form>
//               <p className="mt-3 text-center">
//                 Already have an account? <Link to="/">Login</Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Register;
