import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

export default function StaffRegister() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [staffId, setStaffId] = useState('')
  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', { 
        name, 
        email, 
        password, 
        role: 'staff',
        staffId,
        teamName 
      })
      navigate('/staff/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{
      backgroundImage: 'url("https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920")',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="absolute inset-0 bg-orange-900/80"></div>
      <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Staff Registration</h1>
          <p className="text-gray-600">Create your staff account</p>
        </div>
        {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input 
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition" 
            placeholder="John Doe" 
            value={name} 
            onChange={e=>setName(e.target.value)} 
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Staff ID</label>
          <input 
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition" 
            placeholder="STAFF001" 
            value={staffId} 
            onChange={e=>setStaffId(e.target.value)} 
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Team Name <span className="text-xs text-gray-500">(3-6 members)</span></label>
          <input 
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition" 
            placeholder="Team Alpha" 
            value={teamName} 
            onChange={e=>setTeamName(e.target.value)} 
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input 
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition" 
            placeholder="staff@wastemanagement.com" 
            type="email"
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input 
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition" 
            placeholder="Create a strong password" 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            required
            minLength={6}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg py-3 font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition shadow-lg"
        >
          {loading ? 'Creating Account...' : 'Register as Staff'}
        </button>
        <p className="text-sm text-center text-gray-600">
          Already have an account? <Link to="/staff/login" className="text-purple-600 font-semibold hover:underline">Staff Login</Link>
        </p>
      </form>
    </div>
  )
}

