module.exports = (roles) => (req, res, next) => {
    const preparedRoles = Array.isArray(roles) ? roles : [roles]
    const userRoles = req.user.roles || []
    const isHasRole = preparedRoles.every(role => userRoles.includes(role))

    if (!isHasRole) {
        return res.redirect('/')
    }

    next()
}
