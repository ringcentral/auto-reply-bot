export async function sendMsg (bot, group, userId, text, mention = true) {
  const pre = mention ? `![:Person](${userId}) ` : ''
  await bot.sendMessage(group.id, {
    text: `${pre}${text}`
  })
}

async function openChat (bot, id) {
  const data = {
    members: [
      {
        id
      }
    ]
  }
  return bot.rc.post('/restapi/v1.0/glip/conversations', data)
    .then(r => r.data)
    .catch(e => {
      console.log('open chat error', e)
    })
}

export async function sendPrivateMsg (bot, userId, text) {
  const chat = await openChat(bot, userId)
  await bot.sendMessage(chat.id, {
    text: `![:Person](${userId}) ${text}`
  }).catch(e => {
    console.log('bot chat error', e)
  })
}
