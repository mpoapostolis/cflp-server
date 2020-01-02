import { MongoClient, Db } from 'mongodb'

export class MongoHelper {
  public static client: MongoClient
  public static db: Db

  public static connect(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }, (err, client: MongoClient) => {
        if (err) {
          reject(err)
        } else {
          MongoHelper.client = client
          MongoHelper.db = client.db('cflp')
          resolve(client)
        }
      })
    })
  }
}

// redis.GEOADD('key', lat, lng, id)
// setTimeout(() => {
//   redis.ZREM('key', id)
// }, 30000)
