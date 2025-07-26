'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('products'); // lowercase
    
    if (!tableDescription.imageUrl) {
      await queryInterface.addColumn('products', 'imageUrl', { // lowercase
        type: Sequelize.STRING,
        defaultValue: ''
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('products'); // lowercase
    
    if (tableDescription.imageUrl) {
      await queryInterface.removeColumn('products', 'imageUrl'); // lowercase
    }
  }
};