const bcrypt = require('bcryptjs')
const faker = require('faker')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(customParseFormat)

const { User, Tutor, Course } = require('../models')
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
    const userId = req.params.id
    const SCHEDULE_LIMIT = 2
    Promise.all([
      User.findByPk(userId, { raw: true }),
      Course.findAll({ where: { userId }, raw: true, nest: true, include: [Tutor] })
    ])
      .then(([user, courses]) => {
        const now = dayjs()
        const nowDate = now.format('YYYY-MM-DD')
        // 先找出尚未開始的課程
        courses = courses.filter(course => {
          const date = dayjs(course.date)
          const time = dayjs(course.startTime, 'HH:mm:ss')
          course.date = date.format('YYYY-MM-DD')
          course.startTime = course.startTime.substring(0, 5)
          course.endTime = course.endTime.substring(0, 5)
          return date.isAfter(now) || (course.date === nowDate && time.isAfter(now))
        })
        // 按照先後順序排
        courses.sort((a, b) => {
          const dateA = dayjs(a.date)
          const dateB = dayjs(b.date)
          const timeA = dayjs(a.startTime, 'HH:mm:ss')
          const timeB = dayjs(b.startTime, 'HH:mm:ss')
          // 若date相同就比time
          return dateA - dateB || timeA - timeB
        })
        // 取最先的兩個
        courses = courses.slice(0, SCHEDULE_LIMIT)
        res.render('user', { user, courses })
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
