import { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../utils/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Calendar,
  Users,
  Layers,
  Star,
  MessageSquare,
  LogOut,
  Download,
  Trash2,
  Eye,
  Plus,
  Edit,
  Power,
  CheckCircle,
  Upload,
  X,
  Phone,
  MessageCircle,
  BookOpen,
  FileText,
  Save,
  AlertCircle,
  Search
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function AdminDashboard({ activeSection = "appointments" }) {
  const navigate = useNavigate();

  // Custom Toast Helpers
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Lexical alert override
  const alert = (msg) => {
    const isError = /failed|error|expired|denied|invalid/i.test(msg);
    showToast(msg, isError ? "error" : "success");
  };

  // Navigation state — bound to router activeSection prop
  const activeTab = activeSection;

  const setActiveTab = (tab) => {
    navigate(`/admin/${tab}`);
  };

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [successStories, setSuccessStories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [users, setUsers] = useState([]);

  // UI loading state
  const [loading, setLoading] = useState(true);

  // Search and Filter states (Appointments)
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [customDate, setCustomDate] = useState("");

  // Search and Filter states (Doctors)
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorDeptFilter, setDoctorDeptFilter] = useState("All");

  // Custom Toast State
  const [toast, setToast] = useState(null); // null | { message, type: 'success' | 'error' }

  // Custom Deletion Confirmation State
  const [deleteDoctorId, setDeleteDoctorId] = useState(null); // null | doctorId

  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [doctorModal, setDoctorModal] = useState(null); // null | { type: 'add' } | { type: 'edit', doctor }
  const [serviceModal, setServiceModal] = useState(null); // null | { type: 'add' } | { type: 'edit', service }
  const [testimonialModal, setTestimonialModal] = useState(null); // null | { type: 'add' } | { type: 'edit', testimonial }
  const [storyModal, setStoryModal] = useState(null); // null | { type: 'add' } | { type: 'edit', story }
  const [faqModal, setFaqModal] = useState(null); // null | { type: 'add' } | { type: 'edit', faq }

  // Form states
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    department: "",
    qualification: "",
    experience: "",
    specialization: "",
    available_time: "",
    image: "", // base64 representation
    image_url: "",
    status: "Active",
    availability: "Available"
  });

  const [serviceForm, setServiceForm] = useState({
    title: "",
    icon_name: "Smile",
    overview: "",
    treatmentsInput: "", // comma separated or lines
    whenToVisitInput: ""
  });

  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    treatment: "",
    rating: 5,
    feedback: ""
  });

  const [storyForm, setStoryForm] = useState({
    title: "",
    department: "",
    story: ""
  });

  const [faqForm, setFaqForm] = useState({
    dept: "General",
    q: "",
    a: ""
  });

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("/uploads")) {
      return `${BACKEND_URL}${url}`;
    }
    return url;
  };

  // FETCH ALL DATA
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch appointments
      const apptsRes = await api.get("/appointments");
      setAppointments(apptsRes.data.appointments);

      // Fetch doctors
      const doctorsRes = await api.get("/doctors");
      console.log("Doctors API response:", doctorsRes.data);
      setDoctors(doctorsRes.data);

      // Fetch services
      const servicesRes = await api.get("/services");
      setServices(servicesRes.data);

      // Fetch testimonials & success stories
      const testimonialsRes = await api.get("/testimonials");
      setTestimonials(testimonialsRes.data);

      const storiesRes = await api.get("/success-stories");
      setSuccessStories(storiesRes.data);

      // Fetch FAQs
      const faqsRes = await api.get("/faqs");
      setFaqs(faqsRes.data);

      // Fetch Registered Patients
      try {
        const usersRes = await api.get("/admin/users");
        console.log(`[Frontend Debug] Users data count received: ${usersRes.data.length}`);
        setUsers(usersRes.data);
      } catch (userErr) {
        console.error("Failed to fetch users (non-fatal):", userErr);
      }

    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
        alert("Session expired. Please login again.");
      } else {
        console.error("Failed to fetch dashboard data", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    navigate("/admin/login");
  };

  // ================= APPOINTMENTS OPERATIONS =================
  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      setAppointments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;
    try {
      await api.patch(`/appointments/${selectedAppointment.id}/notes`, {
        admin_notes: selectedAppointment.admin_notes || "",
      });
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === selectedAppointment.id
            ? { ...item, admin_notes: selectedAppointment.admin_notes }
            : item
        )
      );
      alert("Notes saved successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save notes");
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete appointment");
    }
  };

  const handleExportCSV = () => {
    if (filteredAppointments.length === 0) {
      alert("No appointments to export");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Phone",
      "Department",
      "Preferred Date",
      "Preferred Time",
      "Message",
      "Status",
      "Admin Notes",
      "Created At",
    ];

    const rows = filteredAppointments.map((item) => [
      item.id,
      item.name,
      item.phone,
      item.department,
      item.preferred_date ? new Date(item.preferred_date).toLocaleDateString() : "Not selected",
      item.preferred_time || "Not selected",
      item.message || "No message",
      item.status,
      item.admin_notes || "No notes",
      new Date(item.created_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ayurda-appointments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filters logic
  const filteredAppointments = appointments.filter((item) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(search) ||
      item.phone.toLowerCase().includes(search) ||
      item.department.toLowerCase().includes(search);

    const matchesDepartment =
      departmentFilter === "All" || item.department === departmentFilter;

    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    let matchesDate = true;
    if (item.preferred_date) {
      const appointmentDate = new Date(item.preferred_date);
      const today = new Date();
      appointmentDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (dateFilter === "Today") {
        matchesDate = appointmentDate.getTime() === today.getTime();
      } else if (dateFilter === "Upcoming") {
        matchesDate = appointmentDate.getTime() >= today.getTime();
      } else if (dateFilter === "Past") {
        matchesDate = appointmentDate.getTime() < today.getTime();
      } else if (dateFilter === "Custom") {
        matchesDate =
          customDate &&
          appointmentDate.toISOString().split("T")[0] === customDate;
      }
    } else if (dateFilter !== "All") {
      matchesDate = false;
    }

    return matchesSearch && matchesDepartment && matchesStatus && matchesDate;
  });

  // ================= DOCTORS OPERATIONS =================
  const openAddDoctor = () => {
    setDoctorForm({
      name: "",
      department: "Dental Care",
      qualification: "",
      experience: "",
      specialization: "",
      available_time: "",
      image: "",
      image_url: "",
      status: "Active",
      availability: "Available"
    });
    setDoctorModal({ type: "add" });
  };

  const openEditDoctor = (doctor) => {
    setDoctorForm({
      name: doctor.name,
      department: doctor.department,
      qualification: doctor.qualification,
      experience: doctor.experience,
      specialization: doctor.specialization,
      available_time: doctor.available_time,
      image: "",
      image_url: doctor.image_url || "",
      status: doctor.status || "Active",
      availability: doctor.availability || "Available"
    });
    setDoctorModal({ type: "edit", doctor });
  };

  const handleDoctorImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoctorForm((prev) => ({
          ...prev,
          image: reader.result // Base64 Data URL
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      if (doctorModal.type === "add") {
        await api.post("/doctors", doctorForm);
        alert("Doctor added successfully");
      } else {
        await api.put(`/doctors/${doctorModal.doctor.id}`, doctorForm);
        alert("Doctor details updated successfully");
      }
      setDoctorModal(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save doctor");
    }
  };

  const handleToggleDoctorStatus = async (doctor) => {
    const newStatus = doctor.status === "Active" ? "Inactive" : "Active";
    try {
      await api.put(`/doctors/${doctor.id}`, {
        ...doctor,
        status: newStatus
      });
      setDoctors((prev) =>
        prev.map((d) => (d.id === doctor.id ? { ...d, status: newStatus } : d))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleDeleteDoctor = (id) => {
    setDeleteDoctorId(id);
  };

  const confirmDeleteDoctor = async () => {
    if (!deleteDoctorId) return;
    try {
      await api.delete(`/doctors/${deleteDoctorId}`);
      setDoctors((prev) => prev.filter((d) => d.id !== deleteDoctorId));
      alert("Doctor profile deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete doctor");
    } finally {
      setDeleteDoctorId(null);
    }
  };

  // ================= SERVICES OPERATIONS =================
  const openAddService = () => {
    setServiceForm({
      title: "",
      icon_name: "Smile",
      overview: "",
      treatmentsInput: "",
      whenToVisitInput: ""
    });
    setServiceModal({ type: "add" });
  };

  const openEditService = (service) => {
    let treatmentsArr = [];
    let whenToVisitArr = [];
    try {
      treatmentsArr = typeof service.treatments === "string" ? JSON.parse(service.treatments) : service.treatments;
      whenToVisitArr = typeof service.when_to_visit === "string" ? JSON.parse(service.when_to_visit) : service.when_to_visit;
    } catch (e) {
      treatmentsArr = [];
      whenToVisitArr = [];
    }

    setServiceForm({
      title: service.title,
      icon_name: service.icon_name,
      overview: service.overview,
      treatmentsInput: treatmentsArr.join("\n"),
      whenToVisitInput: whenToVisitArr.join("\n")
    });
    setServiceModal({ type: "edit", service });
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    const treatments = serviceForm.treatmentsInput.split("\n").map(t => t.trim()).filter(Boolean);
    const when_to_visit = serviceForm.whenToVisitInput.split("\n").map(w => w.trim()).filter(Boolean);

    const payload = {
      title: serviceForm.title,
      icon_name: serviceForm.icon_name,
      overview: serviceForm.overview,
      treatments,
      when_to_visit
    };

    try {
      if (serviceModal.type === "add") {
        await api.post("/services", payload);
        alert("Service added successfully");
      } else {
        await api.put(`/services/${serviceModal.service.id}`, payload);
        alert("Service updated successfully");
      }
      setServiceModal(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to save service");
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
      alert("Service deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete service");
    }
  };

  // ================= TESTIMONIALS & STORIES OPERATIONS =================
  const openAddTestimonial = () => {
    setTestimonialForm({ name: "", treatment: "Dental Care", rating: 5, feedback: "" });
    setTestimonialModal({ type: "add" });
  };

  const openEditTestimonial = (testimonial) => {
    setTestimonialForm({
      name: testimonial.name,
      treatment: testimonial.treatment,
      rating: testimonial.rating,
      feedback: testimonial.feedback
    });
    setTestimonialModal({ type: "edit", testimonial });
  };

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    try {
      if (testimonialModal.type === "add") {
        await api.post("/testimonials", testimonialForm);
        alert("Testimonial added");
      } else {
        await api.put(`/testimonials/${testimonialModal.testimonial.id}`, testimonialForm);
        alert("Testimonial updated");
      }
      setTestimonialModal(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to save testimonial");
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await api.delete(`/testimonials/${id}`);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      alert("Testimonial deleted");
    } catch (err) {
      console.error(err);
      alert("Failed to delete testimonial");
    }
  };

  // Success Stories
  const openAddStory = () => {
    setStoryForm({ title: "", department: "Dental Care", story: "" });
    setStoryModal({ type: "add" });
  };

  const openEditStory = (story) => {
    setStoryForm({
      title: story.title,
      department: story.department,
      story: story.story
    });
    setStoryModal({ type: "edit", story });
  };

  const handleStorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (storyModal.type === "add") {
        await api.post("/success-stories", storyForm);
        alert("Success story added");
      } else {
        await api.put(`/success-stories/${storyModal.story.id}`, storyForm);
        alert("Success story updated");
      }
      setStoryModal(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to save story");
    }
  };

  const handleDeleteStory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this success story?")) return;
    try {
      await api.delete(`/success-stories/${id}`);
      setSuccessStories((prev) => prev.filter((s) => s.id !== id));
      alert("Story deleted");
    } catch (err) {
      console.error(err);
      alert("Failed to delete story");
    }
  };

  // ================= FAQS OPERATIONS =================
  const openAddFaq = () => {
    setFaqForm({ dept: "General", q: "", a: "" });
    setFaqModal({ type: "add" });
  };

  const openEditFaq = (faq) => {
    setFaqForm({ dept: faq.dept, q: faq.q, a: faq.a });
    setFaqModal({ type: "edit", faq });
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      if (faqModal.type === "add") {
        await api.post("/faqs", faqForm);
        alert("FAQ added successfully");
      } else {
        await api.put(`/faqs/${faqModal.faq.id}`, faqForm);
        alert("FAQ updated successfully");
      }
      setFaqModal(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to save FAQ");
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await api.delete(`/faqs/${id}`);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      alert("FAQ deleted");
    } catch (err) {
      console.error(err);
      alert("Failed to delete FAQ");
    }
  };


  // STATS & CHARTS MATHS
  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === "Pending").length;
  const contacted = appointments.filter((a) => a.status === "Contacted").length;
  const confirmed = appointments.filter((a) => a.status === "Confirmed").length;
  const completed = appointments.filter((a) => a.status === "Completed").length;

  const departmentChartData = [
    { name: "Dental", count: appointments.filter((a) => a.department === "Dental Care").length },
    { name: "Derma", count: appointments.filter((a) => a.department === "Dermatology").length },
    { name: "IVF", count: appointments.filter((a) => a.department === "IVF & Fertility").length },
    { name: "Eye", count: appointments.filter((a) => a.department === "Eye Care").length },
  ];

  const statusChartData = [
    { name: "Pending", value: pending },
    { name: "Contacted", value: contacted },
    { name: "Confirmed", value: confirmed },
    { name: "Completed", value: completed },
  ];

  const chartColors = ["#ca8a04", "#2563eb", "#16a34a", "#6b7280"];

  const getStatusClass = (status) => {
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    if (status === "Contacted") return "bg-blue-100 text-blue-700";
    if (status === "Confirmed") return "bg-green-100 text-green-700";
    if (status === "Completed") return "bg-gray-100 text-gray-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="flex-grow flex flex-col min-w-0 bg-gray-50">
      
      {/* HEADER */}
      <header className="bg-white border-b px-8 py-5 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 capitalize">
            {activeTab === "dashboard" ? "Dashboard Analytics" : activeTab === "users" ? "Registered Patients" : `${activeTab} Management`}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === "dashboard" && "Real-time metrics and system overview."}
            {activeTab === "appointments" && "Track patient registrations and follow-up schedules."}
            {activeTab === "doctors" && "Add specialists, update available hours, or set statuses."}
            {activeTab === "services" && "Customize treatment guides, descriptions, and symptom targets."}
            {activeTab === "testimonials" && "Moderate patient stories and review ratings."}
            {activeTab === "faqs" && "Maintain frequently asked questions grouped by departments."}
            {activeTab === "users" && "View and manage registered clinic patient accounts."}
          </p>
        </div>

        <div className="flex gap-3">
          {activeTab === "appointments" && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl bg-teal-750 hover:bg-teal-800 text-white px-5 py-2.5 font-bold transition shadow-sm"
            >
              <Download size={18} />
              Export CSV
            </button>
          )}
          {activeTab === "doctors" && (
            <button
              onClick={openAddDoctor}
              className="flex items-center gap-2 rounded-xl bg-teal-750 hover:bg-teal-800 text-white px-5 py-2.5 font-bold transition shadow-sm"
            >
              <Plus size={18} />
              Add Doctor
            </button>
          )}
          {activeTab === "services" && (
            <button
              onClick={openAddService}
              className="flex items-center gap-2 rounded-xl bg-teal-750 hover:bg-teal-800 text-white px-5 py-2.5 font-bold transition shadow-sm"
            >
              <Plus size={18} />
              Add Service
            </button>
          )}
          {activeTab === "testimonials" && (
            <div className="flex gap-2">
              <button
                onClick={openAddTestimonial}
                className="flex items-center gap-2 rounded-xl bg-teal-750 hover:bg-teal-800 text-white px-4 py-2.5 font-bold transition shadow-sm"
              >
                <Plus size={16} />
                Add Testimonial
              </button>
              <button
                onClick={openAddStory}
                className="flex items-center gap-2 rounded-xl bg-teal-750 hover:bg-teal-800 text-white px-4 py-2.5 font-bold transition shadow-sm"
              >
                <Plus size={16} />
                Add Story
              </button>
            </div>
          )}
          {activeTab === "faqs" && (
            <button
              onClick={openAddFaq}
              className="flex items-center gap-2 rounded-xl bg-teal-750 hover:bg-teal-800 text-white px-5 py-2.5 font-bold transition shadow-sm"
            >
              <Plus size={18} />
              Add FAQ
            </button>
          )}
        </div>
      </header>

      {/* PAGE CONTENT CONTAINER */}
      <div className="p-8 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 border-4 border-teal-650 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Fetching clinic database...</p>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 0: DASHBOARD ANALYTICS */}
              {activeTab === "dashboard" && (
                <div className="space-y-8">
                  {/* STATS ROW */}
                  <div className="grid gap-5 grid-cols-2 md:grid-cols-5">
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                      <p className="text-gray-400 text-sm font-semibold">Total Inquiries</p>
                      <h2 className="mt-2 text-3xl font-extrabold text-teal-850">{total}</h2>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                      <p className="text-gray-400 text-sm font-semibold text-yellow-600">Pending</p>
                      <h2 className="mt-2 text-3xl font-extrabold text-yellow-600">{pending}</h2>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                      <p className="text-gray-400 text-sm font-semibold text-blue-600">Contacted</p>
                      <h2 className="mt-2 text-3xl font-extrabold text-blue-600">{contacted}</h2>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                      <p className="text-gray-400 text-sm font-semibold text-green-600">Confirmed</p>
                      <h2 className="mt-2 text-3xl font-extrabold text-green-600">{confirmed}</h2>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                      <p className="text-gray-400 text-sm font-semibold text-gray-500">Completed</p>
                      <h2 className="mt-2 text-3xl font-extrabold text-gray-500">{completed}</h2>
                    </div>
                  </div>

                  {/* CHARTS CONTAINER */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-6">Department Distribution</h3>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={departmentChartData}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} />
                            <YAxis allowDecimals={false} stroke="#888888" fontSize={12} tickLine={false} />
                            <Tooltip cursor={{ fill: "#f3f4f6" }} />
                            <Bar dataKey="count" fill="#0f766e" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Inquiry Status Breakdown</h3>
                      <div className="h-[200px] w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusChartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={75}
                              label
                            >
                              {statusChartData.map((entry, index) => (
                                <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 text-xs mt-3">
                        {statusChartData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center gap-1">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: chartColors[index] }}></span>
                            <span className="font-medium text-gray-650">{entry.name} ({entry.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: APPOINTMENTS */}
              {activeTab === "appointments" && (
                <div className="space-y-6">
                  {/* FILTER CONTROLS */}
                  <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                    <div className="grid gap-4 md:grid-cols-5">
                      <input
                        type="text"
                        placeholder="Search patient, phone, department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                      />

                      <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm bg-white"
                      >
                        <option value="All">All Departments</option>
                        <option value="Dental Care">Dental Care</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="IVF & Fertility">IVF & Fertility</option>
                        <option value="Eye Care">Eye Care</option>
                      </select>

                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm bg-white"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <select
                        value={dateFilter}
                        onChange={(e) => {
                          setDateFilter(e.target.value);
                          if (e.target.value !== "Custom") setCustomDate("");
                        }}
                        className="rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm bg-white"
                      >
                        <option value="All">All Dates</option>
                        <option value="Today">Today</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Past">Past</option>
                        <option value="Custom">Custom Date</option>
                      </select>

                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => {
                          setCustomDate(e.target.value);
                          setDateFilter("Custom");
                        }}
                        disabled={dateFilter !== "Custom" && !customDate}
                        className="rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <p>Filtered list shows {filteredAppointments.length} of {appointments.length} entries</p>
                    </div>
                  </div>

                  {/* APPOINTMENTS LIST TABLE */}
                  <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                    {filteredAppointments.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No appointments match your filters.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-gray-50 text-gray-700 font-bold border-b">
                            <tr>
                              <th className="px-6 py-4">ID</th>
                              <th className="px-6 py-4">Patient Name</th>
                              <th className="px-6 py-4">Phone</th>
                              <th className="px-6 py-4">Department</th>
                              <th className="px-6 py-4">Date/Time</th>
                              <th className="px-6 py-4">Payment</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {filteredAppointments.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-500 font-medium">#{item.id}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                                <td className="px-6 py-4">
                                  <a href={`tel:${item.phone}`} className="text-teal-700 font-semibold hover:underline">
                                    {item.phone}
                                  </a>
                                </td>
                                <td className="px-6 py-4">{item.department}</td>
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-gray-800">
                                    {item.preferred_date ? new Date(item.preferred_date).toLocaleDateString() : "No date"}
                                  </div>
                                  <div className="text-xs text-gray-500">{item.preferred_time || "No preferred time"}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className={`inline-flex items-center w-max px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      item.payment_status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                      {item.payment_status || 'Unpaid'}
                                    </span>
                                    {item.consultation_fee > 0 && (
                                      <span className="text-[10px] text-gray-550 font-bold mt-0.5">₹{item.consultation_fee}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <select
                                    value={item.status}
                                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                    className={`rounded-full px-3 py-1 text-xs font-bold border-0 outline-none ${getStatusClass(
                                      item.status
                                    )}`}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="inline-flex gap-2">
                                    <button
                                      onClick={() => setSelectedAppointment(item)}
                                      className="flex items-center gap-1 bg-teal-50 text-teal-850 border border-teal-150 hover:bg-teal-100 rounded-lg px-3 py-1.5 font-semibold text-xs transition"
                                    >
                                      <Eye size={14} /> View Details
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAppointment(item.id)}
                                      className="text-red-650 hover:bg-red-50 hover:text-red-800 rounded-lg p-1.5 transition"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: DOCTORS */}
              {activeTab === "doctors" && (
                <div className="space-y-6">
                  {/* DOCTOR STATS ROW */}
                  <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-semibold">Total Specialists</p>
                        <h2 className="mt-2 text-3xl font-extrabold text-teal-850">{doctors.length}</h2>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                        <Users size={24} />
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-semibold text-green-600">Active Profiles</p>
                        <h2 className="mt-2 text-3xl font-extrabold text-green-600">
                          {doctors.filter((d) => d.status === "Active").length}
                        </h2>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle size={24} />
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-semibold text-blue-600">Available Doctors</p>
                        <h2 className="mt-2 text-3xl font-extrabold text-blue-600">
                          {doctors.filter((d) => d.availability === "Available").length}
                        </h2>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Calendar size={24} />
                      </div>
                    </div>
                  </div>

                  {/* Filters Row */}
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white border p-4 rounded-2xl shadow-sm">
                    <div className="relative w-full md:max-w-xs">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search doctor by name..."
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 outline-none text-sm focus:border-teal-700"
                      />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <label className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Department</label>
                      <select
                        value={doctorDeptFilter}
                        onChange={(e) => setDoctorDeptFilter(e.target.value)}
                        className="rounded-xl border border-gray-250 px-4 py-2.5 outline-none text-sm focus:border-teal-700 bg-white"
                      >
                        <option value="All">All Departments</option>
                        <option value="Dental Care">Dental Care</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="IVF & Fertility">IVF & Fertility</option>
                        <option value="Eye Care">Eye Care</option>
                      </select>
                    </div>
                  </div>

                  {/* DOCTORS GRID/TABLE */}
                  <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                    {doctors.filter((doctor) => {
                      const matchesSearch = doctor.name.toLowerCase().includes(doctorSearch.toLowerCase());
                      const matchesDept = doctorDeptFilter === "All" || doctor.department === doctorDeptFilter;
                      return matchesSearch && matchesDept;
                    }).length === 0 ? (
                      <div className="p-8 text-center text-gray-500 font-semibold">No doctors available</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-gray-50 text-gray-700 font-bold border-b">
                            <tr>
                              <th className="px-6 py-4">Doctor</th>
                              <th className="px-6 py-4">Department</th>
                              <th className="px-6 py-4">Availability</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {doctors
                              .filter((doctor) => {
                                const matchesSearch = doctor.name.toLowerCase().includes(doctorSearch.toLowerCase());
                                const matchesDept = doctorDeptFilter === "All" || doctor.department === doctorDeptFilter;
                                return matchesSearch && matchesDept;
                              })
                              .map((doctor) => (
                                <tr key={doctor.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                      <div className="h-12 w-12 rounded-full overflow-hidden bg-teal-50 border flex items-center justify-center shrink-0">
                                        {doctor.image_url ? (
                                          <img
                                            src={getImageUrl(doctor.image_url)}
                                            alt={doctor.name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src = ""; // Clear source so fallback letter is shown
                                            }}
                                          />
                                        ) : (
                                          <span className="text-xl font-bold text-teal-750">
                                            {doctor.name.replace("Dr. ", "").charAt(0)}
                                          </span>
                                        )}
                                      </div>
                                      <div>
                                        <h4 className="font-extrabold text-gray-950">{doctor.name}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          {doctor.qualification} • {doctor.experience}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="font-semibold">{doctor.department}</div>
                                    <div className="text-xs text-gray-500">{doctor.specialization}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-800">{doctor.available_time}</div>
                                    <div className="mt-1">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        doctor.availability === "Available"
                                          ? "bg-green-100 text-green-800 border border-green-200"
                                          : "bg-red-100 text-red-800 border border-red-200"
                                      }`}>
                                        {doctor.availability || "Available"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <button
                                      onClick={() => handleToggleDoctorStatus(doctor)}
                                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition border ${
                                        doctor.status === "Active"
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : "bg-gray-100 text-gray-600 border-gray-300"
                                      }`}
                                    >
                                      <Power size={12} />
                                      {doctor.status}
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="inline-flex gap-2">
                                      <button
                                        onClick={() => openEditDoctor(doctor)}
                                        className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg px-3 py-1.5 font-semibold text-xs transition"
                                      >
                                        <Edit size={14} /> Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteDoctor(doctor.id)}
                                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SERVICES */}
              {activeTab === "services" && (
                <div className="space-y-6">
                  {/* SERVICES LIST */}
                  <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                    {services.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No services created yet. Create one by clicking "Add Service".</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-gray-50 text-gray-700 font-bold border-b">
                            <tr>
                              <th className="px-6 py-4">Icon & Title</th>
                              <th className="px-6 py-4">Treatments</th>
                              <th className="px-6 py-4">Symptom Guide</th>
                              <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {services.map((service) => {
                              let treatmentsArr = [];
                              let whenToVisitArr = [];
                              try {
                                treatmentsArr = typeof service.treatments === "string" ? JSON.parse(service.treatments) : service.treatments;
                                whenToVisitArr = typeof service.when_to_visit === "string" ? JSON.parse(service.when_to_visit) : service.when_to_visit;
                              } catch (e) {
                                treatmentsArr = [];
                                whenToVisitArr = [];
                              }

                              return (
                                <tr key={service.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 max-w-sm whitespace-normal">
                                    <div className="flex items-start gap-3">
                                      <div className="p-2 rounded-lg bg-teal-50 text-teal-800 border flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                        {service.icon_name}
                                      </div>
                                      <div>
                                        <h4 className="font-extrabold text-gray-950 text-base">{service.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.overview}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 max-w-xs whitespace-normal">
                                    <div className="flex flex-wrap gap-1">
                                      {treatmentsArr.map((t, idx) => (
                                        <span key={idx} className="bg-teal-50 border border-teal-100 text-teal-800 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 max-w-xs whitespace-normal">
                                    <div className="flex flex-wrap gap-1">
                                      {whenToVisitArr.map((w, idx) => (
                                        <span key={idx} className="bg-blue-50 border border-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                          {w}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="inline-flex gap-2">
                                      <button
                                        onClick={() => openEditService(service)}
                                        className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg px-3 py-1.5 font-semibold text-xs transition"
                                      >
                                        <Edit size={14} /> Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteService(service.id)}
                                        className="text-red-650 hover:bg-red-50 p-2 rounded-lg transition"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: TESTIMONIALS */}
              {activeTab === "testimonials" && (
                <div className="space-y-8">
                  {/* PANEL 1: TESTIMONIALS MODERATION */}
                  <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50">
                      <h3 className="text-lg font-bold text-gray-900">Patient Feedbacks</h3>
                    </div>
                    {testimonials.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No testimonials written yet.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-gray-50 text-gray-750 font-bold border-b">
                            <tr>
                              <th className="px-6 py-4">Patient</th>
                              <th className="px-6 py-4">Treatment</th>
                              <th className="px-6 py-4">Rating</th>
                              <th className="px-6 py-4">Feedback Quote</th>
                              <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {testimonials.map((t) => (
                              <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold text-gray-900">{t.name}</td>
                                <td className="px-6 py-4">{t.treatment}</td>
                                <td className="px-6 py-4 text-yellow-500 flex gap-0.5 items-center mt-3 border-0">
                                  {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} size={14} fill="currentColor" />
                                  ))}
                                </td>
                                <td className="px-6 py-4 max-w-md whitespace-normal text-gray-650 leading-relaxed italic">
                                  "{t.feedback}"
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="inline-flex gap-2">
                                    <button
                                      onClick={() => openEditTestimonial(t)}
                                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTestimonial(t.id)}
                                      className="text-red-650 hover:bg-red-50 p-2 rounded-lg transition"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* PANEL 2: SUCCESS STORIES */}
                  <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b bg-gray-50">
                      <h3 className="text-lg font-bold text-gray-900">Success Stories</h3>
                    </div>
                    {successStories.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No success stories published yet.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-gray-50 text-gray-750 font-bold border-b">
                            <tr>
                              <th className="px-6 py-4">Title</th>
                              <th className="px-6 py-4">Department</th>
                              <th className="px-6 py-4">Story Content</th>
                              <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {successStories.map((story) => (
                              <tr key={story.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold text-gray-900 max-w-xs whitespace-normal">{story.title}</td>
                                <td className="px-6 py-4 font-semibold text-teal-800">{story.department}</td>
                                <td className="px-6 py-4 max-w-lg whitespace-normal text-gray-650 leading-relaxed">
                                  {story.story}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="inline-flex gap-2">
                                    <button
                                      onClick={() => openEditStory(story)}
                                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteStory(story.id)}
                                      className="text-red-650 hover:bg-red-50 p-2 rounded-lg transition"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: FAQS */}
              {activeTab === "faqs" && (
                <div className="space-y-6">
                  {/* FAQS TABLE */}
                  <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                    {faqs.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No FAQ questions published.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-gray-50 text-gray-750 font-bold border-b">
                            <tr>
                              <th className="px-6 py-4">Department</th>
                              <th className="px-6 py-4">Question</th>
                              <th className="px-6 py-4">Answer</th>
                              <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {faqs.map((faq) => (
                              <tr key={faq.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-semibold text-teal-850">{faq.dept}</td>
                                <td className="px-6 py-4 font-bold text-gray-900 max-w-xs whitespace-normal">{faq.q}</td>
                                <td className="px-6 py-4 max-w-md whitespace-normal text-gray-600 leading-relaxed">
                                  {faq.a}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="inline-flex gap-2">
                                    <button
                                      onClick={() => openEditFaq(faq)}
                                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteFaq(faq.id)}
                                      className="text-red-655 hover:bg-red-50 p-2 rounded-lg transition"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: USERS */}
              {activeTab === "users" && (
                <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-gray-600 text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4">Patient Name</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Phone</th>
                          <th className="px-6 py-4">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                              No registered patient accounts found.
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition">
                              <td className="px-6 py-4 font-semibold text-gray-700">#{user.id}</td>
                              <td className="px-6 py-4 font-bold text-gray-900">{user.name}</td>
                              <td className="px-6 py-4 text-gray-655">{user.email}</td>
                              <td className="px-6 py-4 text-gray-655">{user.phone}</td>
                              <td className="px-6 py-4 text-gray-500">
                                {new Date(user.created_at).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      {/* ================= MODALS SECTION ================= */}

      {/* APPOINTMENT VIEW DETAIL MODAL */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-gray-150 flex items-center justify-center text-gray-650 hover:bg-gray-250 transition"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-black text-gray-905">Appointment Details</h3>
              <p className="text-xs text-gray-550 mt-1">Inquiry ID: #{selectedAppointment.id}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <span className="text-xs font-bold text-gray-450 uppercase tracking-wide">Patient Name</span>
                <p className="mt-1 font-bold text-gray-900 text-base">{selectedAppointment.name}</p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <span className="text-xs font-bold text-gray-450 uppercase tracking-wide">Phone Number</span>
                <a href={`tel:${selectedAppointment.phone}`} className="mt-1 block font-bold text-teal-700 text-base hover:underline">
                  {selectedAppointment.phone}
                </a>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <span className="text-xs font-bold text-gray-450 uppercase tracking-wide">Department</span>
                <p className="mt-1 font-bold text-gray-900">{selectedAppointment.department}</p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <span className="text-xs font-bold text-gray-450 uppercase tracking-wide">Current Status</span>
                <p className="mt-1 font-bold text-gray-900">{selectedAppointment.status}</p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <span className="text-xs font-bold text-gray-450 uppercase tracking-wide">Payment Status</span>
                <p className={`mt-1 font-bold ${
                  selectedAppointment.payment_status === 'Paid' ? 'text-green-600' : 'text-red-650'
                }`}>
                  {selectedAppointment.payment_status || 'Unpaid'}
                  {selectedAppointment.consultation_fee > 0 && ` (₹${selectedAppointment.consultation_fee})`}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <span className="text-xs font-bold text-gray-450 uppercase tracking-wide">Razorpay Transaction ID</span>
                <p className="mt-1 font-bold text-gray-900 font-mono text-xs truncate">
                  {selectedAppointment.razorpay_payment_id || "No transaction"}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <span className="text-xs font-bold text-gray-450 uppercase tracking-wide">Preferred Date</span>
                <p className="mt-1 font-bold text-gray-900">
                  {selectedAppointment.preferred_date ? new Date(selectedAppointment.preferred_date).toLocaleDateString() : "Not selected"}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <span className="text-xs font-bold text-gray-450 uppercase tracking-wide">Preferred Time</span>
                <p className="mt-1 font-bold text-gray-900">{selectedAppointment.preferred_time || "Not selected"}</p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100 md:col-span-2">
                <span className="text-xs font-bold text-gray-450 uppercase tracking-wide">Patient Message</span>
                <p className="mt-1 text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {selectedAppointment.message || "No message provided"}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100 md:col-span-2">
                <span className="text-xs font-bold text-gray-450 uppercase tracking-wide">Admin Follow-up Notes</span>
                <textarea
                  value={selectedAppointment.admin_notes || ""}
                  onChange={(e) =>
                    setSelectedAppointment({
                      ...selectedAppointment,
                      admin_notes: e.target.value,
                    })
                  }
                  rows="3"
                  placeholder="E.g., Spoke to client on 15th Jun. Booked review schedule."
                  className="mt-2 w-full rounded-xl border border-gray-250 px-4 py-3 outline-none focus:border-teal-700 text-sm"
                ></textarea>

                <button
                  onClick={handleSaveNotes}
                  className="mt-3 flex items-center gap-1.5 rounded-full bg-teal-750 hover:bg-teal-800 px-5 py-2 font-bold text-white text-xs transition shadow-sm"
                >
                  <Save size={14} /> Save Notes
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row border-t pt-4">
              <a
                href={`tel:${selectedAppointment.phone}`}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-750 hover:bg-teal-800 text-white font-bold py-3 text-center transition"
              >
                <Phone size={18} /> Call Patient
              </a>

              <a
                href={`https://wa.me/91${selectedAppointment.phone}?text=${encodeURIComponent(
                  `Hi ${selectedAppointment.name}, this is Ayurda Clinics regarding your ${selectedAppointment.department} appointment inquiry.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-center transition"
              >
                <MessageCircle size={18} /> WhatsApp Patient
              </a>
            </div>
          </div>
        </div>
      )}

      {/* DOCTOR ADD/EDIT MODAL */}
      {doctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm">
          <form
            onSubmit={handleDoctorSubmit}
            className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4"
          >
            <button
              type="button"
              onClick={() => setDoctorModal(null)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-gray-150 flex items-center justify-center text-gray-650 hover:bg-gray-250 transition"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-2xl font-black text-gray-905">
                {doctorModal.type === "add" ? "Add New Doctor" : "Edit Doctor Profile"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Provide credentials and scheduling details.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Doctor Name</label>
                <input
                  required
                  type="text"
                  placeholder="Dr. Rajesh Guptha"
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Department</label>
                  <select
                    value={doctorForm.department}
                    onChange={(e) => setDoctorForm({ ...doctorForm, department: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm bg-white"
                  >
                    <option value="Dental Care">Dental Care</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="IVF & Fertility">IVF & Fertility</option>
                    <option value="Eye Care">Eye Care</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Qualifications</label>
                  <input
                    required
                    type="text"
                    placeholder="MBBS, MD Pediatrics"
                    value={doctorForm.qualification}
                    onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Experience</label>
                  <input
                    required
                    type="text"
                    placeholder="10+ Years Experience"
                    value={doctorForm.experience}
                    onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Specialization</label>
                  <input
                    required
                    type="text"
                    placeholder="Implantology / Lasik Surgery"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Available Timing Hours</label>
                  <input
                    required
                    type="text"
                    placeholder="Mon-Fri, 10:00 AM - 02:00 PM"
                    value={doctorForm.available_time}
                    onChange={(e) => setDoctorForm({ ...doctorForm, available_time: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Availability Status</label>
                  <select
                    value={doctorForm.availability || "Available"}
                    onChange={(e) => setDoctorForm({ ...doctorForm, availability: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block">Doctor Photo Profile</label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full border bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                    {doctorForm.image ? (
                      <img src={doctorForm.image} alt="Preview" className="h-full w-full object-cover" />
                    ) : doctorForm.image_url ? (
                      <img src={getImageUrl(doctorForm.image_url)} alt="Existing" className="h-full w-full object-cover" />
                    ) : (
                      <Upload className="text-gray-400" size={24} />
                    )}
                  </div>
                  <label className="flex items-center gap-2 border border-gray-250 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition">
                    <Upload size={14} /> Choose Image File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDoctorImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">PNG, JPG or JPEG. Max size 5MB. Uploading is optional.</p>
              </div>

              <div className="flex gap-4 pt-2 border-t">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-teal-750 hover:bg-teal-800 text-white py-3 font-bold transition shadow-sm"
                >
                  {doctorModal.type === "add" ? "Register Doctor" : "Update Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => setDoctorModal(null)}
                  className="flex-1 rounded-xl border border-gray-250 text-gray-700 hover:bg-gray-50 py-3 font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* SERVICE ADD/EDIT MODAL */}
      {serviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm">
          <form
            onSubmit={handleServiceSubmit}
            className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4"
          >
            <button
              type="button"
              onClick={() => setServiceModal(null)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-gray-150 flex items-center justify-center text-gray-650 hover:bg-gray-250 transition"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-2xl font-black text-gray-950">
                {serviceModal.type === "add" ? "Create Clinic Service" : "Edit Service Details"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Manage treatments list and symptom triggers.</p>
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Service Title</label>
                  <input
                    required
                    type="text"
                    placeholder="Orthodontics"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Lucide Icon Name</label>
                  <select
                    value={serviceForm.icon_name}
                    onChange={(e) => setServiceForm({ ...serviceForm, icon_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm bg-white"
                  >
                    <option value="Smile">Smile (Dental)</option>
                    <option value="Sparkles">Sparkles (Skin)</option>
                    <option value="Baby">Baby (Fertility)</option>
                    <option value="Eye">Eye (Ophthalmology)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Overview Description</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Overview about the treatments offered under this department..."
                  value={serviceForm.overview}
                  onChange={(e) => setServiceForm({ ...serviceForm, overview: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Treatments Offered (One per line)</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Teeth Whitening&#10;Invisalign Braces&#10;Dental Implants"
                  value={serviceForm.treatmentsInput}
                  onChange={(e) => setServiceForm({ ...serviceForm, treatmentsInput: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm font-mono text-xs"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">When to Visit Symptoms (One per line)</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Tooth ache&#10;Bleeding gums&#10;Crooked teeth alignment"
                  value={serviceForm.whenToVisitInput}
                  onChange={(e) => setServiceForm({ ...serviceForm, whenToVisitInput: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm font-mono text-xs"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-2 border-t">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-teal-750 hover:bg-teal-800 text-white py-3 font-bold transition shadow-sm"
                >
                  Save Service
                </button>
                <button
                  type="button"
                  onClick={() => setServiceModal(null)}
                  className="flex-1 rounded-xl border border-gray-250 text-gray-700 hover:bg-gray-50 py-3 font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TESTIMONIAL MODAL */}
      {testimonialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm">
          <form
            onSubmit={handleTestimonialSubmit}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4"
          >
            <button
              type="button"
              onClick={() => setTestimonialModal(null)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-gray-150 flex items-center justify-center text-gray-650 hover:bg-gray-250 transition"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-2xl font-black text-gray-950">
                {testimonialModal.type === "add" ? "Write Patient Testimonial" : "Edit Testimonial"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Review feedback received from clinics visitors.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Patient Name</label>
                <input
                  required
                  type="text"
                  placeholder="Amit Varma"
                  value={testimonialForm.name}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Treatment/Dept</label>
                  <input
                    required
                    type="text"
                    placeholder="Dental Fillings"
                    value={testimonialForm.treatment}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, treatment: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Rating Star Count (1-5)</label>
                  <select
                    value={testimonialForm.rating}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm bg-white"
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Feedback Quote</label>
                <textarea
                  required
                  rows="4"
                  placeholder="I loved the clinic environment and treatment guidelines..."
                  value={testimonialForm.feedback}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, feedback: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-2 border-t">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-teal-750 hover:bg-teal-800 text-white py-3 font-bold transition shadow-sm"
                >
                  Save Testimonial
                </button>
                <button
                  type="button"
                  onClick={() => setTestimonialModal(null)}
                  className="flex-1 rounded-xl border border-gray-250 text-gray-700 hover:bg-gray-50 py-3 font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* STORY ADD/EDIT MODAL */}
      {storyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm">
          <form
            onSubmit={handleStorySubmit}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4"
          >
            <button
              type="button"
              onClick={() => setStoryModal(null)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-gray-150 flex items-center justify-center text-gray-650 hover:bg-gray-250 transition"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-2xl font-black text-gray-950">
                {storyModal.type === "add" ? "Create Success Story" : "Edit Success Story"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Publish patient success case studies.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Story Title</label>
                <input
                  required
                  type="text"
                  placeholder="Successful Dental Whitening Care Case"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Department</label>
                <select
                  value={storyForm.department}
                  onChange={(e) => setStoryForm({ ...storyForm, department: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm bg-white"
                >
                  <option value="Dental Care">Dental Care</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="IVF & Fertility">IVF & Fertility</option>
                  <option value="Eye Care">Eye Care</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Case Story Details</label>
                <textarea
                  required
                  rows="5"
                  placeholder="Write details of how treatment was completed..."
                  value={storyForm.story}
                  onChange={(e) => setStoryForm({ ...storyForm, story: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-2 border-t">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-teal-750 hover:bg-teal-800 text-white py-3 font-bold transition shadow-sm"
                >
                  Save Story
                </button>
                <button
                  type="button"
                  onClick={() => setStoryModal(null)}
                  className="flex-1 rounded-xl border border-gray-250 text-gray-700 hover:bg-gray-50 py-3 font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* FAQ ADD/EDIT MODAL */}
      {faqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm">
          <form
            onSubmit={handleFaqSubmit}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4"
          >
            <button
              type="button"
              onClick={() => setFaqModal(null)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-gray-150 flex items-center justify-center text-gray-650 hover:bg-gray-250 transition"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-2xl font-black text-gray-950">
                {faqModal.type === "add" ? "Create FAQ Entry" : "Edit FAQ Details"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Frequently asked questions that reflect on FAQ pages.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Department Category</label>
                <select
                  value={faqForm.dept}
                  onChange={(e) => setFaqForm({ ...faqForm, dept: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm bg-white"
                >
                  <option value="General">General</option>
                  <option value="Dental Care">Dental Care</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="IVF & Fertility">IVF & Fertility</option>
                  <option value="Eye Care">Eye Care</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Question Text</label>
                <input
                  required
                  type="text"
                  placeholder="How can I prepare for root canal?"
                  value={faqForm.q}
                  onChange={(e) => setFaqForm({ ...faqForm, q: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Answer Text</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Maintain proper oral hygiene, take recommended medications..."
                  value={faqForm.a}
                  onChange={(e) => setFaqForm({ ...faqForm, a: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-250 px-4 py-2.5 outline-none focus:border-teal-700 text-sm"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-2 border-t">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-teal-750 hover:bg-teal-800 text-white py-3 font-bold transition shadow-sm"
                >
                  Save FAQ
                </button>
                <button
                  type="button"
                  onClick={() => setFaqModal(null)}
                  className="flex-1 rounded-xl border border-gray-250 text-gray-700 hover:bg-gray-50 py-3 font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* CUSTOM TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl animate-slide-in border border-gray-800 max-w-sm">
          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${toast.type === "success" ? "bg-green-400" : "bg-red-500"}`} />
          <p className="text-sm font-semibold">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-white transition ml-2">
            <X size={16} />
          </button>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteDoctorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={24} />
              <h3 className="text-xl font-bold text-gray-900">Delete Doctor Profile?</h3>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to permanently delete this doctor profile? This action will remove the profile database record and cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={confirmDeleteDoctor}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white py-3 font-bold transition shadow-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteDoctorId(null)}
                className="flex-1 rounded-xl border border-gray-250 text-gray-700 hover:bg-gray-50 py-3 font-bold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;