import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Signup() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  })

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const signup = async () => {

    try {

      await axios.post(
        "http://127.0.0.1:8000/signup",
        formData
      )

      alert("Signup successful!")

      navigate("/")

    } catch (error) {

      alert("Signup failed")
    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-10 rounded-2xl shadow w-96">

        <h1 className="text-3xl font-bold mb-6">
          Signup
        </h1>

        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="w-full p-3 border rounded-lg mb-4"
        />

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
          onClick={signup}
          className="w-full bg-green-600 text-white py-3 rounded-lg"
        >
          Signup
        </button>

      </div>

    </div>

  )
}

export default Signup