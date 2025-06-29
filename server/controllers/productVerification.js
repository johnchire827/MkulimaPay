const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 seconds timeout
  maxRetries: 2
});

exports.analyzeProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No image uploaded',
        message: 'Please upload an image for analysis'
      });
    }

    const imagePath = req.file.path;
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({ 
        error: 'File not found',
        message: 'The uploaded file could not be processed'
      });
    }

    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are an agricultural expert analyzing fresh produce. Analyze the product image and: " +
                    "1. Identify the produce type (e.g., fruit, vegetable, dairy, cereal) " +
                    "2. Assess condition (fresh, ripe, unripe, rotten, damaged) " +
                    "3. Determine quality grade (A/B/C) " +
                    "4. List any defects " +
                    "5. Recommend: 'Buy' or 'Reject' " +
                    "6. Estimate freshness percentage " +
                    "7. Suggest storage tips " +
                    "Format response as JSON: {produceType, condition, qualityGrade, defects, recommendation, freshnessPercentage, storageTips, confidence}"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.2
    });

    // Clean up file
    fs.unlinkSync(imagePath);

    // Parse and return response
    const analysis = JSON.parse(response.choices[0].message.content);
    res.json(analysis);
    
  } catch (error) {
    console.error('OpenAI Error:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Analysis failed',
      message: error.message,
      details: error.response?.data || null
    });
  }
};