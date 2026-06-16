import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Layers,
  Star,
  MessageSquare,
  LogOut,
  LayoutDashboard
} from "lucide-react";

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    navigate("/admin/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Appointments", path: "/admin/appointments", icon: Calendar },
    { name: "Doctors", path: "/admin/doctors", icon: Users },
    { name: "Services", path: "/admin/services", icon: Layers },
    { name: "Testimonials", path: "/admin/testimonials", icon: Star },
    { name: "FAQs", path: "/admin/faqs", icon: MessageSquare },
    { name: "Patients", path: "/admin/users", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-teal-900 text-white shrink-0 shadow-xl flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-teal-800">
            <h2 className="text-2xl font-bold tracking-wide flex items-center gap-2">
              <span className="text-teal-400">✦</span> Ayurda Admin
            </h2>
            <p className="text-xs text-teal-300 mt-1">Clinics Control Panel</p>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                      isActive
                        ? "bg-teal-700 text-white shadow-md"
                        : "text-teal-150 hover:bg-teal-850 hover:text-white"
                    }`
                  }
                >
                  <Icon size={20} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-teal-850">
          <div className="flex items-center gap-2 px-4 py-2 text-sm text-teal-200">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
            <span>{localStorage.getItem("adminEmail") || "admin@ayurda.com"}</span>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-red-800 hover:bg-red-700 text-white transition shadow-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
