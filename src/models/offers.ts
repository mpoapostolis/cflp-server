import { Coords } from './stores'

enum offerStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT'
}

enum offerType {
  CHARGE = 'CHARGE',
  REWARD = 'REWARD'
}

type Offser = {
  storeId: string
  name: string
  type: offerType
  lpPrice: number
  coords: Coords
  status: offerStatus
  images: string[]
  purchased: number
  description: string
}
