const config = require('../config')
const logger = require('./logger')
const app = require('./app')
const bodyParser = require('body-parser')

// parse application/json
app.use(bodyParser.json())

//CORS Middleware
app.use(function(req, res, next) {
  //Enabling CORS 
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  next()
})

// Init routing handlers
require('../routing')(app)


module.exports = new Promise((resolve, reject) => {
  app.server = app.listen(config.get('server:port'), resolve)

  app.server.on('close', ()=>{
    logger.info('Http server closed')
  })
})