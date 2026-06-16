import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  CalendarCheck,
} from "lucide-react";

function Contact() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    department: "",
    preferred_date: "",
    preferred_time: "",
    message: "",
    user_id: null,
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("patientToken");
    const userStr = localStorage.getItem("patientUser");
    if (!token) {
      navigate("/login?redirect=contact");
      return;
    }
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setFormData((prev) => ({
          ...prev,
          name: user.name || "",
          phone: user.phone || "",
          email: user.email || "",
          user_id: user.id || null,
        }));
      } catch (err) {
        console.error("Error parsing patientUser from localStorage", err);
      }
    }
  }, [navigate]);

  const resetForm = () => {
    const userStr = localStorage.getItem("patientUser");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setFormData({
          name: user.name || "",
          phone: user.phone || "",
          email: user.email || "",
          department: "",
          preferred_date: "",
          preferred_time: "",
          message: "",
          user_id: user.id || null,
        });
        return;
      } catch (e) {
        console.error("Error resetting form with logged in user details", e);
      }
    }
    setFormData({
      name: "",
      phone: "",
      email: "",
      department: "",
      preferred_date: "",
      preferred_time: "",
      message: "",
      user_id: null,
    });
  };

  const departments = [
    "Dental Care",
    "Dermatology",
    "IVF & Fertility",
    "Eye Care",
  ];

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Please enter your full name.";
    }

    if (!formData.phone.trim()) {
      return "Please enter your phone number.";
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }

    if (!formData.department) {
      return "Please select a department.";
    }

    if (!formData.preferred_date) {
      return "Please select a preferred appointment date.";
    }

    return "";
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getDepartmentWhatsAppLink = () => {
    const phone = "917799889398";
    const departmentText = formData.department || "appointment inquiry";

    const message = `Hi Ayurda Clinics, I want to book an appointment for ${departmentText}. My name is ${formData.name || "Patient"}.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMsg("");
    setErrorMsg("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoading(true);

    try {
      // 1. Create Appointment
      const res = await api.post("/appointments", formData);
      const appointmentId = res.data.appointmentId;

      // 2. Create Payment Order
      const orderRes = await api.post("/payments/order", { appointmentId });
      const orderData = orderRes.data;

      // 3. Check for Mock Mode
      if (orderData.isMockMode) {
        const confirmPayment = window.confirm(
          `[DEVELOPER MODE]: Razorpay API keys not configured in backend .env.\n\nClick OK to simulate a SUCCESSFUL payment of ₹500.\nClick Cancel to simulate a CANCELLED payment.`
        );

        if (confirmPayment) {
          await api.post("/payments/verify", {
            appointmentId,
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: "mock_sig",
            isMockPayment: true,
          });

          setSuccessMsg("Appointment booked & mock payment verified successfully!");
          resetForm();
        } else {
          setErrorMsg("Payment cancelled. Appointment inquiry saved as Unpaid.");
        }
        setLoading(false);
        return;
      }

      // 4. Real Razorpay Mode
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Please check your network connection.");
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Ayurda Clinics",
        description: `Consultation Fee - ${formData.department}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            setLoading(true);
            await api.post("/payments/verify", {
              appointmentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isMockPayment: false,
            });

            setSuccessMsg("Appointment booked & payment completed successfully!");
            resetForm();
          } catch (err) {
            console.error("Signature verification error:", err);
            setErrorMsg("Payment signature verification failed.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: orderData.patientDetails.name,
          contact: orderData.patientDetails.phone,
          email: orderData.patientDetails.email,
        },
        theme: {
          color: "#0f766e",
        },
        modal: {
          ondismiss: () => {
            setErrorMsg("Payment checkout closed. Appointment marked as Unpaid.");
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Booking error:", error);
      const backendMessage = error.response?.data?.message;
      setErrorMsg(backendMessage || "Something went wrong. Please try again.");
      
      if (error.response?.data?.forceLogout || error.response?.status === 401) {
        localStorage.removeItem("patientToken");
        localStorage.removeItem("patientUser");
        window.dispatchEvent(new Event("storage"));
        setTimeout(() => {
          navigate("/login?redirect=contact");
        }, 3000);
      }
      setLoading(false);
    }
  };

  return (
    <main className="bg-gray-50">
      <section className="bg-teal-50 px-5 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            Contact & Appointment Inquiry
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
            Submit your appointment request or connect with Ayurda Clinics
            through WhatsApp.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <Phone size={28} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Call Us</h2>
          <p className="mt-2 text-gray-600">7799889398</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <Clock size={28} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Clinic Timing
          </h2>
          <p className="mt-2 text-gray-600">Mon - Sat, 9 AM - 7 PM</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <MapPin size={28} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Location</h2>
          <p className="mt-2 text-gray-600">
            Add clinic address here after client confirms.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 md:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700">
              <CalendarCheck size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Book Appointment Inquiry
              </h2>
              <p className="text-gray-600">
                Our clinic team will contact you soon.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <input
              className="rounded-xl border px-4 py-3 outline-none focus:border-teal-700 bg-white read-only:bg-gray-50 read-only:text-gray-500 read-only:cursor-not-allowed"
              placeholder="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              readOnly={isLoggedIn}
            />

            <input
              className="rounded-xl border px-4 py-3 outline-none focus:border-teal-700 bg-white read-only:bg-gray-50 read-only:text-gray-500 read-only:cursor-not-allowed"
              placeholder="10-digit Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength="10"
              readOnly={isLoggedIn}
            />

            <input
              className="rounded-xl border px-4 py-3 outline-none focus:border-teal-700 bg-white read-only:bg-gray-50 read-only:text-gray-500 read-only:cursor-not-allowed"
              placeholder="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              readOnly={isLoggedIn}
            />

            <select
              className="rounded-xl border px-4 py-3 outline-none focus:border-teal-700"
              name="department"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="date"
                className="rounded-xl border px-4 py-3 outline-none focus:border-teal-700"
                name="preferred_date"
                value={formData.preferred_date}
                onChange={handleChange}
              />

              <select
                className="rounded-xl border px-4 py-3 outline-none focus:border-teal-700"
                name="preferred_time"
                value={formData.preferred_time}
                onChange={handleChange}
              >
                <option value="">Preferred Time</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>

            <textarea
              className="rounded-xl border px-4 py-3 outline-none focus:border-teal-700"
              rows="5"
              placeholder="Message / Concern"
              name="message"
              value={formData.message}
              onChange={handleChange}
            ></textarea>

            {successMsg && (
              <p className="rounded-xl bg-green-100 px-4 py-3 text-green-700">
                {successMsg}
              </p>
            )}

            {errorMsg && (
              <p className="rounded-xl bg-red-100 px-4 py-3 text-red-700">
                {errorMsg}
              </p>
            )}

            <button
              disabled={loading}
              className="rounded-full bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:bg-gray-400"
            >
              {loading ? "Submitting..." : "Submit Inquiry"}
            </button>

            <a
              href={getDepartmentWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
            >
              <MessageCircle size={20} />
              Continue on WhatsApp
            </a>
          </div>
        </form>

        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-teal-800">
            Ayurda Clinics
          </h2>

          <p className="mt-4 text-gray-700">
            Contact our clinic team for appointment inquiries across Dental,
            Dermatology, IVF and Eye Care.
          </p>

          <div className="mt-6 space-y-3 text-gray-700">
            <p>
              <strong>Phone:</strong> 7799889398
            </p>
            <p>
              <strong>WhatsApp:</strong> 7799889398
            </p>
            <p>
              <strong>Timing:</strong> Mon - Sat, 9 AM - 7 PM
            </p>
            <p>
              <strong>Address:</strong> Add clinic address here
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border">
            <iframe
              title="Ayurda Clinics Location"
              src="https://www.google.com/maps?q=Hyderabad&output=embed"
              width="100%"
              height="300"
              loading="lazy"
              className="border-0"
              allowFullScreen=""
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Replace this map with the actual clinic Google Maps location after
            the client shares the address.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Contact;