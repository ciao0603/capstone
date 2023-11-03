const { User, Tutor, Course } = require('../models')
const dayjs = require('dayjs')

const tutorService = {
  postTutor: async (req, cb) => {
    try {
      const { introduction, style, duration, link, availableDays } = req.body
      const { id, name, image, email, nation } = req.user
      const selectedDays = Array.isArray(availableDays) ? availableDays.join('') : availableDays

      if (!(introduction && style && duration && link && availableDays)) throw new Error('尚有欄位未填!')
      // 確認尚未成為老師
      const user = await User.findByPk(id)
      if (user.isTeacher) throw new Error('已申請過成為老師!')
      // create tutor
      const tutor = await Tutor.create({
        name, image, email, nation, introduction, style, duration, link, availableDays: selectedDays
      })
      // 更新 user 資料
      const updatedUser = await user.update({
        isTeacher: true,
        tutorId: tutor.id
      })

      cb(null, { tutor, user: updatedUser })
    } catch (err) {
      cb(err)
    }
  },
  getTutor: async (req, cb) => {
    try {
      const tutorId = req.params.id
      const SCHEDULE_LIMIT = 2
      const COMMENT_LIMIT = 2
      const now = dayjs()
      const nowDate = now.format('YYYY-MM-DD')

      const tutor = await Tutor.findOne({ where: { id: tutorId }, raw: true })
      if (!tutor) throw new Error('尚未成為老師!')

      const courses = await Course.findAll({ where: { tutorId }, raw: true, nest: true, include: [User, Tutor] })
      // *New Schedule
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
      // *Recent Reviewed
      // 先找出已結束且有評分的課程
      const comments = courses.filter(course => {
        const date = dayjs(course.date)
        const time = dayjs(course.endTime, 'HH:mm:00')
        return (date.isBefore(now, 'day') || (course.date === nowDate && time.isBefore(now))) && course.score
      })
      // 按照先後順序排(新的在前)
      comments.sort((a, b) => {
        const dateA = dayjs(a.date)
        const dateB = dayjs(b.date)
        const timeA = dayjs(a.startTime, 'HH:mm:ss')
        const timeB = dayjs(b.startTime, 'HH:mm:ss')
        // 若date相同就比time
        return dateB - dateA || timeB - timeA
      })
      const recentComments = comments.slice(0, COMMENT_LIMIT)
      // * tutor分數
      const totalScore = comments.reduce((sum, c) => sum + c.score, 0)
      const averageScore = totalScore === 0 ? '尚無評價' : (totalScore / comments.length).toFixed(1)

      cb(null, {
        tutor,
        schedules,
        recentComments,
        averageScore
      })
    } catch (err) {
      cb(err)
    }
  },
  editTutor: async (req, cb) => {
    try {
      const { email } = req.user
      const tutor = await Tutor.findOne({ where: { email }, raw: true })
      if (!tutor) throw new Error('尚未成為老師!')

      cb(null, { tutor })
    } catch (err) {
      cb(err)
    }
  },
  putTutor: async (req, cb) => {
    try {
      const userId = req.user.id
      const tutorId = req.params.id
      const { name, nation, introduction, style, duration, link, availableDays } = req.body
      const selectedDays = Array.isArray(availableDays) ? availableDays.join('') : availableDays
      if (!(introduction && style && duration && link && availableDays)) throw new Error('尚有欄位未填!')

      const tutor = await Tutor.findByPk(tutorId)
      if (!tutor) throw new Error('老師不存在!')
      const user = await User.findByPk(userId)
      // 更新資料
      const updatedTutor = await tutor.update({
        name, nation, introduction, style, duration, link, availableDays: selectedDays
      })
      const updatedUser = await user.update({ name: name })

      cb(null, { tutor: updatedTutor, user: updatedUser })
    } catch (err) {
      cb(err)
    }
  }
}

module.exports = tutorService
