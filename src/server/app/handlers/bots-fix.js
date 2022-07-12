/**
 * renew all rc tokens task
 * should have a limit or may take too long
 */

import Bot from 'ringcentral-chatbot-core/dist/models/Bot'
import { maintainBots } from '../common/maintain'

// const deadline = 1000 * 60 * 60 * 24 * 90
const limit = parseInt(process.env.RENEW_LIMIT, 30)

function nextTask (lastKey) {
  console.log('send next renew request', lastKey)
  // const url = `${process.env.RINGCENTRAL_APP_SERVER}/admin/renew-token?db=${db}&lastKey=${lastKey}`
  // axios.put(
  //   url,
  //   undefined,
  //   {
  //     auth: {
  //       username: process.env.RINGCENTRAL_ADMIN_USERNAME,
  //       password: process.env.RINGCENTRAL_ADMIN_PASSWORD
  //     }
  //   }
  // )
  return maintainBots({
    lastKey,
    app: 'maintainBots'
  })
}

export default async function renew (req, res) {
  const {
    lastKey
  } = req.query
  const q = {
    limit
  }
  if (lastKey) {
    q.lastKey = {
      id: lastKey
    }
  }
  console.log('running ensure bot subscribe task')
  const bots = await Bot.findAll(q)
  console.log('bots:', bots.length)
  let i = 1
  for (const bot of bots) {
    console.log(i, 'bot', bot.id)
    await bot.ensureWebHook().catch(err => {
      console.log('ensureWebHook for bot id', bot.id, 'failed', err)
    })
    i++
  }
  if (bots.lastKey) {
    await nextTask(bots.lastKey.id)
  }
  res.send('ok')
}

// trigger by native lambda event
export function triggerMaintainBots (event) {
  console.log('event- for maintain---', event)
  return new Promise((resolve, reject) => {
    const {
      lastKey
    } = event
    const req = {
      query: {
        lastKey
      }
    }
    const res = {
      send: resolve
    }
    renew(req, res)
  })
}
