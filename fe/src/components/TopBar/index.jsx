import React, { useEffect, useState, useRef } from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { useLocation, useNavigate, Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function TopBar({ user, onLogout, onPhotoUploaded }) {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userDetail, setUserDetail] = useState({});

  useEffect(() => {
    async function fetchUser() {
      const userId = location.pathname.split("/")[2];
      if (userId) {
        try {
          const data = await fetchModel(
            `http://localhost:8080/api/user/${userId}`
          );
          setUserDetail(data);
        } catch (err) {
          console.error(err);
        }
      } else {
        setUserDetail({});
      }
    }
    fetchUser();
  }, [location.pathname]);

  if (!user) {
    return (
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h5">Photo Sharing</Typography>
        </Toolbar>
      </AppBar>
    );
  }

  const onClickLogout = async () => {
    await onLogout();
    navigate("/login");
  };

  async function handleUpload(file) {
    if (!file) return;

    const fd = new FormData();
    fd.append("photo", file);
    fd.append("user_id", user._id);

    try {
      const res = await fetch(
        "http://localhost:8080/api/photosOfUser/new",
        {
          method: "POST",
          body: fd,
          credentials: "include",
        }
      );
      if (res.ok) {
        onPhotoUploaded();
        alert("Upload successfully!");
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AppBar position="fixed">
      <Toolbar className="topbar-toolbar">
        <Box className="topbar-left">
          <Typography variant="h5">B22DCAT228</Typography>
        </Box>

        <Box className="topbar-center">
          {location.pathname.includes("/photos/") && (
            <Typography variant="h6">
              Photos of {userDetail.last_name}
            </Typography>
          )}
          {location.pathname.includes("/user/") && (
            <Typography variant="h6">
              Details of {userDetail.last_name}
            </Typography>
          )}
        </Box>

        <Box className="topbar-right">
          <Typography className="topbar-hello">
            Hi {user.first_name}!
          </Typography>

          <Link to="/changepassword" className="change-password-link">
            Change Password
          </Link>

          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={(e) => handleUpload(e.target.files[0])}
          />

          <button
            className="logout-btn"
            onClick={() => fileInputRef.current.click()}
          >
            Upload Photo
          </button>

          <button className="logout-btn" onClick={onClickLogout}>
            Logout
          </button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
