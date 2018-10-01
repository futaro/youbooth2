const wget = require('node-wget')
  , moment = require('moment')
  , config = require('../../../config.server')

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

        body = JSON.parse(body)

        resolve({
          title      : body.items[0].snippet.title,
          description: body.items[0].snippet.description,
          duration   : moment.duration(body.items[0].contentDetails.duration).asSeconds()
        })
      })
    })
  }
}

module.exports = YouTube