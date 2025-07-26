'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('products', 'reviewCount', 'review_count');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('products', 'review_count', 'reviewCount');
  }
};