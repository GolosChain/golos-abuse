const User = (module.exports.User = require('./libs/User'))
const Post = (module.exports.Post = require('./libs/Post'))
const Complaint = (module.exports.Complaint = require('./libs/Complaint'))

Complaint.belongsTo(Post, { foreignKey: 'postId', as: 'post' })
