const AppServer = require('./src/server')
  , {Track}     = require('./src/models')
  , Resource    = require('./src/resources')
  , slackBot    = require('./src/bot')
  , Store       = require('./src/store')

const interval = 5000

async function play(workspace, channel) {

  const track = await Track.getUnPlayedTrack(workspace, channel)

  if (!track) return

  const store = Store.factory(workspace, channel)

  store.nowPlayingID = track.id
  store.startTime    = (new Date()).getTime()

  server.broadcast(JSON.stringify({
    action: 'play',
    data  : {
      workspace: workspace,
      channel  : channel,
      track    : track,
      from     : 0
    }
  }))

  track.isPlayed = 1
  await track.save()

  setTimeout(async () => {
    store.nowPlayingID = null
    await play(workspace, channel)
  }, track.duration * 1000 + interval)
}

const server = new AppServer()

server.addHandler('hello', async req => {

  const workspace = req.data.workspace || false,
        channel   = req.data.channel || false

  const store = Store.factory(workspace, channel)

  if (!store.nowPlayingID) return

  const track = await Track.findById(store.nowPlayingID)

  if (!track) return

  return {
    action: 'play',
    data  : {
      workspace: workspace,
      channel  : channel,
      track    : track,
      from     : parseInt(((new Date()).getTime() - store.startTime) / 1000)
    }
  }
})


// debug
server.addHandler('debug', async req => {

  const workspace = req.data.workspace || false,
        channel   = req.data.channel || false
console.log(workspace, channel)
  const store = Store.factory(workspace, channel)

  const resource = await Resource.factory(req.data.url)

  if (!resource) {
    console.log("?")
    return
  }

  let track = new Track()

  track.workspace   = workspace
  track.channel     = channel
  track.type        = resource.type
  track.uid         = resource.uid
  track.title       = resource.title
  track.duration    = resource.duration
  track.isPlayed    = 0
  track.requestedBy = 'debug'
  track.good        = 0
  track.bad         = 0

  await track.save()

  if (!store.nowPlayingID) play(workspace, channel)
})

server.listen()

slackBot.on('slash_command', async (bot, message) => {

  const url     = message.text
    , workspace = message.team_domain
    , channel   = message.channel_name

  const store = Store.factory(workspace, channel)

  const resource = await Resource.factory(url)

  if (!resource) {
    bot.replyPrivate(message, '?')
    return
  }

  let track = new Track()

  track.workspace   = workspace
  track.channel     = channel
  track.type        = resource.type
  track.uid         = resource.uid
  track.title       = resource.title
  track.duration    = resource.duration
  track.isPlayed    = 0
  track.requestedBy = message.user_name
  track.good        = 0
  track.bad         = 0

  await track.save()

  if (!store.nowPlayingID) play(workspace, channel)

  bot.replyPrivate(message, 'Add `' + resource.title + '`')
})