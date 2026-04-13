const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("adminToken");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token && options.auth !== false
        ? { Authorization: `Bearer ${token}` }
        : {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok || body.success === false) {
    const error = new Error(
      body.message || body.error || `Request failed (${response.status})`,
    );
    error.status = response.status;
    error.data = body;
    throw error;
  }

  return body;
}

export const adminApi = {
  login: (credentials) =>
    request("/admin/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify(credentials),
    }),
  profile: () => request("/admin/auth/profile"),
  dashboardStats: () => request("/admin/dashboard/stats"),
  themes: () => request("/admin/themes"),
  createTheme: (theme) =>
    request("/admin/themes", {
      method: "POST",
      body: JSON.stringify(theme),
    }),
  updateTheme: (id, theme) =>
    request(`/admin/themes/${id}`, {
      method: "PUT",
      body: JSON.stringify(theme),
    }),
  deleteTheme: (id) => request(`/admin/themes/${id}`, { method: "DELETE" }),
  users: () => request("/admin/users"),
  userDetails: (id) => request(`/admin/users/${id}`),
  events: () => request("/admin/events"),
  createEvent: (event) =>
    request("/admin/events", {
      method: "POST",
      body: JSON.stringify(event),
    }),
  updateEvent: (id, event) =>
    request(`/admin/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(event),
    }),
  deleteEvent: (id) => request(`/admin/events/${id}`, { method: "DELETE" }),
};

export function setAdminSession(payload) {
  localStorage.setItem("adminToken", payload.token);
  localStorage.setItem("adminUser", JSON.stringify(payload.admin));
}

export function clearAdminSession() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
}

export function getAdminUser() {
  const saved = localStorage.getItem("adminUser");
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}
