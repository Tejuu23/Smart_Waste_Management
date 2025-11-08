import { useState, useEffect } from 'react'
import api from '../utils/api'
import { io } from 'socket.io-client'

export default function LiveTracking() {
  const [complaints, setComplaints] = useState([])
  const [bins, setBins] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all') // all, complaints, bins

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get('/complaints')
      setComplaints(data)
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

  const fetchData = async () => {
    try {
      await Promise.all([fetchComplaints(), fetchBins()])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }

    const socket = io('http://localhost:4000')
    
    socket.on('complaint:new', () => {
      fetchComplaints()
    })
    
    socket.on('bin:alert', () => {
      fetchBins()
    })

    fetchData()
    
    return () => socket.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getDistance = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 'N/A'
    const R = 6371 // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return (R * c).toFixed(2) + ' km'
  }

  const filteredComplaints = complaints.filter(c => {
    if (selectedType === 'all' || selectedType === 'complaints') return true
    return false
  })

  const filteredBins = bins.filter(b => {
    if (selectedType === 'all' || selectedType === 'bins') return true
    return false
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tracking data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📍 Live Tracking</h1>
          <p className="text-gray-600">Real-time location tracking of complaints and smart bins</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              selectedType === 'all'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All ({complaints.length + bins.length})
          </button>
          <button
            onClick={() => setSelectedType('complaints')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              selectedType === 'complaints'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Complaints ({complaints.length})
          </button>
          <button
            onClick={() => setSelectedType('bins')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              selectedType === 'bins'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Smart Bins ({bins.length})
          </button>
        </div>

        {/* User Location */}
        {userLocation && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-sm text-blue-800">
              📍 Your Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Complaints Map */}
          {(selectedType === 'all' || selectedType === 'complaints') && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🚨 Complaints ({filteredComplaints.length})
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredComplaints.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No complaints to track</p>
                ) : (
                  filteredComplaints.map(c => (
                    <div key={c._id} className="border-2 border-red-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{c.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span>📍 {c.location?.coordinates[1]?.toFixed(4) || 'N/A'}, {c.location?.coordinates[0]?.toFixed(4) || 'N/A'}</span>
                            {userLocation && (
                              <span>📏 {getDistance(userLocation.lat, userLocation.lng, c.location?.coordinates[1], c.location?.coordinates[0])}</span>
                            )}
                          </div>
                          <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                            c.status === 'open' ? 'bg-red-100 text-red-700' :
                            c.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Bins Map */}
          {(selectedType === 'all' || selectedType === 'bins') && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🗑️ Smart Bins ({filteredBins.length})
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredBins.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bins to track</p>
                ) : (
                  filteredBins.map(b => (
                    <div key={b._id} className={`border-2 rounded-lg p-4 hover:shadow-md transition ${
                      b.fillLevel >= 80 ? 'border-red-400 bg-red-50' :
                      b.fillLevel >= 50 ? 'border-yellow-400 bg-yellow-50' :
                      'border-green-400 bg-green-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">Bin {b.code || b._id.slice(-6)}</h3>
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Fill Level</span>
                              <span className="text-sm font-semibold">{b.fillLevel}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  b.fillLevel >= 80 ? 'bg-red-500' :
                                  b.fillLevel >= 50 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${b.fillLevel}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span>📍 {b.location?.coordinates[1]?.toFixed(4) || 'N/A'}, {b.location?.coordinates[0]?.toFixed(4) || 'N/A'}</span>
                            {userLocation && (
                              <span>📏 {getDistance(userLocation.lat, userLocation.lng, b.location?.coordinates[1], b.location?.coordinates[0])}</span>
                            )}
                          </div>
                          {b.fillLevel >= 80 && (
                            <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                              ⚠️ Needs Collection
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Map Placeholder */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🗺️ Interactive Map</h2>
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Map integration ready for Google Maps API</p>
              <p className="text-sm text-gray-500">Add your Google Maps API key to enable interactive map</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

