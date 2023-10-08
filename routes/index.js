const express = require('express')
const router = express.Router()

const passport = require('../config/passport')
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const { errorHandler } = require('../middleware/error-handler')
const admin = require('./modules/admin')
const userController = require('../controllers/user-controller')
const tutorController = require('../controllers/tutor-controller')
const courseController = require('../controllers/course-controller')

router.use('/admin', authenticatedAdmin, admin)

router.get('/users/tutors', authenticated, userController.getTutors)
router.get('/users/search', authenticated, userController.searchTutors)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', authenticated, userController.putUser)

router.get('/users/tutors/:id', authenticated, courseController.getCourse)
router.post('/courses/:id', authenticated, courseController.postCourse)

router.get('/tutors/create', authenticated, tutorController.createTutor)
router.get('/tutors/:id', authenticated, tutorController.getTutor)
router.get('/tutors/:id/edit', authenticated, tutorController.editTutor)
router.put('/tutors/:id', authenticated, tutorController.putTutor)
router.post('/tutors', authenticated, tutorController.postTutor)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signup', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logOut)

// router.use('/', (req, res) => {
//   res.redirect('/users/tutors')
// })
router.use('/', errorHandler)

module.exports = router
