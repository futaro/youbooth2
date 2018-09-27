const AppServer = require('./src/server')
  , {Track}     = require('./src/models')
  , NicoNicoAPI = require('./src/api/niconico')
  , slackBot    = require('./src/bot')

let nowPlayingID = null,
    startTime    = 0

async function play() {

  const track = await Track.getUnPlayedTrack()

  if (track) {

    nowPlayingID = track.id
    startTime    = (new Date()).getTime()

    app.broadcast(JSON.stringify({
      action : 'play',
      data   : {
        track : track,
        from  : 0
      }
    }))

    track.isPlayed = 1
    await track.save()

    setTimeout(() => {
      nowPlayingID = null
      play()
    }, track.duration * 1000 + 5000)
  }
}


const app = new AppServer()

app.addHandler('hello', async req => {

  if (nowPlayingID) {
    const track = await Track.findById(nowPlayingID)
    if (track) {
      return {
        action : 'play',
        data   : {
          track : track,
          from  : parseInt(((new Date()).getTime() - startTime) / 1000)
        }
      }
    }
  }
})

app.addHandler('add_track', async req => {
  console.log(req.data)

  const url = req.data.url

  const matchNicoNico = /https?:\/\/www\.nicovideo\.jp\/watch\/(sm[0-9]+)/

  let type, uid, title, duration
  if (matchNicoNico.test(url)) {
    type       = 'niconico'
    uid        = RegExp.$1
    const info = await NicoNicoAPI.getInfo(uid)
    console.log('info', info)
    title    = info.title
    duration = info.duration
  }

  if (!uid) {
    return {error : 'not match'}
  }

  let track = new Track()
  
  track.type        = type
  track.uid         = uid
  track.title       = title
  track.duration    = duration
  track.isPlayed    = 0
  track.requestedBy = 'test'

  await track.save()

  if (!nowPlayingID) {
    play()
  }

  return {message : 'success'}
})

app.listen()


slackBot.on('slash_command', (bot, message) => {

  console.log(message)

  // bot.replyPublic(message, `⏰ 「${message.text}」やるぞー！`);
});