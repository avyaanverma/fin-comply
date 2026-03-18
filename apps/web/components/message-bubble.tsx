'use client'

import { Message } from '@/lib/store'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MessageBubbleProps {
  message: Message
}

function formatCitation(citation: unknown): string {
  if (typeof citation === 'string') return citation

  if (citation && typeof citation === 'object') {
    const entry = citation as {
      document_title?: string
      title?: string
      category?: string
      source_url?: string
      source?: string
    }

    const title = entry.document_title || entry.title || 'SEBI source'
    const category = entry.category ? ` (${entry.category})` : ''
    const source = entry.source_url || entry.source

    return source ? `${title}${category} - ${source}` : `${title}${category}`
  }

  return ''
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
        <div className="text-sm break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              h1: ({ children }) => <h1 className="text-base font-semibold mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
              code: ({ children }) => (
                <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">{children}</code>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  {children}
                </a>
              ),
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>

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
                {`Source ${idx + 1}: ${formatCitation(citation)}`}
              </span>
            ))}
          </div>
        )}

        {message.author && (
          <p
            className={`text-xs mt-1 ${
              isUser ? 'text-blue-100' : 'text-muted-foreground'
            }`}
          >
            {`- ${message.author}`}
          </p>
        )}
      </div>
    </div>
  )
}
