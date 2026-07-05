import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

const API = import.meta.env.VITE_API_URL || "https://ai-student-analytics.onrender.com"

function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: "", email: "", password: "" })
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post(`${API}/signup`, formData)
      setMessage(response.data.message)
      setTimeout(() => navigate("/"), 1500)
    } catch (error) {
      setMessage(error.response?.data?.detail || "Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="v-auth-page">
      <div className="v-auth-card">
        <div className="v-auth-mark">AI</div>
        <h1 className="v-auth-title v-gradient-text">AI Student Analytics</h1>
        <p className="v-auth-sub">Create your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" name="username" placeholder="Username" value={formData.username}
            onChange={handleChange} className="v-input" required />
          <input type="email" name="email" placeholder="Email" value={formData.email}
            onChange={handleChange} className="v-input" required />
          <input type="password" name="password" placeholder="Password" value={formData.password}
            onChange={handleChange} className="v-input" required />
          <button type="submit" disabled={loading} className="v-btn-primary v-btn-block mt-1">
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {message && (
          <div className={`${message.toLowerCase().includes("success") ? "v-alert-success" : "v-alert-error"} mt-4`}>
            {message}
          </div>
        )}

        <p className="v-auth-foot">
          Already have an account?
          <Link to="/" className="v-link">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
