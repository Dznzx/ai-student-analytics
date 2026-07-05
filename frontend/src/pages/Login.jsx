import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"

const API = import.meta.env.VITE_API_URL || "https://ai-student-analytics.onrender.com"

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLogin = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await axios.post(`${API}/login`, formData)
      localStorage.setItem("token", response.data.access_token)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin() }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-blue-600">AI Student Analytics</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Sign in to your dashboard</p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
            {error}
          </div>
        )}
        <input type="email" name="email" placeholder="Email" value={formData.email}
          onChange={handleChange} onKeyDown={handleKeyDown}
          className="w-full p-4 border rounded-xl mb-4 focus:outline-none focus:border-blue-400" />
        <input type="password" name="password" placeholder="Password" value={formData.password}
          onChange={handleChange} onKeyDown={handleKeyDown}
          className="w-full p-4 border rounded-xl mb-6 focus:outline-none focus:border-blue-400" />
        <button onClick={handleLogin} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-lg font-semibold disabled:opacity-60 transition">
          {loading ? "Signing in..." : "Login"}
        </button>
        <p className="text-center mt-6 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-semibold ml-1">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
