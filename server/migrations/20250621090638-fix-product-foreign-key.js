'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove duplicate foreign key constraints
    await queryInterface.removeConstraint('Products', 'Products_farmerId_fkey');
    
    // Remove the camelCase farmerId column
    await queryInterface.removeColumn('Products', 'farmerId');
    
    // Rename farmer_id to farmerId if needed (or keep as farmer_id)
    // If you want to keep snake_case, no rename needed
  },

  async down(queryInterface, Sequelize) {
    // For rollback: add back the farmerId column
    await queryInterface.addColumn('Products', 'farmerId', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    
    // Add back the foreign key constraint
    await queryInterface.addConstraint('Products', {
      fields: ['farmerId'],
      type: 'foreign key',
      name: 'Products_farmerId_fkey',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE'
    });
  }
};
