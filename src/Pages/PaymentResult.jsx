import { Link, useLocation } from "react-router-dom";

export default function PaymentResult() {
  const { search } = useLocation();
  const qs = new URLSearchParams(search);

  const status = qs.get("status") || "failed";
  const provider = qs.get("provider") || "payment";
  const message = qs.get("message") || "Payment status unknown";
  const bookingId = qs.get("bookingId") || "";

  const isSuccess = status === "success";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6">
        <h1
          className={`text-2xl font-bold mb-2 ${
            isSuccess ? "text-green-600" : "text-red-600"
          }`}
        >
          {isSuccess ? "Payment Successful" : "Payment Failed"}
        </h1>

        <p className="text-sm text-gray-600 mb-4">
          Gateway: <strong>{provider}</strong>
        </p>

        <p className="text-gray-700 mb-2">{message}</p>
        {bookingId && (
          <p className="text-xs text-gray-500 mb-4">Booking ID: {bookingId}</p>
        )}

        <div className="flex gap-2">
          <Link
            to="/Bookings"
            className="px-4 py-2 rounded bg-emerald-600 text-white"
          >
            Go to My Bookings
          </Link>
          <Link to="/Explore" className="px-4 py-2 rounded border">
            Back to Explore
          </Link>
        </div>
      </div>
    </div>
  );
}
