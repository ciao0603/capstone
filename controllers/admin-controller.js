const adminService = require('../services/admin-service')

const adminController = {
  getUsers: (req, res, next) => {
    adminService.getUsers(req, (err, data) => err ? next(err) : res.render('admin/users', data))
  }
}

module.exports = adminController
