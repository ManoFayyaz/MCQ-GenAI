import React, { useEffect, useState } from "react";
import axios from "axios";
import '../App.css';

export default function ProfilePage() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const userId = user?.id;

  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [streak, setStreak] = useState(0);

  const [newEmail, setNewEmail] = useState("");
  const [passwords, setPasswords] = useState({ old: "", new: "" });

  // Fetch profile details
  useEffect(() => {
    async function loadData() {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/user/${userId}/profile`);
        setEmail(res.data.email);
        setStreak(res.data.streak);
        setProfilePic(res.data.profile_pic || null);
      } catch (err) {
        console.log(err);
      }
    }
    loadData();
  }, [userId]);

  // Preview before upload
  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    uploadPicture(file);
  };

  // Upload profile picture
  const uploadPicture = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/user/upload_pic",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setProfilePic(res.data.file_url);
    } catch (err) {
      console.log(err);
    }
  };

  const updateEmail = async () => {
    try {
      await axios.post("http://127.0.0.1:5000/api/user/update_email", {
        user_id: userId,
        new_email: newEmail,
      });
      alert("Email updated successfully");
      setEmail(newEmail);
      setNewEmail("");
    } catch (err) {
      alert("Error updating email");
    }
  };

  const changePassword = async () => {
    try {
      await axios.post("http://127.0.0.1:5000/api/user/change_password", {
        user_id: userId,
        old_password: passwords.old,
        new_password: passwords.new,
      });
      alert("Password updated!");
      setPasswords({ old: "", new: "" });
    } catch (err) {
      alert("Invalid password");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">

        <div className="profile-pic-section">
          <img
            src={preview || (profilePic ? `http://127.0.0.1:5000/${profilePic}` : "/default.png")}
            className="profile-pic"
            alt="profile"
          />

          <label className="upload-btn">
            Upload
            <input type="file" onChange={handlePicChange} hidden />
          </label>
        </div>

        <h2 className="profile-email">{email}</h2>

        <div className="streak-box">
          <div>
            <h3 className="streak-number">{streak}</h3>
            <p className="streak-label">Total Streak Days</p>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-title">Account Settings</h3>

          <div className="settings-box">
            <h4>Update Email</h4>
            <input
              className="input-field"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New Email"
            />
            <button className="save-btn" onClick={updateEmail}>Save Email</button>
          </div>

          <div className="settings-box">
            <h4>Change Password</h4>
            <input
              type="password"
              className="input-field"
              value={passwords.old}
              onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
              placeholder="Old Password"
            />
            <input
              type="password"
              className="input-field"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              placeholder="New Password"
            />
            <button className="save-btn" onClick={changePassword}>
              Update Password
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
