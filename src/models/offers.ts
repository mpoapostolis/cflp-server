import { Coords, ItemAnalytics } from '../utils'

export enum offerStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export type Discounts = {
  products: string
  discount: number
}[]

export type Offer = {
  storeId: string
  name: string
  description: string
  coords: Coords
  images: string[]
  price: number
  lpPrice: number
  status: offerStatus
  analytics: ItemAnalytics
  discounts: Discounts
}
