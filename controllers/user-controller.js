const userService = require('../services/user-service')

const userController = {
  signUpPage: (req, res, next) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    userService.signUp(req, (err, data) => err ? next(err) : res.redirect('/signin'))
  },
  signInPage: (req, res, next) => {
    res.render('signin')
  },
  signIn: (req, res, next) => {
    req.flash('success_msg', '登入成功!')
    res.redirect('/users/tutors')
  },
  logOut: (req, res, next) => {
    req.logout()
    req.flash('success_msg', '登出成功!')
    res.redirect('/signin')
  },
  getTutors: (req, res, next) => {
    userService.getTutors(req, (err, data) => err ? next(err) : res.render('index', data))
  },
  getUser: (req, res, next) => {
    userService.getUser(req, (err, data) => err ? next(err) : res.render('user', data))
  },
  editUser: (req, res, next) => {
    userService.editUser(req, (err, data) => err ? next(err) : res.render('user-edit', data))
  },
  putUser: (req, res, next) => {
    userService.putUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '修改成功!')
      res.session.updatedData = data
      return res.redirect(`/users/${data.user.id}`)
    })
  }
}

module.exports = userController
