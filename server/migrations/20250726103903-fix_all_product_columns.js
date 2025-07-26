'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('products', 'reviewCount', 'review_count');
    await queryInterface.renameColumn('products', 'currentStage', 'current_stage');
    await queryInterface.renameColumn('products', 'blockchainVerified', 'blockchain_verified');
    await queryInterface.renameColumn('products', 'blockchainTxHash', 'blockchain_tx_hash');
    
    await queryInterface.changeColumn('products', 'rating', {
      type: Sequelize.DECIMAL(3, 2),
      defaultValue: 0.0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('products', 'review_count', 'reviewCount');
    await queryInterface.renameColumn('products', 'current_stage', 'currentStage');
    await queryInterface.renameColumn('products', 'blockchain_verified', 'blockchainVerified');
    await queryInterface.renameColumn('products', 'blockchain_tx_hash', 'blockchainTxHash');
    
    await queryInterface.changeColumn('products', 'rating', {
      type: Sequelize.DOUBLE,
      defaultValue: 0
    });
  }
};
