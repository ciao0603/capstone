const dayjs = require('dayjs')
const { Op } = require('sequelize')
// 設置dayjs為中文
require('dayjs/locale/zh-cn')
dayjs.locale('zh-cn')

const { User, Tutor, Course } = require('../models')

const courseService = {
  getCourse: async (req, cb) => {
    try {
      const tutorId = req.params.id
      const COMMENT_MIX_LIMIT = 2
      const COMMENT_MINI_LIMIT = 2
      const times = []
      const now = dayjs()

      const tutor = await Tutor.findByPk(tutorId, { raw: true })
      if (!tutor) throw new Error('這位家教不存在!')

      const { duration, availableDays } = tutor
      const courseCount = 180 / duration // 每個晚上開課的次數
      // *Generate Times
      // 從當天開始加14天
      for (let d = 1; d <= 14; d++) {
        const date = now.add(d, 'day')
        const dayOfWeek = date.day().toString()
        // 若是date的星期和tutor可以上課的星期一樣
        if (availableDays.includes(dayOfWeek)) {
          let startTime = date.set('hour', 18).set('minute', 0)
          // 根據duration產生當天可上課的時段
          for (let i = 0; i < courseCount; i++) {
            const endTime = startTime.add(duration, 'minute')
            const formattedDate = new Date(date.format('YYYY-MM-DD'))
            const formattedStartTime = startTime.format('HH:mm:00')
            // 確認時段是否已被預約
            const course = await Course.findOne({
              where: {
                [Op.and]: [{ tutorId }, { date: formattedDate }, {
                  startTime: formattedStartTime
                }]
              }
            })
            if (!course) {
              // 儲存這個課程時段
              times.push({
                date: date.format('YYYY-MM-DD'),
                dayOfWeek: date.format('dd'),
                startTime: startTime.format('HH:mm'),
                endTime: endTime.format('HH:mm')
              })
            }
            // 重置下堂課開始時間
            startTime = endTime
          }
        }
      }
      // *Lesson History
      const courses = await Course.findAll({ where: { tutorId }, raw: true })
      // 先找出已結束且有評分的課程
      const comments = courses.filter(course => {
        const nowDate = now.format('YYYY-MM-DD')
        const date = dayjs(course.date)
        const time = dayjs(course.endTime, 'HH:mm:00')
        return (date.isBefore(now) || (course.date === nowDate && time.isBefore(now))) && course.score
      })
      // 按照評分(高>低)排
      comments.sort((a, b) => {
        const scoreA = a.score
        const scoreB = b.score
        return scoreB - scoreA
      })
      // 最多取前後各兩個(最高分和最低分)
      let highestComment = []
      let lowestComment = []
      if (comments.length >= 4) {
        highestComment = comments.slice(0, COMMENT_MIX_LIMIT)
        lowestComment = comments.slice(-COMMENT_MINI_LIMIT)
      } else if (comments.length < 4 && comments.length > 0) {
        highestComment = comments
      }
      // * tutor分數
      const totalScore = comments.reduce((sum, c) => sum + c.score, 0)
      const averageScore = (totalScore / comments.length).toFixed(1) || '尚無評價'

      cb(null, {
        tutor,
        times,
        highestComment,
        lowestComment,
        averageScore
      })
    } catch (err) {
      cb(err)
    }
  },
  postCourse: async (req, cb) => {
    try {
      const userId = req.user.id
      const tutorId = req.params.id
      const time = JSON.parse(req.body.time) // 取得預約時間並轉成json
      const { date, dayOfWeek, startTime, endTime } = time
      const formattedDate = new Date(date)
      const formattedStartTime = `${startTime}:00`

      // where 同老師 、 同一天 且 同時間
      const course = await Course.findOne({ where: { [Op.and]: [{ tutorId }, { date: formattedDate }, { startTime: formattedStartTime }] } })
      // 若時段尚未被預約
      if (!course) {
        // 預約課程
        const newCourse = await Course.create({ date, dayOfWeek, startTime, endTime, userId, tutorId })
        // 取得預約課程資訊
        const reserve = await Course.findByPk(newCourse.id, {
          raw: true,
          nest: true,
          include: [Tutor]
        })
        reserve.date = dayjs(reserve.date).format('YYYY-MM-DD')
        reserve.startTime = reserve.startTime.substring(0, 5)
        reserve.endTime = reserve.endTime.substring(0, 5)
        // 增加 user 學習時數
        const user = await User.findByPk(userId)
        await user.increment('totalMinutes', { by: reserve.Tutor.duration })
        cb(null, { course: reserve, tutorId })
      }
      cb(null, { tutorId })
    } catch (err) {
      cb(err)
    }
  },
  getComment: async (req, cb) => {
    try {
      const courseId = req.params.id

      const course = await Course.findByPk(courseId, { raw: true })
      if (!course) throw new Error('課程不存在!')
      if (course.score) throw new Error('此課程已評過分!')
      course.date = dayjs(course.date).format('YYYY-MM-DD')
      course.startTime = course.startTime.substring(0, 5)
      course.endTime = course.endTime.substring(0, 5)

      cb(null, { course })
    } catch (err) {
      cb(err)
    }
  },
  postComment: async (req, cb) => {
    try {
      const userId = req.user.id
      const courseId = req.params.id
      const { score, comment } = req.body

      if (!score) throw new Error('Score is required !')

      const course = await Course.findByPk(courseId)
      const updatedCourse = await course.update({ score, comment })

      cb(null, { userId, course: updatedCourse })
    } catch (err) {
      cb(err)
    }
  }
}

module.exports = courseService
