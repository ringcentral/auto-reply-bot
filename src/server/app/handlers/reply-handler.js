import { Record } from '../models/record'

function dequote (str = '') {
  return str.slice(1, -1)
}

function check (str, all) {
  if (/^[\u4e00-\u9fa5]+$/.test(str)) {
    return all.includes(str)
  }
  return new RegExp(`(^|(\\s+))${str}((\\s+)|$)`).test(all)
}

function hasKeywords (ks, txt) {
  for (const k of ks) {
    if (
      (k.startsWith('"') && k.endsWith('"') && txt === dequote(k)) ||
      (
        (!k.startsWith('"') || !k.endsWith('"')) &&
        check(k, txt)
      )
    ) {
      return true
    }
  }
  return false
}

export const autoReply = async ({
  text, // original text
  textFiltered, // text without metion user
  group,
  user,
  creatorId,
  isTest,
  isPrivateChat,
  shouldUseSignature // should use signature like "sent by bot skill xxx" in message.
}) => {
  const recIds = user.recIds
    ? user.recIds
    : []
  const q = recIds.map(id => {
    return {
      id
    }
  })
  const faqs = !q.length
    ? []
    : await Record.batchGet(q)

  for (const faq of faqs) {
    const ks = faq.keywords.split(',').map(r => r.trim()).filter(d => d)
    if (hasKeywords(ks, textFiltered)) {
      const res = faq.reply
      const { botId } = faq
      if (botId === creatorId && !isTest) {
        continue
      }
      await Record.update({
        count: (faq.count || 0) + 1
      }, {
        where: {
          id: faq.id
        }
      })
      const sign = shouldUseSignature
        ? `\n(Auto reply by ![:Person](${botId}))`
        : ''
      const sig = isPrivateChat
        ? ''
        : `![:Person](${creatorId})) `
      await user.sendMessage(group.id, {
        text: sig + res + sign
      })
    }
  }
}
