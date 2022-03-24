import Sequelize from 'sequelize'
import sequelize from './sequelize'
import { createRc, tokenExpireTime } from '../common/constants'
import { Record } from './record'
import Bot from 'ringcentral-chatbot-core/dist/models/Bot'
import {
  sendPrivateMsg
} from '../common/send-msg'
import delay from 'timeout-as-promise'
import buildOffMessage from '../common/build-turn-off-warn'

export const subscribeInterval = () => '/restapi/v1.0/subscription/~?threshold=120&interval=35'

/**
 * rc user
 */
const User = sequelize.define('RcUser', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING
  },
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  },
  recIds: {
    type: Sequelize.JSON
  },
  on: {
    type: Sequelize.INTEGER,
    defaultValue: 1
  },
  turnOffDesc: {
    type: Sequelize.STRING
  },
  replyWithoutMentionInTeam: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  pauseUntil: {
    type: Sequelize.INTEGER
  },
  shouldUseSignature: {
    type: Sequelize.INTEGER,
    defaultValue: 1
  },
  lastRefreshTime: {
    type: Sequelize.INTEGER
  },
  lastUseTime: {
    type: Sequelize.INTEGER
  },
  token: {
    type: Sequelize.JSON
  }
})

User.prototype.rc = async function () {
  const rc = await createRc()
  if (this.token) {
    rc.token = this.token
  }
  return rc
}

User.prototype.removeWebHook = async function () {
  return this.ensureWebHook(true)
}

User.prototype.ensureWebHook = async function (removeOnly = false) {
  await this.tryRefresh()
  const rc = await this.rc()
  const r = await rc.get('/restapi/v1.0/subscription')
    .then(d => d.data)
    .catch(e => {
      console.log(e, 'list WebHook error')
    })
  if (r && r.records) {
    for (const sub of r.records) {
      if (sub.deliveryMode.address === process.env.RINGCENTRAL_CHATBOT_SERVER + '/rc/webhook') {
        await rc.delete(`/restapi/v1.0/subscription/${sub.id}`)
          .catch(e => {
            console.log(e, 'del WebHook error, id:', sub.id)
          })
      }
    }
  }
  if (!removeOnly) {
    return this.trySetupWebHook()
  }
}

User.prototype.trySetupWebHook = async function () {
  let count = 0
  let done = false
  while (count < 5 && !done) {
    done = await this.setupWebHook()
    count = count + 1
    await delay(1)
  }
  if (!done) {
    await this.turnOff()
  }
}

User.prototype.setupWebHook = async function () {
  await this.tryRefresh()
  const rc = await this.rc()
  await rc.post('/restapi/v1.0/subscription', {
    eventFilters: [
      '/restapi/v1.0/glip/posts',
      '/restapi/v1.0/glip/groups',
      subscribeInterval()
    ],
    expiresIn: 1799,
    deliveryMode: {
      transportType: 'WebHook',
      address: process.env.RINGCENTRAL_CHATBOT_SERVER + '/rc/webhook'
    }
  })
    .then(() => true)
    .catch(async e => {
      console.log('setupWebHook error', e)
    })
}

User.prototype.getSubscriptions = async function () {
  await this.tryRefresh()
  const rc = await this.rc()
  return rc.get('/restapi/v1.0/subscription')
    .then(d => d.data.records)
    .catch(e => {
      console.log('getSubscriptions error', e)
      return []
    })
}

User.prototype.tryRefresh = async function () {
  const now = Date.now()
  const { lastRefreshTime } = this
  if (now - lastRefreshTime < tokenExpireTime) {
    return false
  }
  await this.refresh()
}

User.prototype.refresh = async function () {
  try {
    const rc = await this.rc()
    await rc.refresh()
    const { token } = rc
    const now = Date.now()
    const up = {
      token,
      lastRefreshTime: now
    }
    await User.update(up, {
      where: {
        id: this.id
      }
    })
    Object.assign(this, up)
    return true
  } catch (e) {
    console.log('User refresh token error', e)
    await this.turnOff()
    console.log(`User ${this.id} refresh token has expired`)
    return false
  }
}

User.prototype.turnOff = async function (groupId) {
  const up = {
    on: 0,
    turnOffDesc: 'fail'
  }
  await User.update(
    up,
    {
      where: {
        id: this.id
      }
    }
  )
  Object.assign(this, up)
  const {
    recIds
  } = this
  if (recIds && recIds[0]) {
    const id = recIds[0]
    const rec = await Record.findByPk(id)
    if (!rec) {
      return false
    }
    const { botId } = rec
    const bot = await Bot.findByPk(botId)
    if (bot) {
      const msg = await buildOffMessage(this, bot)
      await sendPrivateMsg(bot, this.id, msg)
    }
  }
}

User.prototype.getGroup = async function (groupId) {
  await this.tryRefresh()
  const rc = await this.rc()
  return rc.get(`/restapi/v1.0/glip/groups/${groupId}`)
    .then(d => d.data)
    .catch(e => {
      console.log('get group error', e)
      return null
    })
}

User.prototype.sendMessage = async function (groupId, messageObj) {
  await this.tryRefresh()
  const rc = await this.rc()
  const r = await rc.post(`/restapi/v1.0/glip/groups/${groupId}/posts`, messageObj)
    .then(d => d.data)
    .catch(err => {
      console.log('send msg error', err)
    })
  return {
    sendResult: r
  }
}

export const RcUser = User
