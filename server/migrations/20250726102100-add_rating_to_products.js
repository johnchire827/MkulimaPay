'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'rating', {
      type: Sequelize.DECIMAL(3, 2),
      defaultValue: 0.0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'rating');
  }
};
