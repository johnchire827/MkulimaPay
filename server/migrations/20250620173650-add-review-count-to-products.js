'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Products');
    
    if (!tableDescription.reviewCount) {
      await queryInterface.addColumn('Products', 'reviewCount', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Products');
    
    if (tableDescription.reviewCount) {
      await queryInterface.removeColumn('Products', 'reviewCount');
    }
  }
};