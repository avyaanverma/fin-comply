'use client'

import { useStore } from '@/lib/store'
import { Search, Plus } from 'lucide-react'
import { useState } from 'react'
import { Thread } from '@/lib/store'

interface SidebarProps {
  onSelectThread: (thread: Thread) => void
  selectedThreadId?: string
  userId?: string
}

export function Sidebar({ onSelectThread, selectedThreadId, userId }: SidebarProps) {
  const { currentMode, setCurrentMode, threads, addThread } = useStore()
  const [searchQuery, setSearchQuery] = useState('')

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/personal-threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: 'New Chat',
          mode: 'personal',
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create thread')

      const createdThread = data.thread
      const newThread: Thread = {
        id: createdThread._id,
        title: createdThread.title,
        mode: createdThread.mode || 'personal',
        messages: [],
        createdAt: new Date(createdThread.createdAt).getTime(),
      }

      addThread(newThread)
      onSelectThread(newThread)
    } catch (error) {
      console.error('Error creating thread:', error)
    }
  }

  let displayThreads: Thread[] = []

  if (currentMode === 'personal') {
    displayThreads = threads.filter((t) => t.mode === 'personal')
  } else {
    displayThreads = threads.filter((t) => t.mode === 'community')
  }

  const filteredThreads = displayThreads.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full h-full flex flex-col bg-card dark:bg-slate-800 border-r border-border dark:border-slate-700">
      {/* Search */}
      <div className="p-4 border-b border-border dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600"
          />
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-4 border-b border-border dark:border-slate-700">
        <button
          onClick={() => setCurrentMode('personal')}
          className={`flex-1 px-3 py-2 rounded-lg font-medium transition ${
            currentMode === 'personal'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-muted dark:hover:bg-slate-700'
          }`}
        >
          Personal
        </button>
        <button
          onClick={() => setCurrentMode('community')}
          className={`flex-1 px-3 py-2 rounded-lg font-medium transition ${
            currentMode === 'community'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-muted dark:hover:bg-slate-700'
          }`}
        >
          Community
        </button>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredThreads.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No threads found
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => onSelectThread(thread)}
              className={`w-full p-3 rounded-lg mb-2 text-left transition ${
                selectedThreadId === thread.id
                  ? 'bg-primary/10 border border-primary'
                  : 'hover:bg-muted dark:hover:bg-slate-700 border border-transparent'
              }`}
            >
              <h3 className="font-medium text-foreground truncate">{thread.title}</h3>
              <p className="text-xs text-muted-foreground">
                {thread.messages.length} messages
              </p>
            </button>
          ))
        )}
      </div>

      {/* New Chat Button / New Doubt Button */}
      <div className="p-4 border-t border-border dark:border-slate-700">
        {currentMode === 'personal' && (
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus className="h-5 w-5" />
            New Query
          </button>
        )}
        {currentMode === 'community' && (
          <button
            onClick={() => onSelectThread({ id: 'new-community-doubt', title: 'New Community Doubt', mode: 'community', messages: [], createdAt: Date.now() })}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition dark:bg-green-500 dark:hover:bg-green-600"
          >
            <Plus className="h-5 w-5" />
            New Doubt
          </button>
        )}
      </div>
    </div>
  )
}
