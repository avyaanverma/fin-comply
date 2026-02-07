// lib/api.ts
/**
 * Frontend API client for FinComply MongoDB backend
 * Usage examples and helper functions for API calls
 */

// ============================================
// AUTHENTICATION EXAMPLES
// ============================================

/**
 * Sign up a new user
 */
export async function signup(email: string, password: string, name: string) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
    credentials: 'include', // Important: send cookies
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Signup failed')
  }

  return response.json()
}

/**
 * Log in a user
 */
export async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Important: send cookies
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Login failed')
  }

  return response.json()
}

/**
 * Log out current user
 */
export async function logout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Logout failed')
  }

  return response.json()
}

/**
 * Check if user is authenticated
 */
export async function checkSession() {
  const response = await fetch('/api/auth/session', {
    method: 'GET',
    credentials: 'include',
  })

  return response.json()
}

// ============================================
// USER PROFILE EXAMPLES
// ============================================

/**
 * Get current user's profile
 */
export async function getUserProfile() {
  const response = await fetch('/api/user/profile', {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch profile')
  }

  return response.json()
}

/**
 * Update user profile
 */
export async function updateProfile(
  name: string,
  companyStatus: 'listed' | 'unlisted',
  industrySector: string,
  companySize: 'small' | 'medium' | 'large'
) {
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      companyStatus,
      industrySector,
      companySize,
    }),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to update profile')
  }

  return response.json()
}

// ============================================
// THREADS EXAMPLES
// ============================================

/**
 * Get all personal threads for current user
 */
export async function getPersonalThreads() {
  const response = await fetch('/api/threads?mode=personal', {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch threads')
  }

  return response.json()
}

/**
 * Get all community threads
 */
export async function getCommunityThreads() {
  const response = await fetch('/api/threads?mode=community', {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch threads')
  }

  return response.json()
}

/**
 * Create a new thread
 */
export async function createThread(title: string, mode: 'personal' | 'community') {
  const response = await fetch('/api/threads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, mode }),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to create thread')
  }

  return response.json()
}

// ============================================
// MESSAGES EXAMPLES
// ============================================

/**
 * Get all messages in a thread
 */
export async function getThreadMessages(threadId: string) {
  const response = await fetch(`/api/threads/${threadId}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch messages')
  }

  return response.json()
}

/**
 * Send a message to a thread (chat)
 */
export async function sendMessage(message: string, threadId: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, threadId }),
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send message')
  }

  return response.json()
}

// ============================================
// REACT HOOKS EXAMPLES
// ============================================

/**
 * Example: useAuth hook for authentication
 */
import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkSession()
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const loginUser = async (email: string, password: string) => {
    try {
      setLoading(true)
      const data = await login(email, password)
      setUser(data.user)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signupUser = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      const data = await signup(email, password, name)
      setUser(data.user)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logoutUser = async () => {
    try {
      setLoading(true)
      await logout()
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    login: loginUser,
    signup: signupUser,
    logout: logoutUser,
  }
}

// ============================================
// USAGE EXAMPLES IN COMPONENTS
// ============================================

/**
 * Example 1: Login Component
 */
export function LoginExample() {
  const { login, loading } = useAuth()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await login(email, password)
      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
    </form>
  )
}

/**
 * Example 2: Send Message Component
 */
export function SendMessageExample({ threadId }: { threadId: string }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string>('')

  const handleSendMessage = async () => {
    try {
      setLoading(true)
      const data = await sendMessage(message, threadId)
      setResponse(data.response)
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={handleSendMessage} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
      {response && <p>{response}</p>}
    </div>
  )
}

/**
 * Example 3: Fetch Threads Component
 */
export function ThreadsListExample() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPersonalThreads()
      .then((data) => setThreads(data.threads))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {threads.map((thread: any) => (
        <div key={thread._id}>
          <h3>{thread.title}</h3>
          <p>{thread.mode}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Example 4: Update Profile Component
 */
export function UpdateProfileExample() {
  const [loading, setLoading] = useState(false)

  const handleUpdateProfile = async () => {
    try {
      setLoading(true)
      await updateProfile('John Doe', 'listed', 'Finance', 'large')
      alert('Profile updated!')
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleUpdateProfile} disabled={loading}>
      {loading ? 'Updating...' : 'Update Profile'}
    </button>
  )
}
