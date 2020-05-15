import { Pool } from 'pg'

import * as knex from 'knex'
import * as knexPostgis from 'knex-postgis'

export const qb = knex({
  client: 'pg',
})

export const st = knexPostgis(qb)

const pool = new Pool({
  host: 'localhost',
  user: 'mpoapostolis',
  database: 'slourp',
  password: 'system',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export default pool
