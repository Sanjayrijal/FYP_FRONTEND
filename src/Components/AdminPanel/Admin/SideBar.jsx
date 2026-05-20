import { Building2, LayoutGrid, LogOut, Users } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  return (
    <div className="h-screen w-48 bg-white border-r border-gray-200 flex flex-col px-4 py-6">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-lg font-bold text-gray-900">KickHub Futsal</h1>
        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-1 flex-1">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              isActive
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <LayoutGrid size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/futsals"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              isActive
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <Building2 size={18} />
          Futsals
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              isActive
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <Users size={18} />
          Users
        </NavLink>
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
