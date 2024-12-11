const db = require('../models')

module.exports = async function(req, res, next) {
  if (!req.session.user) {
    return next()
  }

  req.user = await db.users.findOne({where: {id: req.session.user.id}})
  next()
}
