import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("patientToken"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("patientToken"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("patientToken");
    localStorage.removeItem("patientUser");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  const links = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Doctors", path: "/doctors" },
    { name: "AI Guide", path: "/symptom-guide" },
    { name: "Testimonials", path: "/testimonials" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="text-2xl font-bold text-teal-700">
          Ayurda Clinics
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-teal-700"
                  : "font-medium text-gray-700 hover:text-teal-700"
              }
            >
              {link.name}
            </NavLink>
          ))}

          <span className="h-5 w-[1px] bg-gray-200"></span>

          {isLoggedIn ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "font-semibold text-teal-750"
                    : "font-medium text-gray-700 hover:text-teal-700"
                }
              >
                Dashboard
              </NavLink>
              <button
                onClick={handleLogout}
                className="font-medium text-red-650 hover:text-red-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? "font-semibold text-teal-750"
                    : "font-medium text-gray-700 hover:text-teal-700"
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-full border border-teal-700 px-4 py-1.5 font-semibold text-teal-700 hover:bg-teal-50"
              >
                Register
              </NavLink>
            </>
          )}

          <Link
            to="/book-appointment"
            className="rounded-full bg-teal-700 px-5 py-2 font-semibold text-white hover:bg-teal-800"
          >
            Book Appointment
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t bg-white px-5 py-4 md:hidden space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setOpen(false)}
              className="block py-2.5 font-medium text-gray-700"
            >
              {link.name}
            </NavLink>
          ))}

          <hr className="my-2" />

          {isLoggedIn ? (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="block py-2.5 font-medium text-teal-700"
              >
                Dashboard
              </NavLink>
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left py-2.5 font-medium text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className="block py-2.5 font-medium text-gray-700"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setOpen(false)}
                className="block py-2.5 font-medium text-gray-700"
              >
                Register
              </NavLink>
            </>
          )}

          <Link
            to="/book-appointment"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-full bg-teal-700 px-5 py-3 text-center font-semibold text-white"
          >
            Book Appointment
          </Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;