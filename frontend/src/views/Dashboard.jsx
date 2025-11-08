import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [complaints, setComplaints] = useState([])
  const [bins, setBins] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 })
  const [notifications, setNotifications] = useState([])
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get('/complaints')
      setComplaints(data)
      setStats({
        total: data.length,
        pending: data.filter(c => c.status === 'open').length,
        inProgress: data.filter(c => c.status === 'in_progress').length,
        completed: data.filter(c => c.status === 'resolved').length
      })
    } catch (err) {
      console.error('Failed to fetch complaints:', err)
    }
  }

  const fetchBins = async () => {
    try {
      const { data } = await api.get('/bins')
      setBins(data)
    } catch (err) {
      console.error('Failed to fetch bins:', err)
    }
  }

  const fetchTeams = async () => {
    try {
      const { data } = await api.get('/teams')
      setTeams(data)
    } catch (err) {
      console.error('Failed to fetch teams:', err)
    }
  }

  const fetchData = async () => {
    try {
      await Promise.all([fetchComplaints(), fetchBins(), fetchTeams()])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/admin/login')
      return
    }
    
    const socket = io('http://localhost:4002')
    
    socket.on('complaint:new', (data) => {
      const notification = {
        id: Date.now(),
        type: 'new',
        message: `New complaint: "${data.title || 'Untitled'}"`,
        complaintId: data.id
      }
      setNotifications(prev => [notification, ...prev])
      fetchComplaints()
    })
    
    socket.on('complaint:resolved', (data) => {
      const notification = {
        id: Date.now(),
        type: 'resolved',
        message: `Complaint resolved: "${data.title || 'Untitled'}"`,
        complaintId: data.id
      }
      setNotifications(prev => [notification, ...prev])
      fetchComplaints()
    })
    
    socket.on('complaint:assigned', (data) => {
      const notification = {
        id: Date.now(),
        type: 'assigned',
        message: `Complaint assigned to ${data.team || 'team'}`,
        complaintId: data.id
      }
      setNotifications(prev => [notification, ...prev])
      fetchComplaints()
    })
    // Personal channel for admin notifications (e.g., task_resolved)
    const personal = `user:${user.id}:notification`
    socket.on(personal, (data) => {
      const notification = {
        id: Date.now(),
        type: data.type || 'info',
        message: data.message,
        complaintId: data.complaintId
      }
      setNotifications(prev => [notification, ...prev])
      fetchComplaints()
    })
    
    socket.on('bin:alert', () => {
      fetchBins()
    })

    fetchData()
    
    return () => socket.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate])

  const handleResolve = async (id) => {
    try {
      await api.post(`/complaints/${id}/resolve`)
      fetchComplaints()
    } catch (err) {
      alert('Failed to resolve complaint')
    }
  }

  const handleAssign = async (id, team) => {
    try {
      await api.post(`/complaints/${id}/assign`, { team })
      fetchComplaints()
    } catch (err) {
      alert('Failed to assign complaint')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <Link to="/dashboard" className="text-green-600 bg-green-50 px-4 py-2 rounded-lg font-semibold flex items-center gap-1">
              <span>⚙️</span> Admin Dashboard
            </Link>
            {user && (
              <Link to="/admin/profile" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1">
                <span>👤</span> Profile
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-64 flex items-center justify-center text-white" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-xl text-blue-100">
            Monitor complaints, manage teams, and analyze performance data to optimize city waste management.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="📊" label="Overview" />
            <TabButton active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')} icon="📝" label="Complaints" />
            <TabButton active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon="👥" label="Staff Management" />
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon="📈" label="Analytics" />
            <TabButton active={activeTab === 'heatmap'} onClick={() => setActiveTab('heatmap')} icon="🗺️" label="Heatmap" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🔔</span> Recent Notifications
                </h3>
                <div className="space-y-2">
                  {notifications.slice(0, 5).map((notif) => (
                    <div key={notif.id} className={`border rounded-lg p-4 flex items-center justify-between ${
                      notif.type === 'resolved' ? 'bg-green-50 border-green-200' :
                      notif.type === 'new' ? 'bg-blue-50 border-blue-200' :
                      'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {notif.type === 'resolved' ? '✅' : notif.type === 'new' ? '➕' : '⚠️'}
                        </span>
                        <span className={notif.type === 'resolved' ? 'text-green-800' : notif.type === 'new' ? 'text-blue-800' : 'text-yellow-800'}>
                          {notif.message}
                        </span>
                      </div>
                      <button 
                        onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <MetricCard icon="📄" number={stats.total} label="Total Complaints" color="blue" />
              <MetricCard icon="⏰" number={stats.pending} label="Pending" color="yellow" />
              <MetricCard icon="🔄" number={stats.inProgress} label="In Progress" color="orange" />
              <MetricCard icon="✅" number={stats.completed} label="Completed Today" color="green" />
            </div>

            {/* Recent Activity & Staff Status */}
            <div className="grid lg:grid-cols-2 gap-6">
              <RecentActivity complaints={complaints.slice(0, 4)} />
              <StaffStatus teams={teams} />
            </div>
          </div>
        )}

        {activeTab === 'complaints' && (
          <ComplaintsTab 
            complaints={complaints} 
            onResolve={handleResolve}
            onAssign={handleAssign}
            teams={teams}
          />
        )}

        {activeTab === 'staff' && (
          <StaffManagementTab teams={teams} onRefresh={fetchTeams} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab complaints={complaints} />
        )}

        {activeTab === 'heatmap' && (
          <HeatmapTab complaints={complaints} />
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
          ? 'text-white bg-purple-600 rounded-t-lg'
          : 'text-gray-600 hover:text-purple-600'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function MetricCard({ icon, number, label, color }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500'
  }
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600 mb-1">{label}</div>
          <div className="text-3xl font-bold text-gray-800">{number}</div>
        </div>
        <div className={`${colorClasses[color]} text-white rounded-full p-4 text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function RecentActivity({ complaints }) {
  const activities = [
    { type: 'new', icon: '➕', text: 'New complaint reported', location: 'Main Street', time: '5 min ago' },
    { type: 'completed', icon: '✅', text: 'Task completed by Team Alpha', location: 'Central Park', time: '15 min ago' },
    { type: 'assigned', icon: '⚠️', text: 'High priority issue assigned', location: 'Industrial Zone', time: '1 hour ago' },
    { type: 'checkin', icon: '📍', text: 'Staff check-in received', location: 'Downtown', time: '2 hours ago' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-purple-600">🕐</span> Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-2xl">{activity.icon}</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">{activity.text}</div>
              <div className="text-xs text-gray-500 mt-1">
                {activity.location} • {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StaffStatus({ teams = [] }) {
  const displayTeams = teams.length > 0 ? teams.slice(0, 3) : [
    { name: 'Team Alpha', area: 'Downtown Area', status: 'Active', activeTasks: 3 },
    { name: 'Team Beta', area: 'Residential Zone', status: 'Active', activeTasks: 2 },
    { name: 'Team Gamma', area: 'Industrial Area', status: 'Break', activeTasks: 1 }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-purple-600">👥</span> Staff Status
      </h3>
      <div className="space-y-4">
        {displayTeams.map((team, i) => (
          <div key={team._id || i} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-800">{team.name}</div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                team.status === 'Active' ? 'bg-green-100 text-green-700' : 
                team.status === 'Break' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {team.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-2">📍 {team.area || 'General Area'}</div>
            <div className="text-sm text-blue-600">{team.activeTasks || 0} active tasks</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComplaintsTab({ complaints, onResolve, onAssign, teams = [] }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Complaint Management</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              const status = prompt('Filter by status (open/in_progress/resolved) or press Cancel for all:')
              if (status) {
                alert(`Filtering by status: ${status}`)
                // In a real app, you would filter the complaints here
              }
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          >
            <span>🔽</span> Filter
          </button>
          <button 
            onClick={() => {
              const csv = complaints.map(c => `${c._id},${c.title},${c.status},${c.priority || 'Medium'}`).join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'complaints.csv'
              a.click()
              alert('Complaints exported successfully!')
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          >
            <span>⬇️</span> Export
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {complaints.map(c => (
          <div key={c._id} className="border-2 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-gray-800">#{c._id.slice(-6)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    c.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                    c.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {c.status}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    c.priority === 'High' ? 'bg-red-100 text-red-700' :
                    c.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {c.priority || 'medium'}
                  </span>
                </div>
                <div className="font-semibold text-gray-800 mb-1">{c.title}</div>
                <div className="text-xs text-gray-500 mb-2">Reported by: {typeof c.userId === 'object' ? (c.userId?.name || 'User') : 'User'}</div>
                <div className="text-sm text-gray-600 mb-2">{c.description}</div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>📍 {c.location?.coordinates?.[1]?.toFixed(4) || 'N/A'}, {c.location?.coordinates?.[0]?.toFixed(4) || 'N/A'}</span>
                  <span>📅 {new Date(c.createdAt).toLocaleDateString()}</span>
                  <span>👤 {typeof c.userId === 'object' ? (c.userId?.name || 'Unknown') : (c.userId || 'Unknown')}</span>
                  <span>👥 Unassigned</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button 
                  onClick={() => {
                    alert(`Complaint Details:\n\nTitle: ${c.title}\nDescription: ${c.description || 'N/A'}\nStatus: ${c.status}\nPriority: ${c.priority || 'Medium'}\nCategory: ${c.category || 'N/A'}`)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
                >
                  View Details
                </button>
                {c.status === 'open' && (
                  <>
                    <button 
                      onClick={async () => {
                        // Get available teams (excluding break teams)
                        const availableTeams = teams.filter(t => t.status !== 'Break')
                        if (availableTeams.length === 0) {
                          alert('No available teams. All teams are on break.')
                          return
                        }
                        const teamNames = availableTeams.map(t => t.name).join('\n')
                        const selectedTeam = prompt(`Select team to assign:\n\n${teamNames}`)
                        if (selectedTeam) {
                          try {
                            await onAssign(c._id, selectedTeam)
                            alert(`Complaint assigned to ${selectedTeam}`)
                          } catch (err) {
                            alert(err.response?.data?.error || 'Failed to assign team')
                          }
                        }
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition"
                    >
                      Assign Team
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to resolve this complaint?')) {
                          onResolve(c._id)
                          alert('Complaint resolved! Notification sent to citizen.')
                        }
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition"
                    >
                      Resolve
                    </button>
                  </>
                )}
                {c.status === 'in_progress' && (
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to resolve this complaint?')) {
                        onResolve(c._id)
                        alert('Complaint resolved! Notification sent to citizen.')
                      }
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="text-center py-12 text-gray-500">No complaints found</div>
        )}
      </div>
    </div>
  )
}

function StaffManagementTab({ teams = [], onRefresh }) {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-purple-600">👥</span> Staff Management
        </h2>
        <button 
          onClick={async () => {
            const teamName = prompt('Enter team name:')
            if (teamName) {
              const area = prompt('Enter team area:') || 'General Area'
              try {
                await api.post('/teams', { name: teamName, area })
                alert(`Team "${teamName}" added successfully!`)
                if (onRefresh) onRefresh()
              } catch (err) {
                alert(err.response?.data?.error || 'Failed to add team')
              }
            }
          }}
          className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
        >
          <span>➕</span> Add Team
        </button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {teams.map((team, i) => (
          <div key={i} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                👥
              </div>
              <div>
                <div className="font-bold text-gray-800">{team.name}</div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  team.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {team.status}
                </span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {team.members && team.members.length > 0 ? (
                team.members.map((member, j) => (
                  <div key={member._id || j} className="flex items-center gap-2 text-sm text-gray-600">
                    <span>👤</span> {member.name || member}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic">No members assigned</div>
              )}
            </div>
            <div className="space-y-2 mb-4">
              <div className="text-sm">
                <span className="text-blue-600 font-semibold">{team.activeTasks}</span> Active Tasks
              </div>
              <div className="text-sm">
                <span className="text-green-600 font-semibold">{team.completed}</span> Completed Today
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-4">📍 {team.area}</div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  alert(`Contacting ${team.name}...\n\nTeam Members:\n${team.members.join('\n')}\n\nArea: ${team.area}`)
                }}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition"
              >
                Contact
              </button>
              <button 
                onClick={() => {
                  navigate('/tracking')
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300 transition"
              >
                Track
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsTab({ complaints }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Performance Analytics</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Complaint Trends</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📈</div>
              <p>Chart showing complaint trends over time</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Resolution Time</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>Average resolution time by category</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Team Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Team Alpha</span>
                <span className="text-green-600 font-semibold">5/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Team Beta</span>
                <span className="text-green-600 font-semibold">7/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Team Gamma</span>
                <span className="text-green-600 font-semibold">4/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Response Time</span>
              <span className="text-2xl font-bold text-green-600">2.3 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Satisfaction Rate</span>
              <span className="text-2xl font-bold text-green-600">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Staff</span>
              <span className="text-2xl font-bold text-blue-600">6</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completion Rate</span>
              <span className="text-2xl font-bold text-green-600">87%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeatmapTab({ complaints }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-green-600">📍</span> Complaint Density Heatmap
        </h2>
        <button 
          onClick={() => {
            fetchComplaints()
            alert('Heatmap data refreshed!')
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
        >
          <span>🔄</span> Refresh Data
        </button>
      </div>
      <div className="bg-gray-200 rounded-lg h-96 mb-4 relative overflow-hidden">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1841322394!2d-73.98811768459418!3d40.74844097932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          className="absolute inset-0"
        />
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>High Density</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Medium Density</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Low Density</span>
        </div>
      </div>
    </div>
  )
}
