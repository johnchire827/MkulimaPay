'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('orders');

    if (!table.shipping_address) {
      await queryInterface.addColumn('orders', 'shipping_address', {
        type: Sequelize.STRING,
      });
    } else {
      console.log('Column shipping_address already exists. Skipping.');
    }

    if (!table.payment_method) {
      await queryInterface.addColumn('orders', 'payment_method', {
        type: Sequelize.STRING,
      });
    } else {
      console.log('Column payment_method already exists. Skipping.');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('orders');

    if (table.shipping_address) {
      await queryInterface.removeColumn('orders', 'shipping_address');
    }

    if (table.payment_method) {
      await queryInterface.removeColumn('orders', 'payment_method');
    }
  }
};

