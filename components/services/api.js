import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Change this when deploying

// 🔹 Authentication API
export const login = (username, password) =>
  axios.post(`${API_URL}/auth/login`, { username, password });

export const signup = (username, password) =>
  axios.post(`${API_URL}/auth/signup`, { username, password });

// 🔹 Habits API
export const getHabits = (user_id) =>
  axios.get(`${API_URL}/habits?user_id=${user_id}`);

export const addHabit = (user_id, title, difficulty) =>
  axios.post(`${API_URL}/habits`, { user_id, title, difficulty });

export const deleteHabit = (habit_id) =>
  axios.delete(`${API_URL}/habits/${habit_id}`);

// 🔹 Dailies API
export const getDailies = (user_id) =>
  axios.get(`${API_URL}/dailies?user_id=${user_id}`);

export const addDaily = (user_id, title) =>
  axios.post(`${API_URL}/dailies`, { user_id, title });

export const deleteDaily = (daily_id) =>
  axios.delete(`${API_URL}/dailies/${daily_id}`);

// 🔹 Routines API
export const getRoutines = (user_id) =>
  axios.get(`${API_URL}/routines?user_id=${user_id}`);

export const addRoutine = (user_id, title, time) =>
  axios.post(`${API_URL}/routines`, { user_id, title, time });

export const deleteRoutine = (routine_id) =>
  axios.delete(`${API_URL}/routines/${routine_id}`);
