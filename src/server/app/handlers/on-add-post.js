/**
 * default parser for add post event
 */
// import { RcUser } from '../models/rc'
import { testMessageSignature } from '../common/constants'

export default async (message, user) => {
  const { text } = message.body
  if (!text) {
    return // not a text message
  }
  const { ownerId } = message
  const { creatorId } = message.body
  if (ownerId === creatorId) {
    return // bot should not talk to itself to avoid dead-loop conversation
  }
  const { groupId } = message.body
  const group = await user.getGroup(groupId)
  const isPrivateChat = group.members.length <= 2
  const isNotMentioned = !message.body.mentions ||
  !message.body.mentions.some(m => m.type === 'Person' && m.id === ownerId)
  // const replyWithoutMentionInTeam = _.get(user, 'data.replyWithoutMentionInTeam')
  if (
    !isPrivateChat &&
    isNotMentioned
  ) {
    // only respond to mentioned chat in group chat or private chat
    return
  }
  const regex = new RegExp(`!\\[:Person\\]\\(${user.id}\\)`)
  const isTest = text.includes(testMessageSignature)
  const textFiltered = text.replace(regex, ' ').trim().replace(testMessageSignature, '')
  return {
    text,
    creatorId,
    textFiltered,
    isPrivateChat,
    group,
    user,
    isTest
  }
}
