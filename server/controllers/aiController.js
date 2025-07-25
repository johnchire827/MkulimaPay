const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handleAIChat = async (req, res) => {
  try {
    const { messages, productId, verificationResult } = req.body;
    const userId = req.user.id;

    const systemMessage = {
      role: 'system',
      content: `You are a quality assurance assistant for agricultural products. 
                Current quality analysis: ${JSON.stringify(verificationResult)}.
                Product ID: ${productId}.
                User ID: ${userId}.
                Provide helpful, accurate responses about product quality.`
    };

    const formattedMessages = [systemMessage, ...messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))];

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = response.choices[0].message.content;

    res.json({ success: true, content: aiResponse });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI request',
      error: error.message
    });
  }
};
