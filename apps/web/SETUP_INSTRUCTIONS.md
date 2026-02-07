# FinComply Setup Instructions

## 1. Run Database Migrations

First, execute the SQL script to set up your Supabase database:

\`\`\`bash
# The migration script is at: scripts/001_create_tables.sql
# Copy the entire content and run it in your Supabase SQL editor at:
# https://app.supabawhense.com/project/[YOUR_PROJECT_ID]/sql/new
\`\`\`

Or you can run it from the scripts folder directly in v0.

## 2. Configure Environment Variables

All required environment variables are already set up in your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- And others...

## 3. Set Up Google OAuth (Optional)

To enable Google login:

1. Go to your Supabase project settings
2. Navigate to Authentication → Providers
3. Enable Google OAuth and add your credentials from Google Cloud Console
4. The app automatically handles the OAuth callback at `/auth/callback`

## 4. Add Your AI API Key

Once you've set up an account with your preferred AI provider (OpenAI, Claude, Groq, etc.):

1. Log in to FinComply
2. Click the Settings icon (gear icon) in the top right
3. Paste your API key
4. The key is stored locally in your browser and used to authenticate with the AI provider

## 5. Start Using FinComply

1. Create an account or sign in with Google
2. Fill out your company profile
3. Go to Personal tab and click "New Query"
4. Ask any SEBI compliance question
5. Join Community threads to discuss with others

## Database Schema

### Tables:
- **profiles**: User company information and preferences
- **threads**: Personal and community chat threads
- **messages**: All messages in threads
- **community_doubts**: Questions posted in community threads

All tables have Row Level Security (RLS) enabled for data protection.

## API Integration

The `/api/chat` endpoint handles all AI requests:

- Checks for API key in browser storage
- Sends your query to the AI provider (using the API key you provided)
- Returns the response with citations
- Saves everything to Supabase database

**Your API key never leaves your browser** - it's used directly from the client-side settings.

## Troubleshooting

**Q: "API key not configured"**
A: Go to Settings (gear icon) and add your AI provider's API key

**Q: Chats not saving**
A: Check that you're logged in and Supabase tables are created (run the SQL migration)

**Q: Google login not working**
A: Set up Google OAuth provider in Supabase Authentication settings

**Q: Dark mode not persisting**
A: It should auto-save. Try clearing browser cache or refreshing.
