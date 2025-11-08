import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { io } from 'socket.io-client'

export default function StaffPortal() {
  const [activeTab, setActiveTab] = useState('assigned')
  const [tasks, setTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [proofFileById, setProofFileById] = useState({})
  const [profile, setProfile] = useState(null)
  const [teamInfo, setTeamInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTasks()
    fetchProfile()
  }, [])

  // Socket notifications for staff
  useEffect(() => {
    if (!user) return
    const socket = io('http://localhost:4002')
    const channel = `user:${user.id}:notification`
    socket.on(channel, (data) => {
      setNotifications(prev => [{ id: Date.now(), ...data }, ...prev])
      // Refresh tasks on assignment
      if (data.type === 'task_assigned') {
        fetchTasks()
      }
    })
    return () => socket.disconnect()
  }, [user])

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/complaints')
      setTasks(data.filter(c => c.status === 'open' || c.status === 'in_progress'))
      setCompletedTasks(data.filter(c => c.status === 'resolved'))
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile')
      setProfile(data)
      if (data.teamName) {
        try {
          const teamsResponse = await api.get('/teams')
          const match = teamsResponse.data.find(t => t.name === data.teamName)
          setTeamInfo(match || null)
        } catch (err) {
          console.warn('Failed to fetch teams for staff:', err)
          setTeamInfo(null)
        }
      }
    } catch (err) {
      console.error('Failed to fetch staff profile:', err)
    }
  }

  const handleComplete = async (id) => {
    try {
      // Enforce proof upload before resolve
      if (!proofFileById[id]) {
        alert('Please upload a proof photo before resolving the task.')
        return
      }
      let proofImageUrl = null
      const file = proofFileById[id]
      if (file) {
        const form = new FormData()
        form.append('image', file)
        const { data } = await api.post('/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } })
        proofImageUrl = data.url
      }
      await api.post(`/complaints/${id}/resolve`, { proofImageUrl })
      fetchTasks()
      setProofFileById(prev => {
        const updated = { ...prev }
        delete updated[id]
        return updated
      })
    } catch (err) {
      alert('Failed to complete task')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notifications Banner */}
      {notifications.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                🔔 {notifications[0].message}
              </div>
              <button className="text-blue-700 text-sm" onClick={() => setNotifications(prev => prev.slice(1))}>Dismiss</button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-green-600 flex items-center gap-2">
            <span>🌱</span> SmartWaste
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1">
              <span>🏠</span> Home
            </Link>
            <Link to="/report" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1">
              <span>👤</span> Citizen Portal
            </Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1">
              <span>⚙️</span> Admin Dashboard
            </Link>
            <Link to="/staff" className="text-green-600 bg-green-50 px-4 py-2 rounded-lg font-semibold flex items-center gap-1">
              <span>👨‍💼</span> Staff Panel
            </Link>
            {user && (
              <Link to="/staff/profile" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1">
                <span>👤</span> Profile
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-64 flex items-center justify-center text-white" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="absolute inset-0 bg-orange-900/80 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Staff Panel</h1>
          <p className="text-xl text-orange-100">
            Manage your assigned tasks, update completion status, and report new issues from the field.
          </p>
        </div>
      </section>

      {/* Team Info Card */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                👥
              </div>
              <div>
                <div className="font-bold text-xl text-gray-800">
                  {profile?.teamName || 'Team not assigned'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Members: {teamInfo?.members?.length ?? 0} (target 3-6)
                </div>
                {teamInfo?.members?.length ? (
                  <div className="text-xs text-gray-500 mt-1">
                    {teamInfo.members.slice(0, 6).map(m => m.name).filter(Boolean).join(', ') || 'Members hidden'}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 mt-1">Ask admin to assign teammates</div>
                )}
                {/* Contact Details */}
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  {teamInfo?.supervisorName ? (
                    <div>👤 Supervisor: <span className="font-medium text-gray-800">{teamInfo.supervisorName}</span></div>
                  ) : null}
                  {teamInfo?.contactPhone ? (
                    <div>📞 Phone: <a href={`tel:${teamInfo.contactPhone}`} className="text-blue-600 hover:underline">{teamInfo.contactPhone}</a></div>
                  ) : null}
                  {teamInfo?.contactEmail ? (
                    <div>✉️ Email: <a href={`mailto:${teamInfo.contactEmail}`} className="text-blue-600 hover:underline">{teamInfo.contactEmail}</a></div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-600 font-semibold text-lg">{completedTasks.length} Completed</div>
              <div className="text-orange-600 font-semibold text-lg">{tasks.length} Remaining</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 items-center justify-between">
            <div className="flex gap-1">
              <TabButton active={activeTab === 'assigned'} onClick={() => setActiveTab('assigned')} icon="☑️" label="Assigned Tasks" />
              <TabButton active={activeTab === 'completed'} onClick={() => setActiveTab('completed')} icon="✅" label="Completed Tasks" />
              <TabButton active={activeTab === 'report'} onClick={() => setActiveTab('report')} icon="⚠️" label="Report Issue" />
              <TabButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon="📅" label="Schedule" />
            </div>
            <button 
              onClick={() => setActiveTab('report')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
            >
              <span>➕</span> Report New Issue
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'assigned' && (
          <AssignedTasksTab 
            tasks={tasks} 
            onComplete={handleComplete} 
            onProofSelect={(id, file) => setProofFileById(prev => ({ ...prev, [id]: file }))}
            proofFileById={proofFileById}
          />
        )}

        {activeTab === 'completed' && (
          <CompletedTasksTab tasks={completedTasks} />
        )}

        {activeTab === 'report' && (
          <ReportIssueTab />
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab />
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 flex items-center gap-2 font-medium transition ${
        active
          ? 'text-white bg-orange-600 rounded-t-lg'
          : 'text-gray-600 hover:text-orange-600'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function AssignedTasksTab({ tasks, onComplete, onProofSelect, proofFileById }) {
  const getLocationName = (task, index) => {
    if (task.title?.includes('Overflowing')) return 'Main Street & 5th Avenue'
    if (task.title?.includes('Damaged') || task.title?.includes('Broken')) return 'Central Park West'
    return ['Main Street & 5th Avenue', 'Central Park West', 'Industrial District'][index % 3]
  }

  const getTaskId = (task, index) => {
    if (task._id) {
      const id = task._id.toString().slice(-6)
      const num = parseInt(id.slice(-3), 16) % 1000
      return `#WM${String(num).padStart(3, '0')}`
    }
    return `#WM${String(index + 1).padStart(3, '0')}`
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Assigned Tasks ({tasks.length})</h2>
      <div className="space-y-4">
        {tasks.map((task, i) => (
          <div key={task._id || i} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-gray-800">{getTaskId(task, i)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    task.priority === 'High' ? 'bg-red-100 text-red-700' :
                    task.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {task.priority?.toLowerCase() || 'medium'} priority
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                    {task.category?.toLowerCase() || 'garbage'}
                  </span>
                </div>
                <div className="font-semibold text-gray-800 mb-2">{task.title}</div>
                <div className="text-sm text-gray-600 mb-3">{task.description}</div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">📍 {getLocationName(task, i)}</span>
                  <span className="flex items-center gap-1">🕐 Assigned: 08:30 AM</span>
                  <span className="flex items-center gap-1">👤 Reported by: {typeof task.userId === 'object' ? (task.userId?.name || 'User') : 'User'}</span>
                  <span className="flex items-center gap-1">⏱️ Est. Duration: {i === 0 ? '30 min' : '45 min'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <label className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded text-sm hover:bg-blue-100 transition flex items-center gap-2 cursor-pointer whitespace-nowrap">
                  <span>📷</span> Upload Proof
                  <input type="file" accept="image/*" className="hidden" onChange={e=>{
                    const file = e.target.files?.[0]
                    if (file && onProofSelect) onProofSelect(task._id, file)
                  }} />
                </label>
                {proofFileById?.[task._id] && (
                  <span className="text-xs text-gray-500 truncate max-w-[160px]">Selected: {proofFileById[task._id].name}</span>
                )}
                <button 
                  onClick={() => onComplete(task._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition whitespace-nowrap"
                >
                  ✓ Mark Complete
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition flex items-center gap-1 whitespace-nowrap">
                  <span>🧭</span> Navigate
                </button>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-lg">
            No assigned tasks
          </div>
        )}
      </div>
    </div>
  )
}

function CompletedTasksTab({ tasks }) {
  const getLocationName = (task, index) => {
    if (task.title?.includes('Broken') || task.title?.includes('recycling')) return 'Central Park East'
    if (task.title?.includes('Illegal') || task.title?.includes('dumping')) return 'Industrial District'
    return ['Central Park East', 'Industrial District'][index % 2]
  }

  const getTaskId = (task, index) => {
    if (task._id) {
      const id = task._id.toString().slice(-6)
      const num = parseInt(id.slice(-3), 16) % 1000
      return `#WM${String(num).padStart(3, '0')}`
    }
    return `#WM${String(index + 2).padStart(3, '0')}`
  }

  const getCompletionTime = (task, index) => {
    if (task.updatedAt) {
      const date = new Date(task.updatedAt)
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }
    return ['07:45 AM', '09:15 AM'][index % 2]
  }

  const getDuration = (task, index) => {
    return ['25 min', '40 min'][index % 2]
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span className="text-green-600">✅</span> Completed Tasks ({tasks.length})
      </h2>
      <div className="space-y-4">
        {tasks.map((task, i) => (
          <div key={task._id || i} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-gray-800">{getTaskId(task, i)}</span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                    Completed
                  </span>
                </div>
                <div className="font-semibold text-gray-800 mb-2">{task.title}</div>
                <div className="text-sm text-gray-600 mb-3">{task.description}</div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">📍 {getLocationName(task, i)}</span>
                  <span className="flex items-center gap-1">🕐 Completed: {getCompletionTime(task, i)}</span>
                  <span className="flex items-center gap-1">⏱️ Duration: {getDuration(task, i)}</span>
                <span className="flex items-center gap-1">👤 Reported by: {typeof task.userId === 'object' ? (task.userId?.name || 'User') : 'User'}</span>
                </div>
              </div>
            {task.proofImageUrl ? (
              <a
                href={task.proofImageUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition flex items-center gap-1 ml-4 whitespace-nowrap"
              >
                <span>📷</span> View Proof
              </a>
            ) : (
              <div className="text-xs text-gray-400 ml-4">No proof uploaded</div>
            )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-lg">
            No completed tasks
          </div>
        )}
      </div>
    </div>
  )
}

function ReportIssueTab() {
  const [issueType, setIssueType] = useState('Bin Overflow')
  const [location, setLocation] = useState('Downtown Area')
  const [priority, setPriority] = useState('Medium')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/staff/login')
      return
    }
    setLoading(true)
    try {
      let latitude = 0
      let longitude = 0
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
          })
          latitude = position.coords.latitude
          longitude = position.coords.longitude
        } catch (err) {
          console.warn('Location error:', err)
        }
      }
      
      await api.post('/complaints', {
        title: issueType,
        description,
        category: issueType,
        priority,
        longitude,
        latitude
      })
      alert('Issue reported successfully!')
      setDescription('')
    } catch (err) {
      alert('Failed to report issue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-orange-600">⚠️</span> Report New Issue
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
          <select
            value={issueType}
            onChange={e => setIssueType(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
          >
            <option>Bin Overflow</option>
            <option>Broken Container</option>
            <option>Illegal Dumping</option>
            <option>Hazardous Waste</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input type="radio" name="priority" value="Low" checked={priority === 'Low'} onChange={e => setPriority(e.target.value)} className="mr-2" />
              Low
            </label>
            <label className="flex items-center">
              <input type="radio" name="priority" value="Medium" checked={priority === 'Medium'} onChange={e => setPriority(e.target.value)} className="mr-2" />
              Medium
            </label>
            <label className="flex items-center">
              <input type="radio" name="priority" value="High" checked={priority === 'High'} onChange={e => setPriority(e.target.value)} className="mr-2" />
              High
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Detailed description of the issue..."
            rows="4"
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photos</label>
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition">
            <span className="text-4xl block mb-2">📷</span>
            <span className="text-gray-600">Click to upload photos</span>
            <span className="block text-sm text-gray-500 mt-1">Multiple photos allowed</span>
            <input type="file" accept="image/*" multiple className="hidden" />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading || !user}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition"
        >
          <span>✈️</span> Submit Issue Report
        </button>
      </form>
    </div>
  )
}

function ScheduleTab() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-orange-600">📅</span> Today's Schedule
        </h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Shift Start</div>
            <div className="font-semibold text-gray-800">06:00 AM</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Shift End</div>
            <div className="font-semibold text-gray-800">02:00 PM</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Break Time</div>
            <div className="font-semibold text-gray-800">12:00 PM - 12:30 PM</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Current Status</div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              On Duty
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-green-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700 transition">
            <span>🕐</span> Clock In/Out
          </button>
          <button className="bg-orange-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition">
            <span>⏸️</span> Start Break
          </button>
          <button className="bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <span>📍</span> Update Location
          </button>
          <button className="bg-purple-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition">
            <span>📞</span> Contact Supervisor
          </button>
        </div>
      </div>
    </div>
  )
}

