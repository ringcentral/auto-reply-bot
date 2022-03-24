import {
  buildLoginUrlRedirect
} from './constants'

export default async function buildOffMessage (user, bot) {
  let warn = ''
  if (user && !user.on) {
    const url = await buildLoginUrlRedirect(bot.id)
    warn = user.turnOffDesc === 'self'
      ? 'You have disabled auto reply.'
      : 'Renew token failure caused auto reply turned off.'
    warn = `\n${warn} You can [click to enable auto reply](${url})\n`
  }
  return warn
}
