'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First check if table exists
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('orders'));

    if (tableExists) {
      // Check if column already exists
      const [results] = await queryInterface.sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='farmer_id'
      `);

      if (results.length === 0) {
        await queryInterface.addColumn('orders', 'farmer_id', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });

        await queryInterface.addIndex('orders', ['farmer_id'], {
          name: 'orders_farmer_id'
        });
      }
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('orders', 'farmer_id');
  }
};