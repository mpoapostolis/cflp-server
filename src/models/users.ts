export type User = {
  firstName?: string
  lastName?: string
  avatar?: string
  email?: string
  gender: 'male' | 'female'
  age: number
  loyaltyPoints: Record<string, number>
  favorites: string[]
  username: string
  password: string
}
