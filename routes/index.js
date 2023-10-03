const express = require('express')
const router = express.Router()

const passport = require('../config/passport')
const { authenticated } = require('../middleware/auth')
const { errorHandler } = require('../middleware/error-handler')
const userController = require('../controllers/user-controller')
const tutorController = require('../controllers/tutor-controller')

router.get('/users/tutors', authenticated, userController.getTutors)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', authenticated, userController.putUser)

router.get('/tutors/create', authenticated, tutorController.createTutor)
router.post('/tutors', authenticated, tutorController.postTutor)

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
