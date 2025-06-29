// testReview.js
const { sequelize, Product, User, Review } = require('./models');

const testReview = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Database connection established');

    // Find a test product
    const testProduct = await Product.findOne();
    if (!testProduct) {
      console.error('No products found in database');
      return;
    }
    console.log('Test Product:', testProduct.name);

    // Find a test user
    const testUser = await User.findOne();
    if (!testUser) {
      console.error('No users found in database');
      return;
    }
    console.log('Test User:', testUser.name);

    // Create a review
    const review = await Review.create({
      productId: testProduct.id,
      userId: testUser.id,
      rating: 5,
      comment: 'Excellent product!'
    });
    console.log('Created Review:', review.toJSON());

    // Update product rating
    await testProduct.updateRating();
    
    // Reload product to get updated values
    await testProduct.reload();
    
    console.log('Updated Product Rating:', testProduct.rating);
    console.log('Updated Review Count:', testProduct.reviewCount);
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await sequelize.close();
  }
};

testReview();