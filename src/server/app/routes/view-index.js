/**
 * view index
 */

import copy from 'json-deep-copy'
import {
  pack,
  defaultState,
  jwtPrefix,
  loginUrl,
  FEEDBACK_URL
} from '../common/constants'

const {
  RINGCENTRAL_CHATBOT_SERVER,
  CDN,
  APP_HOME
} = process.env

export default (view) => {
  return async (req, res) => {
    // const list = 'https://*.hubspot.com;'
    // if (view === 'index') {
    //   res.set(
    //     'Content-Security-Policy',
    //     `frame-ancestors ${list}`
    //   )
    // }
    const { botId } = req.params
    res.set({
      'Cache-Control': 'no-cache'
    })
    const url = await loginUrl()
    const data = {
      version: pack.version,
      title: 'Authorize/Manage Auto Replies',
      server: RINGCENTRAL_CHATBOT_SERVER,
      cdn: CDN || RINGCENTRAL_CHATBOT_SERVER,
      home: APP_HOME,
      botId,
      query: req.query,
      defaultState,
      jwtPrefix,
      loginUrl: url,
      path: req.path,
      feedbackUrl: FEEDBACK_URL
    }
    data._global = copy(data)
    res.render(view, data)
  }
}
