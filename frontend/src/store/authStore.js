import { create } from 'zustand'
import api from '../utils/api'

const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export const useAuthStore = create((set) => ({
  user: getUserFromStorage(),
  token: localStorage.getItem('token') || null,
  login: async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      if (data.token && data.user) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        set({ user: data.user, token: data.token })
        return { success: true }
      } else {
        return { success: false, error: 'Invalid response from server' }
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please check your credentials.'
      return { success: false, error: errorMessage }
    }
  },
  register: async (name, email, password, role = 'citizen') => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role })
      if (response.status === 200 || response.status === 201) {
        return { success: true }
      } else {
        return { success: false, error: 'Registration failed' }
      }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed. Please try again.'
      return { success: false, error: errorMessage }
    }
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  }
}))

