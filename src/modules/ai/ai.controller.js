const AppError = require('../../shared/utils/AppError');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * POST /api/v1/ai/chat
 * Proxy chat requests to OpenRouter securely
 */
const chatWithAI = async (req, res, next) => {
  try {
    const { messages } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'openrouter/auto';

    if (!apiKey) {
      throw new AppError('AI service is not configured on the server', 503);
    }

    if (!messages || !Array.isArray(messages)) {
      throw new AppError('Messages array is required', 400);
    }

    // Prepare messages for OpenRouter (ensure formatting)
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : msg.role,
      content: msg.content
    }));

    // Inject a system prompt to give it context about TaskPulse
    const systemPrompt = {
      role: 'system',
      content: `You are TaskPulse AI, an intelligent assistant built into a task management SaaS. 
Keep your answers concise, helpful, and focused on productivity, project management, and task analysis.`
    };

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CORS_ORIGIN || 'http://localhost:5173',
        'X-Title': 'TaskPulse Chatbot',
      },
      body: JSON.stringify({
        model: model,
        temperature: 0.7,
        stop: ["\n```\n", "### Code:"], // Stop sequences to separate code/text
        messages: [systemPrompt, ...formattedMessages]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    res.status(200).json({
      success: true,
      reply: data.choices[0].message.content
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAI
};
