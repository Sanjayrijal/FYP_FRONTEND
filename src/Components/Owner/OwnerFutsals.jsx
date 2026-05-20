import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../../config/api.js";
import OwnerSidebar from "./OwnerSidebar";

export default function OwnerFutsals() {
  const navigate = useNavigate();
  const [futsals, setFutsals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ownerToken");
    if (!token) {
      navigate("/owner/login");
      return;
    }
    fetchFutsals();
  }, [navigate]);

  const fetchFutsals = async () => {
    try {
      const token = localStorage.getItem("ownerToken");
      const res = await axios.get(apiUrl("/api/owner/futsals"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFutsals(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching futsals:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this futsal?")) return;

    try {
      const token = localStorage.getItem("ownerToken");
      await axios.delete(apiUrl(`/api/owner/futsals/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFutsals();
    } catch (error) {
      console.error("Error deleting futsal:", error);
      alert("Failed to delete futsal");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <OwnerSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-48 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">My Futsals</h2>
          <Link
            to="/owner/futsals/add"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            + Add Futsal
          </Link>
        </div>

        {futsals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Futsals Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start by adding your first futsal venue
            </p>
            <Link
              to="/owner/futsals/add"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Add Your First Futsal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {futsals.map((futsal) => (
              <div
                key={futsal._id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                {/* Images (show all or fallback) */}
                <div className="h-48 bg-linear-to-r from-green-400 to-blue-500 relative flex items-center justify-center">
                  {Array.isArray(futsal.images) && futsal.images.length > 0 ? (
                    <img
                      src={futsal.images[0]}
                      alt={futsal.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                      {futsal.name.charAt(0)}
                    </div>
                  )}
                  {/* Thumbnails if multiple images */}
                  {Array.isArray(futsal.images) && futsal.images.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-white/70 rounded px-2 py-1">
                      {futsal.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`thumb-${idx}`}
                          className="w-8 h-6 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                  {/* Approval Badge */}
                  <div className="absolute top-3 right-3">
                    {futsal.approved ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Approved
                      </span>
                    ) : (
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {futsal.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {futsal.location}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Price/Hour</p>
                      <p className="text-lg font-bold text-blue-600">
                        Rs {futsal.pricePerHour}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hours</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {futsal.openingTime} - {futsal.closingTime}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/owner/futsals/edit/${futsal._id}`}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-center hover:bg-blue-600 transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(futsal._id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
