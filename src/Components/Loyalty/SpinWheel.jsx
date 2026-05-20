import axios from "axios";
import { useState } from "react";

export default function SpinWheel({ spin, onClose, onSpun }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const doSpin = async () => {
    setSpinning(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5001/api/loyalty/spin",
        { spinId: spin._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const coupon = res.data.coupon;
      setResult(coupon);
      if (onSpun) onSpun(coupon);
    } catch (err) {
      console.error("Spin failed", err);
      alert("Spin failed. Try again.");
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded shadow max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">
          Congrats — you unlocked a spin!
        </h3>
        {!result ? (
          <>
            <p className="mb-4">
              Click to spin the wheel and reveal your discount.
            </p>
            <div className="flex gap-2">
              <button
                onClick={doSpin}
                disabled={spinning}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {spinning ? "Spinning..." : "Spin"}
              </button>
              <button onClick={onClose} className="px-4 py-2 rounded border">
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4">
              You got: <strong>{result.discount}%</strong> off! Code:{" "}
              <code>{result.code}</code>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(result.code);
                  alert("Coupon code copied to clipboard");
                }}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Copy Code
              </button>
              <button onClick={onClose} className="px-4 py-2 rounded border">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
