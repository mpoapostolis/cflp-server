import { Product } from './products'

export type Coords = [number, number]

type Store = {
  storeId: string
  name: string
  coords: Coords
  images: string[]
  description: string
  adress: string
}

const x = {
  name: 'toMagazim',
  coords: [1, 2],
  images: [],
  description: '',
  adress: ''
}
