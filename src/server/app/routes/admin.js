
import basicAuth from 'express-basic-auth'
import renewTask from '../handlers/renew'
import { Record } from '../models/record'
// import { RcUser } from '../models/rc'

const {
  RINGCENTRAL_CHATBOT_ADMIN_USERNAME,
  RINGCENTRAL_CHATBOT_ADMIN_PASSWORD
} = process.env

const auth = basicAuth({
  users: {
    [RINGCENTRAL_CHATBOT_ADMIN_USERNAME]: RINGCENTRAL_CHATBOT_ADMIN_PASSWORD
  }
})

// create database tables if not exists
const initDb = async (req, res) => {
  await Record.sync()
  res.send('ok')
}

// async function test (req, res) {
//   const all = await RcUser.findAll()
//   const a = await RcUser.findByPk(all[0].id)
//   await a.removeWebHook()
//   res.send(all)
// }

export default (app) => {
  app.put('/admin/setup-database', auth, initDb)
  app.put('/admin/renew', auth, renewTask)
  // app.put('/admin/test', auth, test)
}
