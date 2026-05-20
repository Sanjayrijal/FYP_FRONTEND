import axios from "axios";
import dayjs from "dayjs";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link, useLocation } from "react-router-dom";
import { apiUrl } from "../../config/api.js";
import { Breadcrumbs } from "../Breadcrumbs/Breadcrumbs.jsx";
import Footer from "../Footer/Footer";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

export default function FutsalData() {
  const { state } = useLocation();

  const [futsal, setFutsal] = useState(state?.futsal || {});
  const [selectedSlot, setSelectedSlot] = useState("");
  // Date slider state
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD"),
  );
  // Image state - will be updated when futsal is fetched
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);

  // Update images array when futsal data is fetched
  useEffect(() => {
    if (futsal?.images && futsal.images.length > 0) {
      // Filter out null/undefined values from images array
      const validImages = futsal.images.filter((img) => img && img.trim());
      console.log("📸 Raw images from futsal:", futsal.images);
      console.log("✅ Filtered valid images:", validImages);
      setImages(validImages);
      setCurrentImage(0);
    } else if (futsal?.image) {
      console.log("⚠️ Using fallback single image");
      setImages([futsal.image]);
      setCurrentImage(0);
    } else {
      console.log("❌ No images available");
      setImages([]);
    }
  }, [futsal]);

  const handlePrev = () =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  const handleNext = () =>
    setCurrentImage((prev) => (prev + 1) % images.length);

  // Generate next 7 days for slider
  const dateOptions = Array.from({ length: 7 }, (_, i) =>
    dayjs().add(i, "day"),
  );

  const slots = [
    "6am - 7am",
    "7am - 8am",
    "8am - 9am",
    "9am - 10am",
    "10am - 11am",
    "11am - 12pm",
    "12pm - 1pm",
    "1pm - 2pm",
    "2pm - 3pm",
    "3pm - 4pm",
    "4pm - 5pm",
    "5pm - 6pm",
    "6pm - 7pm",
    "7pm - 8pm",
    "8pm - 9pm",
  ];

  // -----------------------
  // Fetch futsal details
  // -----------------------
  useEffect(() => {
    if (!futsal?._id) return;

    const fetchFutsalDetails = async () => {
      try {
        const res = await axios.get(apiUrl(`/api/futsals/${futsal._id}`));
        console.log("📸 Fetched futsal data:", res.data.data);
        console.log("📸 Images array:", res.data.data.images);
        setFutsal(res.data.data);
      } catch (err) {
        console.error("Error fetching futsal details:", err);
      }
    };

    fetchFutsalDetails();
  }, [futsal?._id]);

  // -----------------------
  // Fetch booked slots for selected date
  // -----------------------
  useEffect(() => {
    console.log("⚡ fetchBookedSlots useEffect triggered with:", {
      futsalId: futsal?._id,
      selectedDate,
    });
    if (!futsal?._id || !selectedDate) {
      console.log("❌ Early return: missing futsal ID or selectedDate");
      return;
    }

    const fetchBookedSlots = async () => {
      try {
        console.log("🚀 Starting axios.get request...");
        const res = await axios.get(apiUrl("/api/futsal/booking/getBookings"));

        console.log("=== DEBUG BOOKING FETCH ===");
        console.log("All bookings:", res.data);
        console.log(
          "Current futsal ID:",
          futsal._id,
          "Type:",
          typeof futsal._id,
        );
        console.log("Selected date:", selectedDate);
        const filtered = res.data.filter((booking) => {
          // booking.futsal is an object (populated), extract _id
          const bookingFutsalId = String(booking.futsal?._id || booking.futsal);
          const currentFutsalId = String(futsal._id);

          // Extract date part from booking.bookingDate (handles ISO format like "2026-04-03T00:00:00.000Z")
          const bookingDateStr = new Date(booking.bookingDate)
            .toISOString()
            .split("T")[0];

          console.log(
            `Checking booking: futsalId=${bookingFutsalId}, dateStr=${bookingDateStr}, selected=${selectedDate}`,
          );
          return (
            bookingFutsalId === currentFutsalId &&
            bookingDateStr === selectedDate
          );
        });

        console.log("Filtered bookings for this futsal:", filtered);

        // Extract slot strings and normalize format
        const slotStrings = filtered.map((booking) => {
          let start = String(booking.startTime).toLowerCase().trim();
          let end = String(booking.endTime).toLowerCase().trim();

          console.log(
            `📅 Processing booking: rawStart="${booking.startTime}", rawEnd="${booking.endTime}"`,
          );

          // Convert 24-hour format to am/pm if needed
          // e.g., "10:00" or "10" -> "10am"; but keep "1pm", "10am" as-is
          if (!start.includes("am") && !start.includes("pm")) {
            const hourMatch = start.match(/^(\d+):?/);
            if (hourMatch) {
              const hour = parseInt(hourMatch[1]);
              start =
                hour >= 12
                  ? hour === 12
                    ? "12pm"
                    : `${hour - 12}pm`
                  : `${hour}am`;
            }
          }

          if (!end.includes("am") && !end.includes("pm")) {
            const hourMatch = end.match(/^(\d+):?/);
            if (hourMatch) {
              const hour = parseInt(hourMatch[1]);
              end =
                hour >= 12
                  ? hour === 12
                    ? "12pm"
                    : `${hour - 12}pm`
                  : `${hour}am`;
            }
          }

          const slotStr = `${start} - ${end}`;
          console.log(`  ✅ Converted to: "${slotStr}"`);
          return slotStr;
        });

        console.log("Booked slots to set:", slotStrings);
        setBookedSlots(slotStrings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookedSlots([]);
      }
    };

    fetchBookedSlots();
  }, [futsal?._id, selectedDate]);

  // -----------------------
  // Helper functions for slot availability
  // -----------------------
  const isSlotInPast = (slot, bookingDate) => {
    const now = new Date();
    const today = dayjs().format("YYYY-MM-DD");

    // If booking date is not today, slot is not in past
    if (bookingDate !== today) return false;

    // Extract start time from slot (e.g., "7am" from "7am - 8am")
    const startTimeStr = slot.split(" - ")[0].toLowerCase();
    const [hour, period] = startTimeStr.match(/(\d+)(am|pm)/).slice(1);

    let slotHour = parseInt(hour);
    if (period === "pm" && slotHour !== 12) slotHour += 12;
    if (period === "am" && slotHour === 12) slotHour = 0;

    const slotDate = new Date(bookingDate);
    slotDate.setHours(slotHour, 0, 0, 0);

    return now > slotDate;
  };

  const isSlotBooked = (slot) => {
    const normalizedSlot = slot.toLowerCase();
    const isBooked = bookedSlots.some(
      (s) => s.toLowerCase() === normalizedSlot,
    );
    console.log(
      `Checking slot "${slot}" (normalized: "${normalizedSlot}") - isBooked: ${isBooked}`,
      { bookedSlots },
    );
    return isBooked;
  };

  const canClickSlot = (slot, bookingDate) => {
    const isPast = isSlotInPast(slot, bookingDate);
    const isBooked = isSlotBooked(slot);
    const canClick = !isPast && !isBooked;
    console.log(
      `canClickSlot(${slot}): isPast=${isPast}, isBooked=${isBooked}, canClick=${canClick}`,
    );
    return canClick;
  };

  // -----------------------
  // Navigate to Booking Page
  // -----------------------

  // Booking modal state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [bookingCreatedId, setBookingCreatedId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("khalti");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    feedback: "",
  });
  const [reviewerId, setReviewerId] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerImage, setReviewerImage] = useState("");
  const [ratingHover, setRatingHover] = useState(0);
  const [reviewStatus, setReviewStatus] = useState({ type: "", message: "" });
  const [showReviewLoginModal, setShowReviewLoginModal] = useState(false);
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  // Fetch offers for this futsal
  useEffect(() => {
    if (!futsal?._id) {
      setLoadingOffers(false);
      return;
    }

    const fetchOffers = async () => {
      try {
        const res = await axios.get(apiUrl(`/api/offers/futsal/${futsal._id}`));
        setOffers(res.data.data || []);
        setLoadingOffers(false);
      } catch (err) {
        console.error("Error fetching offers:", err);
        setOffers([]);
        setLoadingOffers(false);
      }
    };

    fetchOffers();
  }, [futsal?._id]);

  const loadFutsalReviews = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("futsalReviews") || "[]");
      const filtered = stored
        .filter((review) => String(review.futsalId) === String(futsal?._id))
        .sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
      setReviews(filtered);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      setReviews([]);
    }
  };

  useEffect(() => {
    if (!futsal?._id) return;
    loadFutsalReviews();
  }, [futsal?._id]);

  useEffect(() => {
    const fetchReviewerProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setReviewerId("");
        setReviewerName("");
        setReviewerImage("");
        return;
      }

      try {
        const response = await axios.get(apiUrl("/api/users/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviewerId(String(response.data?.data?._id || ""));
        setReviewerName((response.data?.data?.name || "").trim());
        setReviewerImage((response.data?.data?.profilePic || "").trim());
      } catch (error) {
        console.error("Failed to load reviewer profile:", error);
        setReviewerId("");
        setReviewerName("");
        setReviewerImage("");
      }
    };

    fetchReviewerProfile();
  }, []);

  const handleReviewSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const name = reviewerName.trim();
    const feedback = reviewForm.feedback.trim();

    // If user is not logged in, show login modal
    if (!token || !name) {
      setShowReviewLoginModal(true);
      return;
    }

    if (!feedback) {
      setReviewStatus({
        type: "error",
        message: "Please enter your feedback.",
      });
      return;
    }

    const newReview = {
      id: Date.now(),
      futsalId: futsal._id,
      reviewerId: reviewerId || undefined,
      property: futsal.name || "Futsal Arena",
      name,
      rating: Number(reviewForm.rating) || 5,
      feedback,
      image: reviewerImage || "",
      profilePic: reviewerImage || "",
      createdAt: new Date().toISOString(),
    };

    try {
      const stored = JSON.parse(localStorage.getItem("futsalReviews") || "[]");
      const updated = [newReview, ...stored];
      localStorage.setItem("futsalReviews", JSON.stringify(updated));
      setReviewForm({ rating: 5, feedback: "" });
      setRatingHover(0);
      setReviewStatus({
        type: "success",
        message: "Review submitted successfully.",
      });
      loadFutsalReviews();
    } catch (error) {
      console.error("Failed to save review:", error);
      setReviewStatus({
        type: "error",
        message: "Could not save review. Please try again.",
      });
    }
  };

  const handleBookingOpen = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to book a futsal");
      return;
    }
    if (!selectedSlot) {
      alert("Please select a slot first");
      return;
    }
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }
    setShowBookingForm(true);
    setBookingError("");
    setBookingSuccess("");
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError("");
    setBookingSuccess("");
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setBookingError("You must be logged in to book. Please login first.");
        setBookingLoading(false);
        return;
      }

      const payload = {
        futsal: futsal._id,
        bookingDate: selectedDate,
        startTime: selectedSlot.split(" - ")[0].trim(),
        endTime: selectedSlot.split(" - ")[1].trim(),
      };

      const response = await fetch(
        apiUrl("/api/futsal/booking/createBooking"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        setBookingError(errorData.msg || "Failed to book. Please try again.");
      } else {
        const data = await response.json();
        setBookingSuccess("Booking successful!");
        setBookingCreatedId(data.data?._id || null);
        setShowPaymentModal(true);
        setShowBookingForm(false);
        setSelectedDate("");
        setSelectedSlot("");
      }
    } catch (err) {
      setBookingError(err.message || "Failed to book. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentCheckout = async () => {
    if (!bookingCreatedId) return;
    setPaymentLoading(true);
    setPaymentResult(null);
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        paymentMethod === "esewa"
          ? apiUrl("/api/payments/esewa/initiate")
          : apiUrl("/api/payments/khalti/initiate");

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: bookingCreatedId,
          couponCode: couponCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPaymentResult({ error: data.msg || "Payment failed" });
      } else {
        if (paymentMethod === "esewa") {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.paymentUrl;

          Object.entries(data.formData || {}).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value;
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
          return;
        }

        if (paymentMethod === "khalti") {
          window.location.href = data.paymentUrl;
          return;
        }
      }
    } catch (err) {
      setPaymentResult({ error: err.message || "Payment failed" });
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex flex-col bg-gray-50">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Venues", href: "/Venues" },
          { label: futsal?.name || "Court Details" },
        ]}
      />

      {/* Review Login Modal */}
      {showReviewLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 relative max-w-lg w-full mx-4">
            <button
              onClick={() => setShowReviewLoginModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
            <h2 className="text-center text-xl font-bold mb-6">
              Login to Write a Review
            </h2>
            <LoginSignup
              defaultMode="login"
              onLoginSuccess={() => {
                setShowReviewLoginModal(false);
                // Reload the reviewer profile after login
                const token = localStorage.getItem("token");
                if (token) {
                  axios
                    .get(apiUrl("/api/users/me"), {
                      headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((response) => {
                      setReviewerId(String(response.data?.data?._id || ""));
                      setReviewerName((response.data?.data?.name || "").trim());
                      setReviewerImage(
                        (response.data?.data?.profilePic || "").trim(),
                      );
                    })
                    .catch((err) =>
                      console.error("Failed to load profile", err),
                    );
                }
              }}
              isModal={true}
            />
          </div>
        </div>
      )}

      <div className="flex-1 px-2 sm:px-4 md:px-10 lg:px-24 py-4 sm:py-8">
        {/* Breadcrumbs */}
        <nav
          className="text-xs sm:text-sm mb-4 text-gray-500"
          aria-label="Breadcrumb"
        >
          <ol className="list-reset flex">
            <li>
              <Link to="/Explore" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-700 font-semibold">{futsal.name}</li>
          </ol>
        </nav>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Gallery with slider */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow flex items-center justify-center">
              {images.length > 0 ? (
                <>
                  <button
                    aria-label="Previous image"
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow transition z-10"
                    style={{ display: images.length > 1 ? "block" : "none" }}
                  >
                    <span className="text-xl">&#8592;</span>
                  </button>
                  <img
                    src={images[currentImage]}
                    alt={futsal.name}
                    className="w-full h-full object-cover select-none"
                    draggable={false}
                    onError={(e) => {
                      console.error(
                        "❌ Image failed to load:",
                        images[currentImage],
                      );
                      e.target.src =
                        "https://via.placeholder.com/800x450?text=Image+Not+Found";
                    }}
                  />
                  <button
                    aria-label="Next image"
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow transition z-10"
                    style={{ display: images.length > 1 ? "block" : "none" }}
                  >
                    <span className="text-xl">&#8594;</span>
                  </button>
                  {/* Dots indicator */}
                  {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          className={`w-2.5 h-2.5 rounded-full ${idx === currentImage ? "bg-emerald-600" : "bg-gray-300"} border border-white`}
                          onClick={() => setCurrentImage(idx)}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-white text-center">
                  <p className="text-lg font-semibold">No images available</p>
                  <p className="text-sm text-gray-400">
                    The owner hasn't uploaded any images yet
                  </p>
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-2 justify-center">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`w-16 h-12 object-cover rounded-lg border cursor-pointer transition ring-2 ${idx === currentImage ? "ring-emerald-600" : "ring-transparent"}`}
                    onClick={() => setCurrentImage(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Booking Panel */}
          <aside className="w-full lg:w-[350px] xl:w-[400px] bg-white rounded-2xl shadow-lg p-6 sticky top-6 self-start flex flex-col gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 mb-2">
                {futsal.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <span>📍</span>
                <span>{futsal.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span>📞</span>
                <span>{futsal.contactNumber}</span>
              </div>
            </div>
            {/* Date Slider */}
            <div>
              <p className="text-base font-semibold mb-2">Select Date</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {dateOptions.map((date) => (
                  <button
                    key={date.format("YYYY-MM-DD")}
                    onClick={() => setSelectedDate(date.format("YYYY-MM-DD"))}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border min-w-[90px] transition-all duration-150 whitespace-nowrap
                      ${selectedDate === date.format("YYYY-MM-DD") ? "bg-emerald-600 text-white border-emerald-700 scale-105 shadow" : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-emerald-50"}`}
                  >
                    {date.format("ddd, MMM D")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-base font-semibold mb-2">Available Slots</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slots.map((slot) => {
                  const isBooked = isSlotBooked(slot);
                  const isPast = isSlotInPast(slot, selectedDate);
                  const isClickable = canClickSlot(slot, selectedDate);

                  return (
                    <button
                      key={slot}
                      onClick={() => isClickable && setSelectedSlot(slot)}
                      disabled={!isClickable}
                      className={`px-2 sm:px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-150
                        ${
                          isBooked
                            ? "bg-red-800 text-white border-red-900 cursor-not-allowed opacity-60"
                            : isPast
                              ? "bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed opacity-60"
                              : selectedSlot === slot
                                ? "bg-emerald-600 text-white border-emerald-700 scale-105 shadow"
                                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-emerald-50"
                        }`}
                      title={
                        isBooked
                          ? "Already booked"
                          : isPast
                            ? "Slot has passed"
                            : "Available"
                      }
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={handleBookingOpen}
              className="w-full py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition text-lg mt-2"
            >
              Book Now
            </button>
            {!localStorage.getItem("token") && (
              <div className="text-sm text-blue-600 text-center mt-2 p-2 bg-blue-50 rounded">
                <NavLink to="/LoginSignup" className="underline font-semibold">
                  Login
                </NavLink>{" "}
                to book futsal courts
              </div>
            )}
            {/* Booking Modal Overlay */}
            {showBookingForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                    onClick={() => setShowBookingForm(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <h2 className="text-xl font-bold mb-4 text-emerald-700">
                    Confirm Booking
                  </h2>
                  <form
                    onSubmit={handleBookingSubmit}
                    className="flex flex-col gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Date
                      </label>
                      <input
                        type="text"
                        value={dayjs(selectedDate).format("ddd, MMM D, YYYY")}
                        readOnly
                        className="w-full rounded border px-3 py-2 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Slot
                      </label>
                      <input
                        type="text"
                        value={selectedSlot}
                        readOnly
                        className="w-full rounded border px-3 py-2 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        required
                        className="w-full rounded border px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={bookingPhone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          setBookingPhone(value);
                        }}
                        required
                        placeholder="Enter phone number (numbers only)"
                        className="w-full rounded border px-3 py-2"
                      />
                    </div>
                    {bookingError && (
                      <div className="text-red-500 text-sm">{bookingError}</div>
                    )}
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full py-2 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
                    >
                      {bookingLoading ? "Booking..." : "Confirm Booking"}
                    </button>
                  </form>
                </div>
              </div>
            )}
            <div className="text-xs text-gray-400 text-center">
              * Please select a date and slot before booking
            </div>
          </aside>
        </div>

        {/* Description & Details */}
        <div className="mt-8 max-w-3xl text-gray-700 leading-relaxed">
          <div className="flex flex-wrap gap-4 mb-2">
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
              Open: {futsal.openingTime}
            </span>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
              Close: {futsal.closingTime}
            </span>
          </div>
          <p className="font-medium text-base sm:text-lg mb-2">
            {futsal.description}
          </p>
        </div>

        {/* Offers Section */}
        {!loadingOffers && offers.length > 0 && (
          <section className="mt-8 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 shadow-md p-5 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🎉 Special Offers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <div
                  key={offer._id}
                  className="bg-white rounded-lg border border-amber-200 p-4 hover:shadow-md transition"
                >
                  <div className="mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">
                      {offer.title}
                    </h3>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                      {offer.discount}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {offer.description}
                  </p>
                  <div className="bg-gray-50 rounded p-2 mb-3">
                    <p className="text-xs text-gray-500 mb-1">Promo Code</p>
                    <p className="font-mono font-bold text-gray-800">
                      {offer.code}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Valid until:{" "}
                    {new Date(offer.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Location Section */}
        <section className="mt-8 rounded-2xl border border-emerald-100 bg-white shadow-md overflow-hidden">
          <div className="p-5 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              📍 Location
            </h2>
            <p className="text-base text-gray-700 mb-4">{futsal.location}</p>

            {futsal.latitude && futsal.longitude ? (
              <>
                <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Coordinates:</span>
                    <p className="text-gray-700 mt-1">
                      Lat: {futsal.latitude.toFixed(6)}, Lng:{" "}
                      {futsal.longitude.toFixed(6)}
                    </p>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${futsal.latitude},${futsal.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                  >
                    View on Google Maps
                  </a>
                </div>
                <div
                  className="relative border border-emerald-200 rounded-lg overflow-hidden"
                  style={{ height: "300px" }}
                >
                  <MapContainer
                    center={[futsal.latitude, futsal.longitude]}
                    zoom={16}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[futsal.latitude, futsal.longitude]}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-semibold">{futsal.name}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {futsal.location}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  ℹ️{" "}
                  <span className="font-semibold">Coordinates not yet set</span>{" "}
                  by the owner. Location will be precise once added.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-emerald-100 bg-linear-to-br from-white via-emerald-50/40 to-green-50/40 shadow-md p-5 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900">Leave a Review</h2>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Share your experience for {futsal.name}.
          </p>

          <div className="mb-4 rounded-xl border border-emerald-100 bg-white/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Reviewing as
            </p>
            <p className="text-sm font-semibold text-gray-800 mt-1">
              {reviewerName || "Please login with a profile name"}
            </p>
          </div>

          {!localStorage.getItem("token") && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <NavLink
                  to="/LoginSignup"
                  className="underline font-semibold hover:text-blue-600"
                >
                  Login
                </NavLink>{" "}
                to share your review and help other players
              </p>
            </div>
          )}

          <form
            onSubmit={handleReviewSubmit}
            className="grid grid-cols-1 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={!localStorage.getItem("token")}
                    onClick={() =>
                      setReviewForm((prev) => ({ ...prev, rating: star }))
                    }
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(0)}
                    className={`text-3xl leading-none transition-transform duration-150 hover:scale-110 ${star <= (ratingHover || reviewForm.rating) ? "text-yellow-400" : "text-gray-300"}`}
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-sm font-medium text-gray-700 ml-1">
                  {ratingHover || reviewForm.rating}/5
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback
              </label>
              <textarea
                disabled={!localStorage.getItem("token")}
                rows={4}
                value={reviewForm.feedback}
                onChange={(e) =>
                  setReviewForm((prev) => ({
                    ...prev,
                    feedback: e.target.value,
                  }))
                }
                placeholder="Tell others about your booking experience..."
                maxLength={300}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-emerald-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {reviewForm.feedback.length}/300
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              {reviewStatus.message && (
                <p
                  className={`text-sm ${reviewStatus.type === "error" ? "text-red-600" : "text-green-600"}`}
                >
                  {reviewStatus.message}
                </p>
              )}

              <button
                type="submit"
                disabled={!reviewerName || !reviewForm.feedback.trim()}
                className="ml-auto rounded-lg bg-emerald-600 text-white px-6 py-2.5 font-semibold hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Submit Review
              </button>
            </div>
          </form>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Recent Reviews
            </h3>

            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">
                No reviews yet. Be the first to review this futsal.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.slice(0, 4).map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-gray-800">
                        {review.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-1 text-yellow-400 text-sm">
                      {"★".repeat(
                        Math.max(1, Math.min(5, Number(review.rating) || 5)),
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-700">
                      "{review.feedback}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Complete Payment</h3>
            <p className="text-sm text-gray-600 mb-3">
              Choose payment gateway and optionally apply a coupon code.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setPaymentMethod("khalti")}
                className={`px-3 py-2 rounded border text-sm ${
                  paymentMethod === "khalti"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700"
                }`}
              >
                Khalti
              </button>
              <button
                onClick={() => setPaymentMethod("esewa")}
                className={`px-3 py-2 rounded border text-sm ${
                  paymentMethod === "esewa"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700"
                }`}
              >
                eSewa
              </button>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 rounded border px-3 py-2"
              />
              <button
                onClick={handlePaymentCheckout}
                disabled={paymentLoading}
                className="bg-emerald-600 text-white px-4 py-2 rounded"
              >
                {paymentLoading ? "Processing..." : "Pay Now"}
              </button>
            </div>

            {paymentResult?.error && (
              <div className="text-red-500 text-sm mb-2">
                {paymentResult.error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setCouponCode("");
                  setPaymentResult(null);
                }}
                className="px-4 py-2 rounded border"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
