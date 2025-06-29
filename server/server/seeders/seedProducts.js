const { Product, User } = require('../../models');

async function seedProducts() {
  try {
    // Check for an existing farmer
    let farmer = await User.findOne({ where: { role: 'farmer' } });

    // If no farmer exists, create a default one
    if (!farmer) {
      console.log('No farmer found. Creating default farmer...');
      farmer = await User.create({
        name: 'Default Farmer',
        phone_number: '0712345678',
        email: 'farmer@example.com',
        password: 'password123', // Ideally hash this in production
        role: 'farmer'
      });
    }

    
    await Product.bulkCreate(products);
    console.log('✅ Products seeded successfully');
  } catch (error) {
    console.error('❌ Product seeding failed:', error);
  }
}

seedProducts();
