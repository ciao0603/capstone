const express = require('express')
const router = express.Router()

const userController = require('../controllers/user-controller')
const { errorHandler } = require('../middleware/error-handler')

router.get('/users/tutors', userController.getTutors)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', userController.signIn)

router.use('/', (req, res) => {
  res.redirect('/users/tutors')
})
router.use('/', errorHandler)

module.exports = router
