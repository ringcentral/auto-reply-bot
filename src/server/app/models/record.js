/**
 * ringcentral id and github id mapping
 */

import Sequelize from 'sequelize'
import sequelize from './sequelize'

export const Record = sequelize.define('Record', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  keywords: {
    type: Sequelize.STRING
  },
  userId: {
    type: Sequelize.STRING
  },
  botId: {
    type: Sequelize.STRING
  },
  count: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  reply: {
    type: Sequelize.STRING
  }
})
