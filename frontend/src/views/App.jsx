import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function App() {
  const { user, logout } = useAuthStore()
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-green-600">🌱 SmartWaste</Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1">
              <span>🏠</span> Home
            </Link>
            <Link to="/report" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1">
              <span>👤</span> Citizen Portal
            </Link>
            <Link to="/admin/login" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1">
              <span>👨‍💼</span> Admin Login
            </Link>
            <Link to="/staff/login" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1">
              <span>👨‍💼</span> Staff Panel
            </Link>
            {user && (
              <button onClick={logout} className="text-red-600 hover:text-red-700">Logout</button>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-white" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1920")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="absolute inset-0 bg-green-900/70"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Smart Waste Management for Modern Cities</h1>
          <p className="text-xl mb-8 text-green-100">
            Connecting citizens and municipal authorities through transparent, data-driven waste management solutions. 
            Report issues, track progress, and build cleaner communities together.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2 transition shadow-lg"
            >
              <span>👤</span> Get Started as Citizen
            </Link>
            
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard icon="✅" number="2,847" label="Complaints Involved" />
            <StatCard icon="👥" number="156" label="Active Staff Members" />
            <StatCard icon="❤️" number="98%" label="Citizen Satisfaction" />
            <StatCard icon="🕐" number="24/7" label="System Availability" />
          </div>
        </div>
      </section>

      

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How Our System Works</h2>
            <p className="text-xl text-gray-600">A seamless workflow from complaint to resolution.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <WorkflowStep
              icon="👤💬"
              title="Report Issue"
              description="Citizens report waste problems with photos and location."
            />
            <WorkflowStep
              icon="👤🔍"
              title="Admin Review"
              description="Administrators review and assign cleaning teams."
            />
            <WorkflowStep
              icon="👤🧹"
              title="Staff Action"
              description="Field staff complete tasks and provide proof of work."
            />
            <WorkflowStep
              icon="✅"
              title="Resolution"
              description="Citizens receive updates and confirmation of completion."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your City's Waste Management?</h2>
          <p className="text-xl mb-8 text-green-100">
            Join thousands of cities already using our platform to create cleaner, more sustainable communities.
          </p>
          <Link 
            to="/register"
            className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            Request Demo →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">🌱 SmartWaste</h3>
              <p className="text-sm">
                Revolutionizing urban waste management through technology and community engagement.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/report" className="hover:text-green-400">Citizen Portal</Link></li>
                <li><Link to="/staff/login" className="hover:text-green-400">Staff Panel</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-green-400">Help Center</a></li>
                <li><a href="#" className="hover:text-green-400">Contact Us</a></li>
                <li><a href="#" className="hover:text-green-400">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="text-2xl hover:text-green-400">📘</a>
                <a href="#" className="text-2xl hover:text-green-400">📷</a>
                <a href="#" className="text-2xl hover:text-green-400">💼</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2024 SmartWaste Platform. All rights reserved. | Powered by smartwastemanagement</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatCard({ icon, number, label }) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-green-600 mb-1">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  )
}

function FeatureCard({ icon, title, description, link, linkText }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link to={link} className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1">
        {linkText} →
      </Link>
    </div>
  )
}

function WorkflowStep({ icon, title, description }) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
