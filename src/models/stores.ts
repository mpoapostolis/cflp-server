import { Coords } from '../utils'

export type Store = {
  storeId: string
  name: string
  coords: Coords
  images: string[]
  description: string
  adress: string
}
