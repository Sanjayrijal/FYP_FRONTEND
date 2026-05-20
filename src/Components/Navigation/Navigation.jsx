import {
    faBars,
    faMagnifyingGlass,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { UserCircle2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { apiUrl } from "../../config/api.js";

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef();
  const [userProfile, setUserProfile] = useState({
    name: "",
    profilePic: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserProfile({ name: "", profilePic: "" });
        return;
      }

      try {
        const response = await axios.get(apiUrl("/api/users/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserProfile({
          name: String(response.data?.data?.name || "").trim(),
          profilePic: String(response.data?.data?.profilePic || "").trim(),
        });
      } catch (error) {
        console.error("Error loading nav profile image:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const userInitials = useMemo(() => {
    const value = String(userProfile.name || "").trim();
    if (!value) return "U";
    const parts = value.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [userProfile.name]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Navigation Bar */}
      <div className="flex flex-row w-full h-auto md:h-20 justify-between py-2 md:py-2 my-2 md:my-2 px-4 sm:px-6 md:px-14 items-center">
        {/* Logo */}
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
          <span className="text-blue-500">Kick</span>Hub
        </h2>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-700 text-xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between px-6 py-4 gap-6">
          {/* NavBar */}
          <nav>
            <ul className="flex gap-8 lg:gap-12 text-sm lg:text-lg font-medium">
              <li>
                <NavLink
                  to="/Explore"
                  className={({ isActive }) =>
                    `block py-2 pr-1 pl-3 duration-200 ${isActive ? "text-black underline font-bold" : "text-gray-500"} gap-2 flex items-center transition-transform transform hover:scale-110 cursor-pointer`
                  }
                >
                  <span>Home</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/Wishlist"
                  className={({ isActive }) =>
                    `block py-2 pr-1 pl-1 duration-200 ${isActive ? "text-black underline font-bold" : "text-gray-500"} gap-2 flex items-center transition-transform transform hover:scale-110 cursor-pointer`
                  }
                >
                  <span>Favorite</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/offers"
                  className={({ isActive }) =>
                    `block py-2 pr-1 pl-1 duration-200 ${isActive ? "text-black underline font-bold" : "text-gray-500"} gap-2 flex items-center transition-transform transform hover:scale-110 cursor-pointer`
                  }
                >
                  <span>Offers</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/Bookings"
                  className={({ isActive }) =>
                    `block py-2 pr-1 pl-1 duration-200 ${isActive ? "text-black underline font-bold" : "text-gray-500"} gap-2 flex items-center transition-transform transform hover:scale-110 cursor-pointer`
                  }
                >
                  <span>Bookings</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* SearchBox */}
          <form
            onSubmit={handleSearch}
            className="flex border border-gray-300 w-64 lg:w-80 h-11 space-x-3 items-center rounded-full transition-all duration-200 focus-within:w-72 lg:focus-within:w-96 shadow-sm px-4"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-full outline-none border-none text-gray-700 placeholder-gray-500 bg-transparent text-sm"
              placeholder="Futsal, Location, etc..."
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="text-gray-800 cursor-pointer hover:text-gray-800 transition"
              onClick={handleSearch}
            />
          </form>
        </div>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          {userProfile.profilePic ? (
            <img
              src={userProfile.profilePic}
              alt="userImg"
              onClick={() => setOpen(!open)}
              className="w-10 h-10 rounded-full cursor-pointer object-cover border border-gray-200"
            />
          ) : (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="w-10 h-10 rounded-full cursor-pointer bg-emerald-100 text-emerald-700 font-semibold border border-gray-200"
              aria-label="Open user menu"
            >
              {userInitials}
            </button>
          )}
          {open && (
            <div className="bg-white shadow-xl absolute top-10 p-4 rounded-lg cursor-pointer right-1 z-50">
              <ul className="min-w-36">
                <li
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setOpen(false);
                    navigate("/profile");
                  }}
                >
                  <UserCircle2 size={16} />
                  Profile
                </li>
                <li
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setOpen(false);
                    navigate("/LoginSignup");
                  }}
                >
                  <span className="text-red-500" aria-hidden="true">
                    🚪
                  </span>
                  <span className="text-red-500">Log-out</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 sm:px-6 pb-3">
        <form
          onSubmit={handleSearch}
          className="flex border border-gray-300 w-full h-10 space-x-3 items-center rounded-full shadow-sm px-3"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-full outline-none border-none text-gray-700 placeholder-gray-500 bg-transparent text-sm"
            placeholder="Search..."
          />
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="text-gray-800 cursor-pointer hover:text-gray-800 transition"
            onClick={handleSearch}
          />
        </form>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3">
          <nav>
            <ul className="flex flex-col gap-3">
              <li>
                <NavLink
                  to="/Explore"
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded text-sm ${isActive ? "bg-blue-100 text-black font-bold" : "text-gray-600"} hover:bg-gray-100`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/Wishlist"
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded text-sm ${isActive ? "bg-blue-100 text-black font-bold" : "text-gray-600"} hover:bg-gray-100`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Favorite
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/offers"
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded text-sm ${isActive ? "bg-blue-100 text-black font-bold" : "text-gray-600"} hover:bg-gray-100`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Offers
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/Bookings"
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded text-sm ${isActive ? "bg-blue-100 text-black font-bold" : "text-gray-600"} hover:bg-gray-100`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Bookings
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
