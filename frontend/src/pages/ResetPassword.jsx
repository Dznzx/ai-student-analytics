import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"

const API = import.meta.env.VITE_API_URL || "https://ai-student-analytics.onrender.com"

function ResetPassword() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ token: "", new_password: "" })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    try {
      const response = await axios.post(`${API}/reset-password`, formData)
      setMessage(response.data.message + " Redirecting to login...")
      setTimeout(() => navigate("/"), 1800)
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to reset password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="v-auth-page">
      <div className="v-auth-card">
        <div className="v-auth-mark">AI</div>
        <h1 className="v-auth-title v-gradient-text">Reset Password</h1>
        <p className="v-auth-sub">Paste your reset token and choose a new password</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            name="token" placeholder="Reset token" value={formData.token}
            onChange={handleChange} className="v-input" rows={3} required
            style={{ resize: "vertical", fontFamily: "monospace", fontSize: "12px" }}
          />
          <input
            type="password" name="new_password" placeholder="New password" value={formData.new_password}
            onChange={handleChange} className="v-input" required
          />
          <button type="submit" disabled={loading} className="v-btn-primary v-btn-block">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && <div className="v-alert-success mt-4">{message}</div>}

        <p className="v-auth-foot">
          <Link to="/" className="v-link" style={{ marginLeft: 0 }}>Back to login</Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword
