'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('users');

    if (!table.balance) {
      await queryInterface.addColumn('users', 'balance', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      });
    } else {
      console.log('Column "balance" already exists. Skipping.');
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('users');

    if (table.balance) {
      await queryInterface.removeColumn('users', 'balance');
    }
  }
};

