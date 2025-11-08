import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { io } from 'socket.io-client'

export default function CitizenPortal() {
  const [activeTab, setActiveTab] = useState('report')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Garbage Collection')
  const [priority, setPriority] = useState('Medium')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [geoLocation, setGeoLocation] = useState({ latitude: null, longitude: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [myComplaints, setMyComplaints] = useState([])
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        reject,
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImage(file)
    
    // Capture location when photo is selected
    try {
      const loc = await getCurrentLocation()
      setGeoLocation(loc)
    } catch (err) {
      console.warn('Location error:', err)
    }
    
    // Upload image
    const formData = new FormData()
    formData.append('image', file)
    try {
      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setImageUrl(data.url)
    } catch (err) {
      setError('Image upload failed')
    }
  }

  const handleMapClick = async () => {
    try {
      const loc = await getCurrentLocation()
      setGeoLocation(loc)
      setLocation(`${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`)
    } catch (err) {
      setError('Could not get location. Please enter address manually.')
    }
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && activeTab === 'report') {
      navigate('/login', { state: { from: '/report' } })
    }
  }, [user, navigate, activeTab])

  // Fetch user's complaints
  useEffect(() => {
    if (user && activeTab === 'track') {
      fetchMyComplaints()
    }
  }, [user, activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Setup socket for notifications
  useEffect(() => {
    if (!user) return
    
    const socket = io('http://localhost:4002')
    
    socket.on('complaint:resolved', (data) => {
      if (data.userId === user.id) {
        const notification = {
          id: Date.now(),
          type: 'success',
          message: data.message || 'Your complaint has been resolved!',
          complaintId: data.id
        }
        setNotifications(prev => [notification, ...prev])
        fetchMyComplaints() // Refresh complaints list
      }
    })

    socket.on(`user:${user.id}:notification`, (data) => {
      const notification = {
        id: Date.now(),
        type: data.type || 'info',
        message: data.message,
        complaintId: data.complaintId
      }
      setNotifications(prev => [notification, ...prev])
      fetchMyComplaints()
    })

    return () => socket.disconnect()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMyComplaints = async () => {
    try {
      const { data } = await api.get('/complaints')
      setMyComplaints(data)
    } catch (err) {
      console.error('Failed to fetch complaints:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login', { state: { from: '/report' } })
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      let latitude = geoLocation.latitude || 0
      let longitude = geoLocation.longitude || 0
      
      if (!latitude || !longitude) {
        try {
          const loc = await getCurrentLocation()
          latitude = loc.latitude
          longitude = loc.longitude
        } catch (err) {
          console.warn('Location not available')
        }
      }
      
      await api.post('/complaints', {
        title,
        description,
        imageUrl,
        longitude,
        latitude,
        category,
        priority
      })
      
      setSuccess('Report submitted successfully! You earned 10 eco-points!')
      
      // Refresh user data to get updated eco-points and complaint count
      const { data: userData } = await api.get('/profile')
      useAuthStore.setState({ 
        user: { ...user, ecoPoints: userData.ecoPoints, complaintsCount: userData.complaintsCount }
      })
      localStorage.setItem('user', JSON.stringify({ ...user, ecoPoints: userData.ecoPoints, complaintsCount: userData.complaintsCount }))
      
      setTimeout(() => {
        setTitle('')
        setCategory('Garbage Collection')
        setPriority('Medium')
        setLocation('')
        setDescription('')
        setImage(null)
        setImageUrl('')
        setGeoLocation({ latitude: null, longitude: null })
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-green-600">🌱 SmartWaste</Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition">Home</Link>
            <Link to="/report" className="text-green-600 font-semibold">Citizen Portal</Link>
            <Link to="/leaderboard" className="text-gray-700 hover:text-green-600 transition">Leaderboard</Link>
            {user && (
              <>
                <Link to="/citizen/profile" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1">
                  <span>👤</span> Profile
                  {user.ecoPoints > 0 && (
                    <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                      {user.ecoPoints} pts
                    </span>
                  )}
                </Link>
              </>
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
        <div className="absolute inset-0 bg-green-900/80 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Citizen Portal</h1>
          <p className="text-xl text-green-100">
            Report waste issues, track your complaints, and stay informed about collection schedules in your area
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <TabButton 
              active={activeTab === 'report'} 
              onClick={() => setActiveTab('report')}
              icon="📷"
              label="Report Issue"
            />
            <TabButton 
              active={activeTab === 'track'} 
              onClick={() => setActiveTab('track')}
              icon="🔍"
              label="Track Complaints"
            />
            <TabButton 
              active={activeTab === 'bins'} 
              onClick={() => setActiveTab('bins')}
              icon="🗑️"
              label="Bin Status"
            />
            <TabButton 
              active={activeTab === 'schedule'} 
              onClick={() => setActiveTab('schedule')}
              icon="📅"
              label="Collection Schedule"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'report' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Report Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span>📷</span> Report New Issue
                </h2>
                
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
                {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Brief description of the issue"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                    required
                  >
                    <option>Garbage Collection</option>
                    <option>Recycling</option>
                    <option>Hazardous Waste</option>
                    <option>Illegal Dumping</option>
                    <option>Bin Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="priority"
                        value="Low"
                        checked={priority === 'Low'}
                        onChange={e => setPriority(e.target.value)}
                        className="mr-2"
                      />
                      <span className={priority === 'Low' ? 'text-green-600 font-semibold' : ''}>Low</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="priority"
                        value="Medium"
                        checked={priority === 'Medium'}
                        onChange={e => setPriority(e.target.value)}
                        className="mr-2"
                      />
                      <span className={priority === 'Medium' ? 'text-green-600 font-semibold' : ''}>Medium</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="priority"
                        value="High"
                        checked={priority === 'High'}
                        onChange={e => setPriority(e.target.value)}
                        className="mr-2"
                      />
                      <span className={priority === 'High' ? 'text-red-600 font-semibold' : ''}>High</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Street address or landmark"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                    required
                  />
                  {geoLocation.latitude && (
                    <p className="text-sm text-green-600 mt-1">
                      📍 GPS: {geoLocation.latitude.toFixed(6)}, {geoLocation.longitude.toFixed(6)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Detailed description of the issue..."
                    rows="4"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Photo
                  </label>
                  <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="max-w-full h-48 mx-auto rounded-lg" />
                    ) : (
                      <div>
                        <span className="text-4xl mb-2 block">📷</span>
                        <span className="text-gray-600">Click to upload photo</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {!user ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800 mb-3">Please login to report an issue</p>
                    <Link 
                      to="/login" 
                      className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      Login to Report
                    </Link>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition"
                  >
                    <span>✈️</span> Submit Report
                  </button>
                )}
              </form>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Location Map */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-green-600">📍</span> Location Map
                </h3>
                <div className="bg-gray-200 rounded-lg h-64 mb-4 flex items-center justify-center relative overflow-hidden">
                  {(() => {
                    const lat = geoLocation.latitude || 40.7484
                    const lng = geoLocation.longitude || -73.9857
                    const src = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`
                    return (
                      <iframe
                        src={src}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        className="absolute inset-0"
                        title="map"
                      />
                    )
                  })()}
                </div>
                <p className="text-sm text-gray-600">Click on the map to select precise location for your report</p>
                <button
                  onClick={handleMapClick}
                  className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                >
                  Use Current Location
                </button>
              </div>

              {/* Reporting Tips */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-green-600">💡</span> Reporting Tips
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm text-gray-700">Take clear photos showing the issue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm text-gray-700">Provide specific location details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm text-gray-700">Include relevant landmarks nearby</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm text-gray-700">Select appropriate priority level</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'track' && (
          <div className="space-y-6">
            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🔔</span> Notifications
                </h3>
                <div className="space-y-2">
                  {notifications.slice(0, 5).map((notif) => (
                    <div key={notif.id} className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">✅</span>
                        <span className="text-green-800">{notif.message}</span>
                      </div>
                      <button 
                        onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                        className="text-green-600 hover:text-green-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Complaints */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span>📋</span> My Complaints
                </h2>
                {user && (
                  <div className="text-sm text-gray-600">
                    Total: <span className="font-semibold text-green-600">{user.complaintsCount || myComplaints.length}</span> complaints
                  </div>
                )}
              </div>
              {!user ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">Please login to view your complaints</p>
                  <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                    Login →
                  </Link>
                </div>
              ) : myComplaints.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">📭</div>
                  <p>You haven't reported any issues yet.</p>
                  <button 
                    onClick={() => setActiveTab('report')}
                    className="mt-4 text-green-600 hover:text-green-700 font-semibold"
                  >
                    Report an Issue →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myComplaints.map((complaint) => (
                    <div key={complaint._id} className="border-2 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-gray-800">#{complaint._id.slice(-6)}</span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              complaint.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                              complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {complaint.status}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              complaint.priority === 'High' ? 'bg-red-100 text-red-700' :
                              complaint.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {complaint.priority || 'Medium'}
                            </span>
                          </div>
                          <div className="font-semibold text-gray-800 mb-1">{complaint.title}</div>
                          <div className="text-sm text-gray-600 mb-2">{complaint.description}</div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>📅 {new Date(complaint.createdAt).toLocaleDateString()}</span>
                            <span>📍 {complaint.category}</span>
                            {complaint.status === 'resolved' && (
                              <>
                                <span className="text-green-600 font-semibold">✅ Resolved</span>
                                {complaint.assignedBy ? (
                                  <button
                                    onClick={async () => {
                                      const rating = prompt('Rate the admin who assigned (1-5):')
                                      if (rating && rating >= 1 && rating <= 5) {
                                        const comment = prompt('Add a comment (optional):') || ''
                                        try {
                                          await api.post(`/profile/rate/${complaint.assignedBy._id || complaint.assignedBy}`, { value: parseInt(rating), comment })
                                          alert('Rating submitted successfully!')
                                        } catch (err) {
                                          alert(err.response?.data?.error || 'Failed to submit rating')
                                        }
                                      }
                                    }}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition"
                                  >
                                    ⭐ Rate Admin {complaint.assignedBy?.name ? `(${complaint.assignedBy.name})` : ''}
                                  </button>
                                ) : null}
                                {complaint.resolvedBy ? (
                                  <button
                                    onClick={async () => {
                                      const rating = prompt('Rate the staff who resolved (1-5):')
                                      if (rating && rating >= 1 && rating <= 5) {
                                        const comment = prompt('Add a comment (optional):') || ''
                                        try {
                                          await api.post(`/profile/rate/${complaint.resolvedBy._id || complaint.resolvedBy}`, { value: parseInt(rating), comment })
                                          alert('Rating submitted successfully!')
                                        } catch (err) {
                                          alert(err.response?.data?.error || 'Failed to submit rating')
                                        }
                                      }
                                    }}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                                  >
                                    ⭐ Rate Staff {complaint.resolvedBy?.name ? `(${complaint.resolvedBy.name})` : ''}
                                  </button>
                                ) : null}
                              </>
                            )}
                          </div>
                        </div>
                        {complaint.imageUrl && (
                          <img src={complaint.imageUrl} alt="Complaint" className="w-24 h-24 object-cover rounded-lg ml-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bins' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🗑️</span> Bin Status
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-3xl mb-2">🟢</div>
                <div className="font-semibold">Bin #001</div>
                <div className="text-sm text-gray-600">Main Street</div>
                <div className="text-sm text-green-600 mt-2">Status: Normal</div>
                <button 
                  onClick={() => navigate('/tracking')}
                  className="mt-3 w-full bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition"
                >
                  View on Map
                </button>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-3xl mb-2">🟡</div>
                <div className="font-semibold">Bin #002</div>
                <div className="text-sm text-gray-600">Park Avenue</div>
                <div className="text-sm text-yellow-600 mt-2">Status: 75% Full</div>
                <button 
                  onClick={() => navigate('/tracking')}
                  className="mt-3 w-full bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700 transition"
                >
                  View on Map
                </button>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-3xl mb-2">🔴</div>
                <div className="font-semibold">Bin #003</div>
                <div className="text-sm text-gray-600">Central Park</div>
                <div className="text-sm text-red-600 mt-2">Status: Full - Needs Collection</div>
                <button 
                  onClick={() => navigate('/tracking')}
                  className="mt-3 w-full bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition"
                >
                  View on Map
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📅</span> Collection Schedule
            </h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-800">Monday - General Waste</div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">Weekly</span>
                </div>
                <div className="text-sm text-gray-600">Collection time: 8:00 AM - 12:00 PM</div>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="mt-3 text-green-600 hover:text-green-700 font-semibold text-sm"
                >
                  View Details →
                </button>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-800">Wednesday - Recycling</div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">Bi-weekly</span>
                </div>
                <div className="text-sm text-gray-600">Collection time: 9:00 AM - 1:00 PM</div>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="mt-3 text-green-600 hover:text-green-700 font-semibold text-sm"
                >
                  View Details →
                </button>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-800">Friday - Organic Waste</div>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm">Weekly</span>
                </div>
                <div className="text-sm text-gray-600">Collection time: 7:00 AM - 11:00 AM</div>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="mt-3 text-green-600 hover:text-green-700 font-semibold text-sm"
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
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
          ? 'text-green-600 border-b-2 border-green-600'
          : 'text-gray-600 hover:text-green-600'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

