'use strict';
/** @type {import('sequelize-cli').Migration} */
const tableName = 'courses'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(tableName, 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(tableName, 'isActive');
  }
};
