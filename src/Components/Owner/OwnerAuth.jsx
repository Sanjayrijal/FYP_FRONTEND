import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../config/api.js";
import { PasswordInput } from "../PasswordInput";

export default function OwnerAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contactNumber: "",
    preferredMobileNumber: "",
    whatsappNumber: "",
    city: "",
    businessName: "",
    businessAddress: "",
    registrationNumber: "",
    preferredContactMethod: "phone",
    website: "",
    otp: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        apiUrl("/api/owner/auth/register"),
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          contactNumber: formData.contactNumber,
          preferredMobileNumber:
            formData.preferredMobileNumber || formData.contactNumber,
          whatsappNumber: formData.whatsappNumber,
          city: formData.city,
          businessName: formData.businessName,
          businessAddress: formData.businessAddress,
          registrationNumber: formData.registrationNumber,
          preferredContactMethod: formData.preferredContactMethod,
          website: formData.website,
        },
      );

      setMessage(res.data.msg);
      setShowOTP(true);
    } catch (error) {
      setMessage(error.response?.data?.msg || "Registration failed");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        apiUrl("/api/owner/auth/verify-otp"),
        {
          email: formData.email,
          otp: formData.otp,
        },
      );

      setMessage(res.data.msg);
      setTimeout(() => {
        setShowOTP(false);
        setIsLogin(true);
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.msg || "OTP verification failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        apiUrl("/api/owner/auth/login"),
        {
          email: formData.email,
          password: formData.password,
        },
      );

      localStorage.setItem("ownerToken", res.data.token);
      localStorage.setItem("ownerData", JSON.stringify(res.data.owner));
      setMessage("Login successful!");

      setTimeout(() => {
        navigate("/owner/dashboard");
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            <span className="text-blue-500">Kick</span>hub Owner
          </h1>
          <p className="text-gray-600">
            {showOTP
              ? "Verify Your Email"
              : isLogin
                ? "Welcome back!"
                : "Join us today"}
          </p>
        </div>

        {/* OTP Verification Form */}
        {showOTP ? (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit OTP
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="123456"
                maxLength="6"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Verify OTP
            </button>

            {message && (
              <p className="text-center text-sm text-green-600">{message}</p>
            )}
          </form>
        ) : isLogin ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="owner@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <PasswordInput
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                inputClassName="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                buttonClassName="absolute right-3 top-8 text-gray-500 hover:text-blue-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Login
            </button>

            {message && (
              <p className="text-center text-sm text-red-600">{message}</p>
            )}

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-blue-500 font-medium hover:underline"
              >
                Register here
              </button>
            </p>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="owner@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <PasswordInput
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                inputClassName="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                buttonClassName="absolute right-3 top-8 text-gray-500 hover:text-blue-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="+977 9812345678"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Mobile Number
              </label>
              <input
                type="tel"
                name="preferredMobileNumber"
                value={formData.preferredMobileNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Defaults to contact number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Kathmandu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Premier Futsal Arena"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address
              </label>
              <input
                type="text"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Baluwatar, Kathmandu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Number
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="PAN/VAT/Business Reg. No."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Contact Method
              </label>
              <select
                name="preferredContactMethod"
                value={formData.preferredContactMethod}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="https://your-futsal.com"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Register
            </button>

            {message && (
              <p className="text-center text-sm text-green-600">{message}</p>
            )}

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-blue-500 font-medium hover:underline"
              >
                Login here
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
