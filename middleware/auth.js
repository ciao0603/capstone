const { getUser, ensureAuthenticated } = require('../helpers/auth-helper')

const authenticated = (req, res, next) => {
  if (ensureAuthenticated(req)) return next()
  req.flash('error_msg', '請先登入才可使用!')
  res.redirect('/signin')
}

const authenticatedAdmin = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    if (getUser(req).isAdmin) return next()
    req.flash('error_msg', '此帳號無訪問權限!')
    res.redirect('/')
  } else {
    req.flash('error_msg', '請先登入才可使用!')
    res.redirect('/signin')
  }
}

module.exports = { authenticated, authenticatedAdmin }
