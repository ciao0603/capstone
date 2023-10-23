const { User } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const adminService = {
  getUsers: async (req, cb) => {
    try {
      const DEFAULT_LIMIT = 7
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || DEFAULT_LIMIT
      const offset = getOffset(limit, page)

      const users = await User.findAndCountAll({
        limit, offset, raw: true
      })
      let data = users.rows
      data = data.filter(u => u.isAdmin !== 1) // 排除 root

      cb(null, {
        users: data,
        pagination: getPagination(limit, page, users.count)
      })
    } catch (err) {
      cb(err)
    }
  }
}

module.exports = adminService
