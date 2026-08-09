export interface CmsGettingStartedItem {
  id: string
  title: string
  description: string
  imageUrl: string | null
  order: number
  isActive: boolean
  createdAt: Date | null
  updatedAt: Date | null
}
