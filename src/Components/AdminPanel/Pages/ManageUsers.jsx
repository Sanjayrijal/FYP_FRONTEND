import axios from "axios";
import { CheckCircle, Pencil, Trash2, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiUrl } from "../../../config/api.js";

const EMPTY_FORM = { name: "", email: "", contactNumber: "" };
const BASE_URL = apiUrl("/api/users");

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const getToken = () => localStorage.getItem("adminToken");

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      console.log("Token:", token);

      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Response:", res.data);
      setUsers(res.data.data || []);
    } catch (error) {
      console.error(
        "Error fetching users:",
        error?.response?.data || error.message,
      );
    }
  };

  const approveUser = async (id) => {
    try {
      await axios.put(
        `${BASE_URL}/${id}`,
        { verified: true },
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      fetchUsers();
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      contactNumber: user.contactNumber || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setFormError("");
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and email are required.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.put(
        `${BASE_URL}/${editingUser._id}`,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contactNumber: formData.contactNumber.trim(),
        },
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      setFormError(
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                USER
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                EMAIL
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                CONTACT
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
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-400 text-sm"
                >
                  No users found.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={20} />
                    </div>
                    <span className="font-medium text-gray-900">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.contactNumber || "N/A"}
                </td>
                <td className="px-6 py-4">
                  {user.verified ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                      Verified
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                      Unverified
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {!user.verified && (
                      <button
                        onClick={() => approveUser(user._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Verify User"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit User"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete User"
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

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Edit User</h2>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email address"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. 9800000000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
