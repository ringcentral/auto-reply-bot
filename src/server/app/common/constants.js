import { resolve } from 'path'
import RingCentral from '@rc-ex/core'
import AuthorizeUriExtension from '@rc-ex/authorize-uri'
import crypto from 'crypto'

const {
  RINGCENTRAL_SERVER,
  RINGCENTRAL_CHATBOT_SERVER,
  RINGCENTRAL_CLIENT_ID,
  RINGCENTRAL_CLIENT_SECRET
} = process.env

const arr = RINGCENTRAL_CHATBOT_SERVER.split('/')
const root = arr[0] + arr[1] + arr[2]
const cwd = process.cwd()

export const defaultState = '__default_state_'
export const extraPath = RINGCENTRAL_CHATBOT_SERVER.replace(root, '')
export const pack = require(resolve(cwd, 'package.json'))
export const jwtPrefix = crypto.createHash('md5').update(RINGCENTRAL_CHATBOT_SERVER).digest('hex')

const url = encodeURIComponent('https://github.com/ringcentral/auto-reply-bot/issues/new')
export const FEEDBACK_URL = `https://ringcentral.github.io/common-redirect?redirect=${url}&appName=auto-reply-bot`

export const createRc = async () => {
  const rc = new RingCentral({
    server: RINGCENTRAL_SERVER,
    clientId: RINGCENTRAL_CLIENT_ID,
    clientSecret: RINGCENTRAL_CLIENT_SECRET
  })
  const authorizeUriExtension = new AuthorizeUriExtension()
  await rc.installExtension(authorizeUriExtension)
  rc.redirectUrl = RINGCENTRAL_CHATBOT_SERVER + '/rc/oauth'
  rc.loginUrl = ({ state }) => {
    return authorizeUriExtension.buildUri({
      state,
      redirect_uri: rc.redirectUrl
    })
  }
  return rc
}

export const loginUrl = async () => {
  const rc = await createRc()
  return rc.loginUrl({
    state: defaultState
  })
}

export const buildLoginUrlRedirect = async (botID) => {
  const url = await loginUrl()
  return url.replace(
    defaultState,
    encodeURIComponent(RINGCENTRAL_CHATBOT_SERVER + '/app/' + botID)
  )
}

const baseURL = (name) => {
  return `https://raw.githubusercontent.com/ringcentral/github-notification-app/main/icons_v2/${name}.png`
}
export const icons = {
  feedback: baseURL('feedback')
}

export const cmdUrl = 'https://github.com/ringcentral/auto-reply-bot/blob/main/doc/command.md'

export const tokenExpireTime = 25 * 60 * 1000
export const testMessageSignature = ' [__test__]'

export function buildAuthUrl (bot, action = '') {
  return RINGCENTRAL_CHATBOT_SERVER +
  `/app/${bot.id}` +
  (action ? `?action=${action}` : '')
}
