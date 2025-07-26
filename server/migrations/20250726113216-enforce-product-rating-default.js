// migrations/XXXXXXXXXXXXXX-enforce-product-rating-default.js

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('products', 'rating', {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert (if needed)
    await queryInterface.changeColumn('products', 'rating', {
      type: Sequelize.DOUBLE,
      allowNull: true, // Re-allows NULL (optional)
    });
  }
};