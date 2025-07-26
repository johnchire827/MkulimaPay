'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the farmerId column exists but doesn't have proper constraints
    const tableDescription = await queryInterface.describeTable('products');
    
    if (tableDescription.farmerId) {
      // Remove any existing constraints first
      const constraints = await queryInterface.sequelize.query(
        `SELECT constraint_name 
         FROM information_schema.table_constraints 
         WHERE table_name = 'products' 
         AND constraint_type = 'FOREIGN KEY' 
         AND constraint_name LIKE '%farmerId%'`
      );
      
      if (constraints[0].length > 0) {
        await queryInterface.removeConstraint('products', constraints[0][0].constraint_name);
      }
      
      // Add the proper foreign key constraint
      await queryInterface.addConstraint('products', {
        fields: ['farmerId'],
        type: 'foreign key',
        name: 'products_farmerId_fkey',
        references: {
          table: 'users',
          field: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove the constraint if needed (optional)
    const constraints = await queryInterface.sequelize.query(
      `SELECT constraint_name 
       FROM information_schema.table_constraints 
       WHERE table_name = 'products' 
       AND constraint_type = 'FOREIGN KEY' 
       AND constraint_name = 'products_farmerId_fkey'`
    );
    
    if (constraints[0].length > 0) {
      await queryInterface.removeConstraint('products', 'products_farmerId_fkey');
    }
  }
};