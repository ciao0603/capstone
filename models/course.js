'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Course.belongsTo(models.User, { foreignKey: 'userId' })
      Course.belongsTo(models.Tutor, { foreignKey: 'tutorId' })
    }
  };
  Course.init({
    date: DataTypes.DATE,
    dayOfWeek: DataTypes.STRING,
    startTime: DataTypes.TIME,
    endTime: DataTypes.TIME,
    score: DataTypes.FLOAT,
    comment: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    tutorId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Course',
    tableName: 'Courses',
    underscored: true
  })
  return Course
}
