import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";

function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default UserLayout;
