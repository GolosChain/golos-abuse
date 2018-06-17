const errors = require('restify-errors')
const {Signature, PublicKey} = require('steem/lib/auth/ecc')
const {golos} = require('core')

module.exports.byRoles = roles => (req, res, next) => {
  if (!req.user || !~roles.indexOf(req.user.role)) {
    const err = new errors.UnauthorizedError()
    res.status(err.statusCode)
    res.send(err)
  } else next()
}


module.exports.bySign = async (req, res, next) => {
  const { username } = req.body
  const sign = req.headers['x-sign']
  try {
    if (!username || !sign) throw new errors.UnauthorizedError()
    const account = await golos.getAccount({ username })
    const key = account.posting.key_auths[0][0]
    const publicKey = PublicKey.fromString(key, 'GLS')
    const signature = Signature.fromHex(sign)
    if (!signature.verifyBuffer(new Buffer(JSON.stringify(req.body)), publicKey))
      throw new errors.UnauthorizedError()
    next()
  } catch (err) {
    err = new errors.UnauthorizedError()
    res.status(err.statusCode)
    res.send(err)
  }
}
