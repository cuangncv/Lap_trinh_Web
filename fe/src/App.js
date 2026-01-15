import "./App.css";
import { useState, useEffect } from "react";
import { Grid, Paper } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";

import api from "./lib/api";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";
import ProtectedRoutes from "./components/ProtectedRoutes";
import MainLayout from "./components/MainLayout";
import TopBar from "./components/TopBar";
import ChangePassword from "./components/LoginRegister/changepassword";
const App = () => {
  const [user, setUser] = useState(undefined);
  const [reloadSignal, setReloadSignal] = useState(0);

  const handlePhotoUploaded = () => setReloadSignal((c) => c + 1);

  useEffect(() => {
    api
      .get("/api/user/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    api
      .post("/api/user/logout", {}, { withCredentials: true })
      .finally(() => setUser(null));
  };

  // --- Loading screen ---
  if (user === undefined) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      <Grid item xs={12}>
        <TopBar
          user={user}
          onLogout={handleLogout}
          onPhotoUploaded={handlePhotoUploaded}
        />
      </Grid>

      <Grid item xs={12} md={9}>
        <Paper className="main-grid-item" sx={{ p: 2 }}>
          <Routes>
            <Route
              path="/"
              element={
                user ? (
                  <Navigate to="/users" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/login"
              element={<LoginRegister onLogin={setUser} />}
            />

            <Route element={<ProtectedRoutes user={user} />}>
              <Route element={<MainLayout />}>
                <Route path="/users" element={<UserList />} />

                <Route
                  path="/user/:userId"
                  element={<UserDetail user={user} />}
                />
                <Route
                  path="/photos/:userId"
                  element={<UserPhotos user={user} reloaded={reloadSignal} />}
                />

                <Route
                  path="/changepassword"
                  element={
                    <ChangePassword user={user} reloaded={reloadSignal} />
                  }
                />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default App;
