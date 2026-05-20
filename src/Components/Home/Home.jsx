import axios from "axios";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { apiUrl } from "../../config/api.js";
import Footer from "../Footer/Footer";

export function Home() {
  const [futsals, setFutsals] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    id: "",
    name: "",
    profilePic: "",
  });

  useEffect(() => {
    const fetchFutsals = async () => {
      try {
        const res = await axios.get(
          apiUrl("/api/futsals/getFutsals"),
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
        const response = await axios.get(apiUrl("/api/users/me"), {
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
            apiUrl("/api/users/favorites"),
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

  useEffect(() => {
    const loadReviews = () => {
      try {
        const storedReviews = JSON.parse(
          localStorage.getItem("futsalReviews") || "[]",
        );
        const legacyReviews = JSON.parse(
          localStorage.getItem("userTestimonials") || "[]",
        );
        const merged = [...storedReviews, ...legacyReviews].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
        setReviews(merged);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setReviews([]);
      }
    };

    loadReviews();
    window.addEventListener("storage", loadReviews);
    window.addEventListener("focus", loadReviews);
    return () => {
      window.removeEventListener("storage", loadReviews);
      window.removeEventListener("focus", loadReviews);
    };
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
          apiUrl("/api/users/favorites/remove"),
          { futsalId: item._id },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.post(
          apiUrl("/api/users/favorites/add"),
          { futsalId: item._id },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      // Refresh favorites
      const favRes = await axios.get(
        apiUrl("/api/users/favorites"),
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

  const getInitials = (name) => {
    const value = String(name || "").trim();
    if (!value) return "U";
    const parts = value.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  // Always show only 4 futsals on home page
  const displayedFutsals = futsals.slice(0, 4);

  const isRealUploadedImage = (imageUrl) => {
    if (!imageUrl || String(imageUrl).trim() === "") return false;
    const url = String(imageUrl).trim();
    // Exclude auto-generated/emoji avatars and placeholders
    const excludedPatterns = [
      "dicebear",
      "pravatar",
      "ui-avatars",
      "placekitten",
      "placeimg",
      "placeholder",
      "via.placeholder",
      "emoji",
      "gravatar",
    ];
    const isExcluded = excludedPatterns.some((pattern) =>
      url.toLowerCase().includes(pattern.toLowerCase()),
    );
    if (isExcluded) return false;
    // Accept data URLs (from localStorage) or any valid URL/path that's not a placeholder
    const isDataUrl = url.startsWith("data:");
    const isValidUrl =
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/");
    return isDataUrl || isValidUrl;
  };

  const resolveReviewImage = (testimonial) => {
    // Check if testimonial has a real uploaded image (not auto-generated)
    if (testimonial?.image && isRealUploadedImage(testimonial.image)) {
      return testimonial.image;
    }

    if (
      testimonial?.profilePic &&
      isRealUploadedImage(testimonial.profilePic)
    ) {
      return testimonial.profilePic;
    }

    // Return empty string - will show initials instead
    return "";
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 pt-16">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/video/bgVideo.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/60 to-slate-950/85" />

        <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-3 sm:px-4 lg:px-8">
          <section className="flex items-center justify-center gap-4 sm:gap-8 lg:gap-12">
            <div className="w-full max-w-3xl px-2 text-center sm:px-4">
              <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl">
                <span className="text-blue-500 shadow-lg font-black">
                  Book Futsal
                </span>
                <br></br>
                Courts in Nepal
              </h1>

              <p className="mt-4 mx-auto font-light max-w-3xl text-sm sm:text-base lg:text-lg text-center text-white/85">
                Discover verified courts, check live availability, and complete
                bookings in minutes. KickHub keeps your match planning smooth,
                simple, and reliable.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 sm:gap-4 justify-center sm:mt-8">
                <NavLink
                  to="/Explore"
                  className="rounded-lg sm:rounded-xl bg-blue-500 px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  Start Booking
                </NavLink>
                <NavLink
                  to="/Explore"
                  className="rounded-lg sm:rounded-xl border border-white/35 bg-white/10 px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Explore Venues
                </NavLink>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-white/70 sm:gap-3 sm:text-sm lg:mt-8 justify-center">
                <span className="px-2 py-1 sm:px-3">Real-time slots</span>
                <span className="px-2 py-1 sm:px-3">Verified venues</span>
                <span className="px-2 py-1 sm:px-3">Fast booking flow</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Futsals Section */}
      <div className="p-4 sm:p-6 md:p-10">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Futsals Courts
          </h1>
          <NavLink
            to="/Venues"
            className="text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View more
          </NavLink>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {displayedFutsals.map((item) => (
            <div
              key={item._id}
              className="p-4 sm:p-6 rounded-lg shadow-xl hover:scale-105 transition-transform cursor-pointer"
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
                  <p className="text-lg sm:text-xl text-blue-800 font-bold">
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
          <p className="text-center text-red-500 mt-4">
            No futsals found in Database.
          </p>
        )}
      </div>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 bg-gray-50">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <p className="text-blue-600 font-bold text-xs tracking-widest mb-2 sm:mb-3">
            TRUSTED REVIEWS
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
            Client Feedback & Testimonial
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            See why renters trust and love our properties. Real stories from
            verified renters who've had great experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {reviews.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl shadow-md p-6 sm:p-8 hover:shadow-xl transition-shadow flex flex-col items-center"
            >
              {resolveReviewImage(testimonial) ? (
                <img
                  src={resolveReviewImage(testimonial)}
                  alt={testimonial.name}
                  className="w-20 sm:w-24 h-20 sm:h-24 rounded-full mb-4 sm:mb-5 border-4 border-gray-100 object-cover"
                />
              ) : (
                <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full mb-4 sm:mb-5 border-4 border-gray-100 bg-blue-100 text-blue-700 flex items-center justify-center text-lg sm:text-2xl font-bold">
                  {getInitials(testimonial.name || "User")}
                </div>
              )}
              <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-1">
                {testimonial.name || "Anonymous"}
              </h3>
              <div className="flex justify-center gap-1 mb-2 sm:mb-3">
                {[
                  ...Array(
                    Math.max(1, Math.min(5, Number(testimonial.rating) || 5)),
                  ),
                ].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    ★
                  </span>
                ))}
                {[
                  ...Array(
                    5 -
                      Math.max(1, Math.min(5, Number(testimonial.rating) || 5)),
                  ),
                ].map((_, i) => (
                  <span key={i} className="text-gray-300 text-lg">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold mb-3 sm:mb-4 uppercase tracking-wide">
                {testimonial.property || "Futsal Arena"}
              </p>
              <p className="text-gray-700 text-center text-xs sm:text-sm leading-relaxed">
                "{testimonial.feedback}"
              </p>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <p className="text-center text-sm text-gray-500 mt-8">
            No reviews yet. Submit one from a futsal details page.
          </p>
        )}
      </section>

      <Footer />
    </div>
  );
}
