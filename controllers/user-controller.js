const bcrypt = require('bcryptjs')
const faker = require('faker')

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
          email,
          password: hash,
          name: faker.name.findName(),
          introduction: faker.lorem.text()
        })
      })
      .then(() => res.redirect('/users/tutors'))
      .catch(err => next(err))
  },
  signInPage: (req, res, next) => {
    res.render('signin')
  },
  signIn: (req, res, next) => {
    req.flash('success_msg', '登入成功!')
    res.redirect('/users/tutors')
  },
  logOut: (req, res, next) => {
    req.logout()
    res.redirect('/signin')
  },
  getTutors: (req, res, next) => {
    const { id } = req.user
    User.findByPk(id, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error('使用者尚未註冊!')
        res.render('index', { user })
      })
      .catch(err => next(err))
  },
  getUser: (req, res, next) => {
    const { id } = req.user
    User.findByPk(id, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error('使用者尚未註冊!')
        res.render('user', { user })
      })
      .catch(err => next(err))
  }
}

module.exports = userController
