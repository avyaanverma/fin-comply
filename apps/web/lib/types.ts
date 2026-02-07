export interface Profile {
  id: string
  email: string
  company_status?: string
  industry_sector?: string
  company_size?: string
  created_at: string
  updated_at: string
}

export interface Thread {
  id: string
  user_id: string
  title: string
  mode: 'personal' | 'community'
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  thread_id: string
  user_id: string
  sender_type: 'user' | 'ai'
  content: string
  citations?: Array<{ title: string; source: string }>
  created_at: string
}

export interface CommunityDoubt {
  id: string
  thread_id: string
  user_id: string
  question: string
  created_at: string
}
