type Favorites = {
  storeId: string
  productId: string
}

export type tokenInfo = { _id: string }

export type User = {
  _id?: string
  firstName?: string
  lastName?: string
  avatar?: string
  gender?: 'male' | 'female'
  age?: number
  loyaltyPoints: Record<string, number>
  favorites: Favorites[]
  username: string
  password: string
}

/**
 * example
 *  {
 *    name: apo,
 *    avatar: www.images.com/random,
 *    surname: mpo,
 *    gender: "male",
 *    age: 28,
 *    loyaltyPoints: {
 *      storeId: number,
 *    },
 *    favorites: [...
 *      {
 *        storeId: xxx-xxx-xxx-xxx,
 *        productId: xxx-xxx-xxx-xxx
 *      }
 *    ],
 *  }
 *
 */
