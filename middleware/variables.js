module.exports = function(req, res, next) {
  res.locals.isAuth = req.session.isAuthenticated
  res.locals.isAdmin = ((req.session.user || {}).roles || []).includes('admin')
  res.locals.csrf = req.csrfToken()
  next()
}
