import { Navigate } from "react-router-dom";

function PatientProtectedRoute({ children }) {
  const token = localStorage.getItem("patientToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PatientProtectedRoute;
