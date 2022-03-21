
/**
 * lambda file
 */
import serverlessHTTP from 'serverless-http'
import app1 from './app/app'
import axios from 'axios'
import triggerFunc from './app/handlers/trigger'

export const app = serverlessHTTP(app1)

export const trigger = async (event) => {
  return triggerFunc(event)
}

export const maintain = async () => {
  console.log('send renew request')
  return axios.put(
    `${process.env.RINGCENTRAL_APP_SERVER}/admin/renew`,
    undefined,
    {
      auth: {
        username: process.env.RINGCENTRAL_CHATBOT_ADMIN_USERNAME,
        password: process.env.RINGCENTRAL_CHATBOT_ADMIN_PASSWORD
      }
    }
  )
}
