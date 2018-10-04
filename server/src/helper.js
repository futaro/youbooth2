const getUserNameFromMessage = (bot, message) => {
  return new Promise((resolve, reject) => {
    bot.api.users.info({user: message.user}, async (error, response) => {
      try {
        if (error) return reject(error)
        resolve(response.user.real_name)
      } catch (e) {
        reject(e)
      }
    })
  })
}

module.exports = {getUserNameFromMessage}