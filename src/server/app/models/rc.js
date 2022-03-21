import Sequelize from 'sequelize'
import sequelize from './sequelize'
import delay from 'timeout-as-promise'
import { createRc, tokenExpireTime } from '../common/constants'

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
  try {
    await this.tryRefresh()
    const rc = await this.rc()
    const r = await rc.get('/restapi/v1.0/subscription')
      .then(d => d.data)
    for (const sub of r.records) {
      if (sub.deliveryMode.address === process.env.RINGCENTRAL_CHATBOT_SERVER + '/rc/webhook') {
        await rc.delete(`/restapi/v1.0/subscription/${sub.id}`)
      }
    }
  } catch (e) {
    console.log(e, 'ensureWebHook error')
  }

  if (!removeOnly) {
    return this.setupWebHook()
  }
}

User.prototype.setupWebHook = async function () {
  await this.tryRefresh()
  let done = false
  while (!done) {
    try {
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
      done = true
      return done
    } catch (e) {
      console.log('error', e)
      const { message } = e
      if (message.includes('SUB-406') || message.includes('SUB-521')) {
        await delay(10000)
        continue
      }
      throw e
    }
  }
}

User.prototype.getSubscriptions = async function () {
  try {
    await this.tryRefresh()
    const rc = await this.rc()
    return rc.get('/restapi/v1.0/subscription')
      .then(d => d.data.records)
  } catch (e) {
    console.log('getSubscriptions error', e)
    return []
  }
}

User.prototype.tryRefresh = async function () {
  const now = Date.now()
  const { lastRefreshTime } = this
  if (now - lastRefreshTime > tokenExpireTime) {
    await this.refresh()
  }
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
    console.log('User refresh token', e)
    await User.update(
      {
        on: 0
      },
      {
        where: {
          id: this.id
        }
      }
    )
    console.log(`User ${this.id} refresh token has expired`)
    return false
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
