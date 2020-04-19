import { ItemAnalytics } from '../utils'

export type Product = {
  name: string
  storeId: string
  price: number
  lpPrice: number
  lpReward: number
  analytics: ItemAnalytics
  description: string
  images: string[]
}
