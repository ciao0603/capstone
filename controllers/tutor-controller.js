const { User, Tutor } = require('../models')

const tutorController = {
  createTutor: (req, res, next) => {
    const { id, email, isTeacher } = req.user
    if (isTeacher) {
      Promise.all([
        Tutor.findOne({ where: { email }, raw: true }),
        User.findByPk(id, { raw: true })
      ])
        .then(([tutor, user]) => res.render('tutor-create', { tutor, user }))
        .catch(err => next(err))
    } else {
      User.findByPk(id, { raw: true })
        .then(user => res.render('tutor-create', { user }))
        .catch(err => next(err))
    }
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
          user.update({ isTeacher: true })
        ])
      })
      .then(([tutor, user]) => res.redirect(`/tutors/${tutor.id}`))
      .catch(err => next(err))
  }
}

module.exports = tutorController
