const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const { authenticateUser } = require('../../../middleware/auth');


// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


// AI Chat endpoint
router.post('/chat', authenticateUser, async (req, res) => {

  try {
    const { messages, productId, verificationResult } = req.body;
    const userId = req.user.id;

    // Prepare system message with verification context
    const systemMessage = {
      role: 'system',
      content: `You are a quality assurance assistant for agricultural products. 
                Current quality analysis: ${JSON.stringify(verificationResult)}.
                Product ID: ${productId}.
                User ID: ${userId}.
                Provide helpful, accurate responses about product quality.`
    };
    
    // Format messages for OpenAI
    const formattedMessages = [systemMessage, ...messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))];

    // Get AI response
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = response.choices[0].message.content;

    res.json({
      success: true,
      content: aiResponse
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI request',
      error: error.message
    });
  }
});

module.exports = router;