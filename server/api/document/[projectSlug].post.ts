export default defineEventHandler(async () => {
  try {
    const config = useRuntimeConfig()

    // Create a document
    await $fetch<DocumentMeta>('/api/document/template', {
      baseURL: config.public.docUrl,
      method: 'POST',
      body: {
        template: selectedTemplate.value,
        data: payloadData,
      },
    })

    // Get the document

    // attach the document and Send a email
    await $fetch('/email/hostinger/send', {
      baseURL: 'http://localhost:3111',
      method: 'POST',
      body: {
        from: 'admin@redcatpictures.com',
        displayName: 'RED CAT PICTURES',
        to: ['shirsendu2001@gmail.com'],
        template: 'internship-completion',
        data: {
          organization: {
            id: 'red-cat-pictures',
            name: 'RED CAT PICTURES',
            website: 'https://redcatpictures.com',
            branding: {
              logo: 'https://redcatpictures.com/logo-dark.svg',
              color: {
                primary: '#CD2D2D',
                accent: '',
              },
              font: 'Exo 2',
            },
            socials: {},
          },
          studentName: 'Test 1',
          internshipRole: 'Test 2',
          certificateUrl: 'https://document.modesthumanbrands.com/api/document/4dd38bbf-8372-4a4b-a1c7-6f70d904f73e/view?download=true',
        },
      },
    })

    return { status: 'ok' }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API health GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
