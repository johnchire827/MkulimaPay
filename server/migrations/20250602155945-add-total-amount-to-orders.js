// File: migrations/YYYYMMDDHHMMSS-add-total-amount-to-orders.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Check if column exists first
      const columns = await queryInterface.describeTable('orders');
      if (!columns.total_amount) {
        await queryInterface.addColumn(
          'orders',
          'total_amount',
          {
            type: Sequelize.DOUBLE,
            allowNull: false,
            defaultValue: 0.0
          },
          { transaction }
        );
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('orders', 'total_amount');
  }
};