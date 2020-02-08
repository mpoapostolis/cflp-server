type Favorites = {
  storeId: string
  productId: string
}

export type ClientToken = { _id: string }
export type EmployeeToken = { _id: string; storeId: string }

export type User = {
  _id?: string
  firstName?: string
  lastName?: string
  avatar?: string
  email?: string
  gender?: 'male' | 'female'
  age?: number
  loyaltyPoints: Record<string, number>
  favorites: Favorites[]
  username: string
  password: string
  storeId: string
  permissions?: string[]
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
