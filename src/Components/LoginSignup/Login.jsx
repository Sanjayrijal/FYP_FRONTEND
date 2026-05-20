import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../config/api.js";
import { AuthContext } from "../AuthContext/AuthContext";
import { PasswordInput } from "../PasswordInput";
import { OTPVerification } from "./OTPVerification";

export function Login({ switchToSignup, onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const navigate = useNavigate();
  const { login: authLogin } = useContext(AuthContext);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("🔍 Login attempt:", formData.email);

    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("✅ Response status:", response.status);
      console.log("📦 Response data:", result);

      if (response.ok) {
        console.log("✅ Login successful, token:", result.token);
        authLogin(result.token, { email: formData.email });
        localStorage.setItem("token", result.token);

        // Call the onLoginSuccess callback if provided (for modal mode)
        if (onLoginSuccess) {
          console.log("📞 Calling onLoginSuccess callback");
          onLoginSuccess();
        } else {
          console.log("🔄 Navigating to /Explore");
          navigate("/Explore");
        }
      } else if (response.status === 403 && result.verified === false) {
        // User exists but email not verified
        console.log("⚠️ Email not verified");
        setUnverifiedEmail(result.email || formData.email);
        setShowOTPVerification(true);
        setError("");
      } else {
        console.log("❌ Login failed:", result.msg);
        setError(result.msg || "Login failed");
      }
    } catch (err) {
      console.error("💥 Catch error:", err);
      setError("Server error");
    }
  };

  // If user needs to verify OTP, show verification component
  if (showOTPVerification) {
    return (
      <OTPVerification
        email={unverifiedEmail}
        onSuccess={() => {
          // Reset states after successful verification
          setShowOTPVerification(false);
          setUnverifiedEmail("");
          setFormData({ email: "", password: "" });
        }}
        switchToLogin={() => {
          // This will keep the user on login after verification
          setShowOTPVerification(false);
          setUnverifiedEmail("");
        }}
      />
    );
  }

  return (
    <>
      <h1 className="font-bold text-blue-500 text-3xl text-center gap-2">
        KickHUb
      </h1>

      <p className="text-center text-gray-600">Welcome Back</p>

      <form className="flex flex-col space-y-6 p-6" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 w-[420px]"
        />

        <PasswordInput
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-[420px]"
        />

        <button
          type="submit"
          className="border w-full py-2 rounded-2xl cursor-pointer text-white bg-blue-600 transition-transform transform delay-105 duration-200 hover:scale-105"
        >
          Log-In
        </button>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <p className="text-center">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={switchToSignup}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Sign-up
          </button>
        </p>
        <p className="text-center">
          Forget Password?{" "}
          <button
            type="button"
            onClick={() => navigate("/send-reset-email")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Click Here
          </button>
        </p>

        {/* Google Login */}
        <div className="flex flex-col items-center mt-4">
          <span className="text-gray-400 mb-2">or login with</span>
          <button
            type="button"
            className="flex items-center gap-2 border border-gray-300 rounded-xl px-6 py-2 bg-white hover:bg-gray-100 shadow transition"
            onClick={() =>
              (window.location.href = apiUrl("/api/v1/auth/google"))
            }
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google"
              className="w-6 h-6"
            />
            <span className="text-gray-700 font-medium">Google</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate("/owner/login")}
          className="border w-fit px-6 py-1 rounded-xl cursor-pointer text-white bg-gray-600 transition-transform transform delay-105 duration-200 hover:scale-105 text-sm mx-auto block"
        >
          Owner Login
        </button>
      </form>
    </>
  );
}
