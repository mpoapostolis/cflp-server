import { Router, Request, Response } from 'express'
import { validateAdminToken, generateSortFilter } from '../../utils'
import { EmployeeToken } from 'models/users'
import { MongoHelper } from '../../mongoHelper'
import * as multer from 'multer'
import * as R from 'ramda'
import * as crypto from 'crypto'
import { ObjectID } from 'bson'
import * as fs from 'fs'
const offers = Router()

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, `/home/tolis/Desktop/projects/cflp/cflp-server/src/images`)
  },
  filename: function(req, file, cb) {
    const [, type] = file.mimetype.split('/')
    cb(null, `${crypto.randomBytes(18).toString('hex')}.${type}`)
  }
})

const upload = multer({ storage })

offers.get('/', validateAdminToken, async (req: Request, res: Response) => {
  const { offset = 0, limit = 25, searchTerm = '', status, type, sortBy = 'date:DESC' } = req.query
  const sort = generateSortFilter(sortBy)
  let filters = {}
  if (status) filters['status'] = status
  if (type) filters['type'] = type

  const user = req.user as EmployeeToken

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('offers')
    .find({
      storeId: user.storeId,
      name: { $regex: searchTerm, $options: 'gi' },
      ...filters
    })
    .sort(sort)
    .skip(+offset)
    .limit(+limit)

    .toArray()
    .catch(console.log)

  const total = await MongoHelper.db
    .collection('offers')
    .find({ storeId: user.storeId })
    .count()
    .catch(r => r)
    .finally(() => {
      MongoHelper.client.close()
    })
  res.send({ data, offset: +offset, limit: +limit, total })
})

offers.get('/:id', validateAdminToken, async (req: Request, res: Response) => {
  const params = req.params
  await MongoHelper.connect()
  const product = await MongoHelper.db.collection('offers').findOne({ _id: new ObjectID(params.id) })
  MongoHelper.client.close()
  res.json(product)
})

offers.post('/', validateAdminToken, upload.array('image'), async (req: Request, res: Response) => {
  const { name, description = '', status, loyaltyPoints } = JSON.parse(req.body.infos)
  const user = req.user as EmployeeToken

  const error = {}
  if (!['ACTIVE', 'DRAFT'].includes(status)) error['status'] = 'status must be ACTIVE or DRAFT'
  if (!Boolean(name)) error['name'] = 'name cant be empty'
  if (!R.isEmpty(error)) return res.status(400).json({ error })

  const images = R.map(
    (o: any) => R.prop('path', o).replace('/home/tolis/Desktop/projects/cflp/cflp-server/src', ''),
    R.propOr([], 'files', req)
  )

  await MongoHelper.connect()
  const nameAlreadyExists = await MongoHelper.db.collection('offers').findOne({ name, storeId: user.storeId })
  if (nameAlreadyExists) {
    return res.status(400).json({ error: { name: 'name already exists' } })
  }
  const data = await MongoHelper.db.collection('offers').insertOne({
    name,
    description,
    status,
    images,
    loyaltyPoints,
    storeId: user.storeId
  })
  MongoHelper.client.close()

  res.json(data.ops[0])
})

offers.put('/:id', validateAdminToken, upload.array('image'), async (req: Request, res: Response) => {
  const { name, description = '', status, discounts = [] } = JSON.parse(req.body.infos)
  const user = req.user as EmployeeToken

  const error = {}
  if (!['ACTIVE', 'DRAFT'].includes(status)) error['status'] = 'status must be ACTIVE or DRAFT'
  if (!Boolean(name)) error['name'] = 'name cant be empty'
  if (!R.isEmpty(error)) return res.status(400).json({ error })

  const images = R.map(
    (o: any) => R.prop('path', o).replace('/home/tolis/Desktop/projects/cflp/cflp-server/src', ''),
    R.propOr([], 'files', req)
  )

  await MongoHelper.connect()
  await MongoHelper.db.collection('offers').updateOne(
    { _id: new ObjectID(req.params.id) },
    {
      $push: { images: { $each: images } },
      $set: {
        name,
        description,
        status,
        discounts,
        storeId: user.storeId
      }
    }
  )
  MongoHelper.client.close()

  res.json({ msg: 'ok' })
})

offers.delete('/:id/images', validateAdminToken, async (req: Request, res: Response) => {
  const { paths = [] } = req.body

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('offers')
    .updateOne({ _id: new ObjectID(req.params.id) }, { $pull: { images: { $in: paths } } })

  paths.forEach(path => {
    fs.unlink(`/home/tolis/Desktop/projects/cflp/cflp-server/src/${path}`, err => {})
  })
  MongoHelper.client.close()

  res.json(data)
})

offers.delete('/:id', validateAdminToken, async (req: Request, res: Response) => {
  await MongoHelper.connect()
  await MongoHelper.db.collection('offers').deleteOne({ _id: new ObjectID(req.params.id) })

  MongoHelper.client.close()

  res.json({ msg: 'ok' })
})

offers.post('/activate', validateAdminToken, async (req: Request, res: Response) => {
  await MongoHelper.connect()
  await MongoHelper.db
    .collection('offers')
    .updateOne({ _id: new ObjectID(req.body.id) }, { $set: { status: 'ACTIVE' } })

  MongoHelper.client.close()

  res.json({ msg: 'ok' })
})

offers.post('/deactivate', validateAdminToken, async (req: Request, res: Response) => {
  await MongoHelper.connect()
  await MongoHelper.db.collection('offers').updateOne({ _id: new ObjectID(req.body.id) }, { $set: { status: 'DRAFT' } })

  MongoHelper.client.close()

  res.json({ msg: 'ok' })
})

export default offers
