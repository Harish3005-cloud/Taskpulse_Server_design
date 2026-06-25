/**
 * AI Scoring Service using OpenRouter
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Score a task using OpenRouter
 * @param {string} title Task title
 * @param {string} description Task description
 * @returns {Object|null} The parsed AI score object or null if failed
 */
const scoreTask = async (title, description) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'openrouter/auto';

  if (!apiKey) {
    console.warn('OPENROUTER_API_KEY is not set. Skipping AI scoring.');
    return null;
  }

  const systemPrompt = `
You are an expert AI task analyzer for TaskPulse, a task management system.
Evaluate the given task based on its title and description.
Return a strict JSON object (no markdown, no backticks, no extra text) with exactly the following schema:
{
  "priority": <number 1-10, where 10 is highest priority>,
  "urgency": "<string: exactly one of 'low', 'medium', 'high', 'critical'>",
  "category": "<string: e.g., 'bug', 'feature', 'maintenance', 'docs', 'design'>",
  "reasoning": "<string: brief explanation of why you chose these scores>"
}
  `.trim();

  const userPrompt = `Title: ${title}\nDescription: ${description || 'No description provided.'}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CORS_ORIGIN || 'http://localhost:5173',
        'X-Title': 'TaskPulse API',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2, // Low temperature for more deterministic output
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract just the JSON block by finding the first { and last }
    let jsonString = content;
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1) {
      jsonString = content.substring(startIndex, endIndex + 1);
    }

    const parsed = JSON.parse(jsonString);

    // Basic validation
    return {
      priority: typeof parsed.priority === 'number' ? parsed.priority : 3,
      urgency: ['low', 'medium', 'high', 'critical'].includes(parsed.urgency.toLowerCase()) ? parsed.urgency.toLowerCase() : 'medium',
      category: parsed.category || 'general',
      reasoning: parsed.reasoning || 'AI generated score.'
    };

  } catch (error) {
    console.error('[AI Service Error]', error.message);
    return null; // Graceful fallback
  }
};

module.exports = {
  scoreTask
};
