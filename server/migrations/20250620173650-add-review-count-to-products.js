'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('products'); // lowercase
    
    if (!tableDescription.reviewCount) {
      await queryInterface.addColumn('products', 'reviewCount', { // lowercase
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('products'); // lowercase
    
    if (tableDescription.reviewCount) {
      await queryInterface.removeColumn('products', 'reviewCount'); // lowercase
    }
  }
};