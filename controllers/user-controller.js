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
          nation: faker.address.country(),
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
    const TUTORS_LIMIT = 6
    const RANKING_LIMIT = 7
    const KEYWORD = req.query.keyword || ''
    const keyword = KEYWORD.toLowerCase() || ''
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || TUTORS_LIMIT
    const offset = getOffset(limit, page)

    Promise.all([
      Tutor.findAndCountAll({
        limit,
        offset,
        raw: true
      }),
      Tutor.findOne({ where: { email }, raw: true }),
      User.findAll({ raw: true })
    ])

      .then(([tutors, tutor, users]) => {
        let total = tutors.count
        // show tutors
        let data = tutors.rows.map(t => ({
          ...t,
          introduction: t.introduction.substring(0, 100) + '...'
        }))
        // search function
        if (keyword) {
          data = data.filter(t => t.name.toLowerCase().includes(keyword) || t.introduction.toLowerCase().includes(keyword))
          total = data.length
        }
        // ranking list
        const userList = users.sort((a, b) => b.totalMinutes - a.totalMinutes).slice(0, RANKING_LIMIT)
        res.render('index', {
          tutors: data,
          tutor,
          users: userList,
          pagination: getPagination(limit, page, total)
        })
      })
      .catch(err => next(err))
  },
  getUser: (req, res, next) => {
    const userId = req.params.id
    const SCHEDULE_LIMIT = 2
    const HISTORY_LIMIT = 4
    Promise.all([
      User.findAll({ raw: true }),
      User.findByPk(userId, { raw: true }),
      Course.findAll({ where: { userId }, raw: true, nest: true, include: [Tutor] })
    ])
      .then(([users, user, courses]) => {
        if (!user) throw new Error('用戶不存在!')

        const now = dayjs()
        const nowDate = now.format('YYYY-MM-DD')
        // * New Schedule
        // 先找出尚未開始的課程
        let schedules = courses.filter(course => {
          const date = dayjs(course.date)
          const time = dayjs(course.startTime, 'HH:mm:ss')
          course.date = date.format('YYYY-MM-DD')
          course.startTime = course.startTime.substring(0, 5)
          course.endTime = course.endTime.substring(0, 5)
          return date.isAfter(now) || (course.date === nowDate && time.isAfter(now))
        })
        // 按照先後順序排
        schedules.sort((a, b) => {
          const dateA = dayjs(a.date)
          const dateB = dayjs(b.date)
          const timeA = dayjs(a.startTime, 'HH:mm:ss')
          const timeB = dayjs(b.startTime, 'HH:mm:ss')
          // 若date相同就比time
          return dateA - dateB || timeA - timeB
        })
        // 取最先的兩個
        schedules = schedules.slice(0, SCHEDULE_LIMIT)

        // *Lesson History
        // 先找出已結束f且尚未評分的課程
        let histories = courses.filter(course => {
          const date = dayjs(course.date)
          const time = dayjs(course.endTime, 'HH:mm:00')
          return (date.isBefore(now, 'day') || (course.date === nowDate && time.isBefore(now))) && !course.score
        })
        // 按照先後順序排(新的在前)
        histories.sort((a, b) => {
          const dateA = dayjs(a.date)
          const dateB = dayjs(b.date)
          const timeA = dayjs(a.startTime, 'HH:mm:ss')
          const timeB = dayjs(b.startTime, 'HH:mm:ss')
          // 若date相同就比time
          return dateB - dateA || timeB - timeA
        })
        // 取最先的四個
        histories = histories.slice(0, HISTORY_LIMIT)

        // *user ranking
        const userList = users.sort((a, b) => b.totalMinutes - a.totalMinutes)
        const userIndex = userList.findIndex(user => { return user.id === Number(userId) })

        res.render('user', { user, schedules, histories, userIndex })
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
