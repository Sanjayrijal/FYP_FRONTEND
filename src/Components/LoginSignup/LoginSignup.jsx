import { useState } from "react";
import { Login } from "./Login";
import { Signup } from "./SignUp";

export function LoginSignup({
  defaultMode = "login",
  onLoginSuccess,
  isModal = false,
}) {
  const [isLogin, setIsLogin] = useState(defaultMode === "login");

  const handleLoginSuccess = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  // If rendering as a modal, don't show the full-screen layout
  if (isModal) {
    return (
      <div className="flex flex-col space-y-2">
        {isLogin ? (
          <Login
            switchToSignup={() => setIsLogin(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <Signup switchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    );
  }

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
          {isLogin ? (
            <Login switchToSignup={() => setIsLogin(false)} />
          ) : (
            <Signup switchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </section>
    </div>
  );
}
