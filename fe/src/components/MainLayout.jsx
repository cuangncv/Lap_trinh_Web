import { Paper } from "@mui/material";
import { Outlet } from "react-router-dom";
import UserList from "./UserList";
import "../App.css";

export default function MainLayout() {
  return (
    <>
      <div className="topbar-container" />

      <div className="main-container">
        <div className="sidebar-fixed">
          <Paper className="sidebar-paper">
            <UserList />
          </Paper>
        </div>

        <div className="content-fixed">
          <Paper className="content-paper">
            <Outlet />
          </Paper>
        </div>
      </div>
    </>
  );
}
