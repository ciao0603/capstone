const express = require('express')
const router = express.Router()

const passport = require('../config/passport')
const { authenticated } = require('../middleware/auth')
const { errorHandler } = require('../middleware/error-handler')
const userController = require('../controllers/user-controller')

router.get('/users/tutors', authenticated, userController.getTutors)
router.get('/users/:id', authenticated, userController.getUser)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logOut)

// router.use('/', (req, res) => {
//   res.redirect('/users/tutors')
// })
router.use('/', errorHandler)

module.exports = router
