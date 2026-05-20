import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "../Components/Footer/Footer";

const EMPTY_PROFILE = {
  name: "",
  email: "",
  contactNumber: "",
  location: "",
  bio: "",
  profilePic: "",
  dateOfBirth: "",
  gender: "",
  notificationPreferences: {
    email: false,
    sms: false,
    push: false,
  },
};

const sanitizeProfile = (data = {}) => ({
  name: data.name || "",
  email: data.email || "",
  contactNumber: data.contactNumber || "",
  location: data.location || "",
  bio: data.bio || "",
  profilePic: data.profilePic || "",
  dateOfBirth: data.dateOfBirth
    ? new Date(data.dateOfBirth).toISOString().split("T")[0]
    : "",
  gender: data.gender && data.gender !== "prefer_not_to_say" ? data.gender : "",
  notificationPreferences: {
    email: Boolean(data.notificationPreferences?.email),
    sms: Boolean(data.notificationPreferences?.sms),
    push: Boolean(data.notificationPreferences?.push),
  },
});

const estimateDataUrlBytes = (dataUrl) => {
  const base64 = String(dataUrl || "").split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
};

const optimizeImageToDataUrl = (file, maxDimension = 900, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error("Could not process image."));
      img.onload = () => {
        const longestSide = Math.max(img.width, img.height) || 1;
        const scale = Math.min(1, maxDimension / longestSide);
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not create image canvas."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.src = String(reader.result || "");
    };

    reader.readAsDataURL(file);
  });

function ProfileChecklist({ profile }) {
  const hasNotificationsEnabled =
    profile.notificationPreferences.email ||
    profile.notificationPreferences.sms ||
    profile.notificationPreferences.push;

  const tasks = [
    {
      label: "Setup account",
      weight: 20,
      done: Boolean(profile.name && profile.email),
    },
    {
      label: "Upload your photo",
      weight: 10,
      done: Boolean(profile.profilePic),
    },
    {
      label: "Personal info",
      weight: 20,
      done: Boolean(
        profile.contactNumber && profile.dateOfBirth && profile.gender,
      ),
    },
    {
      label: "Location",
      weight: 15,
      done: Boolean(profile.location),
    },
    {
      label: "Biography",
      weight: 15,
      done: Boolean(profile.bio),
    },
    {
      label: "Notifications",
      weight: 20,
      done: hasNotificationsEnabled,
    },
  ];

  const progress = tasks
    .filter((task) => task.done)
    .reduce((total, task) => total + task.weight, 0);

  return (
    <aside className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">
        Complete your profile
      </h3>

      <div className="mt-6 flex items-center justify-center">
        <div
          className="grid h-36 w-36 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#22c55e ${Math.min(progress, 100) * 3.6}deg, #d1d5db 0deg)`,
          }}
        >
          <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-2xl font-bold text-gray-800">
            {Math.min(progress, 100)}%
          </div>
        </div>
      </div>

      <ul className="mt-8 space-y-3 text-sm text-gray-700">
        {tasks.map((task) => (
          <li
            key={task.label}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-4 w-4 rounded-full text-center text-xs leading-4 ${task.done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}
              >
                {task.done ? "✓" : "x"}
              </span>
              <span>{task.label}</span>
            </div>
            <span className="font-medium text-gray-500">
              {`${task.weight}%`}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState("");
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingNotifications, setIsEditingNotifications] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const initials = useMemo(() => {
    if (!profile.name) return "U";
    const parts = profile.name.trim().split(" ").filter(Boolean);
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  }, [profile.name]);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus({
        type: "error",
        message: "Please log in to view and edit your profile.",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:5001/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(sanitizeProfile(response.data?.data));
    } catch (error) {
      console.error("Error fetching profile:", error);
      setStatus({
        type: "error",
        message: "Could not load your profile right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (section) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSavingSection(section);
      const response = await axios.put(
        "http://localhost:5001/api/users/me",
        {
          name: profile.name,
          email: profile.email,
          contactNumber: profile.contactNumber,
          location: profile.location,
          bio: profile.bio,
          profilePic: profile.profilePic,
          dateOfBirth: profile.dateOfBirth || undefined,
          gender: profile.gender || "prefer_not_to_say",
          notificationPreferences: profile.notificationPreferences,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setProfile(sanitizeProfile(response.data?.data));
      setStatus({ type: "success", message: "Profile updated successfully." });
      if (section === "personal") setIsEditingInfo(false);
      if (section === "bio") setIsEditingBio(false);
      if (section === "notifications") setIsEditingNotifications(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      const httpStatus = error?.response?.status;
      const backendMessage =
        error?.response?.data?.message || error?.response?.data?.msg;

      let message = backendMessage || "Failed to save profile changes.";
      if (httpStatus === 413) {
        message = "Image is too large. Please upload a smaller photo.";
      }

      setStatus({ type: "error", message });
    } finally {
      setSavingSection("");
    }
  };

  const onPhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", message: "Please choose an image file." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus({
        type: "error",
        message: "Please upload an image smaller than 5MB.",
      });
      return;
    }

    try {
      setStatus({ type: "success", message: "Optimizing image..." });
      const optimizedDataUrl = await optimizeImageToDataUrl(file);
      const optimizedBytes = estimateDataUrlBytes(optimizedDataUrl);

      if (optimizedBytes > 1.6 * 1024 * 1024) {
        setStatus({
          type: "error",
          message: "Optimized image is still too large. Try a smaller photo.",
        });
        return;
      }

      setProfile((prev) => ({ ...prev, profilePic: optimizedDataUrl }));
      setStatus({
        type: "success",
        message: "Photo ready. Click Save photo to update profile.",
      });
    } catch (error) {
      console.error("Error preparing profile photo:", error);
      setStatus({
        type: "error",
        message: "Could not process this image. Please try another one.",
      });
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-linear-to-br from-slate-100 via-gray-100 to-blue-50">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Profile" }]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Edit Profile
        </h1>

        {status.message && (
          <div
            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${status.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}
          >
            {status.message}
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 text-center text-gray-500 shadow-sm">
            Loading profile...
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="space-y-5">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    {profile.profilePic ? (
                      <img
                        src={profile.profilePic}
                        alt="Profile"
                        className="h-20 w-20 rounded-full border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="grid h-20 w-20 place-items-center rounded-full bg-yellow-400 text-lg font-semibold text-gray-900">
                        {initials}
                      </div>
                    )}

                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        Upload new photo
                      </button>
                      <p className="mt-2 text-xs text-gray-500">
                        At least 800x800 px recommended. JPG or PNG allowed.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => saveProfile("photo")}
                    disabled={savingSection === "photo"}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingSection === "photo" ? "Saving..." : "Save photo"}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={onPhotoChange}
                />
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Personal Info
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEditingInfo((prev) => !prev)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    {isEditingInfo ? "Cancel" : "Edit"}
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="text-sm text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">
                      Full Name
                    </span>
                    <input
                      type="text"
                      value={profile.name}
                      disabled={!isEditingInfo}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none transition focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </label>

                  <label className="text-sm text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">
                      Email
                    </span>
                    <input
                      type="email"
                      value={profile.email}
                      disabled={!isEditingInfo}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none transition focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </label>

                  <label className="text-sm text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">
                      Phone
                    </span>
                    <input
                      type="text"
                      value={profile.contactNumber}
                      disabled={!isEditingInfo}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          contactNumber: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none transition focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </label>

                  <label className="text-sm text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">
                      Date of Birth
                    </span>
                    <input
                      type="date"
                      value={profile.dateOfBirth}
                      disabled={!isEditingInfo}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          dateOfBirth: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none transition focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </label>

                  <label className="text-sm text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">
                      Gender
                    </span>
                    <select
                      value={profile.gender}
                      disabled={!isEditingInfo}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          gender: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none transition focus:border-blue-500 disabled:bg-gray-50"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                </div>

                {isEditingInfo && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => saveProfile("personal")}
                      disabled={savingSection === "personal"}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {savingSection === "personal"
                        ? "Saving..."
                        : "Save changes"}
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Location
                </h2>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Enter your location"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none transition focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => saveProfile("location")}
                    disabled={savingSection === "location"}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingSection === "location"
                      ? "Saving..."
                      : "Save changes"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Bio</h2>
                  <button
                    type="button"
                    onClick={() => setIsEditingBio((prev) => !prev)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    {isEditingBio ? "Cancel" : "Edit"}
                  </button>
                </div>

                <textarea
                  value={profile.bio}
                  disabled={!isEditingBio}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={6}
                  placeholder="Write something about yourself..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none transition focus:border-blue-500 disabled:bg-gray-50"
                />

                {isEditingBio && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => saveProfile("bio")}
                      disabled={savingSection === "bio"}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {savingSection === "bio" ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEditingNotifications((prev) => !prev)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    {isEditingNotifications ? "Cancel" : "Edit"}
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { key: "email", label: "Email alerts" },
                    { key: "sms", label: "SMS alerts" },
                    { key: "push", label: "Push alerts" },
                  ].map((channel) => (
                    <label
                      key={channel.key}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={profile.notificationPreferences[channel.key]}
                        disabled={!isEditingNotifications}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            notificationPreferences: {
                              ...prev.notificationPreferences,
                              [channel.key]: e.target.checked,
                            },
                          }))
                        }
                      />
                      {channel.label}
                    </label>
                  ))}
                </div>

                {isEditingNotifications && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => saveProfile("notifications")}
                      disabled={savingSection === "notifications"}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {savingSection === "notifications"
                        ? "Saving..."
                        : "Save changes"}
                    </button>
                  </div>
                )}
              </div>
            </section>

            <div className="lg:sticky lg:top-6 lg:h-fit">
              <ProfileChecklist profile={profile} />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
