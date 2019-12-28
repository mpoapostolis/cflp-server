export type tokenInfo = { _id: string }

export type Employee = {
  _id?: string
  username: string
  password: string
  avatar?: string
  permissions: string[]
  firstName?: string
  lastName?: string
  gender?: 'male' | 'female'
  age?: number
}
