import axios from "axios";
import {
  Calendar,
  Heart,
  LogOut,
  Menu,
  Search,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export function DynamicHeroNavbar() {
  const token = localStorage.getItem("token");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef();
  const [userProfile, setUserProfile] = useState({
    name: "",
    profilePic: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setUserProfile({ name: "", profilePic: "" });
        return;
      }

      try {
        const response = await axios.get("http://localhost:5001/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserProfile({
          name: String(response.data?.data?.name || "").trim(),
          profilePic: String(response.data?.data?.profilePic || "").trim(),
        });
      } catch (error) {
        console.error("Error loading nav profile:", error);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const userInitials = useMemo(() => {
    const value = String(userProfile.name || "").trim();
    if (!value) return "U";
    const parts = value.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [userProfile.name]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/LoginSignup");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Not logged in - Show simple navbar
  if (!token) {
    return (
      <nav className="flex items-center justify-between px-4 py-4 bg-slate-950 text-white shadow-lg">
        <div className="text-xl font-bold tracking-tight">
          <span className="text-blue-500">Kick</span>Hub
        </div>

        <div className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `font-medium transition-colors ${
                isActive ? "text-blue-500" : "text-white/80 hover:text-white"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/Explore"
            className={({ isActive }) =>
              `font-medium transition-colors ${
                isActive ? "text-blue-500" : "text-white/80 hover:text-white"
              }`
            }
          >
            Venues
          </NavLink>
          <NavLink
            to="/LoginSignup"
            className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
          >
            Sign in
          </NavLink>
        </div>

        {/* Mobile Menu */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-slate-900 shadow-lg md:hidden">
            <div className="flex flex-col gap-4 p-4">
              <NavLink
                to="/"
                className="font-medium text-white/80 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/Explore"
                className="font-medium text-white/80 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Venues
              </NavLink>
              <NavLink
                to="/LoginSignup"
                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </NavLink>
            </div>
          </div>
        )}
      </nav>
    );
  }

  // Logged in - Show hero navbar with search bar
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-slate-950/95 backdrop-blur-sm text-white shadow-lg">
      {/* Left Section - Logo and Menu */}
      <div className="flex items-center gap-12">
        {/* Logo */}
        <div className="text-lg font-bold tracking-tight flex-shrink-0">
          <span className="text-blue-500">Kick</span>Hub
        </div>

        {/* Center Menu */}
        <div className="hidden lg:flex items-center gap-8 pl-114 pr-10">
          <NavLink
            to="/Explore"
            className={({ isActive }) =>
              `font-medium transition-colors text-sm ${
                isActive ? "text-blue-500" : "text-white/80 hover:text-white"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/Venues"
            className={({ isActive }) =>
              `font-medium transition-colors text-sm ${
                isActive ? "text-blue-500" : "text-white/80 hover:text-white"
              }`
            }
          >
            Venues
          </NavLink>
          <NavLink
            to="/offers"
            className={({ isActive }) =>
              `font-medium transition-colors text-sm ${
                isActive ? "text-blue-500" : "text-white/80 hover:text-white"
              }`
            }
          >
            Offers
          </NavLink>
          <NavLink
            to="/contactUS"
            className={({ isActive }) =>
              `font-medium transition-colors text-sm ${
                isActive ? "text-blue-500" : "text-white/80 hover:text-white"
              }`
            }
          >
            Contact Us
          </NavLink>
        </div>
      </div>

      {/* Center - Search Bar */}
      <div className="hidden md:flex items-center flex-1 px-6">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Futsal, Location, etc..."
            className="w-full px-4 py-2 rounded-lg bg-gray-300 text-gray-800 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search
            size={18}
            className="absolute right-3 top-2.5 text-gray-400"
          />
        </div>
      </div>

      {/* Right Section - Icons and Profile */}
      <div className="flex items-center gap-6">
        {/* Settings Icon */}
        <button className="p-1.5 hover:bg-white/10 rounded-full transition hidden lg:flex items-center justify-center">
          <Settings size={20} className="text-white/80" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition"
          >
            {userProfile.profilePic ? (
              <img
                src={userProfile.profilePic}
                alt={userProfile.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {userInitials}
              </div>
            )}
            <span className="text-white text-sm font-medium hidden md:block">
              {userProfile.name}
            </span>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                {userProfile.profilePic ? (
                  <img
                    src={userProfile.profilePic}
                    alt={userProfile.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    {userInitials}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {userProfile.name}
                  </p>
                  <p className="text-xs text-gray-500">View profile</p>
                </div>
              </div>

              <NavLink
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-gray-900 font-medium"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs">
                  ⊙
                </div>
                Profile
              </NavLink>

              <NavLink
                to="/Wishlist"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-gray-900 font-medium"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <Heart size={18} className="text-red-500" />
                Favorites
              </NavLink>

              <NavLink
                to="/Bookings"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-gray-900 font-medium"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <Calendar size={18} className="text-blue-500" />
                My Bookings
              </NavLink>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-red-600 font-medium last:rounded-b-lg"
              >
                <LogOut size={18} />
                Log-out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-slate-900 shadow-lg md:hidden">
          <div className="flex flex-col gap-4 p-4">
            <NavLink
              to="/"
              className="font-medium text-white/80 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/Explore"
              className="font-medium text-white/80 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Venues
            </NavLink>
            <NavLink
              to="/offers"
              className="font-medium text-white/80 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Offers
            </NavLink>
            <a
              href="#contact"
              className="font-medium text-white/80 hover:text-white"
            >
              Contact Us
            </a>
            <hr className="my-2 border-white/20" />
            <NavLink
              to="/profile"
              className="flex items-center gap-2 font-medium text-white/80 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </NavLink>
            <NavLink
              to="/Wishlist"
              className="flex items-center gap-2 font-medium text-white/80 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart size={16} className="text-red-500" />
              Favorites
            </NavLink>
            <NavLink
              to="/Bookings"
              className="flex items-center gap-2 font-medium text-white/80 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Calendar size={16} className="text-blue-500" />
              My Bookings
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition justify-start"
            >
              <LogOut size={16} />
              Log-out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
