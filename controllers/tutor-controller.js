const { User, Tutor } = require('../models')

const tutorController = {
  createTutor: (req, res, next) => {
    res.render('tutor-create')
  },
  postTutor: (req, res, next) => {
    const { introduction, style, duration, link, availableDays } = req.body
    const { id, name, image, email } = req.user
    if (!(introduction && style && duration && link && availableDays)) throw new Error('尚有欄位未填!')
    const selectedDays = Array.isArray(availableDays) ? availableDays.join('') : availableDays
    User.findByPk(id)
      .then(user => {
        if (user.isTeacher) throw new Error('已申請過成為老師!')
        return Promise.all([
          Tutor.create({
            name, image, email, introduction, style, duration, link, availableDays: selectedDays
          }),
          user.update({ is_teacher: true })
        ])
      })
      .then(([tutor, user]) => res.redirect(`/tutors/${tutor.id}`))
      .catch(err => next(err))
  }
}

module.exports = tutorController
