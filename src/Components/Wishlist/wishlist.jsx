import axios from "axios";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { apiUrl } from "../../config/api.js";
import { Breadcrumbs } from "../Breadcrumbs/Breadcrumbs.jsx";
import Footer from "../Footer/Footer";

export default function Wishlist() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(apiUrl("/api/users/favorites"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(res.data.data || []);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (futsalId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        apiUrl("/api/users/favorites/remove"),
        { futsalId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Refresh favorites
      fetchFavorites();
    } catch (err) {
      console.error("Error removing favorite:", err);
      alert("Failed to remove favorite");
    }
  };

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Favorites" }]}
      />

      <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">
            Favorite Courts
          </h1>
          <span className="text-sm text-gray-500">
            {favorites.length} saved
          </span>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && favorites.length === 0 && (
          <div className="text-center mt-12 sm:mt-20">
            <Heart
              size={40}
              className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-4"
            />
            <p className="text-gray-500 text-base sm:text-lg">
              No favourite futsals yet.
            </p>
            <NavLink
              to="/Explore"
              className="text-blue-600 text-xs sm:text-sm mt-2 inline-block hover:underline"
            >
              Browse futsals
            </NavLink>
          </div>
        )}

        {!loading && favorites.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mt-4 sm:mt-6">
            {favorites.map((item) => (
              <div
                key={item._id}
                className="p-4 sm:p-5 md:p-6 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-40 sm:h-48 md:h-50 object-cover rounded-md"
                  />
                  {/* Remove from favorites */}
                  <button
                    onClick={() => removeFavorite(item._id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:scale-110 transition-transform"
                  >
                    <Heart size={18} className="fill-red-500 text-red-500" />
                  </button>
                </div>

                <NavLink to="/FutsalData" state={{ futsal: item }}>
                  <h2 className="text-base sm:text-lg font-semibold mt-2">
                    {item.name}
                  </h2>
                  <small className="text-xs sm:text-sm text-gray-600">
                    {item.location}
                  </small>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 md:gap-10 justify-between mt-2">
                    <p className="text-lg sm:text-xl text-blue-800 font-bold">
                      Rs. {item.pricePerHour} / hr
                    </p>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {item.openingTime} - {item.closingTime}
                    </span>
                  </div>
                </NavLink>
              </div>
            ))}
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
