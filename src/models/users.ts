export enum Gender {
  'male' = 'male',
  'female' = 'female',
}

export type User = {
  firstName?: string
  lastName?: string
  avatar?: string
  email?: string
  gender: Gender
  birthday: Date
  loyaltyPoints: Record<string, number>
  favorites: string[]
  username: string
  password: string
}
