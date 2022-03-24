import copy from 'json-deep-copy'
import jwt from 'jsonwebtoken'
import { pack, jwtPrefix, createRc } from '../common/constants'
import { RcUser } from '../models/rc'
import _ from 'lodash'

const {
  SERVER_SECRET,
  RINGCENTRAL_CHATBOT_SERVER
} = process.env

async function init (code) {
  const rc = await createRc()
  await rc.authorize({
    redirect_uri: rc.redirectUrl,
    code
  }).then(d => d.data)
  const rcToken = rc.token
  const info = await rc.get('/restapi/v1.0/account/~/extension/~')
    .then(r => r.data)
  const rcId = rcToken.owner_id
  let user = await RcUser.findByPk(rcId)
  const now = Date.now()
  const up = {
    on: 1,
    token: rcToken,
    lastUseTime: now,
    lastRefreshTime: now,
    name: info.name,
    ..._.pick(info.contact, [
      'firstName',
      'lastName',
      'email'
    ])
  }
  const q = {
    where: {
      id: rcId
    }
  }
  if (!user) {
    user = await RcUser.create({
      id: rcId,
      ...up
    })
  } else {
    Object.assign(user, up)
    await RcUser.update(up, q)
  }
  await user.ensureWebHook()
  return rcId
}

export default async (req, res) => {
  const { code, state } = req.query
  const id = await init(code)
  const token = jwt.sign({
    id
  }, SERVER_SECRET, { expiresIn: '120y' })
  const red = state

  const data = {
    redirect: red,
    title: pack.name,
    jwtPrefix,
    token,
    cdn: RINGCENTRAL_CHATBOT_SERVER
  }
  const view = 'rc-oauth'
  data._global = copy(data)
  res.render(view, data)
}
