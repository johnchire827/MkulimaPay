const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Bid extends Model {
    static associate(models) {
      // Update aliases to match controller
      Bid.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'bid_product'
      });
      Bid.belongsTo(models.User, {
        foreignKey: 'buyer_id',
        as: 'bid_buyer'
      });
    }
  }

  Bid.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shipping_address: {  // NEW FIELD
      type: DataTypes.STRING,
      allowNull: false
    },
    payment_method: {   // NEW FIELD
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'cash'
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Bid',
    tableName: 'bids',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return Bid;
};