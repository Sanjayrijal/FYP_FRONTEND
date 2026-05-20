import axios from "axios";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../config/api.js";
import OwnerSidebar from "./OwnerSidebar";

export default function OwnerOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [futsals, setFutsals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount: "",
    code: "",
    expiresAt: "",
    futsalId: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const token = localStorage.getItem("ownerToken");
    if (!token) {
      navigate("/owner/login");
      return;
    }
    fetchOffers();
    fetchFutsals();
  }, [navigate]);

  const fetchFutsals = async () => {
    try {
      const token = localStorage.getItem("ownerToken");
      const res = await axios.get(apiUrl("/api/owner/futsals"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFutsals(res.data.data);
    } catch (error) {
      console.error("Error fetching futsals:", error);
    }
  };

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem("ownerToken");
      const res = await axios.get(apiUrl("/api/offers/owner/all"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers(res.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching offers:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("ownerToken");

      if (editingId) {
        // Update existing offer
        await axios.put(apiUrl(`/api/offers/${editingId}`), formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage({ type: "success", text: "Offer updated successfully!" });
      } else {
        // Create new offer
        await axios.post(apiUrl("/api/offers/create"), formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage({ type: "success", text: "Offer created successfully!" });
      }

      setFormData({
        title: "",
        description: "",
        discount: "",
        code: "",
        expiresAt: "",
        futsalId: "",
      });
      setEditingId(null);
      setShowForm(false);
      fetchOffers();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save offer",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (offer) => {
    setFormData({
      title: offer.title,
      description: offer.description,
      discount: offer.discount,
      code: offer.code,
      expiresAt: offer.expiresAt.split("T")[0],
      futsalId: offer.futsal._id,
    });
    setEditingId(offer._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      const token = localStorage.getItem("ownerToken");
      await axios.delete(apiUrl(`/api/offers/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: "success", text: "Offer deleted successfully!" });
      fetchOffers();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete offer",
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      discount: "",
      code: "",
      expiresAt: "",
      futsalId: "",
    });
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
          <h2 className="text-3xl font-bold text-gray-800">Manage Offers</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <Plus size={20} />
              Create Offer
            </button>
          )}
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Offer Creation/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? "Edit Offer" : "Create New Offer"}
            </h3>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Futsal Selection */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Futsal *
                  </label>
                  <select
                    name="futsalId"
                    value={formData.futsalId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a futsal</option>
                    {futsals.map((futsal) => (
                      <option key={futsal._id} value={futsal._id}>
                        {futsal.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Weekend Special"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe your offer"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="text"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 20%, 500 Rs"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Code */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., WEEKEND20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Expires At *
                  </label>
                  <input
                    type="date"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-60"
                >
                  {submitLoading
                    ? "Saving..."
                    : editingId
                      ? "Update Offer"
                      : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Offers List */}
        {offers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No offers created yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Create Your First Offer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <h3 className="font-bold text-lg">{offer.title}</h3>
                  <p className="text-blue-100 text-sm">{offer.futsal?.name}</p>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-3">
                    <p className="text-3xl font-bold text-blue-600">
                      {offer.discount}
                    </p>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {offer.description}
                    </p>
                  </div>

                  {/* Code */}
                  <div className="bg-gray-50 rounded p-2 mb-3">
                    <p className="text-xs text-gray-500 mb-1">Promo Code</p>
                    <p className="font-mono text-lg font-bold text-gray-800">
                      {offer.code}
                    </p>
                  </div>

                  {/* Expiry */}
                  <p className="text-xs text-gray-500 mb-4">
                    Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                  </p>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        offer.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {offer.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(offer)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm font-medium"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(offer._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-medium"
                    >
                      <Trash2 size={16} />
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
