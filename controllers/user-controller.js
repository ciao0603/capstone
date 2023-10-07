const bcrypt = require('bcryptjs')
const faker = require('faker')

const { User, Tutor } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

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
          introduction: faker.lorem.text(),
          image: `https://loremflickr.com/g/350/350/portrait/?random=${(Math.random() * 100)}`
        })
      })
      .then(() => res.redirect('/signin'))
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
    req.flash('success_msg', '登出成功!')
    res.redirect('/signin')
  },
  getTutors: (req, res, next) => {
    const { email } = req.user
    const DEFAULT_LIMIT = 6
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    Promise.all([
      Tutor.findAndCountAll({
        limit,
        offset,
        raw: true
      }),
      Tutor.findOne({ where: { email }, raw: true })
    ])

      .then(([tutors, tutor]) => {
        const data = tutors.rows.map(t => ({
          ...t,
          introduction: t.introduction.substring(0, 100) + '...'
        }))
        res.render('index', {
          tutors: data,
          tutor,
          pagination: getPagination(limit, page, tutors.count)
        })
      })
      .catch(err => next(err))
  },
  searchTutors: (req, res, next) => {
    const KEYWORD = req.query.keyword
    const keyword = KEYWORD.toLowerCase()
    Tutor.findAll({ raw: true })
      .then(tutorList => tutorList.filter(tutor => tutor.name.toLowerCase().includes(keyword)))
      .then(tutors => res.render('index', { tutors }))
      .catch(err => next(err))
  },
  getUser: (req, res, next) => {
    const { id } = req.params
    User.findByPk(id, {
      raw: true
    })
      .then(user => {
        res.render('user', { user })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    const { id } = req.params
    User.findByPk(id, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error('使用者尚未註冊!')
        res.render('user-edit', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const { id } = req.params
    const { name, introduction } = req.body
    console.log(id)
    User.findByPk(id)
      .then(user => {
        if (!user) throw new Error('使用者尚未註冊!')
        return user.update({
          name,
          introduction
        })
      })
      .then(() => {
        req.flash('success_msg', '修改成功!')
        res.redirect(`/users/${id}`)
      })
      .catch(err => next(err))
  }
}

module.exports = userController
