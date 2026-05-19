export type PostType = 'parent' | 'reply'

export type Post = {
  id: string
  type: PostType
  author: string
  subject: string
  email: string
  site: string
  date: string
  userAgent: string
  ip: string
  icon: string
  color: string
  authorized: boolean
  body: string
}

export type Thread = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  author: string
  replyCount: number
  posts: Post[]
}
