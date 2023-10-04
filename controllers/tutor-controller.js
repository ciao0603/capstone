const { User, Tutor } = require('../models')

const tutorController = {
  createTutor: (req, res, next) => {
    const { isTeacher } = req.user
    if (isTeacher) throw new Error('目前已是老師!')
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
          user.update({ isTeacher: true })
        ])
      })
      .then(([tutor, user]) => res.redirect(`/tutors/${tutor.id}`))
      .catch(err => next(err))
  },
  getTutor: (req, res, next) => {
    const { email } = req.user
    Tutor.findOne({ where: { email }, raw: true })
      .then((tutor) => {
        if (!tutor) throw new Error('尚未成為老師!')
        res.render('tutor', { tutor })
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
    const { id } = req.params
    const { name, introduction, style, duration, link, availableDays } = req.body
    const selectedDays = Array.isArray(availableDays) ? availableDays.join('') : availableDays
    if (!(introduction && style && duration && link && availableDays)) throw new Error('尚有欄位未填!')
    Tutor.findByPk(id)
      .then(tutor => {
        if (!tutor) throw new Error('老師不存在!')
        return tutor.update({
          name,
          introduction,
          style,
          duration,
          link,
          availableDays: selectedDays
        })
      })
      .then(() => res.redirect(`/tutors/${id}`))
      .catch(err => next(err))
  }
}

module.exports = tutorController
