import { MongoClient, Db } from 'mongodb'

let cachedDb = null

export default async function slourpDb(): Promise<Db> {
  const URI = `mongodb+srv://mpoapostolis:${process.env['PASS']}@slourpcluster0-2kwf7.mongodb.net`
  if (cachedDb) return cachedDb

  const client = await MongoClient.connect(URI, { useUnifiedTopology: true })
  const db = await client.db('slourp')

  cachedDb = db
  return db
}
