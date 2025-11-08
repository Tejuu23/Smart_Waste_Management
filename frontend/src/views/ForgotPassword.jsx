import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    try {
      const { data } = await api.post('/auth/forgot', { email })
      setMessage(data.message || 'If the email exists, reset instructions were sent.')
      setTimeout(()=>navigate('/reset'), 1200)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process request')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-sm text-gray-600">Enter your email to receive reset instructions</p>
        </div>
        {message && <div className="text-green-700 bg-green-50 border border-green-200 rounded p-3 text-sm">{message}</div>}
        {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">{error}</div>}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-4 py-2" placeholder="your@email.com" />
        </div>
        <button disabled={loading} className="w-full bg-green-600 text-white rounded py-2 hover:bg-green-700 disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <div className="text-center text-sm">
          <Link to="/login" className="text-green-600 hover:text-green-700">Back to login</Link>
        </div>
      </form>
    </div>
  )
}
