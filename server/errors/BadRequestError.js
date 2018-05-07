class BadRequestError {
  constructor(message) {
    this.status = 400
    this.message = message
  }
}
module.exports = BadRequestError