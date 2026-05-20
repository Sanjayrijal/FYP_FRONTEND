import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../config/api.js";
import { PasswordInput } from "../PasswordInput";

export function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: "",
    token: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        apiUrl("/api/v1/auth/reset-password"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            token: formData.token,
            newPassword: formData.password,
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.msg || "Password reset successful");
        alert("Password reset successful");
        navigate("/LoginSignup");
      } else {
        setError(result.msg || "Failed to reset password");
      }
    } catch (err) {
      console.error("Reset Password Error:", err);
      setError("Error connecting to the server");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-3xl font-semibold mb-6 text-center text-blue-600">
        Reset Your Password
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white shadow-2xl p-8 rounded-xl"
      >
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="token"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Token
          </label>
          <input
            type="text"
            id="token"
            name="token"
            placeholder="Enter the token"
            value={formData.token}
            onChange={handleChange}
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            New Password
          </label>
          <PasswordInput
            name="password"
            placeholder="Enter new password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Confirm Password
          </label>
          <PasswordInput
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Reset Password
        </button>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mt-4">{success}</p>
        )}
      </form>
    </div>
  );
}

export default ForgotPassword;
