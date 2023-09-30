const express = require('express')
const router = express.Router()

const userController = require('../controllers/user-controller')

router.get('/users/tutors', userController.getTutors)

router.use('/', (req, res) => {
  res.redirect('/users/tutors')
})

module.exports = router