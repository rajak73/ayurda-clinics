import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  const patientToken = localStorage.getItem("patientToken");

  if (!adminToken) {
    if (patientToken) {
      // Normal user trying to access admin pages -> Redirect to home page
      return <Navigate to="/" replace />;
    }
    // Unauthenticated user -> Redirect to admin login page
    return <Navigate to="/admin/login" replace />;
  }

  // Admin exists -> Render the children
  return children;
}

export default AdminRoute;
