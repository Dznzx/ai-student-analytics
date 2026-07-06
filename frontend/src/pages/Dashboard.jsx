import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { saveAs } from "file-saver"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"
import api from "../api"

function Dashboard() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState("")
  const [darkMode, setDarkMode] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [csvFile, setCsvFile] = useState(null)
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: "", reg_no: "", department: "", attendance: "", cgpa: ""
  })
  const [toasts, setToasts] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")
  const [departmentFilter, setDepartmentFilter] = useState("All")
  const [selectedIds, setSelectedIds] = useState([])
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [whatIfActive, setWhatIfActive] = useState(false)
  const [whatIfValues, setWhatIfValues] = useState({ attendance: 0, cgpa: 0 })
  const [whatIfResult, setWhatIfResult] = useState(null)
  const [whatIfLoading, setWhatIfLoading] = useState(false)
  const [studentHistory, setStudentHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [alertsSending, setAlertsSending] = useState(false)

  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Reset the what-if simulator and fetch trend history whenever a
  // different student's detail modal is opened.
  useEffect(() => {
    if (selectedStudent) {
      setWhatIfValues({ attendance: selectedStudent.attendance, cgpa: selectedStudent.cgpa })
      setWhatIfActive(false)
      setWhatIfResult(null)
      fetchHistory(selectedStudent.id)
    } else {
      setStudentHistory([])
    }
  }, [selectedStudent])

  const fetchHistory = async (studentId) => {
    setHistoryLoading(true)
    try {
      const response = await api.get(`/students/${studentId}/history`)
      setStudentHistory(response.data)
    } catch (err) {
      setStudentHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (!whatIfActive || !selectedStudent) return
    setWhatIfLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const response = await api.post("/predict", {
          attendance: whatIfValues.attendance, cgpa: whatIfValues.cgpa
        })
        setWhatIfResult(response.data)
      } catch (err) {
        setWhatIfResult(null)
      } finally {
        setWhatIfLoading(false)
      }
    }, 350)
    return () => clearTimeout(timeout)
  }, [whatIfValues, whatIfActive, selectedStudent])

  useEffect(() => { fetchStudents() }, [])

  useEffect(() => {
    students.forEach((student) => { predictRisk(student) })
  }, [students])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get("/students")
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
      await api.post("/students", {
        ...formData,
        attendance: parseFloat(formData.attendance),
        cgpa: parseFloat(formData.cgpa)
      })
      fetchStudents()
      resetForm()
      addToast("Student added successfully.", "success")
    } catch (err) {
      addToast("Failed to add student. Please try again.", "error")
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const toggleSelectAll = (visibleList) => {
    const visibleIds = visibleList.map((s) => s.id)
    const allSelected = visibleIds.every((id) => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)))
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...visibleIds])])
    }
  }

  const bulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/students/${id}`)))
      addToast(`Deleted ${selectedIds.length} student${selectedIds.length > 1 ? "s" : ""}.`, "success")
      setSelectedIds([])
      fetchStudents()
    } catch (err) {
      if (err.response?.status === 403) {
        addToast("Admin access required to delete students.", "error")
      } else {
        addToast("Some students could not be deleted.", "error")
      }
    } finally {
      setConfirmBulkDelete(false)
    }
  }

  const bulkExport = () => {
    const selected = students.filter((s) => selectedIds.includes(s.id))
    exportCSV(selected, "selected_students.csv")
  }

  const deleteStudent = async (id) => {
    try {
      await api.delete(`/students/${id}`)
      fetchStudents()
      addToast("Student deleted.", "success")
    } catch (err) {
      if (err.response?.status === 403) {
        addToast("Admin access required to delete students.", "error")
      } else {
        addToast("Failed to delete student.", "error")
      }
    } finally {
      setConfirmDelete(null)
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
      await api.put(`/students/${editingId}`, {
        ...formData,
        attendance: parseFloat(formData.attendance),
        cgpa: parseFloat(formData.cgpa)
      })
      fetchStudents()
      setEditingId(null)
      resetForm()
      addToast("Student updated successfully.", "success")
    } catch (err) {
      addToast("Failed to update student.", "error")
    }
  }

  const resetForm = () => {
    setFormData({ name: "", reg_no: "", department: "", attendance: "", cgpa: "" })
  }

  const uploadCSV = async () => {
    if (!csvFile) { addToast("Please select a CSV file.", "error"); return }
    try {
      const fd = new FormData()
      fd.append("file", csvFile)
      await api.post("/upload-csv", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      fetchStudents()
      addToast("CSV uploaded successfully!", "success")
    } catch (err) {
      addToast("CSV upload failed.", "error")
    }
  }

  const exportCSV = (list = students, filename = "students_report.csv") => {
    const headers = ["Name", "Register No", "Department", "Attendance", "CGPA"]
    const rows = list.map((s) => [s.name, s.reg_no, s.department, s.attendance, s.cgpa])
    let csv = headers.join(",") + "\n"
    rows.forEach((row) => { csv += row.join(",") + "\n" })
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, filename)
  }

  const predictRisk = async (student) => {
    try {
      const response = await api.post("/predict", {
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

  const sendRiskAlerts = async () => {
    setAlertsSending(true)
    try {
      const response = await api.post("/alerts/send-high-risk")
      addToast(response.data.message, "success")
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to send risk alerts.", "error")
    } finally {
      setAlertsSending(false)
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getRiskValue = (student) => (predictions[student.id]?.prediction === "HIGH RISK" ? 1 : 0)

  const sortStudents = (list) => {
    if (!sortField) return list
    const sorted = [...list].sort((a, b) => {
      let valA, valB
      if (sortField === "risk") { valA = getRiskValue(a); valB = getRiskValue(b) }
      else { valA = a[sortField]; valB = b[sortField] }
      if (typeof valA === "string") { valA = valA.toLowerCase(); valB = valB.toLowerCase() }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1
      if (valA > valB) return sortDirection === "asc" ? 1 : -1
      return 0
    })
    return sorted
  }

  const departments = ["All", ...new Set(students.map((s) => s.department).filter(Boolean))]

  const departmentStats = [...new Set(students.map((s) => s.department).filter(Boolean))].map((dept) => {
    const deptStudents = students.filter((s) => s.department === dept)
    const avgCgpa = deptStudents.reduce((a, s) => a + s.cgpa, 0) / deptStudents.length
    const avgAttendance = deptStudents.reduce((a, s) => a + s.attendance, 0) / deptStudents.length
    const highRisk = deptStudents.filter((s) => s.cgpa < 7 || s.attendance < 75).length
    return { department: dept, avgCgpa: +avgCgpa.toFixed(2), avgAttendance: +avgAttendance.toFixed(1), highRisk }
  })

  const riskData = [
    { name: "High Risk", value: students.filter(s => s.cgpa < 7 || s.attendance < 75).length },
    { name: "Low Risk",  value: students.filter(s => s.cgpa >= 7 && s.attendance >= 75).length }
  ]
  const COLORS = ["#f87171", "#4ade80"]

  const logout = () => { localStorage.removeItem("token"); navigate("/") }

  const visibleStudents = sortStudents(
    students
      .filter(s => departmentFilter === "All" || s.department === departmentFilter)
      .filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase())
      )
  )

  const wrap = `v-dashboard ${darkMode ? "" : "light"} p-6 md:p-10`
  const card = "v-dash-card mb-8"

  const historyChartData = studentHistory.map((h) => ({
    date: new Date(h.recorded_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    attendance: h.attendance,
    cgpa: h.cgpa
  }))

  return (
    <div className={wrap}>
      {/* TOASTS */}
      <div className="v-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`v-toast ${t.type === "error" ? "v-toast-error" : "v-toast-success"}`}>
            <span>{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="v-toast-close">✕</button>
          </div>
        ))}
      </div>

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold v-title">
          AI Student Analytics <span className="v-gradient-text">Dashboard</span>
        </h1>
        <div className="flex flex-wrap gap-3">
          <button onClick={sendRiskAlerts} disabled={alertsSending} className="v-btn-purple">
            {alertsSending ? "Sending..." : "📧 Send Risk Alerts"}
          </button>
          <button onClick={exportCSV} className="v-btn-success">Export CSV</button>
          <button onClick={() => setDarkMode(!darkMode)} className="v-btn-secondary">{darkMode ? "Light Mode" : "Dark Mode"}</button>
          <button onClick={logout} className="v-btn-danger">Logout</button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="v-alert-error mb-6 flex justify-between items-center flex-wrap gap-3">
          <span>{error}</span>
          <button onClick={fetchStudents} className="v-btn-danger-sm">Retry</button>
        </div>
      )}

      {/* ADD/EDIT STUDENT */}
      <div className={card}>
        <h2 className="text-xl font-bold mb-5 v-title">{editingId ? "Edit Student" : "Add Student"}</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {["name","reg_no","department","attendance","cgpa"].map((field) => (
            <input
              key={field}
              type={["attendance","cgpa"].includes(field) ? "number" : "text"}
              name={field}
              placeholder={field.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}
              value={formData[field]}
              onChange={handleChange}
              className="v-dash-input"
            />
          ))}
        </div>
        {editingId ? (
          <div className="flex gap-3 mt-5">
            <button onClick={updateStudent} className="v-btn-success">Update</button>
            <button onClick={() => { setEditingId(null); resetForm() }} className="v-btn-secondary">Cancel</button>
          </div>
        ) : (
          <button onClick={addStudent} className="v-btn-primary mt-5">Add Student</button>
        )}
      </div>

      {/* CSV UPLOAD */}
      <div className={card}>
        <h2 className="text-xl font-bold mb-4 v-title">Upload Student CSV</h2>
        <p className="text-sm v-dash-muted mb-4">CSV columns: name, reg_no, department, attendance, cgpa</p>
        <div className="flex gap-4 items-center flex-wrap">
          <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="text-sm v-dash-muted" />
          <button onClick={uploadCSV} className="v-btn-purple">Upload CSV</button>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      {loading ? (
        <div>
          <p className="text-center v-dash-muted text-sm mb-6">Loading students — backend may be waking up (30s)...</p>

          {/* stat card skeletons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map((i) => (
              <div key={i} className="v-dash-card">
                <div className="v-skel v-skel-line" style={{width:"60%", margin:"0 auto"}} />
                <div className="v-skel v-skel-line" style={{width:"40%", height:"28px", margin:"14px auto 0"}} />
              </div>
            ))}
          </div>

          {/* chart skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[1,2].map((i) => (
              <div key={i} className="v-dash-card">
                <div className="v-skel v-skel-line" style={{width:"45%", marginBottom:"18px"}} />
                <div className="v-skel" style={{height:"220px", borderRadius:"12px"}} />
              </div>
            ))}
          </div>

          {/* table skeleton */}
          <div className="v-dash-card">
            <div className="v-skel v-skel-line" style={{width:"30%", marginBottom:"18px"}} />
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="v-skel v-skel-row" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="v-dash-card text-center">
              <p className="text-sm v-dash-muted">Total Students</p>
              <p className="text-4xl font-bold mt-2" style={{color:"var(--blue)"}}>{students.length}</p>
            </div>
            <div className="v-dash-card text-center">
              <p className="text-sm v-dash-muted">Average CGPA</p>
              <p className="text-4xl font-bold mt-2" style={{color:"var(--green)"}}>
                {students.length > 0 ? (students.reduce((a,s)=>a+s.cgpa,0)/students.length).toFixed(2) : 0}
              </p>
            </div>
            <div className="v-dash-card text-center">
              <p className="text-sm v-dash-muted">Avg Attendance</p>
              <p className="text-4xl font-bold mt-2" style={{color:"var(--purple)"}}>
                {students.length > 0 ? (students.reduce((a,s)=>a+s.attendance,0)/students.length).toFixed(1) : 0}%
              </p>
            </div>
            <div className="v-dash-card text-center">
              <p className="text-sm v-dash-muted">High Risk</p>
              <p className="text-4xl font-bold mt-2" style={{color:"var(--red)"}}>
                {students.filter(s=>s.cgpa<7||s.attendance<75).length}
              </p>
            </div>
          </div>

          {/* TOP / AT-RISK */}
          {students.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="v-dash-card">
                <h2 className="text-lg font-bold mb-3 v-title">🏆 Top Performer</h2>
                <p className="text-xl font-semibold" style={{color:"var(--green)"}}>
                  {students.reduce((p,c)=>p.cgpa>c.cgpa?p:c).name}
                </p>
                <p className="text-sm v-dash-muted mt-1">CGPA: {students.reduce((p,c)=>p.cgpa>c.cgpa?p:c).cgpa}</p>
              </div>
              <div className="v-dash-card">
                <h2 className="text-lg font-bold mb-3 v-title">⚠️ Most At-Risk</h2>
                <p className="text-xl font-semibold" style={{color:"var(--red)"}}>
                  {students.reduce((p,c)=>p.attendance<c.attendance?p:c).name}
                </p>
                <p className="text-sm v-dash-muted mt-1">Attendance: {students.reduce((p,c)=>p.attendance<c.attendance?p:c).attendance}%</p>
              </div>
            </div>
          )}

          {/* CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="v-dash-card">
              <h2 className="text-lg font-bold mb-4 v-title">CGPA Distribution</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={students}>
                  <XAxis dataKey="name" tick={{fontSize:11, fill:"#7a82a0"}} />
                  <YAxis domain={[0,10]} tick={{fill:"#7a82a0"}} />
                  <Tooltip contentStyle={{background:"#080c18",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,color:"#eef0f8"}} />
                  <Bar dataKey="cgpa" fill="#5b7fff" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="v-dash-card">
              <h2 className="text-lg font-bold mb-4 v-title">Risk Distribution</h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={riskData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                    {riskData.map((_,i)=>(<Cell key={i} fill={COLORS[i%COLORS.length]}/>))}
                  </Pie>
                  <Tooltip contentStyle={{background:"#080c18",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,color:"#eef0f8"}} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DEPARTMENT OVERVIEW */}
          {departmentStats.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="v-dash-card">
                <h2 className="text-lg font-bold mb-4 v-title">Avg CGPA by Department</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={departmentStats}>
                    <XAxis dataKey="department" tick={{fontSize:11, fill:"#7a82a0"}} />
                    <YAxis domain={[0,10]} tick={{fill:"#7a82a0"}} />
                    <Tooltip contentStyle={{background:"#080c18",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,color:"#eef0f8"}} />
                    <Bar dataKey="avgCgpa" fill="#8b5cf6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="v-dash-card">
                <h2 className="text-lg font-bold mb-4 v-title">Avg Attendance by Department</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={departmentStats}>
                    <XAxis dataKey="department" tick={{fontSize:11, fill:"#7a82a0"}} />
                    <YAxis domain={[0,100]} tick={{fill:"#7a82a0"}} />
                    <Tooltip contentStyle={{background:"#080c18",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,color:"#eef0f8"}} />
                    <Bar dataKey="avgAttendance" fill="#22d3ee" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* AI INSIGHTS */}
          {students.length > 0 && (
            <div className={card}>
              <h2 className="text-lg font-bold mb-4 v-title">🤖 AI Insights & Recommendations</h2>
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="v-dash-border-t rounded-xl p-4" style={{border:"1px solid var(--d-border)"}}>
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm v-dash-muted">{student.department} · CGPA: {student.cgpa} · Attendance: {student.attendance}%</p>
                      </div>
                      <span className={predictions[student.id]?.prediction === "HIGH RISK" ? "v-badge-risk" : "v-badge-safe"}>
                        {predictions[student.id]?.prediction || "Predicting..."}
                        {predictions[student.id] && ` · ${predictions[student.id].risk_probability}%`}
                      </span>
                    </div>
                    <p className="text-sm v-dash-muted mt-2">{getRecommendation(student)}</p>
                    {predictions[student.id]?.explanation?.message && (
                      <p className="text-xs mt-2" style={{color:"var(--cyan)"}}>
                        🔍 {predictions[student.id].explanation.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEARCH + TABLE */}
          <div className={card}>
            <h2 className="text-lg font-bold mb-4 v-title">Students</h2>
            <div className="flex flex-col md:flex-row gap-3 mb-5">
              <input
                type="text"
                placeholder="Search by name or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="v-dash-input flex-1"
              />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="v-dash-input md:w-52"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>
                ))}
              </select>
            </div>

            {selectedIds.length > 0 && (
              <div className="v-bulk-bar">
                <span className="text-sm">{selectedIds.length} selected</span>
                <div className="flex gap-2">
                  <button onClick={bulkExport} className="v-btn-success">Export Selected</button>
                  <button onClick={() => setConfirmBulkDelete(true)} className="v-btn-danger">Delete Selected</button>
                  <button onClick={() => setSelectedIds([])} className="v-btn-secondary">Clear</button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left v-dash-border-t v-dash-muted" style={{borderBottom:"1px solid var(--d-border)"}}>
                    <th className="p-3">
                      <input
                        type="checkbox"
                        checked={visibleStudents.length > 0 && visibleStudents.every((s) => selectedIds.includes(s.id))}
                        onChange={() => toggleSelectAll(visibleStudents)}
                      />
                    </th>
                    {[
                      { key: "name", label: "Name" },
                      { key: "reg_no", label: "Reg No" },
                      { key: "department", label: "Dept" },
                      { key: "attendance", label: "Attendance" },
                      { key: "cgpa", label: "CGPA" },
                      { key: "risk", label: "Risk" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        className="p-3 select-none"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSort(col.key)}
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          <span style={{ opacity: sortField === col.key ? 1 : 0.25, fontSize: "10px" }}>
                            {sortField === col.key && sortDirection === "desc" ? "▼" : "▲"}
                          </span>
                        </span>
                      </th>
                    ))}
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStudents
                    .map((student) => (
                      <tr
                        key={student.id}
                        className="v-dash-row"
                        style={{borderBottom:"1px solid var(--d-border)", cursor:"pointer"}}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(student.id)}
                            onChange={() => toggleSelect(student.id)}
                          />
                        </td>
                        <td className="p-3 font-medium">{student.name}</td>
                        <td className="p-3 v-dash-muted">{student.reg_no}</td>
                        <td className="p-3 v-dash-muted">{student.department}</td>
                        <td className="p-3">
                          <span style={{color: student.attendance < 75 ? "var(--red)" : "var(--green)", fontWeight: student.attendance < 75 ? 600 : 400}}>
                            {student.attendance}%
                          </span>
                        </td>
                        <td className="p-3">
                          <span style={{color: student.cgpa < 7 ? "var(--red)" : "var(--green)", fontWeight: student.cgpa < 7 ? 600 : 400}}>
                            {student.cgpa}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={predictions[student.id]?.prediction === "HIGH RISK" ? "v-badge-risk" : "v-badge-safe"}>
                            {predictions[student.id]?.prediction || "..."}
                          </span>
                        </td>
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <button onClick={() => startEdit(student)} className="v-btn-warn">Edit</button>
                            <button onClick={() => setConfirmDelete(student)} className="v-btn-danger-sm">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {students.length === 0 && !loading && (
                <p className="text-center v-dash-muted py-8">No students yet. Add one above or upload a CSV.</p>
              )}
            </div>
          </div>
        </>
      )}
      {/* CONFIRM DELETE MODAL */}
      {confirmDelete && (
        <div className="v-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="v-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2 v-title">Delete Student?</h3>
            <p className="v-dash-muted text-sm mb-6">
              This will permanently remove <span style={{color:"var(--d-text)", fontWeight:600}}>{confirmDelete.name}</span> ({confirmDelete.reg_no}) from your records. This can't be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="v-btn-secondary">Cancel</button>
              <button onClick={() => deleteStudent(confirmDelete.id)} className="v-btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM BULK DELETE MODAL */}
      {confirmBulkDelete && (
        <div className="v-modal-overlay" onClick={() => setConfirmBulkDelete(false)}>
          <div className="v-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2 v-title">Delete {selectedIds.length} Students?</h3>
            <p className="v-dash-muted text-sm mb-6">
              This will permanently remove <span style={{color:"var(--d-text)", fontWeight:600}}>{selectedIds.length}</span> selected student record{selectedIds.length > 1 ? "s" : ""}. This can't be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmBulkDelete(false)} className="v-btn-secondary">Cancel</button>
              <button onClick={bulkDelete} className="v-btn-danger">Delete All</button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div className="v-modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="v-modal" style={{maxWidth:"480px"}} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-xl font-bold v-title">{selectedStudent.name}</h3>
              <span className={predictions[selectedStudent.id]?.prediction === "HIGH RISK" ? "v-badge-risk" : "v-badge-safe"}>
                {predictions[selectedStudent.id]?.prediction || "..."}
                {predictions[selectedStudent.id] && ` · ${predictions[selectedStudent.id].risk_probability}%`}
              </span>
            </div>
            <p className="v-dash-muted text-sm mb-5">{selectedStudent.reg_no} · {selectedStudent.department}</p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="v-dash-card" style={{padding:"14px"}}>
                <p className="text-xs v-dash-muted mb-1">CGPA</p>
                <p className="text-2xl font-bold" style={{color: selectedStudent.cgpa < 7 ? "var(--red)" : "var(--green)"}}>
                  {selectedStudent.cgpa}
                </p>
                <p className="text-xs v-dash-muted mt-1">
                  Dept avg: {(departmentStats.find(d => d.department === selectedStudent.department)?.avgCgpa ?? "—")}
                </p>
              </div>
              <div className="v-dash-card" style={{padding:"14px"}}>
                <p className="text-xs v-dash-muted mb-1">Attendance</p>
                <p className="text-2xl font-bold" style={{color: selectedStudent.attendance < 75 ? "var(--red)" : "var(--green)"}}>
                  {selectedStudent.attendance}%
                </p>
                <p className="text-xs v-dash-muted mt-1">
                  Dept avg: {(departmentStats.find(d => d.department === selectedStudent.department)?.avgAttendance ?? "—")}%
                </p>
              </div>
            </div>

            {predictions[selectedStudent.id]?.explanation?.message && (
              <div className="v-dash-card mb-5" style={{padding:"14px"}}>
                <p className="text-xs v-dash-muted mb-2">🔍 Why this risk score?</p>
                <p className="text-sm">{predictions[selectedStudent.id].explanation.message}</p>
              </div>
            )}

            <div className="v-dash-card mb-5" style={{padding:"14px"}}>
              <p className="text-xs v-dash-muted mb-2">🤖 Recommendation</p>
              <p className="text-sm">{getRecommendation(selectedStudent)}</p>
            </div>

            {/* TREND HISTORY */}
            <div className="v-dash-card mb-5" style={{padding:"14px"}}>
              <p className="text-xs v-dash-muted mb-2">📈 Attendance & CGPA Trend</p>
              {historyLoading ? (
                <div className="v-skel" style={{height:"140px", borderRadius:"10px"}} />
              ) : historyChartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={historyChartData}>
                    <XAxis dataKey="date" tick={{fontSize:10, fill:"#7a82a0"}} />
                    <YAxis yAxisId="left" domain={[0,100]} tick={{fontSize:10, fill:"#7a82a0"}} width={28} />
                    <YAxis yAxisId="right" orientation="right" domain={[0,10]} tick={{fontSize:10, fill:"#7a82a0"}} width={28} />
                    <Tooltip contentStyle={{background:"#080c18",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,color:"#eef0f8", fontSize:12}} />
                    <Line yAxisId="left" type="monotone" dataKey="attendance" stroke="#22d3ee" strokeWidth={2} dot={false} name="Attendance %" />
                    <Line yAxisId="right" type="monotone" dataKey="cgpa" stroke="#8b5cf6" strokeWidth={2} dot={false} name="CGPA" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs v-dash-muted">
                  No trend yet — history builds automatically each time this student's record is edited.
                </p>
              )}
            </div>

            {/* WHAT-IF SIMULATOR */}
            <div className="v-dash-card mb-5" style={{padding:"14px"}}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs v-dash-muted">🎛️ What-if Simulator</p>
                <button
                  onClick={() => setWhatIfActive((v) => !v)}
                  className={whatIfActive ? "v-btn-purple" : "v-btn-secondary"}
                  style={{padding:"4px 12px", fontSize:"11px"}}
                >
                  {whatIfActive ? "Simulating" : "Try it"}
                </button>
              </div>

              {whatIfActive && (
                <div className="mt-3">
                  <div className="mb-4">
                    <div className="flex justify-between text-xs v-dash-muted mb-1">
                      <span>Attendance</span>
                      <span style={{color:"var(--d-text)", fontWeight:600}}>{whatIfValues.attendance}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="1"
                      value={whatIfValues.attendance}
                      onChange={(e) => setWhatIfValues((v) => ({ ...v, attendance: Number(e.target.value) }))}
                      className="v-slider"
                    />
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs v-dash-muted mb-1">
                      <span>CGPA</span>
                      <span style={{color:"var(--d-text)", fontWeight:600}}>{whatIfValues.cgpa.toFixed(1)}</span>
                    </div>
                    <input
                      type="range" min="0" max="10" step="0.1"
                      value={whatIfValues.cgpa}
                      onChange={(e) => setWhatIfValues((v) => ({ ...v, cgpa: Number(e.target.value) }))}
                      className="v-slider"
                    />
                  </div>

                  <div className="flex items-center justify-between v-dash-border-t pt-3" style={{borderTop:"1px solid var(--d-border)"}}>
                    <span className="text-xs v-dash-muted">Simulated risk</span>
                    {whatIfLoading ? (
                      <span className="text-xs v-dash-muted">Calculating...</span>
                    ) : whatIfResult ? (
                      <span className={whatIfResult.prediction === "HIGH RISK" ? "v-badge-risk" : "v-badge-safe"}>
                        {whatIfResult.prediction} · {whatIfResult.risk_probability}%
                      </span>
                    ) : (
                      <span className="text-xs v-dash-muted">—</span>
                    )}
                  </div>
                  {whatIfResult?.explanation?.message && (
                    <p className="text-xs mt-2" style={{color:"var(--cyan)"}}>🔍 {whatIfResult.explanation.message}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setSelectedStudent(null); startEdit(selectedStudent) }}
                className="v-btn-warn"
              >Edit</button>
              <button
                onClick={() => { setSelectedStudent(null); setConfirmDelete(selectedStudent) }}
                className="v-btn-danger"
              >Delete</button>
              <button onClick={() => setSelectedStudent(null)} className="v-btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
