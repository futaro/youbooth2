const log4js = require('log4js')
  , configs  = require('../../config.server')

const logger = log4js.getLogger()
logger.level = configs.logLevel

module.exports = logger