import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'

export default function AdminProfile() {
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login')
      return
    }
    fetchProfile()
  }, [user, navigate])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile')
      setProfile(data)
      setNameInput(data.name)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const rating = profile?.rating || { average: 0, count: 0 }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-green-600">🌱 SmartWaste</Link>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-gray-700 hover:text-green-600 transition">Dashboard</Link>
            <Link to="/admin/profile" className="text-green-600 font-semibold">Profile</Link>
          </div>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              ⚙️
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{profile?.name || 'Admin'}</h1>
            <p className="text-gray-600">{profile?.email}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-yellow-50 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-2">Rating</div>
              <div className="text-4xl font-bold text-yellow-600">
                {rating.average > 0 ? rating.average.toFixed(1) : 'N/A'}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {rating.count} {rating.count === 1 ? 'rating' : 'ratings'}
              </div>
              <div className="mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-2xl">
                    {star <= Math.round(rating.average) ? '⭐' : '☆'}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-2">System Access</div>
              <div className="text-4xl font-bold text-purple-600">Full</div>
              <div className="text-sm text-gray-500 mt-2">Administrator privileges</div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600">Name:</span>
                {isEditing ? (
                  <input value={nameInput} onChange={(e)=>setNameInput(e.target.value)} className="border rounded px-3 py-2 flex-1 max-w-xs" />
                ) : (
                  <span className="font-semibold">{profile?.name}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{profile?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-semibold capitalize">{profile?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since:</span>
                <span className="font-semibold">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              {!isEditing ? (
                <button onClick={()=>setIsEditing(true)} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Edit</button>
              ) : (
                <>
                  <button onClick={async ()=>{
                    try {
                      await api.put('/profile', { name: nameInput })
                      setProfile({ ...profile, name: nameInput })
                      setIsEditing(false)
                    } catch (e) { alert('Failed to update profile') }
                  }} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
                  <button onClick={()=>{ setIsEditing(false); setNameInput(profile?.name||'') }} className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200">Cancel</button>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Update Password</h2>
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                <input type="password" value={pwForm.currentPassword} onChange={e=>setPwForm({...pwForm, currentPassword: e.target.value})} className="border rounded px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">New Password</label>
                <input type="password" value={pwForm.newPassword} onChange={e=>setPwForm({...pwForm, newPassword: e.target.value})} className="border rounded px-3 py-2 w-full" />
              </div>
              <button onClick={async ()=>{
                try {
                  await api.put('/profile/password', pwForm)
                  alert('Password updated')
                  setPwForm({ currentPassword:'', newPassword:'' })
                } catch (e) { alert(e.response?.data?.error || 'Failed to update password') }
              }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update</button>
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <Link
              to="/dashboard"
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-purple-700 transition"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

