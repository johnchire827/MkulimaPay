'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('bids', 'shipping_address', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });
    
    await queryInterface.addColumn('bids', 'payment_method', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'cash'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('bids', 'shipping_address');
    await queryInterface.removeColumn('bids', 'payment_method');
  }
};
