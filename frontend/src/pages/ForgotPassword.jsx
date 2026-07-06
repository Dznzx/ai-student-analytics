import { useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

const API = import.meta.env.VITE_API_URL || "https://ai-student-analytics.onrender.com"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [resetToken, setResetToken] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setResetToken("")
    try {
      const response = await axios.post(`${API}/forgot-password`, { email })
      setMessage(response.data.message)
      if (response.data.reset_token) {
        setResetToken(response.data.reset_token)
      }
    } catch (err) {
      setMessage(err.response?.data?.detail || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="v-auth-page">
      <div className="v-auth-card">
        <div className="v-auth-mark">AI</div>
        <h1 className="v-auth-title v-gradient-text">Forgot Password</h1>
        <p className="v-auth-sub">Enter your email to get a reset token</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} className="v-input" required
          />
          <button type="submit" disabled={loading} className="v-btn-primary v-btn-block">
            {loading ? "Sending..." : "Send Reset Token"}
          </button>
        </form>

        {message && <div className="v-alert-success mt-4">{message}</div>}

        {resetToken && (
          <div className="v-dash-card mt-4" style={{ padding: "14px" }}>
            <p className="text-xs v-dash-muted mb-2">
              ⚠️ Email sending isn't configured yet, so here's your reset token directly (for testing).
              In production this would be emailed instead of shown here.
            </p>
            <p className="text-xs" style={{ wordBreak: "break-all", color: "var(--white)" }}>{resetToken}</p>
            <Link to="/reset-password" className="v-link" style={{ marginLeft: 0, display: "inline-block", marginTop: "10px" }}>
              Continue to reset password →
            </Link>
          </div>
        )}

        <p className="v-auth-foot">
          <Link to="/" className="v-link" style={{ marginLeft: 0 }}>Back to login</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
