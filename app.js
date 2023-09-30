const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')

const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000

app.engine('hbs', exphbs({ extname: '.hbs' }))
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.use(routes)

app.listen(port, () => {
  console.log(`Capstone app is listening on localhost:${port}`)
})