import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PasswordInput } from "../PasswordInput";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5001/api/v1/auth/forget-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        setMessage(result.msg || "Password reset successful.");
        setTimeout(() => navigate("/"), 2000); // Redirect after success
      } else {
        setError(result.msg || "Reset failed.");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-xl shadow-md space-y-5 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-blue-700">
          Reset Your Password
        </h2>
        <PasswordInput
          name="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          name="confirmPassword"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Reset Password
        </button>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {message && <p className="text-green-500 text-center">{message}</p>}
      </form>
    </div>
  );
}

export default ResetPassword;
