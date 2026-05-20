import { useState } from "react";

export function OTPVerification({ email, onSuccess, switchToLogin }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5001/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          onSuccess();
          switchToLogin();
        }, 1500);
      } else {
        setError(result.msg || "Verification failed");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://localhost:5001/api/auth/resend-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        setSuccess("Verification code sent to your email!");
        setOtp("");
        setResendCooldown(30); // 30 second cooldown

        // Countdown timer
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(result.msg || "Failed to resend code");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  // Handle OTP input - only allow digits
  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(value);
  };

  return (
    <>
      <h1 className="font-bold text-blue-500 text-3xl text-center">KickHub</h1>

      <p className="text-center text-gray-600 mb-2">Verify Your Email</p>

      <p className="text-center text-gray-500 text-sm mb-4">
        We've sent a verification code to
        <br />
        <span className="font-semibold">{email}</span>
      </p>

      <form className="flex flex-col space-y-6 p-6" onSubmit={handleVerifyOTP}>
        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-2">
            Verification Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={handleOTPChange}
            maxLength="6"
            className="bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 w-[420px] text-center text-lg font-mono tracking-widest"
          />
          <p className="text-gray-500 text-xs mt-1">{otp.length}/6 digits</p>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className={`border w-full py-2 rounded-2xl cursor-pointer text-white transition-transform transform delay-105 duration-200 ${
            loading || otp.length !== 6
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:scale-105"
          }`}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>

        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        {success && (
          <p className="text-green-500 text-center text-sm">{success}</p>
        )}

        <div className="flex items-center justify-center space-x-2">
          <p className="text-gray-600 text-sm">Didn't receive the code?</p>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendCooldown > 0 || resendLoading}
            className={`text-sm font-semibold transition-colors ${
              resendCooldown > 0 || resendLoading
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:text-blue-800 cursor-pointer"
            }`}
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : resendLoading
                ? "Sending..."
                : "Resend Code"}
          </button>
        </div>

        <p className="text-center text-gray-500 text-xs">
          The code will expire in 10 minutes. If you don't use it, you'll need
          to sign up again.
        </p>
      </form>
    </>
  );
}
