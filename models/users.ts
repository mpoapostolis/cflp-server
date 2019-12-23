type Favorites = {
  storeId: string
  productId: string
}

type User = {
  name: string
  avatar: string
  surname: string
  gender: "male" | "female"
  age: number
  loyaltyPoints: Record<string, number>
  favorites: Favorites[]
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
