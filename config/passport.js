const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')

const { User } = require('../models')

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passReqToCallback: true
  },
  (req, email, password, cb) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) return cb(null, false, req.flash('error_msg', '尚未註冊過此帳號！'))
        bcrypt.compare(password, user.password)
          .then(res => {
            if (!res) return cb(null, false, req.flash('error_msg', '帳號或密碼輸入錯誤！'))
            return cb(null, user)
          })
      })
  }
))

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  User.findByPk(id)
    .then(user => {
      return cb(null, user)
    })
})

module.exports = passport
