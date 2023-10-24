'use strict'
const faker = require('faker')
const { User, Tutor } = require('../models')

let daysOfWeek = [0, 1, 2, 3, 4, 5, 6]
function generateAvailableDays () {
  daysOfWeek = daysOfWeek.sort(() => Math.random() - 0.5)
  let count = Math.floor(Math.random() * 7)
  count = count === 0 ? 1 : count
  return daysOfWeek.slice(0, count).join('')
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const INTRO_LIMIT = 500
      const TUTOR_LENGTH = 10
      const users = await queryInterface.sequelize.query('SELECT id FROM Users;')

      const fixedTutor = {
        name: 'user2',
        email: 'user2@example.com',
        image: `https://loremflickr.com/g/350/350/portrait/?random=${(Math.random() * 100)}`,
        nation: 'Japan',
        introduction: faker.lorem.text().substring(0, INTRO_LIMIT),
        style: faker.lorem.text().substring(0, INTRO_LIMIT),
        link: faker.internet.url(),
        duration: Math.random() - 0.5 ? 30 : 60,
        created_at: new Date(),
        updated_at: new Date()
      }

      await queryInterface.sequelize.transaction(async () => {
        // 插入fixedTutor
        const insertFixedTutor = await Tutor.create(fixedTutor)
        await queryInterface.sequelize.query('UPDATE Tutors SET available_days = :days WHERE id = :userId', {
          replacements: {
            days: `${generateAvailableDays()}`,
            userId: insertFixedTutor.id
          }
        })
        // 修改對應user
        const user2 = await User.findOne({ where: { email: 'user2@example.com' } })
        await user2.update({
          tutorId: insertFixedTutor.id
        })

        // 生成剩餘tutor
        for (let i = 0; i < TUTOR_LENGTH - 1; i++) {
          // 隨機取得一個 user 並取得相關資料以帶入 tutor (排除指定的帳號*3)
          const randomIndex = Math.floor(Math.random() * (users[0].length - 3)) + 3
          const randomUserId = users[0][randomIndex].id
          const userData = await queryInterface.sequelize.query('SELECT name, email, image, nation FROM Users WHERE id = :userId', {
            replacements: { userId: randomUserId }
          })
          const newTutor = {
            name: userData[0][0].name,
            email: userData[0][0].email,
            image: userData[0][0].image,
            nation: userData[0][0].nation,
            introduction: faker.lorem.text().substring(0, INTRO_LIMIT),
            style: faker.lorem.text().substring(0, INTRO_LIMIT),
            link: faker.internet.url(),
            duration: 30 * (Math.floor(Math.random() * 2) + 1),
            created_at: new Date(),
            updated_at: new Date()
          }
          // 先 find 後 create 以避免重複創建同一個帳號
          const findNewTutor = await Tutor.findOne({ where: { email: newTutor.email } })
          if (findNewTutor) {
            i -= 1
          } else {
            const insertNewTutor = await Tutor.create(newTutor)
            await queryInterface.sequelize.query('UPDATE Tutors SET available_days = :days WHERE id = :userId', {
              replacements: {
                days: `${generateAvailableDays()}`,
                userId: insertNewTutor.id
              }
            })
            const user = await User.findOne({ where: { email: insertNewTutor.email } })
            await user.update({
              isTeacher: true,
              tutorId: insertNewTutor.id
            })
          }
        }
      })
    } catch (err) {
      console.log('Tutor-seed-file Error:', err)
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Tutors', {})
  }
}
