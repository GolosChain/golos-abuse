class UnauthorizedError {
  constructor() {
    this.status = 401
    this.message = 'Unauthorized Error'
  }
}
module.exports = UnauthorizedError