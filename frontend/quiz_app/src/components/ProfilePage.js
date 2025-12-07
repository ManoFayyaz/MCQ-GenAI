
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [streak, setStreak] = useState(0);
  const [userId, setUserId] = useState(null);

  // Load userId from sessionStorage once
  // useEffect(() => {
  //   const storedId = sessionStorage.getItem("user_id");
  //   if (storedId) setUserId(storedId);
  // }, []);


  // Get logged-in user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) setUserId(user.id);
  }, [])

  // Fetch profile only when userId exists
  useEffect(() => {
    if (!userId) return;

    console.log("Fetching profile for userId:", userId);

    axios
      .get(`http://127.0.0.1:5000/api/user/${userId}`)
      .then((res) => {
        console.log("Profile data:", res.data); // <-- debug
        setEmail(res.data.email);
        setStreak(res.data.streak || 0);
      })
      .catch((err) => console.log("Profile fetch error:", err));
  }, [userId]);

  const handleDelete = () => {
    if (!userId) return;
    const confirmDelete = window.confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) return;

    axios
      .delete(`http://127.0.0.1:5000/api/user/${userId}`)
      .then(() => {
        alert("Account deleted.");
        sessionStorage.clear();
        window.location.href = "/login";
      })
      .catch((err) => console.log("Delete error:", err));
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="profile-page-container">
        
        <h2 className="profile-title" >User Profile</h2>

        <div className="profile-card">
          <div className="profile-email">
            <label>Email: </label> <br/>
            <span><i>{email}</i></span>
          </div>

          <br/>

          <div className="profile-streak">
            <span className="streak-icon">🔥</span>
            <span><b><i>{streak}</i></b> <b>Day Streak </b></span>
          </div>

          <br/>

          <div className="profile-divider"></div>

          <h3 className="settings-title">Account Settings</h3>

          <div className="settings-buttons">
            <button className="btn">Update Email</button>
            <button className="btn">Change Password</button>
          </div>
          
          <br/>
          <button className="delete-btn" onClick={handleDelete}>
            Delete Account
          </button>
        </div>
      </div>
      </div>
  );
}


