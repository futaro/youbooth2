const logger = require('./logger')
  , Store    = require('./store')
  , {Track}  = require('./models')
  , Resource = require('./resources')
  , YouTube  = require('./resources/YouTube')

class DJ {

  static get interval() {
    return 3000
  }

  constructor() {
    this.handlers = {}
  }

  on(event, callback) {
    if (!this.handlers[event]) {
      this.handlers[event] = []
    }
    this.handlers[event].push(callback)
  }

  dispatch(event, vars) {
    if (this.handlers[event]) {
      this.handlers[event].map(callback => {
        callback.apply(null, vars)
      })
    }
  }

  async addTrack(url, team_id, channel_id, user_id) {

    logger.debug(`add(${url}, ${team_id}, ${channel_id}, ${user_id})`)

    const store = Store.factory(team_id, channel_id)

    const resource = await Resource.factory(url)

    if (!resource) return false

    try {
      let track = new Track()

      track.workspace   = team_id
      track.channel     = channel_id
      track.type        = resource.type
      track.uid         = resource.uid
      track.title       = resource.title
      track.duration    = resource.duration
      track.isPlayed    = 0
      track.requestedBy = user_id
      track.good        = 0
      track.bad         = 0

      await track.save()

      if (!store.nowPlayingID) {
        await this.playTrack(team_id, channel_id)
      } else if (store.nowPlayingID && store.isRandom) {
        await this.playTrack(team_id, channel_id)
      }

      this.dispatch('add', [track, team_id, channel_id, user_id])

      return true
    } catch (e) {
      logger.error(e)
      return false
    }
  }

  async playTrack(team_id, channel_id) {

    logger.debug(`play(${team_id}, ${channel_id})`)

    let is_random = false
    let track     = await Track.getUnPlayedTrack(team_id, channel_id)

    if (!track) {
      is_random = true
      track     = await Track.getRandomTrack(team_id, channel_id)
    }

    if (!track) return

    const store = Store.factory(team_id, channel_id)

    store.nowPlayingID = track.id
    store.startTime    = (new Date()).getTime()
    store.isRandom     = is_random

    track.isPlayed = 1
    await track.save()

    this.dispatch('play', [track, is_random])

    if (store.timerID) {
      logger.debug(`clearTimeout(${store.timerID})`)
      clearTimeout(store.timerID)
    }

    store.timerID = setTimeout(async () => {
      store.nowPlayingID = null
      await this.playTrack(team_id, channel_id)
    }, track.duration * 1000 + DJ.interval)
    logger.debug(`setTimeout(${store.timerID})`)
  }


  async searchYouTube(keyword, token = null) {

    const searchResponse = await YouTube.search(keyword, token)
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
      const nav = {
        "fallback"       : "fallback string",
        "callback_id"    : "search_youtube_navigate",
        "color"          : "#478b6e",
        "attachment_type": "default",
        "actions"        : []
      }
      if (searchResponse.prevPageToken) {
        nav.actions.push({
          "name" : "prevYouTubeButton",
          "text" : "Prev",
          "type" : "button",
          "value": JSON.stringify({keyword: keyword, token: searchResponse.prevPageToken})
        })
      }
      if (searchResponse.nextPageToken) {
        nav.actions.push({
          "name" : "nextYouTubeButton",
          "text" : "Next",
          "type" : "button",
          "value": JSON.stringify({keyword: keyword, token: searchResponse.nextPageToken})
        })
      }
      message.attachments.push(nav)
    }

    return message
  }
}

module.exports = DJ
