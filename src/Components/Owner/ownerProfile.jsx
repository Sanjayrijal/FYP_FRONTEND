import axios from "axios";
import { Camera, Mail, MapPin, Phone, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../config/api.js";
import OwnerSidebar from "./OwnerSidebar";

export default function OwnerProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    preferredMobileNumber: "",
    whatsappNumber: "",
    city: "",
    businessName: "",
    businessAddress: "",
    registrationNumber: "",
    preferredContactMethod: "phone",
    website: "",
    profile: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("ownerToken");
    if (!token) {
      navigate("/owner/login");
      return;
    }
    fetchOwnerProfile();
  }, [navigate]);

  const fetchOwnerProfile = async () => {
    try {
      const token = localStorage.getItem("ownerToken");
      const res = await axios.get(apiUrl("/api/owner/auth/profile"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const owner = res.data || {};
      setProfileData({
        name: owner.name || "",
        email: owner.email || "",
        contactNumber: owner.contactNumber || "",
        preferredMobileNumber:
          owner.preferredMobileNumber || owner.contactNumber || "",
        whatsappNumber: owner.whatsappNumber || "",
        city: owner.city || "",
        businessName: owner.businessName || "",
        businessAddress: owner.businessAddress || "",
        registrationNumber: owner.registrationNumber || "",
        preferredContactMethod: owner.preferredContactMethod || "phone",
        website: owner.website || "",
        profile: owner.profile || "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      showMessage("Failed to load profile", "error");
      setLoading(false);
    }
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, profile: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("ownerToken");
      const payload = {
        name: profileData.name,
        contactNumber: profileData.contactNumber,
        preferredMobileNumber: profileData.preferredMobileNumber,
        whatsappNumber: profileData.whatsappNumber,
        city: profileData.city,
        businessName: profileData.businessName,
        businessAddress: profileData.businessAddress,
        registrationNumber: profileData.registrationNumber,
        preferredContactMethod: profileData.preferredContactMethod,
        website: profileData.website,
        profile: profileData.profile,
      };

      const response = await axios.put(
        apiUrl("/api/owner/auth/profile"),
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      showMessage("Profile updated successfully!", "success");
      const updatedOwner = response.data?.data || payload;
      setProfileData((prev) => ({
        ...prev,
        ...updatedOwner,
      }));

      // Update localStorage
      const ownerData = JSON.parse(localStorage.getItem("ownerData"));
      localStorage.setItem(
        "ownerData",
        JSON.stringify({ ...ownerData, ...updatedOwner }),
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage(
        error.response?.data?.msg || "Failed to update profile",
        "error",
      );
    } finally {
      setSaving(false);
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
    <div className="min-h-screen flex bg-linear-to-br from-slate-100 via-blue-50 to-cyan-50">
      {/* Sidebar */}
      <OwnerSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-48 p-6 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Owner Profile</h2>
          <p className="text-gray-600 mt-1">
            Keep your account details up to date.
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-white ${
              messageType === "error" ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <aside className="rounded-2xl bg-white p-6 shadow-md border border-gray-100 lg:col-span-1">
            <div className="flex flex-col items-center text-center">
              {profileData.profile ? (
                <img
                  src={profileData.profile}
                  alt="Owner profile"
                  className="h-28 w-28 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-blue-100 text-blue-700 grid place-items-center border-4 border-blue-50">
                  <User size={40} />
                </div>
              )}

              <h3 className="mt-4 text-xl font-bold text-gray-800">
                {profileData.name || "Owner"}
              </h3>
              <p className="text-sm text-gray-500">Owner Account</p>

              <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                <Camera size={16} />
                Update Profile Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </aside>

          <section className="rounded-2xl bg-white p-6 shadow-md border border-gray-100 lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-800">Profile Details</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Update your personal information shown in the owner panel.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    User Name
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-gray-300 py-3 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-9 pr-3 text-sm text-gray-500"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      name="businessAddress"
                      value={profileData.businessAddress}
                      onChange={handleProfileChange}
                      placeholder="Enter business location"
                      className="w-full rounded-lg border border-gray-300 py-3 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Preferred Mobile Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      name="preferredMobileNumber"
                      value={profileData.preferredMobileNumber}
                      onChange={handleProfileChange}
                      placeholder="Preferred mobile number"
                      className="w-full rounded-lg border border-gray-300 py-3 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Primary Contact Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      name="contactNumber"
                      value={profileData.contactNumber}
                      onChange={handleProfileChange}
                      placeholder="Primary contact number"
                      className="w-full rounded-lg border border-gray-300 py-3 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={profileData.whatsappNumber}
                      onChange={handleProfileChange}
                      placeholder="WhatsApp number"
                      className="w-full rounded-lg border border-gray-300 py-3 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Preferred Contact Method
                  </label>
                  <select
                    name="preferredContactMethod"
                    value={profileData.preferredContactMethod}
                    onChange={handleProfileChange}
                    className="w-full rounded-lg border border-gray-300 py-3 px-3 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="phone">Phone</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={profileData.registrationNumber}
                    onChange={handleProfileChange}
                    placeholder="PAN/VAT/Business registration number"
                    className="w-full rounded-lg border border-gray-300 py-3 px-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
