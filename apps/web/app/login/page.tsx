'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      alert('Please fill in all fields')
      return
    }

    console.log("[v0] Auth attempt:", { email, isSignUp })

    // TODO: Replace with actual auth API
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   body: JSON.stringify({ email, password })
    // })

    // Mock auth - create user session
    const userId = `user_${Date.now()}`
    const userName = email.split('@')[0]

    setUser({ id: userId, email, name: userName })
    console.log("[v0] User logged in:", userId)
    
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-10 w-10 rounded bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">F</span>
          </div>
          <span className="text-2xl font-bold text-foreground">FinComply</span>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            FinComply: Simplify<br />SEBI Compliance<br />with AI
          </h1>
          <p className="text-muted-foreground">
            Your AI-powered chat assistant for navigating complex regulations.
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-lg p-6 shadow-lg dark:bg-slate-800">
          <div className="mb-4 flex gap-2 border-b border-border dark:border-slate-700">
            <button
              onClick={() => setIsSignUp(false)}
              className={`pb-3 px-2 font-medium text-sm ${!isSignUp ? 'text-blue-600 border-b-2 border-blue-600' : 'text-muted-foreground'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`pb-3 px-2 font-medium text-sm ${isSignUp ? 'text-blue-600 border-b-2 border-blue-600' : 'text-muted-foreground'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isSignUp ? 'Sign Up' : 'Login'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          © 2025 FinComply. All rights reserved.
        </div>
      </div>
    </div>
  )
}
