'use strict'
const bcrypt = require('bcryptjs')
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const INTRO_LIMIT = 200
      const USERS_LENGTH = 16
      const users = [
        {
          name: 'root',
          email: 'root@example.com',
          password: await bcrypt.hash('12345678', 10),
          is_admin: true,
          is_teacher: false,
          introduction: faker.lorem.text().substring(0, INTRO_LIMIT),
          total_minutes: 0,
          nation: faker.address.country(),
          image: `https://loremflickr.com/g/350/350/portrait/?random=${(Math.random() * 100)}`,
          tutor_id: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'user1',
          email: 'user1@example.com',
          password: await bcrypt.hash('12345678', 10),
          is_admin: false,
          is_teacher: false,
          introduction: faker.lorem.text().substring(0, INTRO_LIMIT),
          total_minutes: 0,
          nation: faker.address.country(),
          image: `https://loremflickr.com/g/350/350/portrait/?random=${(Math.random() * 100)}`,
          tutor_id: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'user2',
          email: 'user2@example.com',
          password: await bcrypt.hash('12345678', 10),
          is_admin: false,
          is_teacher: true,
          introduction: faker.lorem.text().substring(0, INTRO_LIMIT),
          total_minutes: 0,
          nation: 'Japan',
          image: `https://loremflickr.com/g/350/350/portrait/?random=${(Math.random() * 100)}`,
          tutor_id: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
      for (let i = 3; i < USERS_LENGTH; i++) {
        users.push({
          name: faker.name.findName(),
          email: `user${i}@example.com`,
          password: await bcrypt.hash('12345678', 10),
          is_admin: false,
          is_teacher: false,
          introduction: faker.lorem.text().substring(0, INTRO_LIMIT),
          total_minutes: 0,
          nation: faker.address.country(),
          image: `https://loremflickr.com/g/350/350/portrait/?random=${(Math.random() * 100)}`,
          tutor_id: null,
          created_at: new Date(),
          updated_at: new Date()
        })
      }
      await queryInterface.bulkInsert('Users', users, {})
    } catch (err) {
      console.log('User-seed-file Error:', err)
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {})
  }
}
