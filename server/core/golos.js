const W3CWebSocket = require('websocket').w3cwebsocket

const config = require('../config')
const logger = require('./logger')

const callbacks = {}
let client
let lastId = 0

function call(api, method, params) {
  return new Promise((resolve, reject) => {
    const id = ++lastId
    callbacks[lastId] = data => resolve(data.result)

    const json = {
      id: lastId,
      method: 'call',
      params: [api, method, params],
      jsonrpc: "2.0"
    }

    client.send(JSON.stringify(json))
    setTimeout(() => {
      if (callbacks[id]) {
        delete callbacks[id]
        reject(new Error('TimeOut golos'))
      }
    }, 5000)
  })
}

module.exports.init = () => {
  return new Promise((resolve, reject) => {
    client = new W3CWebSocket(config.get('golos:url'))
    client.onerror = (err) => {
      reject({code: 'GOLOS'})
    }

    client.onopen = () => {
      logger.info('Golos Client Connected')
      resolve(client)
    }

    client.onclose = () => {
      logger.info('Golos client Closed')
    }

    client.onmessage = (e) => {
      if (typeof e.data === 'string') {
        try {
          const data = JSON.parse(e.data)
          if (callbacks[data.id]) {
            callbacks[data.id](data)
            delete callbacks[data.id]
          }
        } catch (err) {
          logger.error(err)
        }
      }
    }
  })
}

module.exports.getContent = async ({author, permlink}) => {
  let data = await call('social_network', 'get_content', [author, permlink])
  return data.id ? data : null
}

module.exports.getAccount = async ({username}) => {
  let [user] = await call('database_api', 'get_accounts', [[username]])
  return user || null
}