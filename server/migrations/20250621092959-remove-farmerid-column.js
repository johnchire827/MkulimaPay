'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if column exists before trying to drop it
    const table = await queryInterface.describeTable('Products');
    if (table.farmerId) {
      console.log('Removing farmerId column...');
      await queryInterface.removeColumn('Products', 'farmerId');
    } else {
      console.log('farmerId column does not exist. Skipping.');
    }
  },

  async down(queryInterface, Sequelize) {
    // Add back the column on rollback
    const table = await queryInterface.describeTable('Products');
    if (!table.farmerId) {
      await queryInterface.addColumn('Products', 'farmerId', {
        type: Sequelize.INTEGER,
        allowNull: false
      });
    } else {
      console.log('farmerId already exists. Skipping rollback add.');
    }
  }
};
