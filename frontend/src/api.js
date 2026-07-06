import axios from "axios"

export const API = import.meta.env.VITE_API_URL || "https://ai-student-analytics.onrender.com"

const api = axios.create({ baseURL: API })

// Automatically attach the auth token to every request, so components
// don't need to build the Authorization header themselves.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// If the backend ever returns 401 (missing/expired/invalid token), clear
// the stored token and bounce to login with a flag the Login page reads
// to show a "your session expired" message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      if (window.location.pathname !== "/") {
        window.location.href = "/?sessionExpired=1"
      }
    }
    return Promise.reject(error)
  }
)

export default api
