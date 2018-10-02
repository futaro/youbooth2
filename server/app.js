const AppServer = require('./src/server')
  , {Track}     = require('./src/models')
  , Resource    = require('./src/resources')
  , slackBot    = require('./src/bot')
  , Store       = require('./src/store')
  , logger      = require('./src/logger')

const interval = 3000

async function play(workspace, channel) {

  logger.debug(`play(${workspace}, ${channel})`)

  let is_random = false
  let track     = await Track.getUnPlayedTrack(workspace, channel)

  if (!track) {
    logger.debug('らんだむ！')
    is_random = true
    track     = await Track.getRandomTrack(workspace, channel)
  }

  if (!track) return

  const store = Store.factory(workspace, channel)
  store.dump()

  store.nowPlayingID = track.id
  store.startTime    = (new Date()).getTime()
  store.isRandom     = is_random
  store.dump()

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
  console.debug(que)
  server.broadcast(JSON.stringify(que))
  this.bot.say({
    channel : channel,
    text    : `now playing ... \`${track.title}\` ${is_random ? '(random)' : ''}`,
    username: 'DJ'
  })


  track.isPlayed = 1
  await track.save()

  setTimeout(async () => {
    store.nowPlayingID = null
    store.dump()
    await play(workspace, channel)
  }, track.duration * 1000 + interval)

}

async function add(url, workspace, channel, user_name) {

  logger.debug(`add(${url}, ${workspace}, ${channel}, ${user_name})`)

  const store = Store.factory(workspace, channel)
  store.dump()

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
server.addHandler('debug', async req => {
  logger.debug(`debug()`)
  const url     = req.data.url
    , workspace = req.data.workspace || false
    , channel   = req.data.channel || false
    , user_name = 'debug'
  logger.debug(await add(url, workspace, channel, user_name))
})

server.listen()

slackBot.on('slash_command', async (bot, message) => {
  const url     = message['text']
    , workspace = message['team_domain']
    , channel   = message['channel_name']
    , user_name = message['user_name']
  bot.replyPrivate(message, await add(url, workspace, channel, user_name))
})
