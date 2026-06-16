import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/AdminLayout";

// Route Protection Wrappers
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Public User Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Doctors from "./pages/Doctors";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Appointment from "./pages/Appointment";
import SymptomGuide from "./pages/SymptomGuide";
import Testimonials from "./pages/Testimonials";
import FAQ from "./pages/FAQ";

// Protected User Pages
import PatientDashboard from "./pages/PatientDashboard";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Admin Login Route (No headers/sidebars) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Deprecated fallback route redirection for admin login */}
        <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />

        {/* Protected Admin Console Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          {/* Index redirect to /admin/dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Dedicated Admin Pages */}
          <Route path="dashboard" element={<AdminDashboard activeSection="dashboard" />} />
          <Route path="appointments" element={<AdminDashboard activeSection="appointments" />} />
          <Route path="doctors" element={<AdminDashboard activeSection="doctors" />} />
          <Route path="services" element={<AdminDashboard activeSection="services" />} />
          <Route path="testimonials" element={<AdminDashboard activeSection="testimonials" />} />
          <Route path="faqs" element={<AdminDashboard activeSection="faqs" />} />
          <Route path="users" element={<AdminDashboard activeSection="users" />} />
        </Route>

        {/* Public & Patient Portal Routes */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          
          {/* Redirect /signup to /register per new routing architecture */}
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          
          <Route path="/book-appointment" element={<Appointment />} />
          <Route path="/symptom-guide" element={<SymptomGuide />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/faq" element={<FAQ />} />

          {/* Protected Patient Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all Redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;