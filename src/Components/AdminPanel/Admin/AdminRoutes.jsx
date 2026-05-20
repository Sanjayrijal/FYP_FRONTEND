import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "../Dashboard/AdminDashboard.jsx";
import ManageFutsals from "../Pages/ManageFutsals.jsx";
import ManageUsers from "../Pages/ManageUsers.jsx";
import AdminLayout from "./AdminLayout.jsx";
import AdminLogin from "./AdminLogin.jsx";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="login" element={<AdminLogin />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="futsals" element={<ManageFutsals />} />
        <Route path="users" element={<ManageUsers />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
