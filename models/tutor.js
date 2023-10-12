'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Tutor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Tutor.hasMany(models.Course, { foreignKey: 'tutorId' })
    }
  };
  Tutor.init({
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    introduction: DataTypes.TEXT,
    style: DataTypes.TEXT,
    link: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    availableDays: DataTypes.STRING,
    email: DataTypes.STRING,
    nation: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tutor',
    tableName: 'Tutors',
    underscored: true
  })
  return Tutor
}
