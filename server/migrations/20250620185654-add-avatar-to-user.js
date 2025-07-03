'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('users');

    if (!tableDefinition.avatar) {
      await queryInterface.addColumn('users', 'avatar', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('users');

    if (tableDefinition.avatar) {
      await queryInterface.removeColumn('users', 'avatar');
    }
  }
};
