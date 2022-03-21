/**
 * handle message for bot
 */

import {
  botJoinTempRender,
  feedbackTempRender,
  actionsTempRender,
  textTempRender
} from '../templates'
import {
  FEEDBACK_URL,
  icons,
  cmdUrl,
  buildLoginUrlRedirect,
  buildAuthUrl
} from '../common/constants'
import parser from '../handlers/string-parser'
import { createFromCmd, handleCmd } from './bot-db'
import {
  sendPrivateMsg
} from '../common/send-msg'
import { RcUser } from '../models/rc'

const addCommands = [
  'add',
  'new',
  'create',
  '-n'
]

const rmCommands = [
  'rm',
  'del',
  'delete'
]

const singleCmds = [
  'list',
  'help',
  'on',
  'off',
  'signatureOff',
  'signatureOn'
]

function buildWelcomeMessage (bot, group) {
  const feedback = feedbackTempRender({
    title: 'Feedback',
    actions: true,
    url: FEEDBACK_URL,
    icon: icons.feedback
  })
  const title = textTempRender({
    text: '**Hi team!**'
  })
  const desc = parser(
  `I am **Auto reply bot**, please click the "Authorize/Manage Auto Replies" button below to authorize and create new keywords and replies, I will post this message again if you post any message and mention me.

  After set keywords and reply, your account will auto reply with the replies you set when the message match the keywords you set.

**After authorize**, You can also create keywords and reply by bot command: eg: \`@AutoReplyBot add keywords='your name' my name is Drake\`, more bot commands please check [bot command](${cmdUrl})

**You can only use bot command in private chat with me.**`
  )
  const url = buildAuthUrl(bot)
  const acts = [{
    type: 'Action.OpenUrl',
    title: 'Authorize/Manage Auto Replies',
    url
  }]
  const actions = actionsTempRender({
    actions: acts,
    hasActions: true
  })
  const r = botJoinTempRender({
    fallbackText: 'Hi Team, I am Auto reply bot!',
    title,
    desc,
    feedback,
    actions
  })
  // console.log(r)
  return JSON.parse(r)
}

async function parseCommand (text = '', userId) {
  const user = await RcUser.findByPk(userId)
  if (!user || !user.on) {
    return {
      error: 'auth'
    }
  }

  if (singleCmds.includes(text)) {
    return {
      cmd: text
    }
  }
  let arr = text.trim().split(/ +/)
  const cmd = arr[0]
  if (cmd === 'test' && arr[1]) {
    return {
      cmd: 'test',
      text: arr.splice(1).join(' ')
    }
  } else if (rmCommands.includes(cmd) && arr.length === 2 && arr[1]) {
    return {
      cmd: 'rm',
      id: arr[1]
    }
  }
  const keywordsReg = /keywords='([^']+)'/
  const matchArr = text.match(keywordsReg)
  let keywords = ''
  if (matchArr) {
    const idStr = matchArr[0]
    keywords = matchArr[1]
    arr = text.replace(idStr + ' ', '').split(' ')
  }
  const reply = arr.slice(1).join(' ')
  if (!addCommands.includes(cmd)) {
    return false
  }
  if (!keywords || !reply) {
    return false
  }
  return {
    cmd,
    keywords,
    reply
  }
}

export async function botJoin (bot, group) {
  const msg1 = buildWelcomeMessage(bot, group)
  await bot.sendAdaptiveCard(group.id, msg1)
}

export async function handleMessage (
  bot,
  group,
  text,
  userId,
  message,
  isPrivateChat
) {
  if (!isPrivateChat) {
    const msg = buildWelcomeMessage(bot, group)
    await sendPrivateMsg(
      bot, userId,
      'You can set keywords and reply from private chat here by command. Please check [bot command](https://github.com/ringcentral/auto-reply-bot/blob/master/command.md) for detail.'
    )
    await bot.sendAdaptiveCard(group.id, msg)
      .catch(e => {
        console.log('send card error', e)
      })
    return false
  }
  const conf = await parseCommand(text, userId)
  if (!conf) {
    const msg = buildWelcomeMessage(bot, group)
    await bot.sendAdaptiveCard(group.id, msg)
    return false
  }
  if (conf && conf.error === 'auth') {
    const url = await buildLoginUrlRedirect(bot.id)
    await sendPrivateMsg(
      bot, userId,
      `Please authorize first: [click to auth](${url})`
    )
    return false
  }
  if (conf.keywords) {
    await createFromCmd(conf, bot, group, userId)
  } else {
    await handleCmd(conf, bot, group, userId)
  }
}
