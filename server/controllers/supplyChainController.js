const db = require('../models');
const Product = db.Product;
const SupplyChainEvent = db.SupplyChainEvent;
const geocoder = require('../utils/geocoder');
const blockchainService = require('../services/blockchainService');

exports.getSupplyChainData = async (req, res) => {
  try {
    const productId = req.params.productId;
    
    // Validate product ID is a number
    if (isNaN(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID format' 
      });
    }

    const id = parseInt(productId, 10);
    
    const product = await Product.findByPk(id, {
      include: [{
        model: SupplyChainEvent,
        as: 'events',
        order: [['createdAt', 'ASC']]
      }]
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      product: {
        id: product.id,
        name: product.name,
        origin: product.origin,
        currentStage: product.currentStage
      },
      events: product.events.map(event => ({
        id: event.id,
        stage: event.stage,
        description: event.description,
        timestamp: event.createdAt,
        location: event.location,
        coordinates: event.coordinates,
        imageUrl: event.imageUrl,
        blockchainTxHash: event.blockchainTxHash,
        status: event.status
      })),
      blockchainVerified: product.blockchainVerified,
      blockchainTxHash: product.blockchainTxHash
    });
  } catch (error) {
    console.error('Error fetching supply chain data:', error);
    res.status(500).json({ error: 'Failed to fetch supply chain data' });
  }
};

exports.updateProductStage = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { stage, description, latitude, longitude } = req.body;

    if (!stage) {
      return res.status(400).json({ error: 'Stage is required' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let location = '';
    if (latitude && longitude) {
      const geoRes = await geocoder.reverse({
        lat: parseFloat(latitude),
        lon: parseFloat(longitude)
      });

      if (geoRes && geoRes[0]) {
        location = [
          geoRes[0].street,
          geoRes[0].city,
          geoRes[0].country
        ].filter(Boolean).join(', ');
      }
    }

    const newEvent = await SupplyChainEvent.create({
      stage,
      description,
      location,
      coordinates: latitude && longitude ? {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude)
      } : null,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'in-progress',
      productId
    });

    product.currentStage = stage;

    try {
      const txHash = await blockchainService.recordEvent(
        productId,
        newEvent.id,
        stage,
        newEvent.createdAt,
        latitude,
        longitude,
        req.file ? `/uploads/${req.file.filename}` : null
      );

      newEvent.blockchainTxHash = txHash;
      product.blockchainVerified = true;
      product.blockchainTxHash = txHash;

      await newEvent.save();
    } catch (blockchainError) {
      console.error('Blockchain recording failed:', blockchainError);
    }

    await product.save();

    res.json({
      success: true,
      event: newEvent,
      product: {
        currentStage: product.currentStage,
        blockchainVerified: product.blockchainVerified
      }
    });
  } catch (error) {
    console.error('Error updating product stage:', error);
    res.status(500).json({ error: 'Failed to update product stage' });
  }
};

// NEW: Save journey to database
exports.saveJourney = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { locations } = req.body;
    
    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({ error: 'Invalid locations data' });
    }
    
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Create events for each location
    const events = [];
    for (const loc of locations) {
      // Convert coordinates to string format if needed
      let coordString = null;
      if (loc.coordinates) {
        coordString = `${loc.coordinates.lat},${loc.coordinates.lng}`;
      }
      
      const event = await SupplyChainEvent.create({
        stage: loc.type || 'location',
        description: `${loc.name} at ${loc.address}`,
        location: loc.address,
        coordinates: coordString,
        status: loc.status || 'completed',
        productId: productId,
        createdAt: loc.date ? new Date(loc.date) : new Date(),
        updatedAt: new Date()
      });
      
      events.push(event);
    }
    
    // Update product stage to last location type
    if (events.length > 0) {
      const lastEvent = events[events.length - 1];
      product.currentStage = lastEvent.stage;
      await product.save();
    }
    
    res.json({
      success: true,
      message: `Journey saved with ${events.length} events`,
      events: events.map(e => e.id)
    });
    
  } catch (error) {
    console.error('Error saving journey:', error);
    res.status(500).json({ error: 'Failed to save journey', details: error.message });
  }
};