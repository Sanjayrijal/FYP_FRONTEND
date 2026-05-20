const rawBaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

export const BASE_URL = rawBaseUrl.replace(/\/$/, "");

export const apiUrl = (path = "") => {
  if (!path) {
    return BASE_URL;
  }

  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
