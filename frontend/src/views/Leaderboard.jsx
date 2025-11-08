import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Leaderboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get('/leaderboard')
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
      // Fallback to mock data if API fails
      const mockData = [
        { name: 'Aarav', ecoPoints: 1200 },
        { name: 'Isha', ecoPoints: 980 },
        { name: 'Ravi', ecoPoints: 910 },
        { name: 'Priya', ecoPoints: 850 },
        { name: 'Karan', ecoPoints: 720 }
      ]
      setUsers(mockData)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6 max-w-2xl mx-auto">Loading...</div>
  }

  return (
    <div className="min-h-screen p-6" style={{
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏆 Eco-Points Leaderboard</h1>
          <p className="text-white/80">Top contributors to waste management</p>
        </div>
        
        <div className="mt-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl divide-y overflow-hidden">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found</div>
          ) : (
            users.map((u, i) => (
              <div 
                key={u._id || u.name || i} 
                className={`flex items-center justify-between p-4 ${
                  i === 0 ? 'bg-yellow-50' : i === 1 ? 'bg-gray-50' : i === 2 ? 'bg-orange-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 text-center font-bold ${
                    i === 0 ? 'text-yellow-600' : i === 1 ? 'text-gray-600' : i === 2 ? 'text-orange-600' : 'text-gray-400'
                  }`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </span>
                  <span className="font-medium">{u.name}</span>
                </div>
                <span className="font-semibold text-green-600">{u.ecoPoints || 0} pts</span>
              </div>
            ))
          )}
        </div>
      
        <div className="mt-6 p-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl">
          <h3 className="font-bold text-xl mb-4 text-gray-800">How to earn points:</h3>
          <ul className="text-gray-700 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-green-600 font-bold">+10</span>
              <span>Report an issue</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 font-bold">+50</span>
              <span>Participate in cleanup</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 font-bold">+5</span>
              <span>Proper waste segregation</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}


