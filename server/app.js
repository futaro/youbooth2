const Server = require('./src/server')
  , DJ       = require('./src/dj')
  , Slack    = require('./src/slack')

const dj = new DJ()
const slack = new Slack(dj)
const server = new Server(dj)


server.listen()