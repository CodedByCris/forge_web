export type CmsLegalDocumentId = 'privacy_policy' | 'terms_of_service'

export interface CmsLegalDocument {
  id: CmsLegalDocumentId
  contentHtml: string
  version: number
  updatedAt: Date | null
}
