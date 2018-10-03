const botkit = require('botkit')
const configs = require('../../config.server')

const controller = botkit.slackbot({
  debug          : false,
  json_file_store: configs.bot.json_file_store_path
}).configureSlackApp({
  clientId    : configs.slack.clientId,
  clientSecret: configs.slack.clientSecret,
  scopes      : ['commands', 'bot', 'channels.write']
})

controller.setupWebserver(configs.bot.port, (err, webserver) => {
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