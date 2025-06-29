module.exports = (sequelize, DataTypes) => {
  const InstoreSale = sequelize.define('InstoreSale', {
    farmer_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    amount: DataTypes.FLOAT,
    payment_method: DataTypes.ENUM('cash', 'mpesa')
  }, {
    tableName: 'instore_sales',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  InstoreSale.associate = function(models) {
    InstoreSale.belongsTo(models.User, {
      foreignKey: 'farmer_id',
      as: 'farmer'
    });
    InstoreSale.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
  };

  return InstoreSale;
};