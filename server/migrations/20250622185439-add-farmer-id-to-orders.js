module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('orders');

    if (!table.farmer_id) {
      await queryInterface.addColumn('orders', 'farmer_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    } else {
      console.log('Column farmer_id already exists in orders table. Skipping.');
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('orders');

    if (table.farmer_id) {
      await queryInterface.removeColumn('orders', 'farmer_id');
    } else {
      console.log('Column farmer_id does not exist. Nothing to rollback.');
    }
  }
};

