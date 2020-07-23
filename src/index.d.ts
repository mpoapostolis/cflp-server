declare namespace Express {
  export interface Request {
    user?: {
      id: string
      store_id?: string
    }
  }
}
