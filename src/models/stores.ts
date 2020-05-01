import { Coords } from '../utils'

type Rating = {
  average: number
  counter: number
}

export type Store = {
  _id: string
  name: string
  coords: Coords
  images: string
  description: string
  adress: string
  rating: Rating
}
