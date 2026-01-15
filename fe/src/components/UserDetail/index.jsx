import React, { useEffect, useState } from "react";
import { Typography, TextField, Button } from "@mui/material";
import "./styles.css";
import { Link, useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

function UserDetail({ user }) {
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const userData = await fetchModel(
        `http://localhost:8080/api/user/${userId}`
      );
      setUserInfo(userData);
      setFormData(userData);
      setEditMode(false);
    };

    fetchData();
  }, [userId]);


  if (!userInfo) {
    return <Typography>Loading user information...</Typography>;
  }

  const isOwner = user && user._id === userInfo._id;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSave = async () => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/user/${userInfo._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      }
    );

    const text = await response.text();
    console.log("STATUS:", response.status);
    console.log("RESPONSE:", text);

    if (!response.ok) {
      throw new Error(text);
    }

    const updatedUser = JSON.parse(text);
    setUserInfo(updatedUser);
    setEditMode(false);
  } catch (err) {
    console.error("Update error:", err);
    alert("Failed to update profile");
  }
};

  return (
    <div className="UserDetail">
      <Typography variant="h4">
        {userInfo.first_name} {userInfo.last_name}
      </Typography>
      <Typography>
        <strong>Location:</strong> {userInfo.location}
      </Typography>
      <Typography>
        <strong>Description:</strong> {userInfo.description}
      </Typography>
      <Typography>
        <strong>Occupation:</strong> {userInfo.occupation}
      </Typography>
      <div className="profile-actions">
        {!editMode && (
          <Link to={`/photos/${userInfo._id}`} className="profile-action-btn">
            View Photos
          </Link>
        )}
        {isOwner && !editMode && (
          <button
            className="profile-action-btn"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        )}
        {editMode && (
        <div className="edit-profile-form">
          <TextField
            name="first_name"
            label="First Name"
            value={formData.first_name || ""}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="last_name"
            label="Last Name"
            value={formData.last_name || ""}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="location"
            label="Location"
            value={formData.location || ""}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="description"
            label="Description"
            value={formData.description || ""}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            name="occupation"
            label="Occupation"
            value={formData.occupation || ""}
            onChange={handleChange}
            fullWidth
          />
          <div className="edit-actions">
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
            <Button variant="outlined" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default UserDetail;
