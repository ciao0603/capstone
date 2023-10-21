const tutorService = require('../services/tutor-service')

const tutorController = {
  createTutor: (req, res, next) => {
    const { isTeacher } = req.user
    if (isTeacher) throw new Error('目前已是老師!')
    res.render('tutor-create')
  },
  postTutor: (req, res, next) => {
    tutorService.postTutor(req, (err, data) => err ? next(err) : res.redirect(`/tutors/${data.tutor.id}`))
  },
  getTutor: (req, res, next) => {
    tutorService.getTutor(req, (err, data) => err ? next(err) : res.render('tutor', data))
  },
  editTutor: (req, res, next) => {
    tutorService.editTutor(req, (err, data) => err ? next(err) : res.render('tutor-edit', data))
  },
  putTutor: (req, res, next) => {
    tutorService.putTutor(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '修改成功!')
      res.session.updatedData = data
      res.redirect(`/tutors/${data.tutor.id}`)
    })
  }
}

module.exports = tutorController
