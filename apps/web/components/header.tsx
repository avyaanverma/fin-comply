'use client'

import { getCurrentUser } from '@/lib/supabase/client'
import { Bell, User, Moon, Sun, LogOut, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileModal } from './profile-modal'
import { SettingsModal } from './settings-modal'

export function Header() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUpdates, setShowUpdates] = useState(false)

  useEffect(() => {
    getUser()
    const theme = localStorage.getItem('darkMode') === 'true'
    setDarkMode(theme)
  }, [])

  const getUser = async () => {
    const currentUser = await getCurrentUser()
    if (currentUser) {
      setUser({ id: currentUser.id, email: currentUser.email || '' })
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    router.push('/auth/login')
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
    document.documentElement.classList.toggle('dark', newMode)
  }

  return (
    <>
      <div className={`flex items-center justify-between border-b border-border bg-card px-6 py-4 ${darkMode ? 'dark bg-slate-900 border-slate-700' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center text-blue-600">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
            </svg>
          </div>
          <span className="text-xl font-semibold text-foreground">FinComply</span>
        </div>

        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-muted-foreground">{user.email}</span>}

          <button
            onClick={() => setShowUpdates(!showUpdates)}
            className="relative text-foreground hover:text-primary p-2"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
          </button>

          <button
            onClick={toggleDarkMode}
            className="text-foreground hover:text-primary p-2"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="text-foreground hover:text-primary p-2"
          >
            <Settings className="h-5 w-5" />
          </button>

          <button
            onClick={() => setShowProfile(true)}
            className="text-foreground hover:text-primary p-2"
          >
            <User className="h-5 w-5" />
          </button>

          <button
            onClick={handleLogout}
            className="text-foreground hover:text-primary p-2"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showUpdates && (
        <div className="absolute top-16 right-6 w-80 rounded-lg bg-card border border-border shadow-lg p-4 dark:bg-slate-800 dark:border-slate-700 z-40">
          <h3 className="font-semibold text-foreground mb-4">New SEBI Updates</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center mx-auto mb-2">
                <span className="text-green-500 text-xl">✓</span>
              </div>
              <p className="font-medium text-foreground">You're all caught up!</p>
              <p className="text-sm text-muted-foreground">No new updates from SEBI at the moment</p>
            </div>
          </div>
        </div>
      )}

      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} userId={user?.id} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
