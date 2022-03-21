/**
 * bot control apis
 * /api
 */
import {
  del,
  list,
  update,
  create
} from './bot-db'
import { view } from './bot-view'
import { jwtAuth, errHandler } from '../common/jwt'
import auth from './bot-rc-auth'

export default (app) => {
  app.get('/rc/oauth', auth)
  app.get('/app/:botId', view)
  app.get('/api/list', jwtAuth, errHandler, list)
  app.put('/api/create', jwtAuth, errHandler, create)
  app.post('/api/del/:id', jwtAuth, errHandler, del)
  app.post('/api/update', jwtAuth, errHandler, update)
}
