import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoginSignup } from "../LoginSignup/LoginSignup";

export default function Booking() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { futsal, selectedSlot } = state || {};

  const [formData, setFormData] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
  });

  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState("login"); // 'login' or 'signup'

  // Convert slot → start & end time
  const parseSlotTime = (slot) => {
    if (!slot) return { start: "", end: "" };

    const [start, end] = slot.split(" - ");

    const convertTo24Hour = (time) => {
      let [hour, period] = time.match(/(\d+)(am|pm)/i).slice(1);
      hour = parseInt(hour);

      if (period.toLowerCase() === "pm" && hour !== 12) hour += 12;
      if (period.toLowerCase() === "am" && hour === 12) hour = 0;

      return `${hour.toString().padStart(2, "0")}:00`;
    };

    return {
      start: convertTo24Hour(start),
      end: convertTo24Hour(end),
    };
  };

  // Auto-fill times from slot
  useEffect(() => {
    if (!selectedSlot) return;

    const { start, end } = parseSlotTime(selectedSlot);
    setFormData((prev) => ({
      ...prev,
      startTime: start,
      endTime: end,
    }));
  }, [selectedSlot]);

  // Submit Booking
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bookingDate) {
      setError("Please select booking date");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        // Show login modal instead of just error
        setLoginMode("login");
        setShowLoginModal(true);
        return;
      }

      let userId;
      try {
        const decoded = jwtDecode(token);
        userId = decoded.userId || decoded._id || decoded.id;
      } catch (decodeErr) {
        setError("Invalid or expired token. Please login again.");
        return;
      }

      const payload = {
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        futsal: futsal._id,
        user: userId,
      };

      console.log("Sending booking request with payload:", payload);
      console.log(
        "Authorization header:",
        `Bearer ${token.substring(0, 20)}...`,
      );

      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      };

      const response = await fetch(
        "http://localhost:5001/api/futsal/booking/createBooking",
        fetchOptions,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Booking failed");
      }

      const data = await response.json();
      alert("Booking confirmed!");
      navigate("/Bookings");
    } catch (err) {
      setError(err.message || "Booking failed. Please try again.");
    }
  };

  // UI
  if (showLoginModal) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 relative max-w-lg w-full mx-4">
          <button
            onClick={() => setShowLoginModal(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
          <h2 className="text-center text-xl font-bold mb-6">
            Login to Book Your Slot
          </h2>
          <LoginSignup
            defaultMode={loginMode}
            onLoginSuccess={() => {
              setShowLoginModal(false);
              // The booking form will still have the data, user can submit again
            }}
            isModal={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-[420px]"
      >
        <h2 className="text-2xl font-bold text-emerald-600 mb-6 text-center">
          Confirm Booking
        </h2>

        <div className="text-sm text-gray-700 mb-4 space-y-1">
          <p>
            <strong>Futsal:</strong> {futsal?.name}
          </p>
          <p>
            <strong>Location:</strong> {futsal?.location}
          </p>
          <p>
            <strong>Selected Slot:</strong> {selectedSlot}
          </p>
        </div>

        {/* Booking Date */}
        <label className="block mb-2 font-medium">Booking Date</label>
        <input
          type="date"
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={formData.bookingDate}
          onChange={(e) =>
            setFormData({ ...formData, bookingDate: e.target.value })
          }
        />

        {/* Start & End Time */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block mb-2 font-medium">Start Time</label>
            <input
              type="time"
              value={formData.startTime}
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="flex-1">
            <label className="block mb-2 font-medium">End Time</label>
            <input
              type="time"
              value={formData.endTime}
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-semibold hover:bg-emerald-700"
          >
            Confirm Booking
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 border py-2 rounded-xl font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
