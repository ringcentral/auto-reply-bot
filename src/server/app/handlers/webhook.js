import _ from 'lodash'
import { RcUser, subscribeInterval } from '../models/rc'
import onAddPost from './on-add-post'
import { autoReply } from './reply-handler'

export default async (req, res) => {
  const message = req.body
  // console.log('rc webhook', message)
  const isRenewEvent = _.get(message, 'event') === subscribeInterval()
  const userId = (_.get(message, 'body.extensionId') || _.get(message, 'ownerId') || '').toString()
  if (!userId) {
    res.set({
      'validation-token': req.get('validation-token') || req.get('Validation-Token')
    })
    return res.send('ok')
  }
  const user = await RcUser.findByPk(userId)
  // console.log('webhook user', userId, user)
  if (isRenewEvent && user) {
    // get reminder event, do token renew and subscribe renew
    // console.log(new Date().toString(), 'receive renew event, user id', userId)
    // await user.refresh()
    await user.ensureWebHook()
    return
  }
  const eventType = _.get(message, 'body.eventType')
  const { shouldUseSignature } = user
  if (eventType === 'PostAdded') {
    const result = await onAddPost(message, user)
    if (result) {
      await autoReply({
        type: 'Message4Bot',
        shouldUseSignature,
        ...result
      })
    }
  }
  res.set({
    'validation-token': req.get('validation-token') || req.get('Validation-Token')
  })
  res.send('WebHook got')
}
