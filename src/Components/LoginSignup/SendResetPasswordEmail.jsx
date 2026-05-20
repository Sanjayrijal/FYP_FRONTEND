import { faEarthAmericas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SendResetPasswordEmail = () => {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const userData = {
      email: email,
    };

    try {
      const url = `http://localhost:5001/api/v1/auth/forget-password`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok) {
        navigate("/ForgotPassword");
        setSuccess("Reset link sent to your email");
      } else {
        setError(result.msg || "An unexpected error occurred.");
      }
    } catch (error) {
      setError("Error connecting to the server");
      console.error("Fetch Error:", error.message);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-blue-200 p-4">
      <section className="flex items-stretch gap-6 p-8 shadow-2xl rounded-3xl bg-white w-full max-w-[900px]">
        <aside className="w-[350px] h-[600px] shrink-0">
          <img
            src="/images/futsal1.jpg"
            alt="Football"
            className="w-full h-full object-cover rounded-2xl shadow-lg"
          />
        </aside>
        <div className="flex flex-col space-y-2 p-4">
          <h1 className="font-bold text-blue-500 text-3xl text-center gap-2">
            KickHUb{" "}
            <FontAwesomeIcon
              icon={faEarthAmericas}
              className="text-purple-700"
            />
          </h1>
          <p className="text-center text-gray-600">
            Join us for an amazing Sporting Experience!
          </p>
          {success ? (
            <p className="text-green-500 text-center">{success}</p>
          ) : (
            <form
              className="flex flex-col space-y-6 p-6"
              onSubmit={handleSubmit}
            >
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
              />

              <button
                type="submit"
                className="border w-full py-2 rounded-2xl cursor-pointer text-white bg-blue-600 transition-transform transform delay-105 duration-200 hover:scale-105"
              >
                Send Reset Link
              </button>
              {error && <p className="text-red-500 text-center">{error}</p>}
              {success && (
                <p className="text-green-500 text-center">{success}</p>
              )}
            </form>
          )}

          <p className="text-sm text-center text-gray-600">
            By logging in , you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
};

export default SendResetPasswordEmail;
