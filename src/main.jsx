import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import AdminRoutes from "./Components/AdminPanel/Admin/AdminRoutes.jsx";
import { AuthProvider } from "./Components/AuthContext/AuthContext.jsx";
import { Explore } from "./Components/Explore.jsx";
import FutsalData from "./Components/FutsalData/FutsalData.jsx";
import Booking from "./Components/FutsalData/booking.jsx";
import { Landing } from "./Components/Landing/Landing";
import { ForgotPassword } from "./Components/LoginSignup/ForgotPassword.jsx";
import { GoogleSuccess } from "./Components/LoginSignup/GoogleSuccess.jsx";
import { LoginSignup } from "./Components/LoginSignup/LoginSignup.jsx";
import SendResetPasswordEmail from "./Components/LoginSignup/SendResetPasswordEmail.jsx";
import ResetPassword from "./Components/PasswordReset/ResetPassword.jsx";
import { Layout } from "./Layout.jsx";
import "./index.css";

import AddEditFutsal from "./Components/Owner/AddEditFutsal.jsx";
import OwnerAuth from "./Components/Owner/OwnerAuth.jsx";
import OwnerBookings from "./Components/Owner/OwnerBookings.jsx";
import OwnerDashboard from "./Components/Owner/OwnerDashboard.jsx";
import OwnerFutsals from "./Components/Owner/OwnerFutsals.jsx";
import OwnerOffers from "./Components/Owner/OwnerOffers.jsx";
import OwnerProfile from "./Components/Owner/ownerProfile.jsx";
import { Venues } from "./Components/Pages/Venues.jsx";
import Wishlist from "./Components/Wishlist/wishlist.jsx";
import ContactUs from "./Pages/ContactUs.jsx";
import MyBookings from "./Pages/Mybookings";
import Offers from "./Pages/Offers";
import PaymentResult from "./Pages/PaymentResult";
import Profile from "./Pages/Profile";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Admin routes - isolated, no user Layout/navbar */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Owner routes - isolated, no user Layout/navbar */}
      <Route path="/owner/login" element={<OwnerAuth />} />
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      <Route path="/owner/futsals" element={<OwnerFutsals />} />
      <Route path="/owner/futsals/add" element={<AddEditFutsal />} />
      <Route path="/owner/futsals/edit/:id" element={<AddEditFutsal />} />
      <Route path="/owner/bookings" element={<OwnerBookings />} />
      <Route path="/owner/offers" element={<OwnerOffers />} />
      <Route path="/owner/profile" element={<OwnerProfile />} />

      {/* User routes - inside Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="LoginSignup" element={<LoginSignup />} />
        <Route path="google-success" element={<GoogleSuccess />} />
        <Route path="ResetPassword" element={<ResetPassword />} />
        <Route path="send-reset-email" element={<SendResetPasswordEmail />} />
        <Route path="ForgotPassword" element={<ForgotPassword />} />
        <Route path="Explore" element={<Explore />} />
        <Route path="FutsalData" element={<FutsalData />} />
        <Route path="Venues" element={<Venues />} />
        <Route path="booking" element={<Booking />} />
        <Route path="Bookings" element={<MyBookings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="Wishlist" element={<Wishlist />} />
        <Route path="offers" element={<Offers />} />
        <Route path="payment-result" element={<PaymentResult />} />
        <Route path="contactUS" element={<ContactUs />} />
      </Route>
    </>,
  ),
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
