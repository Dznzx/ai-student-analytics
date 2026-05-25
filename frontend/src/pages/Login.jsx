import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Login() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const login = async () => {

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/login",
        formData
      )

      localStorage.setItem(
        "token",
        response.data.access_token
      )

      alert("Login successful!")

      navigate("/dashboard")

    } catch (error) {

      alert("Invalid credentials")
    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-10 rounded-2xl shadow w-96">

        <h1 className="text-3xl font-bold mb-6">
          Login
        </h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full p-3 border rounded-lg mb-4"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full p-3 border rounded-lg mb-6"
        />

        <button
          onClick={login}
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          Login
        </button>

      </div>

    </div>

  )
}

export default Login