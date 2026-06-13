import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from '../config';
import toast, { Toaster } from 'react-hot-toast';
import { User, Mail, Flame, Lock, Trash2, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [streak, setStreak] = useState(0);
  const [userId, setUserId] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) setUserId(user.id);
  }, []);

  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_URL}/api/user/${userId}`)
      .then((res) => {
        setEmail(res.data.email);
        setStreak(res.data.streak || 0);
      })
      .catch((err) => console.log("Profile fetch error:", err));
  }, [userId]);

  const handlePasswordUpdate = async () => {
    if (!newPassword) { toast.error("Please enter a new password"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/user/${userId}/update`, { password: newPassword });
      toast.success("Password updated successfully!");
      setShowPasswordForm(false);
      setNewPassword("");
    } catch (err) {
      toast.error("Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!userId) return;
    toast((t) => (
      <div>
        <p style={{ margin: "0 0 12px", fontWeight: "600" }}>Delete your account?</p>
        <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#a0a0b0" }}>This cannot be undone.</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              axios.delete(`${API_URL}/api/user/${userId}`)
                .then(() => {
                  toast.success("Account deleted.");
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = "/";
                })
                .catch(() => toast.error("Failed to delete account."));
            }}
            style={{ backgroundColor: "#ff6b6b", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontWeight: "600" }}
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ backgroundColor: "#2a2a3e", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 10000, style: { background: "#1e1e2e", color: "#fff", border: "1px solid #2a2a3e" } });
  };

  return (
    <div style={{ backgroundColor: "#0f0f1a", minHeight: "100vh", padding: "40px 20px", display: "flex", justifyContent: "center" }}>
      <Toaster position="top-right" toastOptions={{
        style: { background: "#1e1e2e", color: "#fff", border: "1px solid #2a2a3e" }
      }} />

      <div style={{ width: "100%", maxWidth: "480px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "72px", height: "72px",
            backgroundColor: "rgba(212,245,66,0.1)",
            borderRadius: "50%", border: "2px solid rgba(212,245,66,0.3)",
            marginBottom: "14px"
          }}>
            <User size={32} color="#d4f542" />
          </div>
          <h1 style={{ color: "#ffffff", fontSize: "24px", fontWeight: "700", margin: 0 }}>
            My Profile
          </h1>
          <p style={{ color: "#a0a0b0", fontSize: "14px", marginTop: "4px" }}>
            Manage your account settings
          </p>
        </div>

        {/* Email Card */}
        <div style={{
          backgroundColor: "#1e1e2e", border: "1px solid #2a2a3e",
          borderRadius: "16px", padding: "20px 24px",
          marginBottom: "16px",
          display: "flex", alignItems: "center", gap: "14px"
        }}>
          <div style={{
            width: "40px", height: "40px", backgroundColor: "rgba(168,216,240,0.1)",
            borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Mail size={18} color="#a8d8f0" />
          </div>
          <div>
            <p style={{ color: "#a0a0b0", fontSize: "12px", margin: 0 }}>Email Address</p>
            <p style={{ color: "#ffffff", fontSize: "15px", fontWeight: "600", margin: 0 }}>{email}</p>
          </div>
        </div>

        {/* Streak Card */}
        <div style={{
          backgroundColor: "#1e1e2e", border: "1px solid rgba(212,245,66,0.25)",
          borderRadius: "16px", padding: "20px 24px",
          marginBottom: "16px",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "40px", height: "40px",
              backgroundColor: "rgba(212,245,66,0.1)",
              borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Flame size={18} color="#d4f542" />
            </div>
            <div>
              <p style={{ color: "#a0a0b0", fontSize: "12px", margin: 0 }}>Daily Streak</p>
              <p style={{ color: "#d4f542", fontSize: "15px", fontWeight: "700", margin: 0 }}>
                {streak} Day{streak !== 1 ? "s" : ""} 🔥
              </p>
            </div>
          </div>
          <div style={{
            backgroundColor: "rgba(212,245,66,0.1)",
            border: "1px solid rgba(212,245,66,0.2)",
            borderRadius: "10px", padding: "8px 16px",
            color: "#d4f542", fontWeight: "800", fontSize: "24px"
          }}>
            {streak}
          </div>
        </div>

        {/* Settings Card */}
        <div style={{
          backgroundColor: "#1e1e2e", border: "1px solid #2a2a3e",
          borderRadius: "16px", padding: "20px 24px", marginBottom: "16px"
        }}>
          <h3 style={{ color: "#ffffff", fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={18} color="#d4f542" /> Account Settings
          </h3>

          {/* Change Password Button */}
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            style={{
              width: "100%", backgroundColor: "#2a2a3e",
              border: "1px solid #3a3a4e", borderRadius: "10px",
              padding: "12px 16px", color: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer", fontSize: "14px", fontWeight: "500"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Lock size={16} color="#a0a0b0" />
              Change Password
            </div>
            {showPasswordForm ? <ChevronUp size={16} color="#a0a0b0" /> : <ChevronDown size={16} color="#a0a0b0" />}
          </button>

          {/* Password Form */}
          {showPasswordForm && (
            <div style={{ marginTop: "12px" }}>
              <input
                type="password"
                placeholder="Enter new password (min. 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: "100%", backgroundColor: "#2a2a3e",
                  border: "1px solid #3a3a4e", borderRadius: "10px",
                  padding: "11px 14px", color: "#ffffff",
                  fontSize: "14px", outline: "none", marginBottom: "10px"
                }}
                onFocus={e => e.target.style.borderColor = "#d4f542"}
                onBlur={e => e.target.style.borderColor = "#3a3a4e"}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handlePasswordUpdate}
                  disabled={loading}
                  style={{
                    flex: 1, backgroundColor: "#d4f542", color: "#0f0f1a",
                    border: "none", borderRadius: "10px", padding: "10px",
                    fontWeight: "700", cursor: "pointer", fontSize: "14px"
                  }}
                >
                  {loading ? "Saving..." : "Save Password"}
                </button>
                <button
                  onClick={() => { setShowPasswordForm(false); setNewPassword(""); }}
                  style={{
                    backgroundColor: "#2a2a3e", color: "#a0a0b0",
                    border: "1px solid #3a3a4e", borderRadius: "10px",
                    padding: "10px 16px", cursor: "pointer", fontSize: "14px"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Account */}
        <button
          onClick={handleDelete}
          style={{
            width: "100%", backgroundColor: "transparent",
            color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)",
            borderRadius: "12px", padding: "13px",
            fontWeight: "600", fontSize: "14px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "8px", transition: "all 0.2s"
          }}
          onMouseOver={e => { e.currentTarget.style.backgroundColor = "rgba(255,107,107,0.08)"; }}
          onMouseOut={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <Trash2 size={16} />
          Delete Account
        </button>
      </div>
    </div>
  );
}
