import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { saveAs } from "file-saver"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"

const API = import.meta.env.VITE_API_URL || "https://ai-student-analytics.onrender.com"

function Dashboard() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [csvFile, setCsvFile] = useState(null)
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: "", reg_no: "", department: "", attendance: "", cgpa: ""
  })

  useEffect(() => { fetchStudents() }, [])

  useEffect(() => {
    students.forEach((student) => { predictRisk(student) })
  }, [students])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents(response.data)
    } catch (err) {
      setError("Failed to fetch students. Backend may be starting up — try again in 30 seconds.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const addStudent = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(`${API}/students`, {
        ...formData,
        attendance: parseFloat(formData.attendance),
        cgpa: parseFloat(formData.cgpa)
      }, { headers: { Authorization: `Bearer ${token}` } })
      fetchStudents()
      resetForm()
    } catch (err) {
      alert("Failed to add student. Please try again.")
    }
  }

  const deleteStudent = async (id) => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API}/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchStudents()
    } catch (err) {
      alert("Failed to delete student.")
    }
  }

  const startEdit = (student) => {
    setEditingId(student.id)
    setFormData({
      name: student.name, reg_no: student.reg_no,
      department: student.department,
      attendance: student.attendance, cgpa: student.cgpa
    })
  }

  const updateStudent = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(`${API}/students/${editingId}`, {
        ...formData,
        attendance: parseFloat(formData.attendance),
        cgpa: parseFloat(formData.cgpa)
      }, { headers: { Authorization: `Bearer ${token}` } })
      fetchStudents()
      setEditingId(null)
      resetForm()
    } catch (err) {
      alert("Failed to update student.")
    }
  }

  const resetForm = () => {
    setFormData({ name: "", reg_no: "", department: "", attendance: "", cgpa: "" })
  }

  const uploadCSV = async () => {
    if (!csvFile) { alert("Please select a CSV file"); return }
    try {
      const token = localStorage.getItem("token")
      const fd = new FormData()
      fd.append("file", csvFile)
      await axios.post(`${API}/upload-csv`, fd, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
      })
      fetchStudents()
      alert("CSV uploaded successfully!")
    } catch (err) {
      alert("CSV upload failed.")
    }
  }

  const exportCSV = () => {
    const headers = ["Name", "Register No", "Department", "Attendance", "CGPA"]
    const rows = students.map((s) => [s.name, s.reg_no, s.department, s.attendance, s.cgpa])
    let csv = headers.join(",") + "\n"
    rows.forEach((row) => { csv += row.join(",") + "\n" })
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, "students_report.csv")
  }

  const predictRisk = async (student) => {
    try {
      const response = await axios.post(`${API}/predict`, {
        attendance: student.attendance, cgpa: student.cgpa
      })
      setPredictions((prev) => ({ ...prev, [student.id]: response.data }))
    } catch (error) {
      console.log("Prediction error for student", student.id)
    }
  }

  const getRecommendation = (student) => {
    if (student.cgpa < 7 && student.attendance < 75)
      return "Increase attendance above 80%, attend tutoring sessions, and practice DSA daily."
    if (student.cgpa >= 7 && student.cgpa < 8.5)
      return "Focus on coding practice, mock tests, and project development."
    return "Apply for internships, research programs, hackathons, and competitive coding contests."
  }

  const riskData = [
    { name: "High Risk", value: students.filter(s => s.cgpa < 7 || s.attendance < 75).length },
    { name: "Low Risk",  value: students.filter(s => s.cgpa >= 7 && s.attendance >= 75).length }
  ]
  const COLORS = ["#ef4444", "#22c55e"]

  const logout = () => { localStorage.removeItem("token"); navigate("/") }

  const bg = darkMode ? "min-h-screen bg-gray-900 text-white p-6 md:p-10" : "min-h-screen bg-gray-100 p-6 md:p-10"
  const card = "bg-white text-black p-6 rounded-2xl shadow mb-8"

  return (
    <div className={bg}>
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl font-bold">AI Student Analytics Dashboard</h1>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm">Export CSV</button>
          <button onClick={() => setDarkMode(!darkMode)} className="bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm">{darkMode ? "Light Mode" : "Dark Mode"}</button>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm">Logout</button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchStudents} className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm">Retry</button>
        </div>
      )}

      {/* ADD/EDIT STUDENT */}
      <div className={card}>
        <h2 className="text-xl font-bold mb-5">{editingId ? "Edit Student" : "Add Student"}</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {["name","reg_no","department","attendance","cgpa"].map((field) => (
            <input
              key={field}
              type={["attendance","cgpa"].includes(field) ? "number" : "text"}
              name={field}
              placeholder={field.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}
              value={formData[field]}
              onChange={handleChange}
              className="p-3 border rounded-lg text-sm"
            />
          ))}
        </div>
        {editingId ? (
          <div className="flex gap-3 mt-5">
            <button onClick={updateStudent} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg">Update</button>
            <button onClick={() => { setEditingId(null); resetForm() }} className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2.5 rounded-lg">Cancel</button>
          </div>
        ) : (
          <button onClick={addStudent} className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg">Add Student</button>
        )}
      </div>

      {/* CSV UPLOAD */}
      <div className={card}>
        <h2 className="text-xl font-bold mb-4">Upload Student CSV</h2>
        <p className="text-sm text-gray-500 mb-4">CSV columns: name, reg_no, department, attendance, cgpa</p>
        <div className="flex gap-4 items-center flex-wrap">
          <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="text-sm" />
          <button onClick={uploadCSV} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg">Upload CSV</button>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading students — backend may be waking up (30s)...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={card.replace("mb-8","")+" text-center"}>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{students.length}</p>
            </div>
            <div className={card.replace("mb-8","")+" text-center"}>
              <p className="text-sm text-gray-500">Average CGPA</p>
              <p className="text-4xl font-bold text-green-600 mt-2">
                {students.length > 0 ? (students.reduce((a,s)=>a+s.cgpa,0)/students.length).toFixed(2) : 0}
              </p>
            </div>
            <div className={card.replace("mb-8","")+" text-center"}>
              <p className="text-sm text-gray-500">Avg Attendance</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">
                {students.length > 0 ? (students.reduce((a,s)=>a+s.attendance,0)/students.length).toFixed(1) : 0}%
              </p>
            </div>
            <div className={card.replace("mb-8","")+" text-center"}>
              <p className="text-sm text-gray-500">High Risk</p>
              <p className="text-4xl font-bold text-red-600 mt-2">
                {students.filter(s=>s.cgpa<7||s.attendance<75).length}
              </p>
            </div>
          </div>

          {/* TOP / AT-RISK */}
          {students.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className={card.replace("mb-8","")}>
                <h2 className="text-lg font-bold mb-3">🏆 Top Performer</h2>
                <p className="text-xl font-semibold text-green-600">
                  {students.reduce((p,c)=>p.cgpa>c.cgpa?p:c).name}
                </p>
                <p className="text-sm text-gray-500 mt-1">CGPA: {students.reduce((p,c)=>p.cgpa>c.cgpa?p:c).cgpa}</p>
              </div>
              <div className={card.replace("mb-8","")}>
                <h2 className="text-lg font-bold mb-3">⚠️ Most At-Risk</h2>
                <p className="text-xl font-semibold text-red-600">
                  {students.reduce((p,c)=>p.attendance<c.attendance?p:c).name}
                </p>
                <p className="text-sm text-gray-500 mt-1">Attendance: {students.reduce((p,c)=>p.attendance<c.attendance?p:c).attendance}%</p>
              </div>
            </div>
          )}

          {/* CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className={card.replace("mb-8","")}>
              <h2 className="text-lg font-bold mb-4">CGPA Distribution</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={students}>
                  <XAxis dataKey="name" tick={{fontSize:11}} />
                  <YAxis domain={[0,10]} />
                  <Tooltip />
                  <Bar dataKey="cgpa" fill="#2563eb" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={card.replace("mb-8","")}>
              <h2 className="text-lg font-bold mb-4">Risk Distribution</h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={riskData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                    {riskData.map((_,i)=>(<Cell key={i} fill={COLORS[i%COLORS.length]}/>))}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI INSIGHTS */}
          {students.length > 0 && (
            <div className={card}>
              <h2 className="text-lg font-bold mb-4">🤖 AI Insights & Recommendations</h2>
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="border rounded-xl p-4">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.department} · CGPA: {student.cgpa} · Attendance: {student.attendance}%</p>
                      </div>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        predictions[student.id]?.prediction === "HIGH RISK"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}>
                        {predictions[student.id]?.prediction || "Predicting..."}
                        {predictions[student.id] && ` · ${predictions[student.id].risk_probability}%`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{getRecommendation(student)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEARCH + TABLE */}
          <div className={card}>
            <h2 className="text-lg font-bold mb-4">Students</h2>
            <input
              type="text"
              placeholder="Search by name or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 border rounded-xl mb-5 text-sm"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b bg-gray-50">
                    <th className="p-3">Name</th>
                    <th className="p-3">Reg No</th>
                    <th className="p-3">Dept</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3">CGPA</th>
                    <th className="p-3">Risk</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .filter(s =>
                      s.name.toLowerCase().includes(search.toLowerCase()) ||
                      s.department.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((student) => (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{student.name}</td>
                        <td className="p-3 text-gray-500">{student.reg_no}</td>
                        <td className="p-3 text-gray-500">{student.department}</td>
                        <td className="p-3">
                          <span className={student.attendance < 75 ? "text-red-600 font-semibold" : "text-green-600"}>
                            {student.attendance}%
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={student.cgpa < 7 ? "text-red-600 font-semibold" : "text-green-600"}>
                            {student.cgpa}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            predictions[student.id]?.prediction === "HIGH RISK"
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}>
                            {predictions[student.id]?.prediction || "..."}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button onClick={() => startEdit(student)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs">Edit</button>
                            <button onClick={() => deleteStudent(student.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {students.length === 0 && !loading && (
                <p className="text-center text-gray-400 py-8">No students yet. Add one above or upload a CSV.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
