'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the SupplyChainEvents table
    await queryInterface.createTable('SupplyChainEvents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      stage: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      coordinates: {
        type: Sequelize.JSON,
        allowNull: true
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      blockchainTxHash: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'in-progress'
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Check existing columns in Products before adding
    const table = await queryInterface.describeTable('Products');

    if (!table.currentStage) {
      await queryInterface.addColumn('Products', 'currentStage', {
        type: Sequelize.STRING,
        defaultValue: 'planting'
      });
    }

    if (!table.blockchainVerified) {
      await queryInterface.addColumn('Products', 'blockchainVerified', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      });
    }

    if (!table.blockchainTxHash) {
      await queryInterface.addColumn('Products', 'blockchainTxHash', {
        type: Sequelize.STRING,
        defaultValue: ''
      });
    }

    if (!table.origin) {
      await queryInterface.addColumn('Products', 'origin', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the SupplyChainEvents table
    await queryInterface.dropTable('SupplyChainEvents');

    // Safely remove columns if they exist
    const table = await queryInterface.describeTable('Products');

    if (table.currentStage) {
      await queryInterface.removeColumn('Products', 'currentStage');
    }

    if (table.blockchainVerified) {
      await queryInterface.removeColumn('Products', 'blockchainVerified');
    }

    if (table.blockchainTxHash) {
      await queryInterface.removeColumn('Products', 'blockchainTxHash');
    }

    if (table.origin) {
      await queryInterface.removeColumn('Products', 'origin');
    }
  }
};
