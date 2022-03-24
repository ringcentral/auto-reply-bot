/**
 * bot control apis
 * /api
 */

import { RcUser } from '../models/rc'
import { jwtAuth, errHandler } from '../common/jwt'
import webhook from '../handlers/webhook'
import _ from 'lodash'

const propsCanUpdate = [
  'turnOffDesc',
  'on',
  'shouldUseSignature'
]
const props = [
  'id',
  'name',
  'email',
  ...propsCanUpdate,
  'firstName',
  'lastName',
  'recIds'
]

async function getUser (req, res) {
  const {
    id
  } = req.user
  const user = await RcUser.findByPk(id)
  if (!user) {
    return res.status(404).send('')
  }
  res.send(
    _.pick(user, props)
  )
}

async function updateUser (req, res) {
  const {
    id
  } = req.user
  const update = _.pick(req.body, propsCanUpdate)
  if (_.isEmpty(update)) {
    return res.status(400).send('params not right')
  }
  const r = await RcUser.update(update, {
    where: {
      id
    }
  })
  if (update && update.on === 0) {
    const user = await RcUser.findByPk(id)
    await user.removeWebHook()
  }
  res.send(
    r
  )
}

export default (app) => {
  app.get('/api/user', jwtAuth, errHandler, getUser)
  app.post('/api/update-user', jwtAuth, errHandler, updateUser)
  app.post('/rc/webhook', webhook)
}
