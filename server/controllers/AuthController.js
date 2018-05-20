
const HttpStatus = require('http-status-codes')
const jwt = require('jsonwebtoken')

const config = require('../config')
const app = require('../core/app')
const utils = require('../core/utils')
const passport = require('../core/passport')
const UnauthorizedError = require('../errors/UnauthorizedError')

module.exports.auth = async (req, res) => {
  try{
    const {email, password} = req.body
    if (email && password) {
      const user = await app.models.User.findOne({email})
      if (user) {
        if(!utils.comparePassword(password, user.password)) throw new UnauthorizedError()
        const token = jwt.sign({id: user.id}, config.get('JWT:secret'))
        res.status(HttpStatus.OK).send({token})
      } else
        throw new UnauthorizedError()
    } else throw new UnauthorizedError()
  } catch(err){
    if(!(err instanceof UnauthorizedError)){
      console.log(err)
      err = new UnauthorizedError()
    }
    res.status(HttpStatus.UNAUTHORIZED).send(err)
  }
}