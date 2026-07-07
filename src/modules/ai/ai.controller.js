const AppError = require('../../shared/utils/AppError');
const analyticsService = require('../analytics/analytics.service');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * POST /api/v1/ai/chat
 * Proxy chat requests to OpenRouter securely
 */
const chatWithAI = async (req, res, next) => {
  try {
    const { messages, workspaceId } = req.body;
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
    
    let contextString = "";
    
    // Fetch live workspace context if workspaceId is provided
    if (workspaceId && req.user) {
      try {
        const [summary, projects, deadlines] = await Promise.all([
          analyticsService.getWorkspaceSummary(workspaceId, req.user._id),
          analyticsService.getProjectProgress(workspaceId, req.user._id),
          analyticsService.getUpcomingDeadlines(workspaceId, req.user._id)
        ]);
        
        contextString = `
Current Workspace Status:
- Total Projects: ${summary.totalProjects}
- Tasks: ${summary.totalTasks} total, ${summary.completedTasks} completed, ${summary.overdueTasks} overdue.
- Completion Rate: ${summary.completionRate}%

Active Projects:
${projects.map(p => `- ${p.projectName}: ${p.progress}% complete (${p.completedTasks}/${p.totalTasks} tasks)`).join('\n')}

Upcoming Deadlines:
${deadlines.slice(0, 5).map(d => `- ${d.title} (Project: ${d.project || 'None'}) due ${new Date(d.dueDate).toLocaleDateString()}`).join('\n')}

If you notice high overdue tasks or projects with low progress, you can output a line starting with "RISK DETECTED:" followed by your analysis to trigger a special UI warning.`;

      } catch (err) {
        console.warn("Failed to fetch workspace context for AI:", err.message);
      }
    }

    // Inject a system prompt to give it context about TaskPulse
    const systemPrompt = {
      role: 'system',
      content: `You are TaskPulse AI, an intelligent assistant built into a task management SaaS. 
Keep your answers concise, helpful, and focused on productivity, project management, and task analysis.
${contextString}`
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
