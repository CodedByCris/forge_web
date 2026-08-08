export interface CmsModeratedPost {
  id: string
  userNickname: string
  userPhotoUrl: string | null
  workoutName: string
  likesCount: number
  commentsCount: number
  createdAt: Date | null
}

export interface CmsModeratedRoutine {
  id: string
  userNickname: string
  userPhotoUrl: string | null
  name: string
  likesCount: number
  commentsCount: number
  createdAt: Date | null
}
