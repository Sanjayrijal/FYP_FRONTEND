import axios from "axios";
import dayjs from "dayjs";
import {
    Calendar,
    CheckCircle,
    ChevronDown,
    Clock,
    MapPin,
    Trash2,
    TrendingUp,
    Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../Components/Breadcrumbs/Breadcrumbs.jsx";
import Footer from "../Components/Footer/Footer";
import SpinWheel from "../Components/Loyalty/SpinWheel";
import { apiUrl } from "../config/api.js";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("card");
  const [pendingSpin, setPendingSpin] = useState(null);
  const [showSpin, setShowSpin] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
    fetchPendingSpin();
  }, []);

  const fetchPendingSpin = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(apiUrl("/api/loyalty/pending"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.length > 0) {
        setPendingSpin(res.data[0]);
        setShowSpin(true);
      }
    } catch (err) {
      console.error("Error fetching pending spin:", err);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        apiUrl("/api/futsal/booking/user/myBookings"),
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBookings(res.data.data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }
    setCancelling(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(apiUrl(`/api/futsal/booking/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBookings();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(null);
    }
  };

  const today = dayjs().startOf("day");
  let filteredBookings = bookings;
  if (filter === "today") {
    filteredBookings = bookings.filter((b) =>
      dayjs(b.bookingDate).isSame(today, "day"),
    );
  } else if (filter === "upcoming") {
    filteredBookings = bookings.filter((b) =>
      dayjs(b.bookingDate).isAfter(today, "day"),
    );
  } else if (filter === "past") {
    filteredBookings = bookings.filter((b) =>
      dayjs(b.bookingDate).isBefore(today, "day"),
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status, paymentStatus) => {
    const statusConfig = {
      confirmed: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: "✓",
        label: "Confirmed",
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "✕",
        label: "Cancelled",
      },
      pending: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        icon: "⏳",
        label: "Pending",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return config;
  };

  const isUpcoming = (bookingDate) => dayjs(bookingDate).isAfter(today, "day");
  const isToday = (bookingDate) => dayjs(bookingDate).isSame(today, "day");
  const isPast = (bookingDate) => dayjs(bookingDate).isBefore(today, "day");

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "My Bookings" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {showSpin && pendingSpin && (
          <SpinWheel
            spin={pendingSpin}
            onClose={() => setShowSpin(false)}
            onSpun={(coupon) => {
              fetchBookings();
              setShowSpin(false);
              try {
                navigator.clipboard?.writeText(coupon.code);
              } catch (e) {
                console.error("Clipboard copy failed:", e);
              }
              alert(`You received ${coupon.discount}% off! Code copied.`);
            }}
          />
        )}

        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
                My Bookings
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <p className="text-gray-600">
                  {filteredBookings.length} booking
                  {filteredBookings.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition">
                <div className="text-2xl font-bold text-emerald-600">
                  {bookings.filter((b) => b.status === "confirmed").length}
                </div>
                <p className="text-xs text-gray-600 mt-1">Confirmed</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    bookings.filter((b) => dayjs(b.bookingDate).isAfter(today))
                      .length
                  }
                </div>
                <p className="text-xs text-gray-600 mt-1">Upcoming</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition">
                <div className="text-2xl font-bold text-orange-600">
                  {bookings.filter((b) => b.paymentStatus !== "paid").length}
                </div>
                <p className="text-xs text-gray-600 mt-1">Unpaid</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "All", value: "all" },
              { label: "Today", value: "today" },
              { label: "Upcoming", value: "upcoming" },
              { label: "Past", value: "past" },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                  filter === btn.value
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("card")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === "card"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">
              Loading your bookings...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Calendar size={48} className="text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              No Bookings Yet
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-8">
              Start your futsal journey today! Book your favorite venue and
              enjoy amazing games.
            </p>
            <NavLink
              to="/Explore"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              Explore Futsals
            </NavLink>
          </div>
        )}

        {/* Card View */}
        {!loading && bookings.length > 0 && viewMode === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => {
              const status = getStatusBadge(
                booking.status,
                booking.paymentStatus,
              );
              const upcoming = isUpcoming(booking.bookingDate);
              const today_check = isToday(booking.bookingDate);

              return (
                <div
                  key={booking._id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
                >
                  {/* Header Gradient */}
                  <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">
                          {booking.futsal?.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin size={14} />
                          {booking.futsal?.location}
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs ${status.bg} ${status.text}`}
                      >
                        {status.icon} {status.label}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100 my-4"></div>

                    {/* Details Grid */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Date
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(booking.bookingDate)}
                          </p>
                        </div>
                        {today_check && (
                          <span className="ml-auto px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded">
                            TODAY
                          </span>
                        )}
                        {upcoming && !today_check && (
                          <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                            SOON
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Clock size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Time
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-gray-600 font-medium">
                          Rate:
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          Rs. {booking.futsal?.pricePerHour}
                        </span>
                        <span className="text-sm text-gray-500">/hr</span>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div
                      className={`rounded-lg px-4 py-3 text-sm font-semibold text-center mb-4 ${
                        booking.paymentStatus === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {booking.paymentStatus === "paid" ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle size={16} />
                          Payment Done
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Zap size={16} />
                          Pending Payment
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {booking.status !== "cancelled" &&
                        (upcoming || today_check) && (
                          <button
                            onClick={() => cancelBooking(booking._id)}
                            disabled={cancelling === booking._id}
                            className="flex-1 py-2.5 px-4 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                          >
                            <Trash2 size={16} />
                            {cancelling === booking._id
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        )}
                      {booking.paymentStatus !== "paid" && (
                        <button
                          onClick={() =>
                            navigate("/PaymentResult", {
                              state: {
                                bookingId: booking._id,
                                futsalName: booking.futsal?.name,
                                amount:
                                  booking.pendingAmount ||
                                  booking.futsal?.pricePerHour,
                              },
                            })
                          }
                          className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
                        >
                          <TrendingUp size={16} />
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {!loading && bookings.length > 0 && viewMode === "list" && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const status = getStatusBadge(
                booking.status,
                booking.paymentStatus,
              );
              const upcoming = isUpcoming(booking.bookingDate);
              const isExpanded = expandedBooking === booking._id;

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedBooking(isExpanded ? null : booking._id)
                    }
                    className="w-full p-6 hover:bg-gray-50 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin size={24} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">
                          {booking.futsal?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(booking.bookingDate)} •{" "}
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs ${status.bg} ${status.text}`}
                      >
                        {status.label}
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-6 py-6 bg-gray-50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div>
                          <p className="text-xs text-gray-600 font-medium mb-1">
                            Location
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {booking.futsal?.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium mb-1">
                            Rate
                          </p>
                          <p className="text-sm font-semibold text-blue-600">
                            Rs. {booking.futsal?.pricePerHour}/hr
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium mb-1">
                            Payment
                          </p>
                          <p
                            className={`text-sm font-semibold ${
                              booking.paymentStatus === "paid"
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {booking.paymentStatus === "paid"
                              ? "✓ Paid"
                              : "⏳ Pending"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium mb-1">
                            Status
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {booking.status}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {booking.status !== "cancelled" && upcoming && (
                          <button
                            onClick={() => cancelBooking(booking._id)}
                            disabled={cancelling === booking._id}
                            className="px-6 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                          >
                            {cancelling === booking._id
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        )}
                        {booking.paymentStatus !== "paid" && (
                          <button
                            onClick={() =>
                              navigate("/PaymentResult", {
                                state: {
                                  bookingId: booking._id,
                                  futsalName: booking.futsal?.name,
                                  amount:
                                    booking.pendingAmount ||
                                    booking.futsal?.pricePerHour,
                                },
                              })
                            }
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
