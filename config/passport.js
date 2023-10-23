const passport = require('passport')
const LocalStrategy = require('passport-local')
const GoogleStrategy = require('passport-google-oauth20')
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

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK,
  profileFields: ['email', 'displayName'],
  passReqToCallback: true
}, async (accessToken, refreshToken, req, profile, cb) => {
  try {
    const { name, email, picture } = profile._json
    const user = await User.findOne({ where: { email } })
    // 已註冊過就直接登入
    if (user) return cb(null, user)
    // 未註冊則產生隨機密碼後 create
    const randomPassword = Math.random().toString(36).slice(-8)
    const hash = bcrypt.hash(randomPassword, 10)
    const newUser = User.create({ name, email, password: hash, image: picture })
    return cb(null, newUser)
  } catch (err) {
    cb(err, false)
  }
}))

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
