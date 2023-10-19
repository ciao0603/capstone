'use strict'
const dayjs = require('dayjs')
const faker = require('faker')

const { User } = require('../models')

// 設置dayjs為中文
require('dayjs/locale/zh-cn')
dayjs.locale('zh-cn')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 取得學生(沒有成為老師)
    const students = await queryInterface.sequelize.query('SELECT id FROM Users WHERE is_teacher = false AND is_admin = false;')
    // 取得老師
    const tutors = await queryInterface.sequelize.query('SELECT id, duration, available_days FROM Tutors;')
    const courses = []
    const now = dayjs()
    //* 每個 student 要產生 10 堂課
    for (let i = 0; i < students[0].length; i++) {
      // 從 tutors的第幾個位置開始分配
      let startIndex = 2 * i
      startIndex = startIndex <= 0 ? 0 : startIndex
      // 本輪的student
      const userId = students[0][i].id
      const user = await User.findByPk(userId)
      //* 產生 2 堂 已經結束、尚未評分的課程
      for (let c = 0; c < 2; c++) {
        const t = startIndex
        // 此課程對應的老師
        const tutorId = tutors[0][t].id
        // 選一個此老師可以開課的星期幾，並轉為數字
        const tutorAvailableDay = Number(tutors[0][t].available_days.charAt(1))
        // 找出離今天最近的星期幾，並倒退 7 天，以確保一定是過去的日期
        const date = now.day(tutorAvailableDay).subtract(7, 'day')
        const startTime = date.set('hour', 18).set('minute', 0)
        const endTime = startTime.add(tutors[0][t].duration, 'minute')
        // 建立課程
        courses.push({
          user_id: userId,
          tutor_id: tutorId,
          date: date.format('YYYY-MM-DD'),
          day_of_week: date.format('dd'),
          start_time: startTime.format('HH:mm'),
          end_time: endTime.format('HH:mm'),
          created_at: new Date(),
          updated_at: new Date()
        })
        // 增加 user的總學習時數
        await user.increment('totalMinutes', { by: tutors[0][t].duration })
        // 當超過tutors數量時循環回第1個
        startIndex = (startIndex + 1) % tutors[0].length
      }
      //* 產生 4 堂 已經結束、已經評分的課程
      for (let c = 0; c < 4; c++) {
        const t = startIndex
        const tutorId = tutors[0][t].id
        const tutorAvailableDay = Number(tutors[0][t].available_days.charAt(1))
        // 設定為14天來跟尚未評分的課程區別
        let date = now.day(tutorAvailableDay).subtract(14, 'day')
        const startTime = date.set('hour', 18).set('minute', 0)
        const endTime = startTime.add(tutors[0][t].duration, 'minute')
        // 確認時段是否已被預約
        const course = courses.filter(c => {
          return (c.tutor_id === tutorId) && (c.date === date.format('YYYY-MM-DD'))
        })
        // 若查到重複課程，將日期再提早一周
        if (course.length > 0) { date = date.subtract(7, 'day') }

        courses.push({
          user_id: userId,
          tutor_id: tutorId,
          date: date.format('YYYY-MM-DD'),
          day_of_week: date.format('dd'),
          start_time: startTime.format('HH:mm'),
          end_time: endTime.format('HH:mm'),
          score: (Math.random() * 5).toFixed(1),
          comment: faker.lorem.sentence(),
          created_at: new Date(),
          updated_at: new Date()
        })
        await user.increment('totalMinutes', { by: tutors[0][t].duration })
        startIndex = (startIndex + 1) % tutors[0].length
      }
      //* 產生 4 堂 尚未開課的課程
      for (let c = 0; c < 4; c++) {
        const t = startIndex
        const tutorId = tutors[0][t].id
        const tutorAvailableDay = Number(tutors[0][t].available_days.charAt(1))
        // 找出離今天最近的星期幾，並往後 7 天，以確保一定是未來的時間
        let date = now.day(tutorAvailableDay).add(7, 'day')
        const startTime = date.set('hour', 18).set('minute', 0)
        const endTime = startTime.add(tutors[0][t].duration, 'minute')
        // 確認時段是否已被預約
        const course = courses.filter(c => {
          return (c.tutor_id === tutorId) && (c.date === date.format('YYYY-MM-DD'))
        })
        // 若查到重複課程，將日期再延後一周
        if (course.length > 0) { date = date.add(7, 'day') }

        courses.push({
          user_id: userId,
          tutor_id: tutorId,
          date: date.format('YYYY-MM-DD'),
          day_of_week: date.format('dd'),
          start_time: startTime.format('HH:mm'),
          end_time: endTime.format('HH:mm'),
          created_at: new Date(),
          updated_at: new Date()
        })
        await user.increment('totalMinutes', { by: tutors[0][t].duration })
        startIndex = (startIndex + 1) % tutors[0].length
      }
    }

    await queryInterface.bulkInsert('Courses', courses, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Courses', {})
  }
}
