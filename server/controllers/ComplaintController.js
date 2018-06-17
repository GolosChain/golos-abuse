const errors = require('restify-errors')
const path = require('path')
const moment = require('moment')

const { USER } = require('@constants')
const { Post, Complaint } = require('@models')
const { golos, RestController } = require('@core')

const RestComplaintCreate = RestController.create(Complaint)
module.exports.create = async (req, res) => {
  try {
    const { author, permlink } = req.body
    let post = await Post.findOne({ where: { author, permlink } })
    if (!post) {
      const postFromChain = await golos.getContent({ author, permlink })
      if (!postFromChain)
        throw new errors.BadRequestError(
          `Not found post with author:${author} and permlink: ${permlink}`
        )

      post = await Post.create({
        id: postFromChain.id,
        author,
        permlink
      })
    }
    req.body.postId = post.id
    RestComplaintCreate(req, res)
  } catch (err) {
    const errClasses = [RestController.ValidationError, errors.BadRequestError]
    if (!errClasses.some(errClass => err instanceof errClass))
      err = new errors.InternalServerError(err)
    res.status(err.statusCode)
    res.send(err)
  }
}

module.exports.findAll = RestController.findAll(Complaint)

// @todo: Wait client side logic, after should implement aggregate logic
module.exports.top = async (req, res) => res.end()
module.exports.slice = async (req, res) => res.end()
