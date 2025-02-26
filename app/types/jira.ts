export interface Sprint {
  id: number
  name: string
  state: string
}

export interface Issue {
  id: string
  key: string
  summary: string
  description: string | any
  status: string
  department: string
  subtasks: {
    id: string
    summary: string
    status: string
  }[]
  comments: Comment[]
  created: string
  sprint: Sprint | null
  isBacklog: boolean
  showInBacklog: boolean
}

export interface Comment {
  id: string
  body: string | any
  author: string
  created?: string
}

