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

          resolve({
            title      : res.title[0],
            description: res.description[0],
            duration   : parseInt(res.length[0].split(':')[0]) * 60 + parseInt(res.length[0].split(':')[1]) // fuck
          })
        })
      })
    })
  }
}

module.exports = NicoNicoAPI