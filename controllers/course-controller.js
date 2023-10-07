const dayjs = require('dayjs')
// 設置dayjs為中文
require('dayjs/locale/zh-cn')
dayjs.locale('zh-cn')

const { Tutor } = require('../models')

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
              const data = `${date.format('MM-DD (dd)')} ${startTime.format('HH:mm')}-${endTime.format('HH:mm')}`
              times.push(data)
              startTime = endTime
            }
          }
        }
        res.render('course', { tutor, times })
      })
      .catch(err => next(err))
  }
}

module.exports = courseController
