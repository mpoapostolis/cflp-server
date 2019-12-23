type Coords = [number, number]

type Product = {
  name: string
  price: number
  rating: number
}

type Store = {
  name: string
  coords: Coords
  images: string[]
  description: string
  adress: string
  products: Product[]
}
