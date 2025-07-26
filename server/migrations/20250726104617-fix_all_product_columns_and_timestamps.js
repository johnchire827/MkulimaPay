'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename columns
    await queryInterface.renameColumn('products', 'reviewCount', 'review_count');
    await queryInterface.renameColumn('products', 'currentStage', 'current_stage');
    await queryInterface.renameColumn('products', 'blockchainVerified', 'blockchain_verified');
    await queryInterface.renameColumn('products', 'blockchainTxHash', 'blockchain_tx_hash');
    
    // Handle timestamps (check if they exist first)
    const tableInfo = await queryInterface.describeTable('products');
    
    if (tableInfo.createdAt) {
      await queryInterface.renameColumn('products', 'createdAt', 'created_at');
    } else if (!tableInfo.created_at) {
      await queryInterface.addColumn('products', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
    
    if (tableInfo.updatedAt) {
      await queryInterface.renameColumn('products', 'updatedAt', 'updated_at');
    } else if (!tableInfo.updated_at) {
      await queryInterface.addColumn('products', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
    
    // Update data types
    await queryInterface.changeColumn('products', 'rating', {
      type: Sequelize.DECIMAL(3, 2),
      defaultValue: 0.0
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverse operations
    await queryInterface.renameColumn('products', 'review_count', 'reviewCount');
    await queryInterface.renameColumn('products', 'current_stage', 'currentStage');
    await queryInterface.renameColumn('products', 'blockchain_verified', 'blockchainVerified');
    await queryInterface.renameColumn('products', 'blockchain_tx_hash', 'blockchainTxHash');
    
    await queryInterface.renameColumn('products', 'created_at', 'createdAt');
    await queryInterface.renameColumn('products', 'updated_at', 'updatedAt');
    
    await queryInterface.changeColumn('products', 'rating', {
      type: Sequelize.DOUBLE,
      defaultValue: 0
    });
  }
};
