import { Outlet, useLocation } from "react-router-dom";
import { DynamicHeroNavbar } from "./Components/Navigation/DynamicHeroNavbar";

export function Layout() {
  const location = useLocation();

  // Pages that should NOT show the navbar
  const hideNavbarPaths = [
    "/",
    "/LoginSignup",
    "/ResetPassword",
    "/ForgotPassword",
    "/send-reset-email",
  ];

  // Check if current path should hide navbar
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <DynamicHeroNavbar />}
      <Outlet />
    </>
  );
}
