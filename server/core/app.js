const express = require('express')

const app = express()

app.quit = cb => {
  if (app.server) app.server.close()
  if (app.golosClient) app.golosClient.close()
  if (app.tarantool) app.tarantool.socket.destroy()
}

module.exports = app
