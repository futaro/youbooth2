const botkit  = require('botkit')
const secrets = require('../.secrets.json')
const env     = {
  port                 : 3000,
  json_file_store_path : '../.json_file_store/'
}

const controller = botkit.slackbot({
  debug           : false,
  json_file_store : env.json_file_store_path
}).configureSlackApp({
  clientId     : secrets.clientId,
  clientSecret : secrets.clientSecret,
  scopes       : ['commands']
})

controller.setupWebserver(env.port, (err, webserver) => {
  controller
    .createOauthEndpoints(controller.webserver, (err, req, res) => {
      if (err) {
        res.status(500).send('Error: ' + JSON.stringify(err))
      } else {
        res.send('Success')
      }
    })
    .createWebhookEndpoints(controller.webserver)
})


module.exports = controller