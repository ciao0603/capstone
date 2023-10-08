const dayjs = require('dayjs')
// 設置dayjs為中文
require('dayjs/locale/zh-cn')
dayjs.locale('zh-cn')
const utc = require('dayjs/plugin/utc') // 引入UTC插件
// 啟用UTC插件
dayjs.extend(utc)

const { Tutor, Course } = require('../models')

const courseController = {
  getCourse: (req, res, next) => {
    const { id } = req.params
    const times = []
    const today = dayjs()
    Tutor.findByPk(id, { raw: true })
      .then(tutor => {
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
              // 儲存這個課程時段
              times.push({
                date: date.format('YYYY-MM-DD'),
                dayOfWeek: date.format('dd'),
                startTime: startTime.format('HH:mm'),
                endTime: endTime.format('HH:mm')
              })
              // 重置下堂課開始時間
              startTime = endTime
            }
          }
        }
        res.render('course', { tutor, times })
      })
      .catch(err => next(err))
  },
  postCourse: (req, res, next) => {
    const userId = req.user.id
    const tutorId = req.params.id
    // 取得預約時間並轉成json
    const time = JSON.parse(req.body.time)
    const { date, startTime, endTime } = time

    Course.findOne({ tutorId, startTime })
      .then(course => {
        if (course) { return }
        return Course.create({
          date,
          startTime,
          endTime,
          userId,
          tutorId
        })
      })
      .then(newCourse => res.render('course-reserve', { course: newCourse }))
      .catch(err => next(err))
  }
}

module.exports = courseController
