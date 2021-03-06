const wget      = require('node-wget')
  , moment      = require('moment')
  , config      = require('../../../config.server')
  , YouTubeNode = require('youtube-node')

const api = new YouTubeNode()
api.setKey(config.youtube.api_key)

class YouTube {

  constructor(url) {
    this._valid = false
    this._url   = url
  }

  async match() {

    const regExp = /https?:\/\/www\.youtube\.com\/watch\?v=([a-z0-9\-_]+)/i

    if (regExp.test(this._url)) {
      this.type     = 'youtube'
      this.uid      = RegExp.$1
      const info    = await this.getInfo(this.uid)
      this.title    = info.title
      this.duration = info.duration

      this._valid = true
    }
  }

  isValid() {
    return this._valid
  }

  getInfo(uid) {
    return new Promise((resolve, reject) => {
      const url = `https://www.googleapis.com/youtube/v3/videos?id=${uid}&key=${config.youtube.api_key}&part=snippet,contentDetails,status`
      wget({url: url, dest: '/dev/null'}, function (error, response, body) {
        if (error) return reject(error)
        try {
          body = JSON.parse(body)

          resolve({
            title      : body.items[0].snippet.title,
            description: body.items[0].snippet.description,
            duration   : moment.duration(body.items[0].contentDetails.duration).asSeconds()
          })
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  static search(keyword, token = null) {
    return new Promise((resolve, reject) => {
      api.addParam('type', 'video')
      api.addParam('videoEmbeddable', 'true')

      let obj = {}
      if (token) obj.pageToken = token
      api.search(keyword, 3, obj, function (error, result) {
        if (error) {
          reject(error)
        } else {
          try {
            if (result.items.length) {
              resolve({
                nextPageToken: result.nextPageToken || null,
                prevPageToken: result.prevPageToken || null,
                items        : result.items
                  .filter(item => {
                    return !!item.id.videoId
                  })
                  .map(item => {
                    return {
                      id         : item.id.videoId,
                      title      : item.snippet.title,
                      description: item.snippet.description,
                      thumbnail  : item.snippet.thumbnails.default
                    }
                  })
              })
            } else {
              resolve([])
            }
          } catch (e) {
            reject(e)
          }
        }
      })
    })
  }
}

module.exports = YouTube