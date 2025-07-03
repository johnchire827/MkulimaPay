'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Check and drop foreign key constraint if it exists
    const [results] = await queryInterface.sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'Products'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'Products_farmerId_fkey'
    `);

    if (results.length > 0) {
      console.log('Removing existing constraint Products_farmerId_fkey');
      await queryInterface.removeConstraint('Products', 'Products_farmerId_fkey');
    } else {
      console.log('Constraint Products_farmerId_fkey does not exist, skipping removal.');
    }

    // Step 2: Remove the column if it exists
    const table = await queryInterface.describeTable('Products');
    if (table.farmerId) {
      console.log('Removing column farmerId');
      await queryInterface.removeColumn('Products', 'farmerId');
    } else {
      console.log('Column farmerId does not exist, skipping removal.');
    }

    // Optionally rename `farmer_id` to `farmerId` (if needed)
    // await queryInterface.renameColumn('Products', 'farmer_id', 'farmerId');
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Products');
    
    if (!table.farmerId) {
      await queryInterface.addColumn('Products', 'farmerId', {
        type: Sequelize.INTEGER,
        allowNull: false
      });

      await queryInterface.addConstraint('Products', {
        fields: ['farmerId'],
        type: 'foreign key',
        name: 'Products_farmerId_fkey',
        references: {
          table: 'users',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }
  }
};

