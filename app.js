const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')

const hbsHelper = require('./helpers/hbs-helper')
const passport = require('./config/passport')
const { getUser } = require('./helpers/auth-helper')
const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = process.env.SESSION_SECRET || 'secret'

app.engine('hbs', exphbs({ extname: '.hbs', helpers: hbsHelper }))
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use((req, res, next) => {
  res.locals.error_msg = req.flash('error_msg')
  res.locals.success_msg = req.flash('success_msg')
  res.locals.reqUser = getUser(req)
  next()
})

app.use(routes)

app.listen(port, () => {
  console.log(`Capstone app is listening on localhost:${port}`)
})
