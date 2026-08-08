export interface CmsFaq {
  id: string
  question: string
  answer: string
  isActive: boolean
  order: number
  createdAt: Date | null
  updatedAt: Date | null
}
