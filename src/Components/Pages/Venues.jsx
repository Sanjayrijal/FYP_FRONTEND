import axios from "axios";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Breadcrumbs } from "../Breadcrumbs/Breadcrumbs.jsx";
import Footer from "../Footer/Footer";

export function Venues() {
  const [futsals, setFutsals] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    id: "",
    name: "",
    profilePic: "",
  });

  useEffect(() => {
    const fetchFutsals = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/api/futsals/getFutsals",
        );
        const allFutsals = res.data?.data || [];
        setFutsals(allFutsals.filter((futsal) => futsal.approved === true));
      } catch (err) {
        console.error("Error fetching futsals:", err);
      }
    };

    fetchFutsals();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get("http://localhost:5001/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser({
          id: String(response.data?.data?._id || ""),
          name: String(response.data?.data?.name || "").trim(),
          profilePic: String(response.data?.data?.profilePic || "").trim(),
        });

        // Fetch user's favorites from backend
        try {
          const favRes = await axios.get(
            "http://localhost:5001/api/users/favorites",
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setFavorites(favRes.data.data || []);
        } catch (err) {
          console.error("Error fetching favorites:", err);
        }
      } catch (error) {
        console.error("Error loading current user profile:", error);
      }
    };

    fetchCurrentUser();

    // Refresh favorites when user returns to the page (window focus event)
    const handleFocus = () => {
      fetchCurrentUser();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const toggleFavorite = async (item) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add favorites");
      return;
    }

    try {
      const isFav = favorites.some((f) => f._id === item._id);

      if (isFav) {
        await axios.post(
          "http://localhost:5001/api/users/favorites/remove",
          { futsalId: item._id },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.post(
          "http://localhost:5001/api/users/favorites/add",
          { futsalId: item._id },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      // Refresh favorites
      const favRes = await axios.get(
        "http://localhost:5001/api/users/favorites",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setFavorites(favRes.data.data || []);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      alert("Failed to update favorite");
    }
  };

  const isFavorite = (id) => {
    // favorites can be either array of objects (with _id) or array of IDs
    return favorites.some((f) => (f._id || f) === id);
  };

  return (
    <div className="min-h-screen pt-16 bg-white">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Venues" }]}
      />

      {/* Futsals Section */}
      <div className="p-4 sm:p-6 md:p-10">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Futsals Courts
          </h1>
          <NavLink
            to="/"
            className="text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Back to Home
          </NavLink>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {futsals.map((item) => (
            <div
              key={item._id}
              className="p-4 sm:p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-md"
                />
                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(item);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:scale-110 transition-transform"
                >
                  <Heart
                    size={18}
                    className={
                      isFavorite(item._id)
                        ? "fill-blue-500 text-blue-500"
                        : "text-gray-400"
                    }
                  />
                </button>
              </div>

              <NavLink to="/FutsalData" state={{ futsal: item }}>
                <h2 className="text-base sm:text-lg font-semibold mt-2">
                  {item.name}
                </h2>
                <small className="text-gray-600 text-xs sm:text-sm">
                  {item.location}
                </small>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-10 justify-between mt-2">
                  <p className="text-lg sm:text-xl text-blue-600 font-bold">
                    Rs. {item.pricePerHour} / hr
                  </p>
                  <span className="text-gray-500 text-xs sm:text-sm">
                    {item.openingTime} - {item.closingTime}
                  </span>
                </div>
              </NavLink>
            </div>
          ))}
        </section>

        {futsals.length === 0 && (
          <p className="text-center text-red-500 mt-8 py-12">
            No futsals found in Database.
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}
