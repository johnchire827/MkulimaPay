'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('bids');

    if (!table.shipping_address) {
      await queryInterface.addColumn('bids', 'shipping_address', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      });
    } else {
      console.log('Column "shipping_address" already exists. Skipping.');
    }

    if (!table.payment_method) {
      await queryInterface.addColumn('bids', 'payment_method', {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'cash'
      });
    } else {
      console.log('Column "payment_method" already exists. Skipping.');
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('bids');

    if (table.shipping_address) {
      await queryInterface.removeColumn('bids', 'shipping_address');
    }

    if (table.payment_method) {
      await queryInterface.removeColumn('bids', 'payment_method');
    }
  }
};

