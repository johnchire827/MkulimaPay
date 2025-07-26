'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Use lowercase table name 'products' instead of 'Products'
    await queryInterface.changeColumn('products', 'name', {
      type: Sequelize.STRING,
      allowNull: false
    });
    
    await queryInterface.changeColumn('products', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes if needed (optional)
    await queryInterface.changeColumn('products', 'name', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.changeColumn('products', 'description', {
      type: Sequelize.TEXT,
      allowNull: false
    });
  }
};
