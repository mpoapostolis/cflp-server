declare namespace Express {
  export interface Request {
    user?: {
      id: string
      store_id?: string
    }
  }
  export interface Response {
    sendEventStreamData?: (data: any) => void
  }
}
