'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Products', 'name', {
      type: Sequelize.STRING,
      allowNull: false
    });
    
    await queryInterface.changeColumn('Products', 'description', {
      type: Sequelize.TEXT,
      allowNull: true // Make description optional
    });
    
    // Add other column fixes as needed
  },

  down: async (queryInterface) => {
    // Revert changes if needed
  }
};
