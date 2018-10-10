const botkit = require('botkit')
  , configs  = require('../../config.server')
  , logger   = require('./logger')

class Slack {

  static get botConfig() {
    return {
      debug          : true,
      logger         : logger,
      json_file_store: configs.bot.json_file_store_path
    }
  }

  static get slackConfig() {
    return {
      clientId    : configs.slack.clientId,
      clientSecret: configs.slack.clientSecret,
      scopes      : ['commands', 'bot']
    }
  }

  constructor(dj) {

    this.controller = botkit
      .slackbot(Slack.botConfig)
      .configureSlackApp(Slack.slackConfig)
      .setupWebserver(configs.bot.port, (err, webserver) => this.onSetUpWebServer(err, webserver))
      .on('slash_command', (bot, message) => this.onSlashCommand(bot, message))
      .on('interactive_message_callback', (bot, message) => this.onInteractiveMessageCallback(bot, message))

    this.dj = dj
    this.dj.on('play', (track, is_random) => this.onPlayTrack(track, is_random))
  }

  getTeam(team_id) {
    return new Promise((resolve, reject) => {
      this.controller.storage.teams.all(function (err, teams) {
        if (err) return reject(err)
        const team = teams.find(team => team.id === team_id)
        resolve(team)
      })
    })
  }

  async onPlayTrack(track, is_random) {

    const team = await this.getTeam(track.workspace)

    if (!is_random) {
      this.controller.spawn({token: team.bot.token}).say({
        text       : 'now playing',
        channel    : track.channel,
        username   : 'DJ',
        attachments: [{
          title          : track.title,
          title_link     : track.url,
          attachment_type: 'default',
          color          : '#387259'
        }]
      }, function (err, response) {
        if (err) logger.error(err)
        else logger.debug(response)
      })
    }

  }

  onSetUpWebServer(err, webserver) {
    this.controller
      .createOauthEndpoints(this.controller.webserver, (err, req, res) => {
        if (err) res.status(500).send('Error: ' + JSON.stringify(err))
        else res.send('Success')
      })
      .createWebhookEndpoints(this.controller.webserver)
  }

  async onSlashCommand(bot, message) {

    const text     = message['text']
      , team_id    = message['team_id']
      , channel_id = message['channel_id']
      , use_id     = message['user_id']

    const prefix = configs.bot.command_prefix

    switch (message['command']) {

      case `/${prefix}add`:
        if (await this.dj.addTrack(text, team_id, channel_id, use_id)) {
          bot.replyPrivate(message, 'ok')
        } else {
          bot.replyPrivate(message, 'ng')
        }
        break

      case `/${prefix}youtube`:
        bot.replyPrivate(message, await this.dj.searchYouTube(text))
        break

      case `/${prefix}url`:
        bot.replyPrivate(message, `${configs.origin}/#/${message.team_id}/${message.channel_id}`)
        break;
    }
  }

  async onInteractiveMessageCallback(bot, message) {

    if (message.callback_id === 'add_track_from_interaction') {
      const url        = 'https://www.youtube.com/watch?v=' + message.actions[0].value
      const team_id    = message.team.id
      const channel_id = message.channel
      const user_id    = message.user

      bot.replyInteractive(message, await this.dj.addTrack(url, team_id, channel_id, user_id))

    } else if (message.callback_id === 'search_youtube_navigate') {

      const {keyword, token} = JSON.parse(message.text)
      bot.replyInteractive(message, await this.dj.searchYouTube(keyword, token))
    }
  }
}

module.exports = Slack