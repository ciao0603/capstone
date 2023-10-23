const bcrypt = require('bcryptjs')
const dayjs = require('dayjs')

const { User, Tutor, Course } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const userService = {
  signUp: async (req, cb) => {
    try {
      const { name, nation, email, password, passwordCheck } = req.body
      // 確保資料填寫正確
      if (!(name && nation && email && password)) throw new Error('尚有欄位未填!')
      if (password !== passwordCheck) throw new Error('Passwords do not match !')
      // 確認尚未註冊過
      const user = await User.findOne({ where: { email } })
      if (user) throw new Error('User already exists !')
      // 產生user
      const hash = await bcrypt.hash(password, 10)
      const newUser = await User.create({
        name,
        nation,
        email,
        password: hash,
        image: `https://loremflickr.com/g/350/350/portrait/?random=${(Math.random() * 100)}`
      })

      cb(null, { user: newUser })
    } catch (err) {
      cb(err)
    }
  },
  getTutors: async (req, cb) => {
    try {
      const TUTORS_LIMIT = 6
      const RANKING_LIMIT = 7
      const KEYWORD = req.query.keyword || ''
      const keyword = KEYWORD.toLowerCase() || ''
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || TUTORS_LIMIT
      const offset = getOffset(limit, page)

      // * 顯示所有家教的資料
      const tutors = await Tutor.findAndCountAll({ raw: true })
      let tutorsList = tutors.rows
      let total = tutors.count
      // 根據 tutor 名字或介紹搜尋
      if (keyword) {
        tutorsList = tutorsList.filter(t => t.name.toLowerCase().includes(keyword) || t.introduction.toLowerCase().includes(keyword))
        // tutors 數量更改為搜尋到的數量
        total = tutorsList.length
      }
      // 根據 limit 切割並修改為希望頁面呈現的資料
      tutorsList = tutorsList.slice(offset, offset + limit)
      const data = tutorsList.map(t => ({
        ...t,
        introduction: t.introduction.substring(0, 100) + '...'
      }))

      // * 根據總學習時數排名
      let users = await User.findAll({ raw: true })
      // 排除學習時數為 0
      users = users.filter(u => u.totalMinutes !== 0)
      // 按照順序(大 > 小)取前7名
      const userList = users.sort((a, b) => b.totalMinutes - a.totalMinutes).slice(0, RANKING_LIMIT)

      cb(null, {
        tutors: data,
        users: userList,
        pagination: getPagination(limit, page, total)
      })
    } catch (err) {
      cb(err)
    }
  },
  getUser: async (req, cb) => {
    try {
      const userId = req.params.id
      const SCHEDULE_LIMIT = 2
      const HISTORY_LIMIT = 4

      const user = await User.findByPk(userId, { raw: true })
      if (!user) throw new Error('用戶不存在!')

      const courses = await Course.findAll({ where: { userId }, raw: true, nest: true, include: [Tutor] })
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

      // * user 排名
      const users = await User.findAll({ raw: true })
      const userList = users.sort((a, b) => b.totalMinutes - a.totalMinutes)
      const userIndex = userList.findIndex(user => user.id === Number(userId))

      cb(null, {
        user,
        schedules,
        histories,
        userIndex
      })
    } catch (err) {
      cb(err)
    }
  },
  editUser: async (req, cb) => {
    try {
      const userId = req.params.id
      const user = await User.findByPk(userId, { raw: true })
      if (!user) throw new Error('使用者尚未註冊!')

      cb(null, { user })
    } catch (err) {
      cb(err)
    }
  },
  putUser: async (req, cb) => {
    try {
      const userId = req.params.id
      const { name, nation, introduction } = req.body
      console.log(name, introduction)
      const user = await User.findByPk(userId)
      if (!user) throw new Error('使用者尚未註冊!')
      const updatedUser = await user.update({
        name,
        nation,
        introduction
      })
      console.log(updatedUser)

      cb(null, { user: updatedUser })
    } catch (err) {
      cb(err)
    }
  }
}

module.exports = userService
