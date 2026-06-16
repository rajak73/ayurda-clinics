import { useState } from "react";
import api from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";

function Login() {
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
      const res = await api.post("/users/login", formData);
      
      // Store patient session details
      localStorage.setItem("patientToken", res.data.token);
      localStorage.setItem("patientUser", JSON.stringify(res.data.user));

      // Dispatch custom storage event to update navbar dynamically
      window.dispatchEvent(new Event("storage"));

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      navigate(redirect ? `/${redirect}` : "/dashboard");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-5 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg border border-gray-100">
        <h1 className="text-3xl font-black text-gray-905 flex items-center gap-2">
          Patient Login <span className="text-teal-600">✦</span>
        </h1>
        <p className="mt-2 text-sm text-gray-505">
          Sign in to manage your appointments, edit your medical profile, and check receipts.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                required
                type="email"
                name="email"
                placeholder="patient@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-250 pl-11 pr-4 py-3 outline-none focus:border-teal-700 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                required
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-250 pl-11 pr-4 py-3 outline-none focus:border-teal-700 text-sm"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-650 text-sm font-semibold">
              {errorMsg}
            </p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-full bg-teal-700 hover:bg-teal-800 px-5 py-3 font-bold text-white transition disabled:bg-gray-400 shadow-md"
          >
            {loading ? "Logging in..." : <>Login <LogIn size={18} /></>}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t text-center text-sm text-gray-505">
          Don't have a patient account?{" "}
          <Link to={`/signup${window.location.search}`} className="text-teal-750 font-bold hover:underline inline-flex items-center gap-0.5">
            Register Here <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Login;
