import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"


const API = import.meta.env.VITE_API_URL


function Signup() {

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


  const handleSignup = async () => {

    try {

      await axios.post(

        `${API}/signup`,

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

      <div className="bg-white p-10 rounded-2xl shadow-xl w-[400px]">

        <h1 className="text-4xl font-bold text-center mb-8 text-green-600">

          AI Student Analytics

        </h1>


        <h2 className="text-2xl font-semibold mb-6 text-center">

          Signup

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
          onClick={handleSignup}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl text-lg font-semibold"
        >
          Signup
        </button>


        <p className="text-center mt-6">

          Already have an account?

          <Link
            to="/"
            className="text-green-600 font-semibold ml-2"
          >
            Login
          </Link>

        </p>

      </div>

    </div>

  )
}

export default Signup