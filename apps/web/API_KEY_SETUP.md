# AI API Key Setup Guide

## Supported Providers

### 1. **OpenAI** (Most Popular)
- Get API key: https://platform.openai.com/account/api-keys
- Model: `gpt-4-turbo` or `gpt-4`
- Pricing: Pay-as-you-go
- Key format: `sk-...`

### 2. **Anthropic Claude** (Alternative)
- Get API key: https://console.anthropic.com/
- Model: `claude-3-sonnet`
- Pricing: Pay-as-you-go
- Key format: `sk-ant-...`

### 3. **Groq** (Free Tier Available!)
- Get API key: https://console.groq.com
- Model: `mixtral-8x7b-32768`
- Free tier: 30 requests/minute
- Key format: `grok-...`

### 4. **Ollama** (Local - No API Key)
- Download: https://ollama.ai
- Run locally, completely free
- No internet required after model download

## How to Add Your API Key

1. Log in to FinComply
2. Click the **Settings** icon (⚙️) in the top right header
3. Paste your API key in the "AI API Key" field
4. Click "Save API Key"

Your key is stored in **browser local storage** only - never sent to servers.

## Recommended Setup

For **development/testing**: Use Groq (free tier)
For **production**: Use OpenAI or Claude

## Updating the API Route

When you're ready to connect a real AI provider, edit `/app/api/chat/route.ts`:

\`\`\`typescript
// Replace the mock response section with:
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: message }],
    max_tokens: 1024,
  }),
})

const data = await response.json()
return NextResponse.json({
  success: true,
  response: data.choices[0].message.content,
  citations: ['OpenAI API'],
})
