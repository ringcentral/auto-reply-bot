
/**
 * lambda file
 */
import serverlessHTTP from 'serverless-http'
import app1 from './app/app'
import triggerFunc from './app/handlers/trigger'
import { maintain as maintainFunc } from './app/common/maintain'

export const app = serverlessHTTP(app1)

export const maintain = async () => {
  console.log('send renew request')
  await maintainFunc()
}

export const trigger = async (event) => {
  return triggerFunc(event)
}
