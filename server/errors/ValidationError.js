class ValidationError {
  constructor(errors) {
    this.status = 422
    this.message = 'Validation Error'
    this.details = errors.reduce((obj, item) => {
      let field
      if (item.keyword === 'required')
        field = item.params.missingProperty
      else
        field = item.dataPath.split('.')[1]

      obj[field] = item
      return obj
    }, {})
  }
}
module.exports = ValidationError