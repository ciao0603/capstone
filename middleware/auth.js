const { ensureAuthenticated } = require('../helpers/auth-helper')

const authenticated = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    return next()
  }
  req.flash('error_msg', '請先登入才可使用!')
  res.redirect('/signin')
}

module.exports = { authenticated }
