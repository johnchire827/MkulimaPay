'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
        type: Sequelize.DATE
      }
    });

    await queryInterface.addColumn('Products', 'currentStage', {
      type: Sequelize.STRING,
      defaultValue: 'planting'
    });

    await queryInterface.addColumn('Products', 'blockchainVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('Products', 'blockchainTxHash', {
      type: Sequelize.STRING,
      defaultValue: ''
    });

    await queryInterface.addColumn('Products', 'origin', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SupplyChainEvents');
    await queryInterface.removeColumn('Products', 'currentStage');
    await queryInterface.removeColumn('Products', 'blockchainVerified');
    await queryInterface.removeColumn('Products', 'blockchainTxHash');
    await queryInterface.removeColumn('Products', 'origin');
  }
};