export type Coords = [number, number]

type Product = {
  name: string
  price: number
  rating: number
}

type Store = {
  storeId: string
  name: string
  coords: Coords
  images: string[]
  description: string
  adress: string
  products: Product[]
}
