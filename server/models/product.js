const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.User, {
        foreignKey: 'farmerId',  // Changed to camelCase
        as: 'farmer'
      });

      Product.belongsToMany(models.Order, {
        through: 'OrderProducts',
        foreignKey: 'product_id',
        otherKey: 'order_id',
        as: 'orders'
      });
      
      Product.hasMany(models.SupplyChainEvent, {
        foreignKey: 'product_id',
        as: 'events'
      });
      
      Product.hasMany(models.Review, {
        foreignKey: 'product_id',
        as: 'reviews'
      });
    }
    
    async updateRating() {
      try {
        const reviews = await this.getReviews();
        
        if (reviews.length === 0) {
          return this.update({
            rating: 0,
            reviewCount: 0
          });
        }
        
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        const reviewCount = reviews.length;
        
        return this.update({
          rating: parseFloat(averageRating.toFixed(1)),
          reviewCount: reviewCount
        });
      } catch (error) {
        console.error('Error updating product rating:', error);
        throw error;
      }
    }
  }

  Product.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    origin: {
      type: DataTypes.STRING(100),
      allowNull: true
      
    },
    quantity: {
  type: DataTypes.INTEGER,
  allowNull: false, // or false if required
  defaultValue: 1,
},

    organic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      field: 'image_url',
      defaultValue: ''
    },
    rating: {
      type: DataTypes.DOUBLE,
      defaultValue: 0
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      field: 'review_count',
      defaultValue: 0
    },
    currentStage: {
      type: DataTypes.STRING(50),
      field: 'current_stage',
      defaultValue: 'planting'
    },
    blockchainVerified: {
      type: DataTypes.BOOLEAN,
      field: 'blockchain_verified',
      defaultValue: false
    },
    blockchainTxHash: {
      type: DataTypes.STRING(255),
      field: 'blockchain_tx_hash',
      defaultValue: ''
    },
    farmerId: {  // Changed to camelCase with field mapping
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'farmer_id',  // Maps to snake_case column
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return Product;
};