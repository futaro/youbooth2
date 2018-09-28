const AppServer = require('./src/server')
  , {Track}     = require('./src/models')
  , Resource    = require('./src/resources')
  , slackBot    = require('./src/bot')

const interval = 5000

let nowPlayingID = null,
    startTime    = 0

async function play() {

  const track = await Track.getUnPlayedTrack()

  if (!track) return

  nowPlayingID = track.id
  startTime    = (new Date()).getTime()

  app.broadcast(JSON.stringify({
    action: 'play',
    data  : {
      track: track,
      from : 0
    }
  }))

  track.isPlayed = 1
  await track.save()

  setTimeout(() => {
    nowPlayingID = null
    play()
  }, track.duration * 1000 + interval)
}

const app = new AppServer()

app.addHandler('hello', async req => {

  if (!nowPlayingID) return

  const track = await Track.findById(nowPlayingID)

  if (!track) return

  return {
    action: 'play',
    data  : {
      track: track,
      from : parseInt(((new Date()).getTime() - startTime) / 1000)
    }
  }
})

app.listen()

slackBot.on('slash_command', async (bot, message) => {

  const url = message.text

  const resource = Resource.factory(url)


  if (!resource) {
    bot.replyPrivate(message, '?')
    return
  }

  let track = new Track()

  track.channel     = message.channel_name
  track.type        = resource.type
  track.uid         = resource.uid
  track.title       = resource.title
  track.duration    = resource.duration
  track.isPlayed    = 0
  track.requestedBy = message.user_name

  await track.save()

  if (!nowPlayingID) play()

  bot.replyPrivate(message, 'Add `' + resource.title + '`')
})