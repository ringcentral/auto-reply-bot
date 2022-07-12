import { invoke, getName } from './invoke'

export function maintain (data = {
  db: 'rc',
  app: 'maintain'
}) {
  const name = getName()
  return invoke(data, name)
}

export function maintainBots (data = {
  db: 'bot',
  app: 'maintain'
}) {
  const name = getName()
  return invoke(data, name)
}
