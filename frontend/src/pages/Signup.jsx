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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">AI Student Analytics</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Create your account</p>
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Username" value={formData.username}
            onChange={handleChange} className="w-full p-4 border rounded-xl mb-4" required />
          <input type="email" name="email" placeholder="Email" value={formData.email}
            onChange={handleChange} className="w-full p-4 border rounded-xl mb-4" required />
          <input type="password" name="password" placeholder="Password" value={formData.password}
            onChange={handleChange} className="w-full p-4 border rounded-xl mb-6" required />
          <button type="submit" disabled={loading}
            className="w-full bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition disabled:opacity-60">
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        {message && (
          <p className={`text-center mt-4 text-sm ${message.includes("success") ? "text-green-600" : "text-red-500"}`}>
            {message}
          </p>
        )}
        <p className="text-center mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/" className="text-blue-500 font-semibold ml-1">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
