import { MongoClient, Db } from 'mongodb'

let cachedClient = null
export async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) return cachedClient
  const URI = `mongodb+srv://mpoapostolis:${process.env['PASS']}@slourpcluster0-2kwf7.mongodb.net`
  const client = await MongoClient.connect(URI, { useUnifiedTopology: true })
  cachedClient = client
  return client
}

let cachedDb = null
export default async function slourpDb(): Promise<Db> {
  if (cachedDb) return cachedDb

  const client = await getMongoClient()
  const db = await client.db('slourp')

  cachedDb = db
  return db
}
