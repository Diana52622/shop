'use strict';
/** @type {import('sequelize-cli').Migration} */
const tableName = 'users'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(tableName, 'roles', {
      type: Sequelize.JSONB
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(tableName, 'roles');
  }
};
