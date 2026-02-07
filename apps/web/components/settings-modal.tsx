'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    if (apiKey) {
      localStorage.setItem('ai_api_key', apiKey)
    }
    setIsSaving(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-lg dark:bg-slate-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Settings</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              AI API Key
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Enter your OpenAI, Claude, or Groq API key
            </p>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 pr-10"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground text-sm"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-xs text-blue-900 dark:text-blue-200">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-muted dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isSaving ? 'Saving...' : 'Save API Key'}
          </button>
        </div>
      </div>
    </div>
  )
}
