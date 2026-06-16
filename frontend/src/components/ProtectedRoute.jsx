import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("patientToken");
  const location = useLocation();

  if (!token) {
    // Redirect unauthenticated user to login, saving the redirect path
    const searchParams = new URLSearchParams();
    searchParams.set("redirect", location.pathname.substring(1));
    return <Navigate to={`/login?${searchParams.toString()}`} replace />;
  }

  // Get user details
  const userStr = localStorage.getItem("patientUser");
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error("Error parsing patient user:", e);
    }
  }

  const role = user?.role || "user";
  if (role !== "user") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;