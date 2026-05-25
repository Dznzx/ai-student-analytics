import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { saveAs } from "file-saver"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

function Dashboard() {

  const navigate = useNavigate()

  const [students, setStudents] = useState([])
  const [search, setSearch] = useState("")
  const [darkMode, setDarkMode] = useState(false)

  const [editingId, setEditingId] = useState(null)

  const [csvFile, setCsvFile] = useState(null)

  const [predictions, setPredictions] = useState({})

  const [formData, setFormData] = useState({
    name: "",
    reg_no: "",
    department: "",
    attendance: "",
    cgpa: ""
  })

  useEffect(() => {

    fetchStudents()

  }, [])

  useEffect(() => {

    students.forEach((student) => {

      predictRisk(student)

    })

  }, [students])

  const fetchStudents = async () => {

    const response = await axios.get(
      "http://127.0.0.1:8000/students"
    )

    setStudents(response.data)
  }

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const addStudent = async () => {

    await axios.post(
      "http://127.0.0.1:8000/students",
      {
        ...formData,
        attendance: parseFloat(formData.attendance),
        cgpa: parseFloat(formData.cgpa)
      }
    )

    fetchStudents()

    resetForm()
  }

  const deleteStudent = async (id) => {

    await axios.delete(
      `http://127.0.0.1:8000/students/${id}`
    )

    fetchStudents()
  }

  const startEdit = (student) => {

    setEditingId(student.id)

    setFormData({
      name: student.name,
      reg_no: student.reg_no,
      department: student.department,
      attendance: student.attendance,
      cgpa: student.cgpa
    })
  }

  const updateStudent = async () => {

    await axios.put(
      `http://127.0.0.1:8000/students/${editingId}`,
      {
        ...formData,
        attendance: parseFloat(formData.attendance),
        cgpa: parseFloat(formData.cgpa)
      }
    )

    fetchStudents()

    setEditingId(null)

    resetForm()
  }

  const resetForm = () => {

    setFormData({
      name: "",
      reg_no: "",
      department: "",
      attendance: "",
      cgpa: ""
    })
  }

  const uploadCSV = async () => {

    if (!csvFile) {

      alert("Please select a CSV file")

      return
    }

    const formData = new FormData()

    formData.append("file", csvFile)

    await axios.post(
      "http://127.0.0.1:8000/upload-csv",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    )

    fetchStudents()

    alert("CSV uploaded successfully!")
  }

  const exportCSV = () => {

    const headers = [
      "Name",
      "Register No",
      "Department",
      "Attendance",
      "CGPA"
    ]

    const rows = students.map((student) => [

      student.name,
      student.reg_no,
      student.department,
      student.attendance,
      student.cgpa

    ])

    let csvContent =
      headers.join(",") + "\n"

    rows.forEach((row) => {

      csvContent += row.join(",") + "\n"
    })

    const blob = new Blob(
      [csvContent],
      { type: "text/csv;charset=utf-8;" }
    )

    saveAs(blob, "students_report.csv")
  }

  const predictRisk = async (student) => {

    try {

      const response = await axios.post(

        "http://127.0.0.1:8000/predict",

        {
          attendance: student.attendance,
          cgpa: student.cgpa
        }

      )

      setPredictions((prev) => ({

        ...prev,

        [student.id]: response.data

      }))

    } catch (error) {

      console.log("Prediction error")
    }
  }

  const getRecommendation = (student) => {

    if (
      student.cgpa < 7 &&
      student.attendance < 75
    ) {

      return `
      Increase attendance above 80%,
      attend tutoring sessions,
      and practice DSA daily.
      `
    }

    if (
      student.cgpa >= 7 &&
      student.cgpa < 8.5
    ) {

      return `
      Focus on coding practice,
      mock tests,
      and project development.
      `
    }

    return `
    Apply for internships,
    research programs,
    hackathons,
    and competitive coding contests.
    `
  }

  const riskData = [

    {
      name: "High Risk",
      value: students.filter(
        s => s.cgpa < 7 || s.attendance < 75
      ).length
    },

    {
      name: "Low Risk",
      value: students.filter(
        s => s.cgpa >= 7 && s.attendance >= 75
      ).length
    }

  ]

  const COLORS = ["#ef4444", "#22c55e"]

  const logout = () => {

    localStorage.removeItem("token")

    navigate("/")
  }

  return (

    <div className={
      darkMode
      ? "min-h-screen bg-gray-900 text-white p-10"
      : "min-h-screen bg-gray-100 p-10"
    }>

      {/* HEADER */}

      <div className="flex justify-between items-center mb-10">

        <h1 className="text-4xl font-bold">
          AI Student Analytics Dashboard
        </h1>

        <div className="flex gap-4">

          <button
            onClick={exportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            Export CSV
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            {
              darkMode
              ? "Light Mode"
              : "Dark Mode"
            }
          </button>

          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
          >
            Logout
          </button>

        </div>

      </div>

      {/* ADD STUDENT */}

      <div className="bg-white text-black p-6 rounded-2xl shadow mb-10">

        <h2 className="text-2xl font-bold mb-6">

          {
            editingId
            ? "Edit Student"
            : "Add Student"
          }

        </h2>

        <div className="grid grid-cols-5 gap-4">

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />

          <input
            type="text"
            name="reg_no"
            placeholder="Register No"
            value={formData.reg_no}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />

          <input
            type="number"
            name="attendance"
            placeholder="Attendance"
            value={formData.attendance}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />

          <input
            type="number"
            name="cgpa"
            placeholder="CGPA"
            value={formData.cgpa}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />

        </div>

        {
          editingId
          ? (
            <button
              onClick={updateStudent}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
            >
              Update Student
            </button>
          )
          : (
            <button
              onClick={addStudent}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Add Student
            </button>
          )
        }

      </div>

      {/* CSV UPLOAD */}

      <div className="bg-white text-black p-6 rounded-2xl shadow mb-10">

        <h2 className="text-2xl font-bold mb-6">
          Upload Student CSV
        </h2>

        <input
          type="file"
          accept=".csv"
          onChange={(e) =>
            setCsvFile(e.target.files[0])
          }
          className="mb-4"
        />

        <br />

        <button
          onClick={uploadCSV}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
        >
          Upload CSV
        </button>

      </div>

      {/* ANALYTICS CARDS */}

      <div className="grid grid-cols-4 gap-6 mb-10">

        {/* TOTAL STUDENTS */}

        <div className="bg-white text-black p-6 rounded-2xl shadow">

          <h2 className="text-xl font-semibold">
            Total Students
          </h2>

          <p className="text-4xl mt-4 font-bold text-blue-600">
            {students.length}
          </p>

        </div>


        {/* AVERAGE CGPA */}

        <div className="bg-white text-black p-6 rounded-2xl shadow">

          <h2 className="text-xl font-semibold">
            Average CGPA
          </h2>

          <p className="text-4xl mt-4 font-bold text-green-600">

            {
              students.length > 0
              ? (
                students.reduce(
                  (acc, s) => acc + s.cgpa,
                  0
                ) / students.length
              ).toFixed(2)
              : 0
            }

          </p>

        </div>


        {/* AVERAGE ATTENDANCE */}

        <div className="bg-white text-black p-6 rounded-2xl shadow">

          <h2 className="text-xl font-semibold">
            Avg Attendance
          </h2>

          <p className="text-4xl mt-4 font-bold text-purple-600">

            {
              students.length > 0
              ? (
                students.reduce(
                  (acc, s) => acc + s.attendance,
                  0
                ) / students.length
              ).toFixed(1)
              : 0
            }%

          </p>

        </div>


        {/* HIGH RISK */}

        <div className="bg-white text-black p-6 rounded-2xl shadow">

          <h2 className="text-xl font-semibold">
            High Risk Students
          </h2>

          <p className="text-4xl mt-4 font-bold text-red-600">

            {
              students.filter(
                s => s.cgpa < 7 || s.attendance < 75
              ).length
            }

          </p>

        </div>

      </div>


      {/* ADVANCED ANALYTICS */}

      <div className="grid grid-cols-2 gap-6 mb-10">


        {/* TOP PERFORMER */}

        <div className="bg-white text-black p-6 rounded-2xl shadow">

          <h2 className="text-2xl font-bold mb-4">
            Top Performer
          </h2>

          {

            students.length > 0 && (

              <div>

                <p className="text-2xl font-semibold text-green-600">

                  {

                    students.reduce(

                      (prev, current) =>

                        prev.cgpa > current.cgpa
                        ? prev
                        : current

                    ).name

                  }

                </p>

                <p className="mt-2">

                  Highest CGPA:
                  {

                    students.reduce(

                      (prev, current) =>

                        prev.cgpa > current.cgpa
                        ? prev
                        : current

                    ).cgpa

                  }

                </p>

              </div>

            )

          }

        </div>


        {/* MOST AT RISK */}

        <div className="bg-white text-black p-6 rounded-2xl shadow">

          <h2 className="text-2xl font-bold mb-4">
            Most At-Risk Student
          </h2>

          {

            students.length > 0 && (

              <div>

                <p className="text-2xl font-semibold text-red-600">

                  {

                    students.reduce(

                      (prev, current) =>

                        prev.attendance < current.attendance
                        ? prev
                        : current

                    ).name

                  }

                </p>

                <p className="mt-2">

                  Attendance:
                  {

                    students.reduce(

                      (prev, current) =>

                        prev.attendance < current.attendance
                        ? prev
                        : current

                    ).attendance

                  }%

                </p>

              </div>

            )

          }

        </div>

      </div>

      {/* CGPA CHART */}

      <div className="bg-white text-black p-6 rounded-2xl shadow mb-10">

        <h2 className="text-2xl font-bold mb-6">
          Student CGPA Analytics
        </h2>

        <ResponsiveContainer width="100%" height={300}>

          <BarChart data={students}>

            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Bar
              dataKey="cgpa"
              fill="#2563eb"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* PIE CHART */}

      <div className="bg-white text-black p-6 rounded-2xl shadow mb-10">

        <h2 className="text-2xl font-bold mb-6">
          Student Risk Distribution
        </h2>

        <ResponsiveContainer width="100%" height={350}>

          <PieChart>

            <Pie
              data={riskData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              label
            >

              {
                riskData.map((entry, index) => (

                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />

                ))
              }

            </Pie>

            <Tooltip />
            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </div>

      {/* AI INSIGHTS */}

      <div className="bg-white text-black p-6 rounded-2xl shadow mb-10">

        <h2 className="text-2xl font-bold mb-6">
          AI Insights
        </h2>

        <div className="space-y-4">

          {
            students.map((student) => (

              <div
                key={student.id}
                className="border p-4 rounded-xl"
              >

                <div>

                  <p className="font-bold mb-2">

                    {
                      predictions[student.id]?.prediction
                      || "Predicting..."
                    }

                  </p>

                  <p className="mb-3">

                    AI Confidence:
                    {

                      predictions[student.id]?.risk_probability
                      || 0

                    }%

                  </p>

                  <p>

                    {getRecommendation(student)}

                  </p>

                </div>

              </div>

            ))
          }

        </div>

      </div>

      {/* SEARCH */}

      <div className="bg-white text-black p-6 rounded-2xl shadow mb-10">

        <h2 className="text-2xl font-bold mb-6">
          Search Students
        </h2>

        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 border rounded-xl"
        />

      </div>

      {/* STUDENT TABLE */}

      <div className="bg-white text-black p-6 rounded-2xl shadow">

        <h2 className="text-2xl font-bold mb-6">
          Students
        </h2>

        <table className="w-full">

          <thead>

            <tr className="text-left border-b">

              <th className="p-3">Name</th>
              <th className="p-3">Register No</th>
              <th className="p-3">Department</th>
              <th className="p-3">Attendance</th>
              <th className="p-3">CGPA</th>
              <th className="p-3">Prediction</th>
              <th className="p-3">Actions</th>

            </tr>

          </thead>

          <tbody>

            {
              students
              .filter((student) =>
                student.name
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((student) => (

                <tr
                  key={student.id}
                  className="border-b"
                >

                  <td className="p-3">
                    {student.name}
                  </td>

                  <td className="p-3">
                    {student.reg_no}
                  </td>

                  <td className="p-3">
                    {student.department}
                  </td>

                  <td className="p-3">
                    {student.attendance}
                  </td>

                  <td className="p-3">
                    {student.cgpa}
                  </td>

                  <td className="p-3">

                    {
                      predictions[student.id]?.prediction
                      || "Predicting..."
                    }

                  </td>

                  <td className="p-3 flex gap-3">

                    <button
                      onClick={() => startEdit(student)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteStudent(student.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))
            }

          </tbody>

        </table>

      </div>

    </div>

  )
}

export default Dashboard