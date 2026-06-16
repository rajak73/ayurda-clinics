import { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/admin/login", formData);

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminEmail", res.data.admin.email);

      navigate("/admin/dashboard");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-teal-50 px-5 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>

        <p className="mt-2 text-gray-600">
          Login to manage Ayurda Clinics appointments.
        </p>

        <form onSubmit={handleLogin} className="mt-8 grid gap-4">
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            value={formData.email}
            onChange={handleChange}
            className="rounded-xl border px-4 py-3 outline-none focus:border-teal-700"
          />

          <input
            type="password"
            name="password"
            placeholder="Admin Password"
            value={formData.password}
            onChange={handleChange}
            className="rounded-xl border px-4 py-3 outline-none focus:border-teal-700"
          />

          {errorMsg && (
            <p className="rounded-lg bg-red-100 px-4 py-3 text-red-700">
              {errorMsg}
            </p>
          )}

          <button
            disabled={loading}
            className="rounded-full bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default AdminLogin;