'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {  // Changed from 'Products' to 'products'
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      price: {
        type: Sequelize.FLOAT
      },
      unit: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING
      },
      location: {
        type: Sequelize.STRING
      },
      organic: {
        type: Sequelize.BOOLEAN
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      farmerId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');  // Changed from 'Products' to 'products'
  }
};