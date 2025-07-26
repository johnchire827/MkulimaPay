module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('orders');
    
    if (!tableInfo.shipping_address) {
      await queryInterface.addColumn('orders', 'shipping_address', {
        type: Sequelize.STRING
      });
    }
    
    if (!tableInfo.payment_method) {
      await queryInterface.addColumn('orders', 'payment_method', {
        type: Sequelize.STRING
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orders', 'shipping_address');
    await queryInterface.removeColumn('orders', 'payment_method');
  }
};
