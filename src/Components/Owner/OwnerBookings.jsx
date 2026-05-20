import axios from "axios";
import { CheckCircle, MessageSquare, Send, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../config/api.js";
import OwnerSidebar from "./OwnerSidebar";
export default function OwnerBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending-approval");

  // Modal states
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [verificationAction, setVerificationAction] = useState(null); // 'approve' or 'reject'
  const [comment, setComment] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("ownerToken");
    if (!token) {
      navigate("/owner/login");
      return;
    }
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("ownerToken");
      const res = await axios.get(apiUrl("/api/owner/bookings"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    }
  };

  const handleVerifyBooking = async (action) => {
    if (action === "reject" && !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      const token = localStorage.getItem("ownerToken");
      await axios.put(
        apiUrl(`/api/owner/bookings/${selectedBooking._id}/verify`),
        {
          action,
          rejectionReason: rejectionReason.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert(
        `Booking ${action === "approve" ? "approved" : "rejected"} successfully!`,
      );
      setShowVerificationModal(false);
      setRejectionReason("");
      setVerificationAction(null);
      setSelectedBooking(null);
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error("Error verifying booking:", error);
      alert("Failed to verify booking");
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem("ownerToken");
      await axios.post(
        apiUrl(`/api/owner/bookings/${selectedBooking._id}/comment`),
        { comment: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Comment added successfully!");
      setShowCommentModal(false);
      setComment("");
      setSelectedBooking(null);
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    try {
      const token = localStorage.getItem("ownerToken");
      await axios.post(
        apiUrl(`/api/owner/bookings/${selectedBooking._id}/cancel`),
        { reason: cancelReason.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Booking cancelled successfully!");
      setShowCancelModal(false);
      setCancelReason("");
      setSelectedBooking(null);
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking");
    }
  };

  const filterBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case "pending-approval":
        return bookings.filter((b) => b.ownerVerificationStatus === "pending");
      case "approved":
        return bookings.filter((b) => b.ownerVerificationStatus === "approved");
      case "rejected":
        return bookings.filter((b) => b.ownerVerificationStatus === "rejected");
      case "today":
        return bookings.filter((b) => {
          const bookingDate = new Date(b.bookingDate);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === today.getTime();
        });
      case "upcoming":
        return bookings.filter((b) => {
          const bookingDate = new Date(b.bookingDate);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate > today;
        });
      case "past":
        return bookings.filter((b) => {
          const bookingDate = new Date(b.bookingDate);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate < today;
        });
      default:
        return bookings;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const filteredBookings = filterBookings();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <OwnerSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-48 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Bookings</h2>

          {/* Filter Tabs */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm overflow-x-auto">
            <button
              onClick={() => setFilter("pending-approval")}
              className={`px-4 py-2 rounded-md font-medium transition whitespace-nowrap ${
                filter === "pending-approval"
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 py-2 rounded-md font-medium transition whitespace-nowrap ${
                filter === "approved"
                  ? "bg-green-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-4 py-2 rounded-md font-medium transition whitespace-nowrap ${
                filter === "rejected"
                  ? "bg-red-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Rejected
            </button>
            <div className="border-l border-gray-300 mx-2"></div>
            <button
              onClick={() => setFilter("today")}
              className={`px-4 py-2 rounded-md font-medium transition whitespace-nowrap ${
                filter === "today"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-md font-medium transition whitespace-nowrap ${
                filter === "upcoming"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-4 py-2 rounded-md font-medium transition whitespace-nowrap ${
                filter === "past"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Bookings Found
            </h3>
            <p className="text-gray-600">
              No bookings match your current filter
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Futsal
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Payment Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Booking Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Verification Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => {
                  // Calculate hours and amount with proper error handling
                  let amount = 0;
                  try {
                    const start = booking.startTime.split(":").map(Number);
                    const end = booking.endTime.split(":").map(Number);
                    const hours =
                      end[0] + end[1] / 60 - (start[0] + start[1] / 60);
                    const pricePerHour = booking.futsal?.pricePerHour || 0;
                    amount = Math.max(0, hours * pricePerHour); // Ensure non-negative
                  } catch (e) {
                    console.error("Error calculating amount:", e);
                    amount = 0;
                  }

                  // Helper function to get payment status badge
                  const getPaymentStatusBadge = (status) => {
                    const statusConfig = {
                      paid: {
                        bg: "bg-green-100",
                        text: "text-green-700",
                        label: "Paid",
                      },
                      unpaid: {
                        bg: "bg-yellow-100",
                        text: "text-yellow-700",
                        label: "Unpaid",
                      },
                      pending: {
                        bg: "bg-blue-100",
                        text: "text-blue-700",
                        label: "Pending",
                      },
                      failed: {
                        bg: "bg-red-100",
                        text: "text-red-700",
                        label: "Failed",
                      },
                    };
                    const config = statusConfig[status] || statusConfig.unpaid;
                    return config;
                  };

                  const paymentBadge = getPaymentStatusBadge(
                    booking.paymentStatus,
                  );

                  return (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {formatDate(booking.bookingDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {booking.startTime} - {booking.endTime}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {booking.futsal?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.futsal?.location}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {booking.user?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.user?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-800">
                          Rs {amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${paymentBadge.bg} ${paymentBadge.text}`}
                        >
                          {paymentBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {booking.cancelledByOwner ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                            Cancelled
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {booking.ownerVerificationStatus === "pending" && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                            Pending
                          </span>
                        )}
                        {booking.ownerVerificationStatus === "approved" && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded flex items-center gap-1 w-fit">
                            <CheckCircle size={12} />
                            Approved
                          </span>
                        )}
                        {booking.ownerVerificationStatus === "rejected" && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded flex items-center gap-1 w-fit">
                            <XCircle size={12} />
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* Approve/Reject Buttons - Only for pending bookings */}
                          {booking.ownerVerificationStatus === "pending" && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setVerificationAction("approve");
                                  setShowVerificationModal(true);
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Approve Booking"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setVerificationAction("reject");
                                  setShowVerificationModal(true);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Reject Booking"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}

                          {/* Comment Button */}
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowCommentModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Add Comment"
                          >
                            <MessageSquare size={18} />
                          </button>

                          {/* Cancel Button - Only for active bookings */}
                          {!booking.cancelledByOwner && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowCancelModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Cancel Booking"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-right text-sm text-gray-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add Comment
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Booking: {selectedBooking?.futsal?.name}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Customer: {selectedBooking?.user?.name}
              </p>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comment or message for the customer..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
              rows={4}
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setComment("");
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Send size={16} />
                Send Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Cancel Booking
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Booking: {selectedBooking?.futsal?.name}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Customer: {selectedBooking?.user?.name}
              </p>
            </div>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation (required)..."
              className="w-full border border-red-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none mb-4"
              rows={4}
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3
              className={`text-xl font-bold mb-4 ${
                verificationAction === "approve"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {verificationAction === "approve"
                ? "Approve Booking"
                : "Reject Booking"}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Booking: {selectedBooking?.futsal?.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Customer: {selectedBooking?.user?.name}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Date: {formatDate(selectedBooking?.bookingDate)} (
                {selectedBooking?.startTime} - {selectedBooking?.endTime})
              </p>
            </div>

            {verificationAction === "reject" && (
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection (required)..."
                className="w-full border border-red-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none mb-4"
                rows={3}
              />
            )}

            {verificationAction === "approve" && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ This booking will be marked as approved and the customer
                  will be notified.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setRejectionReason("");
                  setVerificationAction(null);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyBooking(verificationAction)}
                className={`px-4 py-2 text-white rounded-lg transition ${
                  verificationAction === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {verificationAction === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
