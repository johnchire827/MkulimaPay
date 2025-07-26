module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bids', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending'
      },
      productId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'products',  // Changed from 'products' to 'Products'
          key: 'id'
        }
      },
      buyerId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      createdAt: {  // Changed from created_at to createdAt for consistency
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {  // Changed from updated_at to updatedAt for consistency
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('bids');
  }
};