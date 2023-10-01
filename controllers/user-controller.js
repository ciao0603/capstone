const bcrypt = require('bcryptjs')

const { User } = require('../models')

const userController = {
  signUpPage: (req, res, next) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    const { email, password, passwordCheck } = req.body

    if (!email) throw new Error('Email is required !')
    if (!password) throw new Error('Password is required !')
    if (password !== passwordCheck) throw new Error('Passwords do not match !')

    User.findOne({ where: { email } })
      .then(user => {
        if (user) throw new Error('User already exists !')
        return bcrypt.hash(password, 10)
      })
      .then(hash => {
        return User.create({
          email, password: hash
        })
      })
      .then(() => res.redirect('/users/tutors'))
      .catch(err => next(err))
  },
  signInPage: (req, res, next) => {
    res.render('signin')
  },
  signIn: (req, res, next) => {

  },
  getTutors: (req, res, next) => {
    res.render('index')
  }
}

module.exports = userController
