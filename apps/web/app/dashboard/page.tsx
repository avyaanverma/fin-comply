'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/client'
// Header is rendered in the root layout; avoid duplicating it here
import { Sidebar } from '@/components/sidebar'
import { ChatThread } from '@/components/chat-thread'
import { useStore, Thread } from '@/lib/store'

export default function DashboardPage() {
  const router = useRouter()
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { threads, setThreads } = useStore()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      loadThreads()
    }
  }, [user])

  const checkAuth = async () => {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    setUser(currentUser)
  }

  const loadThreads = async () => {
    try {
      const [personalThreadsResponse, communityThreadsResponse] = await Promise.all([
        fetch('/api/personal-threads', { credentials: 'include' }),
        fetch('/api/community-threads', { credentials: 'include' }),
      ])

      const personalThreadsData = await personalThreadsResponse.json()
      if (!personalThreadsResponse.ok) {
        throw new Error(personalThreadsData.error || 'Failed to load personal threads')
      }

      const communityThreadsData = await communityThreadsResponse.json()
      if (!communityThreadsResponse.ok) {
        throw new Error(communityThreadsData.error || 'Failed to load community threads')
      }

      const personalThreads = Array.isArray(personalThreadsData?.threads)
        ? personalThreadsData.threads
        : []
      const communityThreads = Array.isArray(communityThreadsData?.threads)
        ? communityThreadsData.threads
        : []

      const allThreads: Thread[] = []

      const processedPersonalThreads = await Promise.all(
        personalThreads.map(async (thread: any) => {
          const msgResponse = await fetch(`/api/threads/${thread._id}`, {
            credentials: 'include',
          })
          const msgData = await msgResponse.json()
          const messages = msgData.messages || []

          return {
            id: thread._id,
            title: thread.title,
            mode: thread.mode as 'personal' | 'community',
            createdAt: new Date(thread.createdAt).getTime(),
            messages: messages.map((m: any) => ({
              id: m._id,
              sender: m.senderType as 'user' | 'ai',
              text: m.content,
              citations: Array.isArray(m.citations)
                ? m.citations
                    .map((c: any) =>
                      typeof c === 'string' ? c : c?.title || c?.source || ''
                    )
                    .filter(Boolean)
                : undefined,
              timestamp: new Date(m.createdAt).getTime(),
            })) || [],
          }
        })
      )
      allThreads.push(...processedPersonalThreads)

      const processedCommunityThreads = await Promise.all(
        communityThreads.map(async (thread: any) => {
          const msgResponse = await fetch(`/api/threads/${thread._id}`, {
            credentials: 'include',
          })
          const msgData = await msgResponse.json()
          const messages = msgData.messages || []

          return {
            id: thread._id,
            title: thread.title,
            mode: 'community',
            createdAt: new Date(thread.createdAt).getTime(),
            messages: messages.map((m: any) => ({
              id: m._id,
              sender: m.senderType as 'user' | 'ai',
              text: m.content,
              citations: Array.isArray(m.citations)
                ? m.citations
                    .map((c: any) =>
                      typeof c === 'string' ? c : c?.title || c?.source || ''
                    )
                    .filter(Boolean)
                : undefined,
              timestamp: new Date(m.createdAt).getTime(),
            })) || [],
          }
        })
      )
      allThreads.push(...processedCommunityThreads)

      setThreads(allThreads)
    } catch (error) {
      console.error('Error loading threads:', error)
    } finally {
      setIsLoading(false)
    }
  }
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-96 overflow-y-auto border-r border-border dark:border-slate-700">
          <Sidebar
            onSelectThread={setSelectedThread}
            selectedThreadId={selectedThread?.id}
            userId={user?.id}
          />
        </div>
        <div className="flex-1">
          {selectedThread ? (
            <ChatThread thread={selectedThread} onBack={() => setSelectedThread(null)} userId={user?.id} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-background dark:bg-slate-900">
              <p className="text-muted-foreground text-lg">Select a thread or start a new query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
