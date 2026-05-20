import { useState } from "react";
import { PasswordInput } from "../PasswordInput";
import { OTPVerification } from "./OTPVerification";

export function Signup({ switchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showOTPVerification, setShowOTPVerification] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Store the email and show OTP verification component
        setRegisteredEmail(result.email || formData.email);
        setShowOTPVerification(true);
      } else {
        setError(result.msg || "Signup failed");
      }
    } catch {
      setError("Server error");
    }
  };

  // If OTP verification is needed, show that component
  if (showOTPVerification) {
    return (
      <OTPVerification
        email={registeredEmail}
        onSuccess={() => {
          // Reset form after successful verification
          setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
          setRegisteredEmail("");
          setShowOTPVerification(false);
        }}
        switchToLogin={switchToLogin}
      />
    );
  }

  return (
    <>
      <h1 className="font-bold text-blue-500 text-3xl text-center">KickHUb</h1>

      <p className="text-center text-gray-600">
        Join us for an amazing Sporting Experience!
      </p>

      <form className="flex flex-col space-y-6 p-6" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
          className="bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 w-[420px]"
        />

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

        <PasswordInput
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-[420px]"
        />

        <button
          type="submit"
          className="border w-full py-2 rounded-2xl cursor-pointer text-white bg-blue-600 transition-transform transform delay-105 duration-200 hover:scale-105"
        >
          Start your Journey
        </button>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <p className="text-center">
          Already have an account?{" "}
          <button
            type="button"
            onClick={switchToLogin}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Log-In
          </button>
        </p>
      </form>
    </>
  );
}
