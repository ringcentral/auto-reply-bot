/**
 * handle triggers
 */

import { triggerMaintain } from './renew'
import { triggerMaintainBots } from './bots-fix'

export default function (event) {
  // console.log('event', event)
  const {
    app
  } = event
  if (app === 'maintain') {
    return triggerMaintain(event)
  } else if (app === 'maintainBots') {
    triggerMaintainBots(event)
  }
}
