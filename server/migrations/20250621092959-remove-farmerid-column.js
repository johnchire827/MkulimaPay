'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the camelCase farmerId column if it exists
    await queryInterface.removeColumn('Products', 'farmerId');
  },

  async down(queryInterface, Sequelize) {
    // For rollback: add back the farmerId column
    await queryInterface.addColumn('Products', 'farmerId', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};