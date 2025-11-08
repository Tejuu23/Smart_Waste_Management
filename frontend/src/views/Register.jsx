import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('citizen')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore(state => state.register)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await register(name, email, password, role)
    setLoading(false)
    if (result.success) {
      if (role === 'admin') {
        navigate('/admin/login')
      } else if (role === 'staff') {
        navigate('/staff/login')
      } else {
        navigate('/login')
      }
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{
      backgroundImage: 'url("https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1920")',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="absolute inset-0 bg-green-900/80"></div>
      <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join the waste management community</p>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input 
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition" 
            placeholder="your@email.com" 
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
          >
            <option value="citizen">Citizen</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Select the portal you want to access</p>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg py-3 font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition shadow-lg"
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
        <p className="text-sm text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-purple-600 font-semibold hover:underline">Login</Link>
        </p>
      </form>
    </div>
  )
}

