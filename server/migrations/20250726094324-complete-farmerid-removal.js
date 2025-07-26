'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Check if farmerId column still exists
    const tableDescription = await queryInterface.describeTable('products');
    
    if (tableDescription.farmerId) {
      console.log('Found existing farmerId column - completing removal');
      
      // 2. Remove any existing constraints first
      try {
        const constraints = await queryInterface.sequelize.query(`
          SELECT constraint_name 
          FROM information_schema.table_constraints 
          WHERE table_name = 'products' 
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%farmerId%'
        `);

        if (constraints[0].length > 0) {
          console.log(`Removing constraint: ${constraints[0][0].constraint_name}`);
          await queryInterface.removeConstraint('products', constraints[0][0].constraint_name);
        }
      } catch (error) {
        console.log('Error removing constraints:', error.message);
      }

      // 3. Remove the column
      try {
        await queryInterface.removeColumn('products', 'farmerId');
        console.log('Successfully removed farmerId column');
      } catch (error) {
        console.log('Error removing column:', error.message);
        throw error; // Re-throw to fail the migration
      }
    } else {
      console.log('No farmerId column exists - nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    // For rollback, recreate the column and constraint
    const tableDescription = await queryInterface.describeTable('products');
    
    if (!tableDescription.farmerId) {
      await queryInterface.addColumn('products', 'farmerId', {
        type: Sequelize.INTEGER,
        allowNull: true
      });

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
      console.log('Recreated farmerId column and constraint');
    }
  }
};