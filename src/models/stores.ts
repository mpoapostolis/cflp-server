import { Coords } from '../utils'

type Rating = {
  average: number
  counter: number
}

export type Store = {
  storeId: string
  name: string
  coords: Coords
  images: string[]
  description: string
  adress: string
  rating: Rating
}
