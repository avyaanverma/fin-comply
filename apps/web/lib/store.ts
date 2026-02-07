'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Profile {
  status: 'listed' | 'unlisted' | ''
  sector: string
  size: 'small' | 'medium' | 'large' | ''
}

export interface Message {
  id: string
  sender: 'user' | 'ai'
  text: string
  author?: string
  citations?: string[]
  timestamp: number
}

export interface Thread {
  id: string
  title: string
  mode: 'personal' | 'community'
  lastMsg?: string
  time?: string
  participants?: number
  lastActive?: string
  messages: Message[]
  createdBy?: string
  createdAt?: number
}

interface Store {
  user: { id: string; email: string; name: string } | null
  setUser: (user: any) => void
  logout: () => void

  profile: Profile
  setProfile: (profile: Profile) => void
  darkMode: boolean
  toggleDarkMode: () => void
  currentMode: 'personal' | 'community'
  setCurrentMode: (mode: 'personal' | 'community') => void
  threads: Thread[]
  setThreads: (threads: Thread[]) => void
  addMessage: (threadId: string, message: Message) => void
  addThread: (thread: Thread) => void
  updateThreadLastMessage: (threadId: string) => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, threads: [] }),

      profile: { status: '', sector: '', size: '' },
      setProfile: (profile) => set({ profile }),
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      currentMode: 'personal',
      setCurrentMode: (mode) => set({ currentMode: mode }),
      threads: [],
      setThreads: (threads) => set({ threads }),
      addMessage: (threadId, message) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? { ...t, messages: [...t.messages, message] }
              : t
          ),
        })),
      addThread: (thread) =>
        set((state) => ({
          threads: [thread, ...state.threads],
        })),
      updateThreadLastMessage: (threadId) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? { ...t, time: 'just now', lastActive: 'just now' }
              : t
          ),
        })),
    }),
    { name: 'fincomply-store' }
  )
)
