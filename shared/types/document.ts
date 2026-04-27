export interface ProjectDocumentCollection {
  slug: string
  title: string
  date: string
  status: 'Plan' | 'Quotation' | 'Shoot' | 'Edit' | 'Delivered'
  client:
    | {
        name: string
        avatar: string | undefined
      }
    | undefined
  documentCount: number
}
