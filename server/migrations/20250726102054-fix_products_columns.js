'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('products', 'farmerId', 'farmer_id');
    await queryInterface.renameColumn('products', 'imageUrl', 'image_url');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('products', 'farmer_id', 'farmerId');
    await queryInterface.renameColumn('products', 'image_url', 'imageUrl');
  }
};