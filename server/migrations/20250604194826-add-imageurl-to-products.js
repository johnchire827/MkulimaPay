'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Products');
    
    if (!tableDescription.imageUrl) {
      await queryInterface.addColumn('Products', 'imageUrl', {
        type: Sequelize.STRING,
        defaultValue: ''
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Products');
    
    if (tableDescription.imageUrl) {
      await queryInterface.removeColumn('Products', 'imageUrl');
    }
  }
};