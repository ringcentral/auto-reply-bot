/**
 * bot control apis
 * /api
 */

import { Record } from '../models/record'
// import parser from '../handlers/string-parser'
import getId from '../common/get-id'
import { RcUser } from '../models/rc'
import _ from 'lodash'
import uid from '../common/uid'
import copy from 'json-deep-copy'
import {
  sendMsg
} from '../common/send-msg'
import {
  cmdUrl,
  testMessageSignature,
  buildLoginUrlRedirect,
  buildAuthUrl
} from '../common/constants'
import buildOffMessage from '../common/build-turn-off-warn'

const MAX_RECS = 50
const propsCanUpdate = [
  'keywords',
  'reply'
]
const propsUsed = [
  ...propsCanUpdate,
  'botId'
]
function validate (req) {
  const {
    body
  } = req
  const bd = copy(body)
  if (!bd.keywords || !bd.reply || !bd.botId) {
    return {
      error: 'keywords or reply not OK'
    }
  }
  return _.pick(bd, propsUsed)
}

export async function list (req, res) {
  const { rcId } = getId(req)
  const user = await RcUser.findByPk(rcId)
  if (!user) {
    return res.status(404).send('no user')
  }
  if (!user.recIds || !user.recIds.length) {
    return res.send([])
  }
  const q = (user.recIds || []).map(id => {
    return {
      id
    }
  })
  const insts = await Record.batchGet(q)
  res.send(
    insts
  )
}

export async function update (req, res) {
  const { id, update } = req.body
  if (!id) {
    return res.status(404).send('id required')
  }
  const { rcId } = getId(req)
  const user = await RcUser.findByPk(rcId)
  if (!user) {
    return res.status(404).send('no user')
  }
  user.recIds = user.recIds || []
  if (!user.recIds.includes(id)) {
    return res.status(404).send('no permission or not exist')
  }
  const inst = await Record.findByPk(id)
  if (!inst) {
    return res.status(404).send('404')
  }
  const up = _.pick(update, propsCanUpdate)
  await Record.update(up, {
    where: {
      id
    }
  })
  res.send(inst)
}

function getRcUser (rcId) {
  return RcUser.findByPk(rcId)
}

export async function create (req, res) {
  const data = validate(req)
  if (data.error) {
    return res.status(data.status || 400).send(data.error)
  }
  data.id = uid()
  const { rcId } = getId(req)
  const rc = await getRcUser(rcId)
  if (!rc.recIds) {
    rc.recIds = []
  }
  if (rc.recIds.length >= MAX_RECS) {
    return res.status(400).send(`Can only have ${MAX_RECS} replies`)
  }
  data.userId = rcId
  const inst = await Record.create(data)
  const {
    recIds = []
  } = rc
  const q = {
    where: {
      id: rcId
    }
  }
  recIds.push(data.id)
  await RcUser.update({
    recIds
  }, q)
  res.send(inst)
}

export async function createFromCmd (
  data,
  bot,
  group,
  user
) {
  const userId = user.id
  data.id = uid()
  data.userId = userId
  data.botId = bot.id
  const rcId = userId
  const rc = user
  if (!rc.recIds) {
    rc.recIds = []
  }
  if (rc.recIds.length >= MAX_RECS) {
    return sendMsg(
      bot, group, userId,
      `Can only have ${MAX_RECS} replies`
    )
  }
  await Record.create(data)
  const {
    recIds = []
  } = rc
  const q = {
    where: {
      id: rcId
    }
  }
  recIds.push(data.id)
  await RcUser.update({
    recIds
  }, q)
  const warn = await buildOffMessage(user, bot)
  await sendMsg(
    bot, group, userId,
    'Keywords and reply created!' + warn,
    false
  )
}

async function delAct (id, userId) {
  const user = await RcUser.findByPk(userId)
  if (!user) {
    return {
      error: 'no user'
    }
  }
  user.recIds = user.recIds || []
  if (!user.recIds.includes(id)) {
    return {
      error: 'no permission or not exist'
    }
  }
  const {
    recIds = []
  } = user
  const q = {
    where: {
      id
    }
  }
  _.remove(recIds, s => s === id)
  await RcUser.update({
    recIds
  }, {
    where: {
      id: user.id
    }
  })
  const result = await Record.destroy(q)
  return {
    result
  }
}

export async function del (req, res) {
  const { rcId } = getId(req)
  const { id } = req.params
  const r = await delAct(id, rcId)
  if (r && r.error) {
    return res.status(404).send(r.error)
  }
  res.send(r)
}

async function changeProp (bot, group, userId, update, msg) {
  await RcUser.update(update, {
    where: {
      id: userId
    }
  })
  if (update.on === 0) {
    const user = await RcUser.findByPk(userId)
    await user.removeWebHook()
  }
  let text = msg
  if (update.on === 1) {
    const url = await buildLoginUrlRedirect(bot.id)
    text = `Turn on auto reply requires authorize: [click to authorize](${url})`
  }
  await sendMsg(bot, group, userId, text, false)
}

async function cmdRm (id, bot, group, userId) {
  await delAct(id, userId)
  await sendMsg(
    bot, group, userId,
    `Keywords (id: ${id}) removed`
  )
}

const moreCmdStr = (botId) => `

More bot command detail and examples please check [command list](${cmdUrl}), you can also create/manage keywords from [webpage](${buildAuthUrl({ id: botId })})
`

function cmdHelp (conf, bot, group, userId) {
  sendMsg(
    bot, group, userId,
    `* add keywords='some-keyword' some reply: create new keywords and reply
* list: list keywords and replies
* rm {id}: delete keywords and replies
* off: disable auto reply
* on: enable auto reply
* signatureOff: disable signature in auto reply
* signatureOn: enable signature in auto reply(so others would know it is a auto reply by bot)
* test {someMessage}: test if some message would trigger auto reply

${moreCmdStr(bot.id)}
`, false
  )
}

async function cmdList (conf, bot, group, userId) {
  const { user } = conf
  if (!user) {
    return false
  }
  let insts = []
  if (!user.recIds || !user.recIds.length) {
    insts = []
  } else {
    const q = (user.recIds || []).map(id => {
      return {
        id
      }
    })
    insts = await Record.batchGet(q)
  }
  let msg = insts.length
    ? insts.reduce((p, k, i) => {
        return p + '\n' +
          `${k.id} | ${k.keywords} | ${k.reply} | ${k.count}`
      }, '** Id | Keywords | Reply | Trigger count**')
    : 'No keywords yet.'
  const warn = await buildOffMessage(user, bot)
  msg = msg + '\n\n' + warn + moreCmdStr(bot.id).replace('\n\n', '\n')
  return sendMsg(
    bot, group, userId,
    msg, false
  )
}

async function test (conf, bot, group, userId) {
  const warn = await buildOffMessage(conf.user, bot)
  if (warn) {
    return sendMsg(
      bot,
      group,
      userId,
      warn,
      false
    )
  }
  const msg = `${conf.text}${testMessageSignature}`
  return sendMsg(
    bot,
    group,
    userId,
    msg,
    false
  )
}

export async function handleCmd (conf, bot, group, userId) {
  const {
    cmd
  } = conf
  switch (cmd) {
    case 'list':
      await cmdList(conf, bot, group, userId)
      break
    case 'rm':
      await cmdRm(conf.id, bot, group, userId)
      break
    case 'on':
      await changeProp(bot, group, userId, {
        on: 1
      }, 'Auto reply enabled')
      break
    case 'off':
      await changeProp(bot, group, userId, {
        on: 0,
        turnOffDesc: 'self'
      }, 'Auto reply disabled')
      break
    case 'signatureOn':
      await changeProp(bot, group, userId, {
        shouldUseSignature: 1
      }, 'Auto reply signature enabled')
      break
    case 'signatureOff':
      await changeProp(bot, group, userId, {
        shouldUseSignature: 0
      }, 'Auto reply signature disabled')
      break
    case 'help':
      await cmdHelp(conf, bot, group, userId)
      break
    case 'test':
      await test(conf, bot, group, userId)
      break
    default:
      return false
  }
}
