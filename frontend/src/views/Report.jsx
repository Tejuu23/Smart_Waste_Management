import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'

export default function Report() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [location, setLocation] = useState({ latitude: null, longitude: null })
  const [locationError, setLocationError] = useState('')
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          reject(error)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  const handleImageUpload = async (file) => {
    if (!file) return null
    
    // Get location when photo is selected
    setLocationError('')
    try {
      const loc = await getCurrentLocation()
      setLocation(loc)
    } catch (err) {
      setLocationError('Location access denied. Please enable location services.')
      console.warn('Location error:', err)
    }
    
    const formData = new FormData()
    formData.append('image', file)
    try {
      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setImageUrl(data.url)
      return data.url
    } catch (err) {
      setError('Image upload failed')
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      let finalImageUrl = imageUrl
      if (image && !imageUrl) {
        finalImageUrl = await handleImageUpload(image)
        if (!finalImageUrl) {
          setLoading(false)
          return
        }
      }
      
      // Use location captured when photo was selected, or get current location
      let latitude = location.latitude || 0
      let longitude = location.longitude || 0
      
      if (!latitude || !longitude) {
        try {
          const loc = await getCurrentLocation()
          latitude = loc.latitude
          longitude = loc.longitude
        } catch (err) {
          console.warn('Location access denied, using default coordinates')
        }
      }
      
      await api.post('/complaints', {
        title,
        description,
        imageUrl: finalImageUrl,
        longitude,
        latitude
      })
      
      setSuccess('Complaint submitted successfully! You earned 10 eco-points!')
      setTimeout(() => {
        setTitle('')
        setDescription('')
        setImage(null)
        setImageUrl('')
        setLocation({ latitude: null, longitude: null })
        setLocationError('')
        navigate('/')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6" style={{
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Report an Issue</h1>
          <p className="text-gray-600 mb-6">Earn 10 eco-points for each valid report</p>
      
      {!user && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm">Please <a href="/login" className="text-blue-600 underline font-semibold">login</a> to report issues and earn points.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600 text-sm p-2 bg-red-50 rounded">{error}</div>}
        {success && <div className="text-green-600 text-sm p-2 bg-green-50 rounded">{success}</div>}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Issue Title</label>
          <input 
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition" 
            placeholder="e.g., Overflowing bin near park" 
            value={title} 
            onChange={e=>setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea 
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition" 
            placeholder="Provide detailed information about the issue..." 
            rows="4"
            value={description} 
            onChange={e=>setDescription(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Photo (with Location)
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={e=>{
              const file = e.target.files?.[0]
              setImage(file)
              if (file) handleImageUpload(file)
            }}
            disabled={loading}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
          />
          {locationError && (
            <p className="text-yellow-600 text-sm mt-2">{locationError}</p>
          )}
          {location.latitude && location.longitude && (
            <p className="text-green-600 text-sm mt-2">
              📍 Location captured: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
          )}
          {imageUrl && (
            <div className="mt-4">
              <img src={imageUrl} alt="Preview" className="max-w-xs rounded-lg border-2 border-gray-300 shadow-md" />
            </div>
          )}
        </div>
        <button 
          type="submit" 
          disabled={loading || !user}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg px-4 py-3 font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition shadow-lg"
        >
          {loading ? 'Submitting...' : '📤 Submit Report'}
        </button>
      </form>
        </div>
      </div>
    </div>
  )
}


