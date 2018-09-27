const wget      = require('node-wget')
  , parseString = require('xml2js').parseString

class NicoNicoAPI {

  static getInfo(uid) {
    return new Promise((resolve, reject) => {
      const url = `https://ext.nicovideo.jp/api/getthumbinfo/${uid}`
      wget({url: url, dest: '/dev/null'}, function (error, response, body) {
        if (error) return reject(error)
        parseString(body, function (error, result) {
          if (error) return reject(error)
          const res = result.nicovideo_thumb_response.thumb[0]

          // fuck
          const l = res.length[0].split(':')
          let duration
          if (l.length === 1) {
            duration = parseInt(l[0])
          } else if (l.length === 2) {
            duration = (parseInt(l[0]) * 60) + parseInt(l[1])
          } else if (l.length === 3) {
            duration = (parseInt(l[0]) * 60 * 60) + (parseInt(l[1]) * 60) + parseInt(l[2])
          }

          resolve({
            title      : res.title[0],
            description: res.description[0],
            duration   : duration
          })
        })
      })
    })
  }
}

module.exports = NicoNicoAPI