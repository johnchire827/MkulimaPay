'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('instore_sales'));

    if (!tableExists) {
      await queryInterface.createTable('instore_sales', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        farmer_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        amount: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        payment_method: {
          type: Sequelize.ENUM('cash', 'mpesa'),
          allowNull: false,
          defaultValue: 'cash'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      // Add indexes
      await queryInterface.addIndex('instore_sales', ['farmer_id']);
      await queryInterface.addIndex('instore_sales', ['product_id']);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('instore_sales');
  }
};
