import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

function Signup() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  })

  const [message, setMessage] = useState("")

  const API = "https://ai-student-analytics.onrender.com"

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })

  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      const response = await axios.post(
        `${API}/signup`,
        formData
      )

      setMessage(response.data.message)

      setTimeout(() => {
        navigate("/")
      }, 1500)

    } catch (error) {

      console.log(error)

      setMessage("Signup failed")

    }

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[400px]">

        <h1 className="text-3xl font-bold text-center mb-6">
          Create Account
        </h1>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl mb-4"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl mb-4"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-4 border rounded-xl mb-6"
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition"
          >
            Sign Up
          </button>

        </form>

        {message && (
          <p className="text-center mt-4 text-red-500">
            {message}
          </p>
        )}

        <p className="text-center mt-6">

          Already have an account?

          <Link
            to="/"
            className="text-blue-500 ml-2"
          >
            Login
          </Link>

        </p>

      </div>

    </div>

  )

}

export default Signup