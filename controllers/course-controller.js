const courseService = require('../services/course-service')

const courseController = {
  getCourse: async (req, res, next) => {
    courseService.getCourse(req, (err, data) => err ? next(err) : res.render('course', data))
  },
  postCourse: (req, res, next) => {
    courseService.postCourse(req, (err, data) => err ? next(err) : res.render('course-reserve', data))
  },
  getComment: (req, res, next) => {
    courseService.getComment(req, (err, data) => err ? next(err) : res.render('course-comment', data))
  },
  postComment: (req, res, next) => {
    courseService.postComment(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '評分成功!')
      req.session.updatedData = data
      return res.redirect(`/users/${data.userId}`)
    })
  }
}

module.exports = courseController
