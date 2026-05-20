import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { Link, useNavigate, useParams } from "react-router-dom";
import OwnerSidebar from "./OwnerSidebar";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

// Component to handle map click events
function MapClickHandler({ setFormData, formData }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setFormData({
        ...formData,
        latitude: lat,
        longitude: lng,
      });
    },
  });
  return null;
}

export default function AddEditFutsal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    location: "",
    latitude: null,
    longitude: null,
    pricePerHour: "",
    contactNumber: "",
    openingTime: "",
    closingTime: "",
    description: "",
  });
  const [imagePreviews, setImagePreviews] = useState([]); // Cloudinary URLs
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("ownerToken");
    if (!token) {
      navigate("/owner/login");
      return;
    }

    if (isEdit) {
      fetchFutsal();
    }
  }, [id, isEdit, navigate]);

  const fetchFutsal = async () => {
    try {
      const token = localStorage.getItem("ownerToken");
      const res = await axios.get(
        `http://localhost:5001/api/owner/futsals/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const futsal = res.data.data;
      setFormData({
        id: futsal.id,
        name: futsal.name,
        location: futsal.location,
        latitude: futsal.latitude || null,
        longitude: futsal.longitude || null,
        pricePerHour: futsal.pricePerHour,
        contactNumber: futsal.contactNumber,
        openingTime: futsal.openingTime,
        closingTime: futsal.closingTime,
        description: futsal.description,
      });
      setImagePreviews(futsal.images || []);
    } catch (error) {
      console.error("Error fetching futsal:", error);
      setMessage("Failed to load futsal details");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e, slotIndex) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(`Uploading image ${slotIndex + 1}/5...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("ownerToken");

      const response = await axios.post(
        "http://localhost:5001/api/owner/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.secure_url) {
        const newPreviews = [...imagePreviews];
        newPreviews[slotIndex] = response.data.secure_url;
        setImagePreviews(newPreviews);
        setMessage("Image uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Full error response:", error.response?.data);
      setMessage(
        `Error uploading image: ${error.response?.data?.error || error.message}`,
      );
    }

    // Reset the input
    e.target.value = "";
  };

  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("ownerToken");

      // Create FormData for submission
      const submitData = new FormData();

      // Add form fields
      submitData.append("id", formData.id);
      submitData.append("name", formData.name);
      submitData.append("location", formData.location);
      submitData.append("latitude", formData.latitude);
      submitData.append("longitude", formData.longitude);
      submitData.append("pricePerHour", formData.pricePerHour);
      submitData.append("contactNumber", formData.contactNumber);
      submitData.append("openingTime", formData.openingTime);
      submitData.append("closingTime", formData.closingTime);
      submitData.append("description", formData.description);

      // Filter out null/empty values from images and send as JSON array
      const validImages = imagePreviews.filter((img) => img && img.trim());
      console.log("📤 Raw imagePreviews:", imagePreviews);
      console.log("📤 Filtered images to send:", validImages);
      submitData.append("images", JSON.stringify(validImages));

      if (isEdit) {
        await axios.put(
          `http://localhost:5001/api/owner/futsals/${id}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        setMessage("Futsal updated successfully!");
      } else {
        await axios.post(
          "http://localhost:5001/api/owner/futsals",
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        setMessage("Futsal created successfully! Pending admin approval.");
      }

      setTimeout(() => {
        navigate("/owner/futsals");
      }, 2000);
    } catch (error) {
      console.error("Error saving futsal:", error);
      setMessage(error.response?.data?.msg || "Failed to save futsal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <OwnerSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-48 p-6 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {isEdit ? "Edit Futsal" : "Add New Futsal"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Futsal ID *
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g., FSL001"
                required
                disabled={isEdit}
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Futsal Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Premier Futsal Arena"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Baluwatar, Kathmandu"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Per Hour (Rs) *
              </label>
              <input
                type="number"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="2500"
                required
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="+977 9812345678"
                required
              />
            </div>

            {/* Opening & Closing Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Time *
                </label>
                <input
                  type="time"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Closing Time *
                </label>
                <input
                  type="time"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Images Upload with Cloudinary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Max 5) *
              </label>
              <p className="text-xs text-gray-600 mb-4">
                {imagePreviews.length}/5 images uploaded
              </p>

              {/* 5 Individual Upload Slots */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[0, 1, 2, 3, 4].map((slotIndex) => (
                  <div
                    key={slotIndex}
                    className="relative border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 overflow-hidden"
                    style={{ aspectRatio: "1" }}
                  >
                    {imagePreviews[slotIndex] ? (
                      // Image Preview
                      <>
                        <img
                          src={imagePreviews[slotIndex]}
                          alt={`Image ${slotIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(slotIndex)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition shadow-md text-sm font-bold"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      // Upload Button
                      <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-blue-100 transition">
                        <div className="text-center">
                          <div className="text-2xl mb-1">+</div>
                          <div className="text-xs text-gray-600">
                            Image {slotIndex + 1}
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, slotIndex)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Describe your futsal venue..."
              />
            </div>

            {/* Location on Interactive Map */}
            <div>
              {formData.latitude && formData.longitude && !isEditingLocation ? (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 mb-2">
                        ✓ Location Set
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Coordinates:</span> (
                        {formData.latitude.toFixed(6)},{" "}
                        {formData.longitude.toFixed(6)})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingLocation(true)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium whitespace-nowrap"
                    >
                      ✏️ Edit Location
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📍 Select Location on Map
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Click on the map to set your futsal's exact location
                  </p>
                  <div
                    className="relative border border-gray-300 rounded-lg overflow-hidden"
                    style={{ height: "400px" }}
                  >
                    <MapContainer
                      center={[
                        formData.latitude || 27.7172,
                        formData.longitude || 85.324,
                      ]}
                      zoom={formData.latitude ? 16 : 13}
                      style={{ height: "100%", width: "100%" }}
                      ref={mapRef}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <MapClickHandler
                        setFormData={setFormData}
                        formData={formData}
                      />
                      {formData.latitude && formData.longitude && (
                        <Marker
                          position={[formData.latitude, formData.longitude]}
                        >
                          <Popup>
                            <div className="text-sm">
                              <p className="font-semibold mb-1">
                                Futsal Location
                              </p>
                              <p>Lat: {formData.latitude.toFixed(6)}</p>
                              <p>Lng: {formData.longitude.toFixed(6)}</p>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
                      <p className="text-emerald-700 font-semibold">
                        ✓ Location set successfully!
                      </p>
                      <p className="text-emerald-600 mt-1">
                        Lat: {formData.latitude.toFixed(6)}, Lng:{" "}
                        {formData.longitude.toFixed(6)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsEditingLocation(false)}
                        className="mt-3 w-full px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-xs font-medium"
                      >
                        Close Map
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-gray-400"
              >
                {loading
                  ? "Saving..."
                  : isEdit
                    ? "Update Futsal"
                    : "Create Futsal"}
              </button>

              <Link
                to="/owner/futsals"
                className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition text-center"
              >
                Cancel
              </Link>
            </div>

            {message && (
              <p
                className={`text-center font-medium ${
                  message.includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
