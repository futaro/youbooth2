const Sequelize = require('sequelize').Sequelize

let Track = connection => {
  return connection.define('tracks', {
    id         : {
      type         : Sequelize.INTEGER,
      primaryKey   : true,
      autoIncrement: true
    },
    workspace  : {
      type     : Sequelize.STRING(255),
      allowNull: false
    },
    channel    : {
      type     : Sequelize.STRING(255),
      allowNull: false
    },
    type       : {
      type     : Sequelize.CHAR(16),
      allowNull: false
    },
    uid        : {
      type     : Sequelize.CHAR(255),
      allowNull: false
    },
    title      : {
      type     : Sequelize.STRING(255),
      allowNull: false
    },
    duration   : {
      type     : Sequelize.INTEGER,
      allowNull: false
    },
    isPlayed   : {
      type     : Sequelize.SMALLINT,
      allowNull: false
    },
    requestedBy: {
      type     : Sequelize.CHAR(64),
      allowNull: false
    },
    good       : {
      type        : Sequelize.INTEGER,
      allowNull   : false,
      defaultValue: 0
    },
    bad        : {
      type        : Sequelize.INTEGER,
      allowNull   : false,
      defaultValue: 0
    },
    createdAt  : {
      type        : Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull   : false
    },
    updatedAt  : {
      type        : Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull   : false
    },
  }, {
    getterMethods: {
      url() {
        if (this.type === 'youtube') {
          return `https://www.youtube.com/watch?v=${this.uid}`
        } else if (this.type === 'niconico') {
          return `http://www.nicovideo.jp/watch/${this.uid}`
        } else {
          return ''
        }
      }
    },
    indexes      : [
      {
        name  : 'is_played_index',
        fields: ['isPlayed']
      },
      {
        name  : 'requested_by_index',
        fields: ['requestedBy']
      }
    ]
  })
}

Track.__proto__.getUnPlayedTrack = async function (workspace, channel) {
  return await this.findOne({
    where: {
      workspace: workspace,
      channel  : channel,
      isPlayed : 0
    },
    order: ['createdAt']
  })
}
Track.__proto__.getRandomTrack   = async function (workspace, channel) {
  return await this.findOne({
    where: {
      workspace: workspace,
      channel  : channel,
      isPlayed : 1
    },
    order: [
      Sequelize.fn('RAND')
    ]
  })
}

module.exports = Track