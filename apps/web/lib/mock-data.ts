export const mockPersonalChats = [
  {
    id: '1',
    title: 'SEBI Update: Insider Trading 2025',
    lastMsg: 'The latest message in the thread regarding the new regulations...',
    time: '5m ago',
    mode: 'personal' as const,
  },
  {
    id: '2',
    title: 'Query on LODR Regulations',
    lastMsg: 'Can you clarify the recent changes to the Listing...',
    time: 'Yesterday',
    mode: 'personal' as const,
  },
  {
    id: '3',
    title: 'Drafting a Compliance Report',
    lastMsg: 'I need help structuring the quarterly report for the...',
    time: '2 days ago',
    mode: 'personal' as const,
  },
]

export const mockCommunityThreads = [
  {
    id: 'c1',
    title: 'SEBI Circular: LODR Amendments – Nov 2025',
    participants: 42,
    lastActive: '10 min ago',
    mode: 'community' as const,
    lastMsg: 'Does this apply to unlisted firms?',
  },
  {
    id: 'c2',
    title: 'New KYC Norms for NBFCs',
    participants: 28,
    lastActive: '1h ago',
    mode: 'community' as const,
    lastMsg: 'What documents are required?',
  },
  {
    id: 'c3',
    title: 'ESG Reporting Guidelines Update',
    participants: 15,
    lastActive: '3h ago',
    mode: 'community' as const,
    lastMsg: 'How do we measure carbon footprint?',
  },
  {
    id: 'c4',
    title: 'Corporate Governance Standards',
    participants: 52,
    lastActive: '5h ago',
    mode: 'community' as const,
    lastMsg: 'Board independence requirements?',
  },
]

export const mockMessages: Record<string, any[]> = {
  '1': [
    {
      id: 'm1',
      sender: 'user',
      text: 'Do insider trading rules apply to unlisted firms?',
      timestamp: Date.now() - 3600000,
    },
    {
      id: 'm2',
      sender: 'ai',
      text: 'No. As per SEBI (Prohibition of Insider Trading) Regulations, 2015, only **listed companies** and their insiders are covered. This includes Directors, Key Managerial Personnel, and those with access to UPSI. Unlisted entities are not subject to these regulations.',
      citations: ['SEBI PIT Regulations 2015', 'SEBI Circular #789'],
      timestamp: Date.now() - 3500000,
    },
  ],
  'c1': [
    {
      id: 'm1',
      sender: 'ai',
      text: 'The LODR Amendments effective Nov 2025 introduce stricter disclosure norms and enhanced board diversity requirements. These apply to all **listed entities** on BSE and NSE.',
      citations: ['SEBI LODR 2025'],
      timestamp: Date.now() - 7200000,
    },
    {
      id: 'm2',
      sender: 'user',
      text: 'Does this apply to unlisted firms?',
      author: 'User_7a2f',
      timestamp: Date.now() - 6600000,
    },
    {
      id: 'm3',
      sender: 'ai',
      text: 'No, LODR applies only to **listed entities**. Unlisted companies follow a different framework under the Companies Act.',
      citations: ['SEBI LODR', 'Companies Act 2013'],
      timestamp: Date.now() - 6300000,
    },
  ],
}

export const getAIResponseTemplate = (userProfile: any) => {
  const { status, sector, size } = userProfile
  const prefix = status ? `As a **${size} ${sector} ${status} company**, ` : ''
  return prefix
}

export const mockSEBIUpdates = [
  { title: 'Circular on Insider Trading...', date: '24 August 2023' },
  { title: 'Master Circular for Stock...', date: '23 August 2023' },
  { title: 'Amendments to SEBI Reg...', date: '21 August 2023' },
  { title: 'Guidelines for AIFs', date: '18 August 2023' },
]
