import axios from "axios";
import { Building2, CheckCircle, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

const EMPTY_FORM = { name: "", location: "", pricePerHour: "" };

export default function ManageFutsals() {
  const [futsals, setFutsals] = useState([]);
  const [filter, setFilter] = useState("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingFutsal, setEditingFutsal] = useState(null); // null = add mode
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingFutsal, setDeletingFutsal] = useState(null);
  const [deletionReason, setDeletionReason] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchFutsals();
  }, []);

  const fetchFutsals = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        "http://localhost:5001/api/futsals/getfutsals",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setFutsals(res.data.data || []);
    } catch (error) {
      console.error("Error fetching futsals:", error);
    }
  };

  const approveFutsal = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `http://localhost:5001/api/futsals/${id}`,
        { approved: true },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchFutsals();
    } catch (error) {
      console.error("Error approving futsal:", error);
    }
  };

  const openDeleteModal = (futsal) => {
    setDeletingFutsal(futsal);
    setDeletionReason("");
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingFutsal(null);
    setDeletionReason("");
    setDeleteError("");
  };

  const submitDeleteFutsal = async (e) => {
    e.preventDefault();
    setDeleteError("");

    const reason = deletionReason.trim();
    if (!reason) {
      setDeleteError("Deletion reason is required.");
      return;
    }

    if (!deletingFutsal?._id) {
      setDeleteError("No futsal selected for deletion.");
      return;
    }

    try {
      setDeleteSubmitting(true);
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `http://localhost:5001/api/futsals/${deletingFutsal._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { deletionReason: reason },
        },
      );
      closeDeleteModal();
      fetchFutsals();
    } catch (error) {
      console.error("Error deleting futsal:", error);
      setDeleteError(
        error?.response?.data?.message ||
          "Failed to delete futsal. Please try again.",
      );
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // --- Modal helpers ---
  const openAddModal = () => {
    setEditingFutsal(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (futsal) => {
    setEditingFutsal(futsal);
    setFormData({
      name: futsal.name || "",
      location: futsal.location || "",
      pricePerHour: futsal.pricePerHour || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFutsal(null);
    setFormData(EMPTY_FORM);
    setFormError("");
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !formData.name.trim() ||
      !formData.location.trim() ||
      !formData.pricePerHour
    ) {
      setFormError("All fields are required.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const payload = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        pricePerHour: Number(formData.pricePerHour),
      };

      if (editingFutsal) {
        // Edit existing
        await axios.put(
          `http://localhost:5001/api/futsals/${editingFutsal._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        // Add new
        await axios.post("http://localhost:5001/api/futsals", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      closeModal();
      fetchFutsals();
    } catch (error) {
      console.error("Error saving futsal:", error);
      setFormError(
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFutsals = futsals.filter((futsal) => {
    if (filter === "approved") return futsal.approved;
    if (filter === "pending") return !futsal.approved;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Futsals</h1>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm"
          >
            <option value="all">All Futsals</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>

          {/* <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Futsal
          </button> */}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                NAME
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                LOCATION
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                PRICE/HOUR
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                STATUS
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredFutsals.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-400 text-sm"
                >
                  No futsals found.
                </td>
              </tr>
            )}
            {filteredFutsals.map((futsal) => (
              <tr key={futsal._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                      <Building2 className="text-blue-600" size={20} />
                    </div>
                    <span className="font-medium text-gray-900">
                      {futsal.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {futsal.location}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  Rs {futsal.pricePerHour}
                </td>
                <td className="px-6 py-4">
                  {futsal.approved ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                      Approved
                    </span>
                  ) : (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-semibold">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {!futsal.approved && (
                      <button
                        onClick={() => approveFutsal(futsal._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(futsal)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(futsal)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingFutsal ? "Edit Futsal" : "Add New Futsal"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Futsal Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Arena Futsal"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Kathmandu, Baneshwor"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Per Hour (Rs)
                </label>
                <input
                  type="number"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleInputChange}
                  placeholder="e.g. 1200"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
                >
                  {submitting
                    ? editingFutsal
                      ? "Saving..."
                      : "Adding..."
                    : editingFutsal
                      ? "Save Changes"
                      : "Add Futsal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Futsal
              </h2>
              <button
                onClick={closeDeleteModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitDeleteFutsal} className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-600">
                Please provide a reason for deleting
                <span className="font-semibold text-gray-900">
                  {` ${deletingFutsal?.name || "this futsal"}`}
                </span>
                . This message will be sent to the futsal owner notification
                box.
              </p>

              {deleteError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
                  {deleteError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deletion Reason
                </label>
                <textarea
                  rows={4}
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  placeholder="Explain clearly why this futsal is being deleted..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={400}
                />
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {deletionReason.length}/400
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60"
                >
                  {deleteSubmitting ? "Deleting..." : "Send Reason & Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
