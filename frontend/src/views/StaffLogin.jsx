import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function StaffLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(state => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      // Check if user is staff or admin
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.role === 'staff') {
        navigate('/staff')
      } else if (user.role === 'admin') {
        navigate('/dashboard')
      } else {
        setError('Access denied. Staff/Admin access required.')
        // Logout if not staff
        const { logout } = useAuthStore.getState()
        logout()
      }
    } else {
      setError(result.error)
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Staff Portal</h1>
          <p className="text-gray-600">Sign in to manage waste operations</p>
        </div>
        {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200">{error}</div>}
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
            placeholder="Enter your password" 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg py-3 font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition shadow-lg"
        >
          {loading ? 'Signing in...' : 'Sign In as Staff'}
        </button>
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Not a staff member? <Link to="/login" className="text-purple-600 font-semibold hover:underline">Citizen Login</Link>
          </p>
          <p className="text-sm text-gray-600">
            Forgot password? <Link to="/forgot" className="text-purple-600 font-semibold hover:underline">Reset here</Link>
          </p>
          <p className="text-sm text-gray-600">
            Need an account? <Link to="/staff/register" className="text-purple-600 font-semibold hover:underline">Staff Registration</Link>
          </p>
        </div>
      </form>
    </div>
  )
}

