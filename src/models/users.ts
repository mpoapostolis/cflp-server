export enum Gender {
  'male' = 'male',
  'female' = 'female',
}

export type User = {
  id: string
  store_id: string
  first_name: string
  last_name: string
  avatar: string
  email: string
  gender: string
  loyalty_points: Record<string, number>
  groups: {
    ageGroup: string
    gender: string
  }
  favorites: string[]
  user_name: string
  fb_id: string
  date_created: string
  token: string
  refresh_token: string
}
