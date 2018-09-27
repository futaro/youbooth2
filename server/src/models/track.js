const Sequelize = require('sequelize').Sequelize

const Track = connection => {
  return connection.define('tracks', {
    id         : {
      type         : Sequelize.INTEGER,
      primaryKey   : true,
      autoIncrement: true
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
  })
}

module.exports = Track