'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'users'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(tableName, [
      {
        name: 'John',
        email: 'admin@admin.com',
        password: '$2a$10$SIcX4.tgqqcnWmxbT9wIpuLdFgb3W8dNGevcJoUw8cmttzYl.0Yhi',
        roles: '["admin"]'
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(tableName, null, {});
  },
};
