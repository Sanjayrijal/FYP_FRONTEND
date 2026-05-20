import {
  Building2,
  Calendar,
  Gift,
  LayoutGrid,
  LogOut,
  Users,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function OwnerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("ownerToken");
    localStorage.removeItem("ownerData");
    navigate("/owner/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen w-48 bg-white border-r border-gray-200 flex flex-col px-4 py-6 fixed left-0 top-0">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-gray-900 font-bold text-lg">KickHub Futsal</h1>
        <p className="text-xs text-gray-400 mt-0.5">Owner Panel</p>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-1 flex-1">
        <Link
          to="/owner/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
            isActive("/owner/dashboard")
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <LayoutGrid size={18} />
          Dashboard
        </Link>

        <Link
          to="/owner/futsals"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
            isActive("/owner/futsals")
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Building2 size={18} />
          My Futsals
        </Link>

        <Link
          to="/owner/bookings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
            isActive("/owner/bookings")
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Calendar size={18} />
          Bookings
        </Link>

        <Link
          to="/owner/offers"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
            isActive("/owner/offers")
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Gift size={18} />
          Offers
        </Link>

        <Link
          to="/owner/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
            isActive("/owner/profile")
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Users size={18} />
          Profile
        </Link>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition w-full"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
