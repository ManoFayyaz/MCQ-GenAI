import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";
import API_URL from '../config';


export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [streak, setStreak] = useState(0);
  const [userId, setUserId] = useState(null);

  // const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  
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
      .get(`${API_URL}/api/user/${userId}`)
      .then((res) => {
        console.log("Profile data:", res.data); // <-- debug
        setEmail(res.data.email);
        setStreak(res.data.streak || 0);
      })
      .catch((err) => console.log("Profile fetch error:", err));
  }, [userId]);


//   const handleEmailUpdate = () => {
//   if (!newEmail) return alert("Please enter a new email");

//   axios.post(`${API_URL}/api/user/${userId}/update`, {
//     email: newEmail
//   })
//   .then(() => {
//     alert("Email updated successfully!");
//     setEmail(newEmail);
//     setShowEmailForm(false);
//     setNewEmail("");
//   })
//   .catch(err => console.log("Email update error:", err));
// };

const handlePasswordUpdate = () => {
  if (!newPassword) return alert("Please enter a new password");

  axios.post(`${API_URL}/api/user/${userId}/update`, {
    password: newPassword
  })
  .then(() => {
    alert("Password updated successfully!");
    setShowPasswordForm(false);
    setNewPassword("");
  })
  .catch(err => console.log("Password update error:", err));
};



  const handleDelete = () => {
    if (!userId) return;
    const confirmDelete = window.confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) return;

    axios
      .delete(`${API_URL}/api/user/${userId}`)
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
            {/* <button className="btn">Update Email</button>
            <button className="btn">Change Password</button> */}
            {/* <button className="btn" onClick={() => setShowEmailForm(true)}>
              Update Email
            </button> */}

            <button className="btn" onClick={() => setShowPasswordForm(true)}>
              Change Password
            </button>
            {/* Email and Password Dialog box */}
            {/* {showEmailForm && (
              <div className="update-box">
                <br/>
                <input
                  type="email"
                  placeholder="Enter new email"
                  className="form-control mb-2"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <button className="btn btn-success" onClick={handleEmailUpdate}>
                  Save Email 
                </button>

                <button className="btn btn-secondary " onClick={() => setShowEmailForm(false)}>
                  Cancel
                </button>
              </div>
            )} */}

            {showPasswordForm && (
              <div className="update-box ">
                <br/>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="form-control mb-2"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button className="btn btn-success" onClick={handlePasswordUpdate}>
                  Save Password
                </button>
                <button className="btn btn-secondary" onClick={() => setShowPasswordForm(false)}>
                  Cancel
                </button>
              </div>
            )}

          </div>
          
          {/* Delete account */}
          <br/>
          <button className="delete-btn" onClick={handleDelete}>
            Delete Account
          </button>
        </div>
      </div>
      </div>
  );
}


