export const contacts: Contact[] = [
  {
    id: '1',
    name: 'Aisha Khan',
    initial: 'A',
    company: 'Brightside Inc.',
    lastActive: '3d ago',
    status: 'New',
    channels: ['whatsapp', 'email'],
    jobTitle: 'Operations Manager',
    email: 'aisha@brightside.inc',
    phone: '+1 (555) 000-1111',
    conversations: [],
  },
  {
    id: '2',
    name: 'Neha Patel',
    initial: 'N',
    company: 'Growth Hackers',
    lastActive: '4d ago',
    status: 'New',
    channels: ['email'],
    conversations: [],
  },
  {
    id: '3',
    name: 'Rohan Mehta',
    initial: 'R',
    company: 'Mehta & Co.',
    lastActive: '5d ago',
    status: 'New',
    channels: ['call', 'instagram'],
    conversations: [],
  },
  {
    id: '4',
    name: 'Sarah Liu',
    initial: 'S',
    company: 'WaveLength Creative Co.',
    lastActive: '2m ago',
    status: 'Contacted',
    channels: ['whatsapp', 'email', 'call', 'instagram'],
    jobTitle: 'Marketing Manager',
    email: 'sarah.liu@wavelength.co',
    phone: '+1 (555) 123-4567',
    conversations: [
      {
        id: 'c1',
        name: 'Sarah Liu',
        msg: "Sure, let's schedule a quick call.",
        time: '10:33 AM',
        channel: 'whatsapp',
        unread: 2,
        active: true,
        messages: [
          { id: 'm1', senderName: 'Sarah Liu', time: '10:30 AM', text: "Hi! I'm looking for a new branding solution for our company.", isOwn: false },
          { id: 'm2', senderName: 'Me', time: '10:32 AM', text: "Hi Sarah! That's great to hear. Can you tell me more about your requirements?", isOwn: true },
          { id: 'm3', senderName: 'Sarah Liu', time: '10:33 AM', text: "Sure, let's schedule a quick call.", isOwn: false },
          { id: 'm4', senderName: 'Sarah Liu', time: '10:34 AM', text: 'Got it?', isOwn: false },
        ],
      },
    ],
  },
  {
    id: '5',
    name: 'Daniel Abu',
    initial: 'D',
    company: 'Project Horizon',
    lastActive: '15m ago',
    status: 'Contacted',
    channels: ['email'],
    conversations: [
      {
        id: 'c2',
        name: 'Daniel Abu',
        msg: 'Re: Project Requirements',
        time: '9:15 AM',
        channel: 'email',
        unread: 1,
        active: true,
        messages: [{ id: 'm5', senderName: 'Daniel Abu', time: '9:15 AM', text: 'Re: Project Requirements', isOwn: false }],
      },
    ],
  },
  {
    id: '6',
    name: 'Steve Laurent',
    initial: 'S',
    company: 'Lunar Studios',
    lastActive: '1h ago',
    status: 'Contacted',
    channels: ['instagram'],
    conversations: [],
  },
  {
    id: '7',
    name: 'Michael Tan',
    initial: 'M',
    company: 'Streamline Corp',
    lastActive: '4d ago',
    status: 'Qualified',
    channels: ['call', 'email'],
    conversations: [],
  },
  {
    id: '8',
    name: 'Daniel Lewis',
    initial: 'D',
    company: 'Lewis Innovations',
    lastActive: '5d ago',
    status: 'Qualified',
    channels: ['instagram'],
    conversations: [],
  },
  {
    id: '9',
    name: 'Riri Rora',
    initial: 'R',
    company: 'Pixel Perfect',
    lastActive: '3d ago',
    status: 'Proposal Sent',
    channels: ['email'],
    conversations: [
      {
        id: 'c3',
        name: 'Riri Rora',
        msg: 'Thanks for reaching out! 🙌',
        time: 'Yesterday',
        channel: 'instagram',
        unread: 1,
        active: false,
        messages: [{ id: 'm6', senderName: 'Riri Rora', time: 'Yesterday', text: 'Thanks for reaching out! 🙌', isOwn: false }],
      },
    ],
  },
  {
    id: '10',
    name: 'Aditya Verma',
    initial: 'A',
    company: 'Verma Solutions',
    lastActive: '1d ago',
    status: 'Converted',
    channels: ['call'],
    conversations: [],
  },
]

export default defineEventHandler(() => {
  try {
    return contacts
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API connect GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
