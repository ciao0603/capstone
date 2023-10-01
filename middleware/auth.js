const { ensureAuthenticated } = require('../helpers/auth-helper')

const authenticated = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    return next()
  }
  req.flash('error_msg', '使用者驗證未通過!')
  res.redirect('/signin')
}

module.exports = { authenticated }
