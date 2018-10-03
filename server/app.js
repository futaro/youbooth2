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

  const videos = await YouTube.search(keyword)
  let message  = []
  videos.map(video => {
    message.push({
      "text"       : `検索結果`,
      "attachments": [
        {
          "fallback"       : "fallback string",
          "title"          : `\`${video.title}\` \n ${video.description} \n [https://www.youtube.com/watch?v=${video.id}] \n ${video.thumbnail.url}`,
          "callback_id"    : "callback_id value",
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
        }
      ]
    })
  })

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
      const {real_name} = response.user;
      bot.replyPrivate(message, await add(text, workspace, channel, real_name))
    })
  } else if (message['command'] === '/youtube') {
    let messages = await search_youtube(text)
    messages.map(m => {
      bot.replyPrivate(message, m).catch(err => {
        console.log(err)
      })
    })
  }
})
