export default defineEventHandler(() => {
  try {
    const leads: Contact[] = [
      // --- NEW ---
      {
        id: '1',
        name: 'Aisha Khan',
        company: 'Brightside Inc.',
        lastActive: '3d ago',
        status: 'New',
        platforms: ['whatsapp', 'email'],
        jobTitle: 'Operations Manager',
        email: 'aisha@brightside.inc',
        phone: '+1 (555) 000-1111',
      },
      {
        id: '2',
        name: 'Neha Patel',
        company: 'Growth Hackers',
        lastActive: '4d ago',
        status: 'New',
        platforms: ['email'],
      },
      {
        id: '3',
        name: 'Rohan Mehta',
        company: 'Mehta & Co.',
        lastActive: '5d ago',
        status: 'New',
        platforms: ['call', 'instagram'],
      },

      // --- CONTACTED ---
      {
        id: '4',
        name: 'Sarah Liu',
        company: 'WaveLength Creative Co.',
        lastActive: '2m ago',
        status: 'Contacted',
        platforms: ['whatsapp', 'email', 'call', 'instagram'],
        jobTitle: 'Marketing Manager',
        email: 'sarah.liu@wavelength.co',
        phone: '+1 (555) 123-4567',
      },
      {
        id: '5',
        name: 'Daniel Abu',
        company: 'Project Horizon',
        lastActive: '15m ago',
        status: 'Contacted',
        platforms: ['email'],
      },
      {
        id: '6',
        name: 'Steve Laurent',
        company: 'Lunar Studios',
        lastActive: '1h ago',
        status: 'Contacted',
        platforms: ['instagram'],
      },

      // --- QUALIFIED ---
      {
        id: '7',
        name: 'Michael Tan',
        company: 'Streamline Corp',
        lastActive: '4d ago',
        status: 'Qualified',
        platforms: ['call', 'email'],
      },
      {
        id: '8',
        name: 'Daniel Lewis',
        company: 'Lewis Innovations',
        lastActive: '5d ago',
        status: 'Qualified',
        platforms: ['instagram'],
      },

      // --- PROPOSAL SENT ---
      {
        id: '9',
        name: 'Riri Rora',
        company: 'Pixel Perfect',
        lastActive: '3d ago',
        status: 'Proposal Sent',
        platforms: ['email'],
      },

      // --- CONVERTED ---
      {
        id: '10',
        name: 'Aditya Verma',
        company: 'Verma Solutions',
        lastActive: '1d ago',
        status: 'Converted',
        platforms: ['call'],
      },
    ]

    return leads
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
