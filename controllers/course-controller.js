const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')

const { Op } = require('sequelize')
// 設置dayjs為中文
require('dayjs/locale/zh-cn')
dayjs.locale('zh-cn')
dayjs.extend(customParseFormat)

const { Tutor, Course } = require('../models')

const courseController = {
  getCourse: async (req, res, next) => {
    try {
      const tutorId = req.params.id
      const times = []
      const today = dayjs()

      const tutor = await Tutor.findByPk(tutorId, { raw: true })
      if (!tutor) throw new Error('這位家教不存在!')
      const { duration, availableDays } = tutor
      const courseCount = 180 / duration // 每個晚上開課的次數

      // 從當天開始加14天
      for (let d = 0; d < 14; d++) {
        const date = today.add(d, 'day')
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
      res.render('course', { tutor, times })
    } catch (err) {
      next(err)
    }
  },
  postCourse: (req, res, next) => {
    const userId = req.user.id
    const tutorId = req.params.id
    // 取得預約時間並轉成json
    const time = JSON.parse(req.body.time)
    const { date, dayOfWeek, startTime, endTime } = time
    const formattedDate = new Date(date)
    const formattedStartTime = `${startTime}:00`

    Course.findOne({
      // where 同老師 、 同一天 且 同時間
      where: { [Op.and]: [{ tutorId }, { date: formattedDate }, { startTime: formattedStartTime }] }
    })
      .then(course => {
        if (!course) {
          return Course.create({
            date,
            dayOfWeek,
            startTime,
            endTime,
            userId,
            tutorId
          })
        }
      })
      .then(newCourse => {
        if (newCourse) {
          return Course.findByPk(newCourse.id, {
            raw: true,
            nest: true,
            include: [Tutor]
          })
        }
      })
      .then(reserve => {
        if (reserve) {
          reserve.date = dayjs(reserve.date).format('YYYY-MM-DD')
          reserve.startTime = reserve.startTime.substring(0, 5)
          reserve.endTime = reserve.endTime.substring(0, 5)
        }
        res.render('course-reserve', { course: reserve })
      })
      .catch(err => next(err))
  }
}

module.exports = courseController
