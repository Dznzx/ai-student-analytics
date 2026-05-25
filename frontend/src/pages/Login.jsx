import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"


const API = import.meta.env.VITE_API_URL


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


  const handleLogin = async () => {

    try {

      const response = await axios.post(

        `${API}/login`,

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

      <div className="bg-white p-10 rounded-2xl shadow-xl w-[400px]">

        <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">

          AI Student Analytics

        </h1>


        <h2 className="text-2xl font-semibold mb-6 text-center">

          Login

        </h2>


        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-4 border rounded-xl mb-4"
        />


        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-4 border rounded-xl mb-6"
        />


        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-lg font-semibold"
        >
          Login
        </button>


        <p className="text-center mt-6">

          Don’t have an account?

          <Link
            to="/signup"
            className="text-blue-600 font-semibold ml-2"
          >
            Signup
          </Link>

        </p>

      </div>

    </div>

  )
}

export default Login