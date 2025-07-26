'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('bids', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_bids_product',
      references: {
        table: 'products',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    
    await queryInterface.addConstraint('bids', {
      fields: ['buyer_id'],
      type: 'foreign key',
      name: 'fk_bids_buyer',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('bids', 'fk_bids_product');
    await queryInterface.removeConstraint('bids', 'fk_bids_buyer');
  }
};
