'use client'

import { Message } from '@/lib/store'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold">AI</span>
        </div>
      )}

      <div
        className={`max-w-xl px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white dark:bg-blue-500'
            : 'bg-muted text-foreground dark:bg-slate-700'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>

        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.citations.map((citation, idx) => (
              <span
                key={idx}
                className={`text-xs px-2 py-1 rounded ${
                  isUser
                    ? 'bg-blue-500 text-blue-100'
                    : 'bg-muted-foreground/20 text-muted-foreground'
                }`}
              >
                📎 {citation}
              </span>
            ))}
          </div>
        )}

        {message.author && (
          <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-muted-foreground'}`}>
            — {message.author}
          </p>
        )}
      </div>
    </div>
  )
}
