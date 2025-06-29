const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

console.log('Initializing Sequelize with environment:', env);
console.log('Database config:', config);

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: console.log,
      define: {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true
      }
    }
  );
}

// Set sequelize instance immediately
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Test connection immediately
sequelize.authenticate()
  .then(() => console.log('✅ Database connection established!'))
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });

// Get all model files
const modelFiles = fs.readdirSync(__dirname)
  .filter(file => (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  ));

console.log('Found model files:', modelFiles);

// Load models
modelFiles.forEach(file => {
  console.log(`⏳ Loading model: ${file}`);
  const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
  
  // Use explicit naming for model registration
  const modelName = model.name;
  db[modelName] = model;
  console.log(`✅ Registered model: ${modelName}`);
});

// MANUAL MODEL REGISTRATION (critical fix)
if (!db.Product) {
  console.log('⚠️ Product model not auto-loaded, registering manually');
  const productModel = require('./product')(sequelize, Sequelize.DataTypes);
  db.Product = productModel;
  console.log(`✅ Manually registered Product model`);
}
if (!db.Bid) {
  console.log('⚠️ Bid model not auto-loaded, registering manually');
  const bidModel = require('./bid')(sequelize, Sequelize.DataTypes);
  db.Bid = bidModel;
  console.log('✅ Manually registered Bid model');
}

if (!db.Order) {
  console.log('⚠️ Order model not auto-loaded, registering manually');
  const orderModel = require('./order')(sequelize, Sequelize.DataTypes);
  db.Order = orderModel;
  console.log('✅ Manually registered Order model');
}
// Add after other models
if (!db.InstoreSale) {
  console.log('⚠️ InstoreSale model not auto-loaded, registering manually');
  db.InstoreSale = instoreSaleModel;
  console.log('✅ Manually registered InstoreSale model');
}


// Create OrderProduct model
db.OrderProduct = sequelize.define('OrderProduct', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: Sequelize.INTEGER,
    references: {
      model: 'Orders',
      key: 'id'
    }
  },
  product_id: {
    type: Sequelize.INTEGER,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  quantity: {
    type: Sequelize.INTEGER,
    defaultValue: 1
  },
  price: {
    type: Sequelize.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'order_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

console.log('✅ Created OrderProduct model');

// Initialize associations AFTER all models are loaded
console.log('🔗 Initializing model associations');
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    console.log(`⏳ Setting associations for: ${modelName}`);
    db[modelName].associate(db);
    console.log(`✅ Associations set for: ${modelName}`);
  }
});

// Remove the syncDatabase function and its call
// We'll handle database sync in server.js instead

console.log('Available models:', Object.keys(db).filter(k => !['sequelize', 'Sequelize'].includes(k)));
console.log('Database instance ready');

module.exports = db;