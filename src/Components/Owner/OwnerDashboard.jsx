import axios from "axios";
import {
  Bell,
  Building2,
  CalendarCheck,
  DollarSign,
  LayoutGrid,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OwnerSidebar from "./OwnerSidebar";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ownerData, setOwnerData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    const owner = JSON.parse(localStorage.getItem("ownerData"));
    if (!owner) {
      navigate("/owner/login");
      return;
    }
    setOwnerData(owner);
    fetchStats();
    fetchNotifications();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("ownerToken");
      const res = await axios.get(
        "http://localhost:5001/api/owner/dashboard/stats",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setStats(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("ownerToken");
      const res = await axios.get(
        "http://localhost:5001/api/owner/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching owner notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("ownerToken");
      await axios.put(
        `http://localhost:5001/api/owner/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, read: true } : item,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <OwnerSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-48 p-6 overflow-y-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome back, {ownerData?.name}!
          </h2>
          <p className="text-gray-600 mt-2">{ownerData?.businessName}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Total Futsals */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Building2 className="text-gray-700" size={24} />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Number of Futsals</div>
            <div className="text-3xl font-bold mb-2">
              {String(stats?.totalFutsals || 0).padStart(2, "0")}
            </div>
            <div className="text-xs text-teal-600">
              +{stats?.approvedFutsals || 0} new this month
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Users className="text-gray-700" size={24} />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Users</div>
            <div className="text-3xl font-bold mb-2">6</div>
            <div className="text-xs text-teal-600">+0% vs last month</div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <CalendarCheck className="text-gray-700" size={24} />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Bookings</div>
            <div className="text-3xl font-bold mb-2">
              {stats?.totalBookings || 0}
            </div>
            <div className="text-xs text-teal-600">+100% vs last month</div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <DollarSign className="text-gray-700" size={24} />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Sales</div>
            <div className="text-3xl font-bold mb-2">
              Rs {stats?.totalRevenue?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-teal-600">+100% vs last month</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/owner/futsals/add"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Plus className="text-gray-700" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Add New Futsal</h3>
                <p className="text-sm text-gray-600">Register a new venue</p>
              </div>
            </div>
          </Link>

          <Link
            to="/owner/futsals"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <LayoutGrid className="text-gray-700" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Manage Futsals</h3>
                <p className="text-sm text-gray-600">Edit your venues</p>
              </div>
            </div>
          </Link>

          <Link
            to="/owner/bookings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <CalendarCheck className="text-gray-700" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">View Bookings</h3>
                <p className="text-sm text-gray-600">Check reservations</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="text-gray-700" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">
                Notifications
              </h3>
            </div>
            <span className="text-xs text-gray-500">
              {notifications.filter((item) => !item.read).length} unread
            </span>
          </div>

          {loadingNotifications ? (
            <p className="text-sm text-gray-500">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 6).map((item) => (
                <div
                  key={item._id}
                  className={`rounded-lg border p-4 ${
                    item.read
                      ? "border-gray-200 bg-gray-50"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        {item.message}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {!item.read && (
                      <button
                        onClick={() => markNotificationRead(item._id)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
