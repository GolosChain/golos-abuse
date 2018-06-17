const jwt = require('jsonwebtoken')
const errors = require('restify-errors')

const { User } = require('@models')
const config = require('@config')

function generateToken(user) {
  return jwt.sign({ id: user.id }, config.get('JWT:secret'))
}

module.exports.auth = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) throw new errors.UnauthorizedError()

    const user = await User.findOne({ where: { email } })

    if (!user || !user.comparePassword(password)) throw new errors.UnauthorizedError()
    const token = generateToken(user)
    res.send({ token })
  } catch (err) {
    if (!(err instanceof errors.UnauthorizedError)) err = new errors.InternalServerError(err)
    res.status(err.statusCode)
    res.send(err)
  }
}

module.exports.current = async (req, res) => {
  res.send(req.user)
}

module.exports.refresh = async (req, res) => {
  const token = generateToken(req.user)
  res.send({ token })
}
