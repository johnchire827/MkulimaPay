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
          model: 'products',  // Changed from 'Products' to 'products'
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addColumn('products', 'currentStage', {  // Changed from 'Products'
      type: Sequelize.STRING,
      defaultValue: 'planting'
    });

    await queryInterface.addColumn('products', 'blockchainVerified', {  // Changed from 'Products'
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('products', 'blockchainTxHash', {  // Changed from 'Products'
      type: Sequelize.STRING,
      defaultValue: ''
    });

    await queryInterface.addColumn('products', 'origin', {  // Changed from 'Products'
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SupplyChainEvents');
    await queryInterface.removeColumn('products', 'currentStage');  // Changed from 'Products'
    await queryInterface.removeColumn('products', 'blockchainVerified');  // Changed from 'Products'
    await queryInterface.removeColumn('products', 'blockchainTxHash');  // Changed from 'Products'
    await queryInterface.removeColumn('products', 'origin');  // Changed from 'Products'
  }
};