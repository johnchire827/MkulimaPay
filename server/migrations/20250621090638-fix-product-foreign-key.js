'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the constraint exists before trying to drop it
   const constraints = await queryInterface.sequelize.query(
  `SELECT constraint_name 
   FROM information_schema.table_constraints 
   WHERE table_name = 'products'
   AND constraint_type = 'FOREIGN KEY' 
   AND constraint_name = 'products_farmerId_fkey'`
);

    
    if (constraints[0].length > 0) {
      await queryInterface.removeConstraint('products', 'products_farmerId_fkey');  // Changed to lowercase
    }
    
    // Add the new constraint
    await queryInterface.addConstraint('products', {  // Changed to lowercase
      fields: ['farmerId'],
      type: 'foreign key',
      name: 'products_farmerId_fkey',  // Changed to lowercase
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('products', 'products_farmerId_fkey');  // Changed to lowercase
  }
};