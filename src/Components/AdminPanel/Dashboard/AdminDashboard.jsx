import axios from "axios";
import { Building2, CalendarCheck, DollarSign, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { apiUrl } from "../../../config/api.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    futsals: 0,
    users: 0,
    bookings: 0,
    sales: 0,
    futsalChange: 0,
    userChange: 0,
    bookingChange: 0,
    revenueChange: 0,
  });

  const [futsals, setFutsals] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      // Fetch futsals
      const futsalsRes = await axios.get(apiUrl("/api/futsals/getfutsals"));
      const futsalsData = futsalsRes.data.data || [];
      setFutsals(futsalsData);

      // Fetch users
      const usersRes = await axios.get(apiUrl("/api/users"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = usersRes.data.data || [];

      // Fetch bookings
      const bookingsRes = await axios.get(
        apiUrl("/api/futsal/booking/getBookings"),
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const bookings = bookingsRes.data || [];
      setBookingsData(bookings);

      // Date boundaries
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Booking change
      const bookingsThisMonth = bookings.filter(
        (b) => new Date(b.bookingDate) >= startOfThisMonth,
      ).length;
      const bookingsLastMonth = bookings.filter(
        (b) =>
          new Date(b.bookingDate) >= startOfLastMonth &&
          new Date(b.bookingDate) <= endOfLastMonth,
      ).length;
      const bookingChange =
        bookingsLastMonth === 0
          ? bookingsThisMonth > 0
            ? 100
            : 0
          : Math.round(
              ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) *
                100,
            );

      // Revenue calculation
      const calcRevenue = (list) =>
        list.reduce((total, booking) => {
          if (booking.futsal && booking.startTime && booking.endTime) {
            const start = booking.startTime.split(":").map(Number);
            const end = booking.endTime.split(":").map(Number);
            const hours = end[0] + end[1] / 60 - (start[0] + start[1] / 60);
            return total + hours * (booking.futsal.pricePerHour || 0);
          }
          return total;
        }, 0);

      const totalRevenue = calcRevenue(bookings);
      const revenueThisMonth = calcRevenue(
        bookings.filter((b) => new Date(b.bookingDate) >= startOfThisMonth),
      );
      const revenueLastMonth = calcRevenue(
        bookings.filter(
          (b) =>
            new Date(b.bookingDate) >= startOfLastMonth &&
            new Date(b.bookingDate) <= endOfLastMonth,
        ),
      );
      const revenueChange =
        revenueLastMonth === 0
          ? revenueThisMonth > 0
            ? 100
            : 0
          : Math.round(
              ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100,
            );

      // Futsal change
      const futsalsThisMonth = futsalsData.filter(
        (f) => new Date(f.createdAt) >= startOfThisMonth,
      ).length;
      const futsalsLastMonth = futsalsData.filter(
        (f) =>
          new Date(f.createdAt) >= startOfLastMonth &&
          new Date(f.createdAt) <= endOfLastMonth,
      ).length;
      const futsalChange = futsalsThisMonth - futsalsLastMonth;

      // User change
      const usersThisMonth = usersData.filter(
        (u) => new Date(u.createdAt) >= startOfThisMonth,
      ).length;
      const usersLastMonth = usersData.filter(
        (u) =>
          new Date(u.createdAt) >= startOfLastMonth &&
          new Date(u.createdAt) <= endOfLastMonth,
      ).length;
      const userChange =
        usersLastMonth === 0
          ? usersThisMonth > 0
            ? 100
            : 0
          : Math.round(
              ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100,
            );

      setStats({
        futsals: futsalsData.length,
        users: usersData.length,
        bookings: bookings.length,
        sales: Math.round(totalRevenue),
        futsalChange,
        userChange,
        bookingChange,
        revenueChange,
      });

      // Recent activities
      const activities = bookings.slice(0, 6).map((booking, index) => ({
        id: `#${String(booking._id).slice(-6)}`,
        title:
          index % 3 === 0
            ? `Booking ${booking._id.slice(-6)}`
            : index % 3 === 1
              ? "Team Registration"
              : "Payment Received",
        futsal: booking.futsal?.name || "Futsal",
        time: new Date(booking.bookingDate).toLocaleDateString(),
        color: ["green", "blue", "orange", "teal", "purple", "yellow"][
          index % 6
        ],
      }));
      setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const weeklyData = [
    { day: "Mon", bookings: 12 },
    { day: "Tue", bookings: 15 },
    { day: "Wed", bookings: 18 },
    { day: "Thu", bookings: 22 },
    { day: "Fri", bookings: 24 },
    { day: "Sat", bookings: 20 },
    { day: "Sun", bookings: 26 },
  ];

  const revenueData = [
    { month: "Jan", revenue: 8000 },
    { month: "Feb", revenue: 10000 },
    { month: "Mar", revenue: 12000 },
    { month: "Apr", revenue: 14000 },
    { month: "May", revenue: 16000 },
    { month: "Jun", revenue: 17000 },
    { month: "Jul", revenue: 19000 },
    { month: "Aug", revenue: 21000 },
    { month: "Sep", revenue: 22000 },
  ];

  const peakHoursData = [
    { time: "6 AM", bookings: 2 },
    { time: "9 AM", bookings: 8 },
    { time: "12 PM", bookings: 15 },
    { time: "3 PM", bookings: 20 },
    { time: "6 PM", bookings: 28 },
    { time: "9 PM", bookings: 25 },
    { time: "12 AM", bookings: 10 },
    { time: "3 AM", bookings: 3 },
  ];

  const StatChange = ({ value, suffix = "% vs last month" }) => (
    <div
      className={`text-xs ${value >= 0 ? "text-green-600" : "text-red-600"}`}
    >
      {value >= 0 ? "+" : ""}
      {value}
      {suffix}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <Building2 className="text-gray-700" size={24} />
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-1">Number of Futsals</div>
          <div className="text-3xl font-bold mb-2">
            {String(stats.futsals).padStart(2, "0")}
          </div>
          <StatChange value={stats.futsalChange} suffix=" new this month" />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <Users className="text-gray-700" size={24} />
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-1">Total Users</div>
          <div className="text-3xl font-bold mb-2">
            {stats.users.toLocaleString()}
          </div>
          <StatChange value={stats.userChange} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <CalendarCheck className="text-gray-700" size={24} />
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-1">Total Bookings</div>
          <div className="text-3xl font-bold mb-2">
            {stats.bookings.toLocaleString()}
          </div>
          <StatChange value={stats.bookingChange} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <DollarSign className="text-gray-700" size={24} />
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-1">Sales</div>
          <div className="text-3xl font-bold mb-2">
            Rs {stats.sales.toLocaleString()}
          </div>
          <StatChange value={stats.revenueChange} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-1">Weekly Bookings</h3>
          <p className="text-sm text-gray-600 mb-4">Total bookings this week</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">updated 1 hour ago</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-1">Revenue Trend</h3>
          <p className="text-sm text-gray-600 mb-4">Monthly revenue growth</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">updated 2 hours ago</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-1">Peak Hours Analysis</h3>
          <p className="text-sm text-gray-600 mb-4">Hourly booking patterns</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">updated just now</p>
        </div>
      </div>

      {/* Futsals Table & Activity */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Futsals</h3>
            <p className="text-sm text-gray-600">
              {futsals.length} total courts
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 text-xs font-semibold text-gray-500 pb-2 border-b">
              <div>FUTSAL COURT</div>
              <div>TOTAL BOOKINGS</div>
              <div>REVENUE GENERATED</div>
            </div>

            {futsals.slice(0, 6).map((futsal) => {
              const futsalBookings = bookingsData.filter(
                (b) => b.futsal?._id === futsal._id || b.futsal === futsal._id,
              );
              const futsalRevenue = futsalBookings.reduce((total, booking) => {
                if (booking.startTime && booking.endTime) {
                  const start = booking.startTime.split(":").map(Number);
                  const end = booking.endTime.split(":").map(Number);
                  const hours =
                    end[0] + end[1] / 60 - (start[0] + start[1] / 60);
                  return total + hours * (futsal.pricePerHour || 0);
                }
                return total;
              }, 0);

              return (
                <div
                  key={futsal._id}
                  className="grid grid-cols-3 items-center py-3 border-b border-gray-100"
                >
                  <div className="font-medium text-gray-900">{futsal.name}</div>
                  <div className="text-sm text-gray-700">
                    {futsalBookings.length}{" "}
                    <span className="text-gray-400">
                      {futsalBookings.length === 1 ? "booking" : "bookings"}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    Rs. {Math.round(futsalRevenue).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-1">Booking Overview</h3>
          <p className="text-sm text-gray-600 mb-4">+ 18% this month</p>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full bg-${activity.color}-500`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.futsal} - {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
