const AppServer = require('./src/server')
  , {Track}     = require('./src/models')
  , Resource    = require('./src/resources')
  , slackBot    = require('./src/bot')
  , Store       = require('./src/store')
  , logger      = require('./src/logger')
  , YouTube     = require('./src/resources/YouTube')

const interval = 3000

async function play(workspace, channel) {

  logger.debug(`play(${workspace}, ${channel})`)

  let is_random = false
  let track     = await Track.getUnPlayedTrack(workspace, channel)

  if (!track) {
    is_random = true
    track     = await Track.getRandomTrack(workspace, channel)
  }

  if (!track) return

  const store = Store.factory(workspace, channel)

  store.nowPlayingID = track.id
  store.startTime    = (new Date()).getTime()
  store.isRandom     = is_random

  const que = {
    action: 'play',
    data  : {
      workspace: workspace,
      channel  : channel,
      track    : track,
      from     : 0,
      is_random: is_random
    }
  }
  server.broadcast(JSON.stringify(que))
  if (this.bot) {

    this.bot.say({
      channel : channel,
      text    : `now playing ... \`${track.title}\` as requested by ${track.requestedBy} ${is_random ? '(random)' : ''}`,
      username: 'DJ'
    })

    // now playing はトピックスに表示させたいのだが・・・
    // this.bot.api.channels.setTopic({
    //   channel: channel,
    //   text   : `now playing ... \`${track.title}\` as requested by ${track.requestedBy} ${is_random ? '(random)' : ''}`
    // }, (err, response) => {
    //   console.log(err, response)
    // })
  }

  track.isPlayed = 1
  await track.save()

  if (store.timerID) {
    logger.debug(`clearTimeout(${store.timerID})`)
    clearTimeout(store.timerID)
  }

  store.timerID = setTimeout(async () => {
    store.nowPlayingID = null
    await play(workspace, channel)
  }, track.duration * 1000 + interval)
  logger.debug(`setTimeout(${store.timerID})`)
}

async function add(url, workspace, channel, user_name) {

  logger.debug(`add(${url}, ${workspace}, ${channel}, ${user_name})`)

  const store = Store.factory(workspace, channel)

  const resource = await Resource.factory(url)

  if (!resource) {
    return '?'
  }

  let track = new Track()

  track.workspace   = workspace
  track.channel     = channel
  track.type        = resource.type
  track.uid         = resource.uid
  track.title       = resource.title
  track.duration    = resource.duration
  track.isPlayed    = 0
  track.requestedBy = user_name
  track.good        = 0
  track.bad         = 0

  await track.save()

  if (!store.nowPlayingID) {
    await play(workspace, channel)
  } else if (store.nowPlayingID && store.isRandom) {
    await play(workspace, channel)
  }

  return 'Add `' + resource.title + '`'
}

async function search_youtube(keyword) {

  const searchResponse = await YouTube.search(keyword)
  let message          = {
    "text"       : `Search Results`,
    "attachments": []
  }
  searchResponse.items.map(video => {
    message.attachments.push({
      "fallback"       : "fallback string",
      "title"          : video.title,
      "title_link"     : `https://www.youtube.com/watch?v=${video.id}`,
      "text"           : video.description,
      "image_url"      : video.thumbnail.url,
      "callback_id"    : "add_track_from_interaction",
      "color"          : "#455da2",
      "attachment_type": "default",
      "actions"        : [
        {
          "name" : "addYouTubeButton",
          "text" : "Add Track",
          "type" : "button",
          "style": "primary",
          "value": video.id
        }
      ]
    })
  })
  if (searchResponse.nextPageToken || searchResponse.prevPageToken) {
    const navi = {
      "fallback"       : "fallback string",
      "title"          : "Next",
      "callback_id"    : "search_youtube_navigate",
      "color"          : "#478b6e",
      "attachment_type": "default",
      "actions"        : []
    }
    if (searchResponse.prevPageToken) {
      navi.actions.push({
        "name" : "prevYouTubeButton",
        "text" : "Prev",
        "type" : "button",
        "style": "primary",
        "value": searchResponse.prevPageToken
      })
    }
    if (searchResponse.nextPageToken) {
      navi.actions.push({
        "name" : "nextYouTubeButton",
        "text" : "Next",
        "type" : "button",
        "style": "primary",
        "value": searchResponse.nextPageToken
      })
    }
    message.attachments.push(navi)
  }

  return message
}

const server = new AppServer()

server.addHandler('hello', async req => {

  logger.debug(`hello()`)

  const workspace = req.data.workspace || false,
        channel   = req.data.channel || false

  const store = Store.factory(workspace, channel)

  if (!store.nowPlayingID) {
    await play(workspace, channel)
    return
  }

  const track = await Track.findById(store.nowPlayingID)

  if (!track) return

  return {
    action: 'play',
    data  : {
      workspace: workspace,
      channel  : channel,
      track    : track,
      from     : parseInt(((new Date()).getTime() - store.startTime) / 1000),
      is_random: store.isRandom
    }
  }
})

// debug
server.addHandler('debug/add', async req => {
  logger.debug(`debug/add()`)
  const url     = req.data.url
    , workspace = req.data.workspace || false
    , channel   = req.data.channel || false
    , user_name = 'debug'
  logger.debug(await add(url, workspace, channel, user_name))
})
server.addHandler('debug/youtube', async req => {
  logger.debug(`debug/youtube()`)
  const keyword = req.data.keyword
  logger.debug(await search_youtube(keyword))
})

server.listen()

slackBot.on('slash_command', async (bot, message) => {
  const text    = message['text']
    , workspace = message['team_domain']
    , channel   = message['channel_name']

  if (message['command'] === '/add') {
    bot.api.users.info({user: message.user}, async (error, response) => {
      const {real_name} = response.user
      bot.replyPrivate(message, await add(text, workspace, channel, real_name))
    })

  } else if (message['command'] === '/youtube') {
    bot.replyPrivate(message, await search_youtube(text))
  }
})

slackBot.on('interactive_message_callback', async (bot, message) => {

  const url       = 'https://www.youtube.com/watch?v=' + message.actions[0].value
  const workspace = message.team.domain
  const channel   = message.raw_message.channel.name
  const user      = await getUserNameFromMessage(message).catch(e => console.dir(e))

  bot.replyInteractive(message, await add(url, workspace, channel, user))
})

function getUserNameFromMessage(message) {
  return new Promise((resolve, reject) => {
    this.bot.api.users.info({user: message.user}, async (error, response) => {
      try {
        if (error) return reject(error)
        resolve(response.user.real_name)
      } catch (e) {
        reject(e)
      }
    })
  })
}
