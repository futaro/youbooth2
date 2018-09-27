const Sequelize = require('sequelize').Sequelize
  , {db}        = require('../../config')

const connection = new Sequelize(db.name, db.user, db.pass, {dialect: 'mysql', host: db.host, port: db.port})

const Track = require('./track')(connection)

module.exports = {Track}
