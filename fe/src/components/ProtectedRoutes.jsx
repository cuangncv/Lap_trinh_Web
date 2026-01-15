import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoutes({ user, children }) {
  if (user === undefined) {
    return null;
  }
  if (user === null) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
