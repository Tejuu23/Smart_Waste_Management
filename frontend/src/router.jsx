import { createBrowserRouter } from 'react-router-dom'
import App from './views/App'
import Login from './views/Login'
import Register from './views/Register'
import AdminLogin from './views/AdminLogin'
import AdminRegister from './views/AdminRegister'
import StaffLogin from './views/StaffLogin'
import StaffRegister from './views/StaffRegister'
import Dashboard from './views/Dashboard'
import Report from './views/Report'
import CitizenPortal from './views/CitizenPortal'
import StaffPortal from './views/StaffPortal'
import Leaderboard from './views/Leaderboard'
import LiveTracking from './views/LiveTracking'
import ForgotPassword from './views/ForgotPassword'
import ResetPassword from './views/ResetPassword'
import CitizenProfile from './views/CitizenProfile'
import StaffProfile from './views/StaffProfile'
import AdminProfile from './views/AdminProfile'

export const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/admin/register', element: <AdminRegister /> },
  { path: '/admin/profile', element: <AdminProfile /> },
  { path: '/staff/login', element: <StaffLogin /> },
  { path: '/staff/register', element: <StaffRegister /> },
  { path: '/staff/profile', element: <StaffProfile /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/report', element: <CitizenPortal /> },
  { path: '/citizen', element: <CitizenPortal /> },
  { path: '/citizen/profile', element: <CitizenProfile /> },
  { path: '/staff', element: <StaffPortal /> },
  { path: '/leaderboard', element: <Leaderboard /> },
  { path: '/tracking', element: <LiveTracking /> },
  { path: '/forgot', element: <ForgotPassword /> },
  { path: '/reset', element: <ResetPassword /> }
])


