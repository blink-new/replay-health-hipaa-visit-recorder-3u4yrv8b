import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Toaster } from './components/ui/toaster'
import Dashboard from './components/Dashboard'
import LoadingScreen from './components/LoadingScreen'
import LandingPage from './components/LandingPage'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLanding, setShowLanding] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // If user is already authenticated, skip landing page
      if (state.user) {
        setShowLanding(false)
      }
    })
    return unsubscribe
  }, [])

  const handleGetStarted = () => {
    if (user) {
      setShowLanding(false)
    } else {
      blink.auth.login()
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  // Show landing page for new visitors or when explicitly requested
  if (showLanding && !user) {
    return <LandingPage onGetStarted={handleGetStarted} />
  }

  // Show simple auth screen if user clicked get started but isn't authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Replay Health</h1>
          <p className="text-gray-600 mb-8">HIPAA-compliant medical visit recording and management</p>
          <button
            onClick={() => blink.auth.login()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 mb-4"
          >
            Sign In to Continue
          </button>
          <button
            onClick={() => setShowLanding(true)}
            className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 px-6 transition-colors duration-200"
          >
            ← Back to Landing Page
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Secure authentication powered by Blink
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Dashboard user={user} />
      <Toaster />
    </div>
  )
}

export default App