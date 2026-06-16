import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  Lock,
  LogOut,
  CreditCard,
  CheckCircle,
  Clock,
  X,
  LockKeyhole,
  Info,
  CalendarDays,
  Smartphone,
  Mail,
  UserCheck
} from "lucide-react";

function PatientDashboard() {
  const navigate = useNavigate();

  // Authentication session
  const token = localStorage.getItem("patientToken");
  const localUser = localStorage.getItem("patientUser") ? JSON.parse(localStorage.getItem("patientUser")) : null;

  // Active navigation tab
  const [activeTab, setActiveTab] = useState("appointments");

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [userData, setUserData] = useState(localUser);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: localUser?.name || "",
    email: localUser?.email || "",
    phone: localUser?.phone || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI state variables
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const getHeaders = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchDashboardData = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      // Fetch profile details
      const profileRes = await api.get("/users/profile");
      setUserData(profileRes.data.user);
      setProfileForm({
        name: profileRes.data.user.name,
        email: profileRes.data.user.email,
        phone: profileRes.data.user.phone,
      });

      // Fetch appointments history
      const apptsRes = await api.get("/users/appointments");
      setAppointments(apptsRes.data.appointments);

    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        handleLogout();
        alert("Session expired. Please log in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("patientToken");
    localStorage.removeItem("patientUser");
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  // ================= PROFILE UPDATES =================
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await api.put("/users/profile", profileForm);
      setUserData(res.data.user);
      localStorage.setItem("patientUser", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("storage"));
      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update profile.");
    }
  };

  // ================= PASSWORD UPDATE =================
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    try {
      await api.put("/users/password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordSuccess("Password updated successfully!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password.");
    }
  };

  // ================= RE-TRIGGER UNPAID CHECKOUT =================
  const handlePayAppointment = async (appt) => {
    setLoading(true);
    try {
      // 1. Create order
      const orderRes = await api.post("/payments/order", {
        appointmentId: appt.id
      });
      const orderData = orderRes.data;

      // 2. Check Mock Mode
      if (orderData.isMockMode) {
        const confirmPayment = window.confirm(
          `[DEVELOPER MODE]: Razorpay API keys not configured in backend .env.\n\nClick OK to simulate a SUCCESSFUL payment of ₹500.\nClick Cancel to simulate a CANCELLED payment.`
        );

        if (confirmPayment) {
          await api.post("/payments/verify", {
            appointmentId: appt.id,
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: "mock_sig",
            isMockPayment: true,
          });

          alert("Payment verified successfully!");
          fetchDashboardData();
        } else {
          alert("Payment cancelled.");
        }
        setLoading(false);
        return;
      }

      // 3. Real Checkout
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay Checkout failed to load. Please verify connection.");
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Ayurda Clinics",
        description: `Consultation Fee - ${appt.department}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            setLoading(true);
            await api.post("/payments/verify", {
              appointmentId: appt.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isMockPayment: false,
            });
            alert("Payment completed successfully!");
            fetchDashboardData();
          } catch (err) {
            console.error(err);
            alert("Signature verification failed.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: userData.name,
          contact: userData.phone,
          email: userData.email,
        },
        theme: {
          color: "#0f766e",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Failed to initiate payment gateway order.");
      setLoading(false);
    }
  };

  // Split appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppts = appointments.filter((appt) => {
    if (!appt.preferred_date) return false;
    const apptDate = new Date(appt.preferred_date);
    return apptDate >= today;
  });

  const pastAppts = appointments.filter((appt) => {
    if (!appt.preferred_date) return true;
    const apptDate = new Date(appt.preferred_date);
    return apptDate < today;
  });

  const getStatusClass = (status) => {
    if (status === "Pending") return "bg-yellow-50 text-yellow-750 border-yellow-150";
    if (status === "Contacted") return "bg-blue-50 text-blue-750 border-blue-150";
    if (status === "Confirmed") return "bg-green-50 text-green-755 border-green-200";
    if (status === "Completed") return "bg-gray-100 text-gray-700 border-gray-250";
    return "bg-gray-50 text-gray-500 border-gray-150";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5">
      <div className="mx-auto max-w-6xl">
        
        {/* HEADER PROFILE OVERVIEW */}
        <div className="rounded-3xl bg-white border p-6 md:p-8 shadow-sm flex flex-col justify-between md:flex-row gap-6 items-center">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-teal-100 border text-teal-700 flex items-center justify-center text-2xl font-black">
              {userData?.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-905">Welcome, {userData?.name}</h1>
              <p className="text-sm text-gray-550 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1"><Mail size={14} /> {userData?.email}</span>
                <span className="flex items-center gap-1"><Smartphone size={14} /> {userData?.phone}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-5 py-2.5 font-bold text-sm transition"
          >
            <LogOut size={16} /> Logout Account
          </button>
        </div>

        {/* STATS ROW */}
        <div className="grid gap-4 grid-cols-3 mt-6">
          <div className="rounded-2xl bg-white p-5 border shadow-xs">
            <span className="text-xs font-bold text-gray-400 uppercase">Upcoming Consults</span>
            <h3 className="text-2xl font-black mt-1 text-teal-750">{upcomingAppts.length}</h3>
          </div>
          <div className="rounded-2xl bg-white p-5 border shadow-xs">
            <span className="text-xs font-bold text-gray-400 uppercase">Total Bookings</span>
            <h3 className="text-2xl font-black mt-1 text-gray-900">{appointments.length}</h3>
          </div>
          <div className="rounded-2xl bg-white p-5 border shadow-xs">
            <span className="text-xs font-bold text-gray-400 uppercase">Paid Consultations</span>
            <h3 className="text-2xl font-black mt-1 text-green-650">
              {appointments.filter(a => a.payment_status === "Paid").length}
            </h3>
          </div>
        </div>

        {/* MAIN BODY NAVIGATION PANEL */}
        <div className="grid gap-6 md:grid-cols-4 mt-8">
          
          {/* NAVIGATION */}
          <div className="md:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition text-sm ${
                activeTab === "appointments"
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-white text-gray-700 border hover:bg-gray-50"
              }`}
            >
              <Calendar size={18} /> Bookings History
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition text-sm ${
                activeTab === "profile"
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-white text-gray-700 border hover:bg-gray-50"
              }`}
            >
              <User size={18} /> Update Profile
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition text-sm ${
                activeTab === "password"
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-white text-gray-700 border hover:bg-gray-50"
              }`}
            >
              <Lock size={18} /> Credentials Setup
            </button>
          </div>

          {/* MAIN FORM/TAB CONTENT */}
          <div className="md:col-span-3">
            
            {/* TAB 1: APPOINTMENTS HISTORY */}
            {activeTab === "appointments" && (
              <div className="space-y-6">
                
                {/* SECTION A: UPCOMING */}
                <div className="bg-white border rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xl font-black text-gray-905 flex items-center gap-2 mb-4">
                    <CalendarDays className="text-teal-700" size={20} /> Upcoming Appointments
                  </h3>
                  
                  {loading ? (
                    <div className="py-12 flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-700 border-t-transparent"></div></div>
                  ) : upcomingAppts.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 italic">No upcoming appointments booked. Need consultation? Submit a request on Contact page.</p>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppts.map((appt) => (
                        <div key={appt.id} className="p-5 border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-xs transition bg-gray-50">
                          <div>
                            <div className="flex gap-2 items-center">
                              <h4 className="font-extrabold text-gray-950 text-base">{appt.department}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusClass(appt.status)}`}>
                                {appt.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 font-semibold">
                              Preferred Session: {new Date(appt.preferred_date).toLocaleDateString()} ({appt.preferred_time || "Not selected"})
                            </p>
                            {appt.message && <p className="text-xs text-gray-600 mt-2 bg-white px-3 py-1.5 rounded-lg border">“{appt.message}”</p>}
                          </div>

                          <div className="flex flex-col md:items-end gap-2 shrink-0 w-full md:w-auto">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                appt.payment_status === "Paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-155"
                              }`}>
                                {appt.payment_status || "Unpaid"}
                              </span>
                              {appt.consultation_fee > 0 && <span className="text-xs font-bold text-gray-800">₹{appt.consultation_fee}</span>}
                            </div>
                            
                            {appt.payment_status !== "Paid" && (
                              <button
                                onClick={() => handlePayAppointment(appt)}
                                className="flex items-center justify-center gap-1.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 font-bold text-xs shadow-xs transition"
                              >
                                <CreditCard size={14} /> Pay Fee Now
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECTION B: PAST HISTORY */}
                <div className="bg-white border rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xl font-black text-gray-905 flex items-center gap-2 mb-4">
                    <CheckCircle className="text-teal-700" size={20} /> Past Consultations History
                  </h3>
                  
                  {loading ? (
                    <div className="py-12 flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-700 border-t-transparent"></div></div>
                  ) : pastAppts.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 italic">No past consultations recorded.</p>
                  ) : (
                    <div className="space-y-4">
                      {pastAppts.map((appt) => (
                        <div key={appt.id} className="p-5 border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-xs transition">
                          <div>
                            <div className="flex gap-2 items-center">
                              <h4 className="font-extrabold text-gray-950 text-base">{appt.department}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusClass(appt.status)}`}>
                                {appt.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 font-semibold">
                              Session Date: {new Date(appt.preferred_date).toLocaleDateString()} ({appt.preferred_time || "Not selected"})
                            </p>
                          </div>

                          <div className="flex flex-col md:items-end gap-2 shrink-0">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              appt.payment_status === "Paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-155"
                            }`}>
                              {appt.payment_status || "Unpaid"}
                            </span>
                            {appt.razorpay_payment_id && (
                              <span className="text-[10px] text-gray-500 font-mono">ID: {appt.razorpay_payment_id}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: UPDATE PROFILE */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileSubmit} className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-gray-905 flex items-center gap-2 border-b pb-3">
                  <UserCheck className="text-teal-700" size={20} /> Personal Profile Details
                </h3>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                  <input
                    required
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm font-semibold"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                    <input
                      required
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Mobile Number</label>
                    <input
                      required
                      type="text"
                      maxLength="10"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm font-semibold"
                    />
                  </div>
                </div>

                {successMsg && (
                  <p className="rounded-xl bg-green-50 border border-green-150 px-4 py-2.5 text-green-700 text-xs font-bold">
                    {successMsg}
                  </p>
                )}

                {errorMsg && (
                  <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-red-650 text-xs font-bold">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="rounded-full bg-teal-750 hover:bg-teal-800 text-white font-bold px-6 py-2.5 text-sm transition shadow-sm"
                >
                  Save Profile Settings
                </button>
              </form>
            )}

            {/* TAB 3: CREDENTIALS SETUP */}
            {activeTab === "password" && (
              <form onSubmit={handlePasswordSubmit} className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-gray-905 flex items-center gap-2 border-b pb-3">
                  <LockKeyhole className="text-teal-700" size={20} /> Update Account Password
                </h3>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Current Password</label>
                  <input
                    required
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
                    <input
                      required
                      type="password"
                      placeholder="Min 6 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Confirm Password</label>
                    <input
                      required
                      type="password"
                      placeholder="Re-type new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                    />
                  </div>
                </div>

                {passwordSuccess && (
                  <p className="rounded-xl bg-green-50 border border-green-150 px-4 py-2.5 text-green-700 text-xs font-bold">
                    {passwordSuccess}
                  </p>
                )}

                {passwordError && (
                  <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-red-650 text-xs font-bold">
                    {passwordError}
                  </p>
                )}

                <button
                  type="submit"
                  className="rounded-full bg-teal-750 hover:bg-teal-800 text-white font-bold px-6 py-2.5 text-sm transition shadow-sm"
                >
                  Change Password
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default PatientDashboard;
