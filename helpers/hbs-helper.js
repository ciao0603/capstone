module.exports = {
  ifEqual: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },
  ifContain: function (a, b, options) {
    return a.toString().includes(b.toString()) ? options.fn(this) : options.inverse(this)
  },
  toJSON: function (object) {
    return JSON.stringify(object)
  },
  increment: function (index) {
    return index + 1
  }
}
