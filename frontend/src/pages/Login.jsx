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
    <div className="v-auth-page">
      <div className="v-auth-card">
        <div className="v-auth-mark">AI</div>
        <h1 className="v-auth-title v-gradient-text">AI Student Analytics</h1>
        <p className="v-auth-sub">Sign in to your dashboard</p>

        {error && <div className="v-alert-error mb-4">{error}</div>}

        <div className="flex flex-col gap-4">
          <input
            type="email" name="email" placeholder="Email" value={formData.email}
            onChange={handleChange} onKeyDown={handleKeyDown} className="v-input"
          />
          <input
            type="password" name="password" placeholder="Password" value={formData.password}
            onChange={handleChange} onKeyDown={handleKeyDown} className="v-input"
          />
          <button onClick={handleLogin} disabled={loading} className="v-btn-primary v-btn-block mt-1">
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>

        <p className="v-auth-foot">
          Don't have an account?
          <Link to="/signup" className="v-link">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
