import { Coords } from './stores'

enum offerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

type Offser = {
  storeId: string
  name: string
  coords: Coords
  loyaltyPoints?: number
  status: offerStatus
  images: string[]
  purchased: number
  description: string
}
