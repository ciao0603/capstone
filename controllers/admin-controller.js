const { User } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const adminController = {
  getUsers: (req, res, next) => {
    const DEFAULT_LIMIT = 7
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    User.findAndCountAll({
      limit,
      offset,
      raw: true
    })
      .then(users => {
        let data = users.rows
        data = data.filter(u => u.isAdmin !== 1)
        res.render('admin/users', {
          users: data,
          pagination: getPagination(limit, page, users.count)
        })
      })
      .catch(err => next(err))
  }
}

module.exports = adminController
