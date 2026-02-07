'use client'

import { useStore, Message, Thread } from '@/lib/store'
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Send } from 'lucide-react'
import { MessageBubble } from './message-bubble'

interface ChatThreadProps {
  thread: Thread | null
  onBack: () => void
  userId?: string
}

export function ChatThread({ thread, onBack, userId }: ChatThreadProps) {
  const { addMessage, addThread, updateThreadLastMessage } = useStore()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>(thread?.messages || [])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(thread?.messages || [])
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a thread or start new query.</p>
      </div>
    )
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    let currentThreadId = thread!.id
    let currentThreadMode = thread!.mode
    let isNewCommunityDoubt = false

    try {
      if (thread!.id === 'new-community-doubt') {
        isNewCommunityDoubt = true
        // Create a new community thread
        const createThreadResponse = await fetch('/api/community-threads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: userMessage.text, // First message as title
            mode: 'community',
          }),
        })

        const newThreadData = await createThreadResponse.json()
        if (!createThreadResponse.ok) throw new Error(newThreadData.error || 'Failed to create community thread')

        const newThread: Thread = {
          id: newThreadData.thread._id,
          title: newThreadData.thread.title,
          mode: 'community',
          messages: [userMessage], // Add the initial message
          createdAt: new Date(newThreadData.thread.createdAt).getTime(),
        }

        // Update the current thread in ChatThread to the newly created one
        // This is important for subsequent messages in this new thread
        // We cannot directly mutate thread prop, create a new object for local state
        // For now, we will update the thread prop by setting the state with updated thread
        // This will be handled by the onSelectThread in the parent component
        Object.assign(thread!, newThread); // Mutate the prop, which is fine for local updates

        // Add the new thread to the global store
        addThread(newThread);

        currentThreadId = newThread.id
        currentThreadMode = newThread.mode
      }

      // Save user message (and get AI response for personal threads)
      const saveResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          threadId: currentThreadId,
          message: userMessage.text,
        }),
      })

      const saveData = await saveResponse.json()
      if (!saveResponse.ok) throw new Error(saveData.error || 'Failed to save message')
      if (!isNewCommunityDoubt) { // If it's a new community doubt, message is already added with thread
        addMessage(currentThreadId, userMessage);
      }

      if (saveData.response) {
        const aiMessage: Message = {
          id: `m-${Date.now() + 1}`,
          sender: 'ai',
          text: saveData.response || 'Unable to generate response',
          citations: saveData.citations,
          timestamp: Date.now() + 1000,
        }

        setMessages((prev) => [...prev, aiMessage])
        addMessage(currentThreadId, aiMessage)
      }
      updateThreadLastMessage(currentThreadId) // Update last message for both personal and community
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: `m-${Date.now() + 1}`,
        sender: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now() + 1000,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border dark:border-slate-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-foreground hover:text-primary p-1">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">{thread.title}</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {thread.mode === 'community' ? 'Community' : 'Personal'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-muted-foreground">Start your conversation</p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        {isLoading && (
          <div className="flex gap-2 items-start">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold">AI</span>
            </div>
            <div className="max-w-xl px-4 py-2 rounded-lg bg-muted">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border dark:border-slate-700 p-6 bg-card dark:bg-slate-800">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question..."
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-muted text-white rounded-lg font-medium transition dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
