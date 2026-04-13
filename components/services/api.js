const API_URL = "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      (body && body.message) || `Request failed with status ${response.status}`,
    );
  }

  return body;
};

export const login = (username, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const signup = (username, password) =>
  request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const getHabits = (user_id) => request(`/habits?user_id=${user_id}`);

export const addHabit = (user_id, title, difficulty) =>
  request("/habits", {
    method: "POST",
    body: JSON.stringify({ user_id, title, difficulty }),
  });

export const deleteHabit = (habit_id) =>
  request(`/habits/${habit_id}`, { method: "DELETE" });

export const getDailies = (user_id) => request(`/dailies?user_id=${user_id}`);

export const addDaily = (user_id, title) =>
  request("/dailies", {
    method: "POST",
    body: JSON.stringify({ user_id, title }),
  });

export const deleteDaily = (daily_id) =>
  request(`/dailies/${daily_id}`, { method: "DELETE" });

export const getRoutines = (user_id) => request(`/routines?user_id=${user_id}`);

export const addRoutine = (user_id, title, time) =>
  request("/routines", {
    method: "POST",
    body: JSON.stringify({ user_id, title, time }),
  });

export const deleteRoutine = (routine_id) =>
  request(`/routines/${routine_id}`, { method: "DELETE" });
