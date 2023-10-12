const { User, Tutor, Course } = require('../models')
const dayjs = require('dayjs')

const tutorController = {
  createTutor: (req, res, next) => {
    const { isTeacher } = req.user
    if (isTeacher) throw new Error('目前已是老師!')
    res.render('tutor-create')
  },
  postTutor: (req, res, next) => {
    const { introduction, style, duration, link, availableDays } = req.body
    const { id, name, image, email, nation } = req.user
    if (!(introduction && style && duration && link && availableDays)) throw new Error('尚有欄位未填!')
    const selectedDays = Array.isArray(availableDays) ? availableDays.join('') : availableDays
    User.findByPk(id)
      .then(user => {
        if (user.isTeacher) throw new Error('已申請過成為老師!')
        return Promise.all([
          Tutor.create({
            name, image, email, nation, introduction, style, duration, link, availableDays: selectedDays
          }),
          user
        ])
      })
      .then(([tutor, user]) => {
        return Promise.all([
          tutor,
          user.update({
            isTeacher: true,
            tutorId: tutor.id
          })
        ])
          .then(tutor => res.redirect(`/tutors/${tutor.id}`))
      })
      .catch(err => next(err))
  },
  getTutor: (req, res, next) => {
    const { id } = req.params
    const SCHEDULE_LIMIT = 2
    const COMMENT_LIMIT = 2
    const now = dayjs()
    const nowDate = now.format('YYYY-MM-DD')
    Promise.all([
      Tutor.findOne({ where: { id }, raw: true }),
      Course.findAll({ where: { tutorId: id }, raw: true, nest: true, include: [User, Tutor] })
    ])
      .then(([tutor, courses]) => {
        if (!tutor) throw new Error('尚未成為老師!')
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
        // 計算平均分數
        const totalScore = comments.reduce((sum, c) => sum + c.score, 0)
        const averageScore = (totalScore / comments.length).toFixed(1) || '尚無評價'

        res.render('tutor', { tutor, schedules, recentComments, averageScore })
      })
      .catch(err => next(err))
  },
  editTutor: (req, res, next) => {
    const { email } = req.user
    Tutor.findOne({ where: { email }, raw: true })
      .then((tutor) => {
        if (!tutor) throw new Error('尚未成為老師!')
        res.render('tutor-edit', { tutor })
      })
      .catch(err => next(err))
  },
  putTutor: (req, res, next) => {
    const userId = req.user.id
    const tutorId = req.params.id
    const { name, introduction, style, duration, link, availableDays } = req.body
    const selectedDays = Array.isArray(availableDays) ? availableDays.join('') : availableDays
    if (!(introduction && style && duration && link && availableDays)) throw new Error('尚有欄位未填!')
    Promise.all([
      Tutor.findByPk(tutorId),
      User.findByPk(userId)
    ])
      .then(([tutor, user]) => {
        if (!tutor) throw new Error('老師不存在!')
        user.update({ name: name })
        return tutor.update({
          name,
          introduction,
          style,
          duration,
          link,
          availableDays: selectedDays
        })
      })
      .then(() => res.redirect(`/tutors/${tutorId}`))
      .catch(err => next(err))
  }
}

module.exports = tutorController
