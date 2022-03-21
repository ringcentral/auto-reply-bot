/**
 * bot control apis
 * /api
 */

import getId from '../common/get-id'
import { RcUser } from '../models/rc'
import { Record } from '../models/record'
import _ from 'lodash'

export async function listRecords (req, res) {
  const { rcId } = getId(req)
  const user = await RcUser.findByPk(rcId)
  if (!user) {
    return res.status(404).send('no user')
  }
  const {
    recIds
  } = req.body
  const q = _.uniq(
    (recIds || [])
      .filter(id => {
        return user.pollIds.includes(id.split('#')[0])
      })
  )
    .map(id => {
      return {
        id
      }
    })
  if (!q.length) {
    return res.send([])
  }
  const insts = await Record.batchGet(q)
  res.send(insts)
}
