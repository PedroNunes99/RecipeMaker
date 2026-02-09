import { Logger, generateTaskId } from '../shared/utils.js';
import { AgentStatus, TaskStatus } from '../shared/types.js';
import { createLLMClient } from '../shared/llm-client.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.agent/.env' });

/**
 * Base Agent class that all specialized agents inherit from
 */
export class BaseAgent {
  constructor(config, agentType) {
    this.id = `${agentType}-${Date.now()}`;
    this.type = agentType;
    this.config = config;
    this.status = AgentStatus.IDLE;
    this.currentTask = null;
    this.results = [];
    this.errors = [];
    this.logger = new Logger(`Agent:${config?.name || agentType}`);
    this.client = createLLMClient();
    this.conversationHistory = [];
  }

  /**
   * Execute a task
   */
  async executeTask(task) {
    this.logger.info(`Starting task: ${task.description}`);
    this.status = AgentStatus.WORKING;
    this.currentTask = task;

    try {
      const result = await this.performTask(task);

      this.status = AgentStatus.IDLE;
      this.currentTask = null;
      this.results.push({ taskId: task.id, result, timestamp: new Date() });

      this.logger.info(`Task completed: ${task.description}`);

      return {
        success: true,
        result,
        taskId: task.id
      };
    } catch (error) {
      this.status = AgentStatus.ERROR;
      this.errors.push({ taskId: task.id, error, timestamp: new Date() });
      this.logger.error(`Task failed: ${task.description}`, error);

      return {
        success: false,
        error: error.message,
        taskId: task.id
      };
    }
  }

  /**
   * Perform the actual task - to be implemented by specialized agents
   */
  async performTask(task) {
    throw new Error('performTask must be implemented by specialized agents');
  }

  /**
   * Call LLM with conversation context
   */
  async callClaude(systemPrompt, userMessage) {
    // Add user message to conversation
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    const response = await this.client.complete(this.conversationHistory, {
      model: this.config?.model,
      maxTokens: this.config?.maxTokens,
      temperature: this.config?.temperature,
      systemPrompt: systemPrompt
    });

    // Add assistant response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: response.content
    });

    return response;
  }

  /**
   * Extract text from LLM response
   */
  extractTextFromResponse(response) {
    if (typeof response === 'string') return response;
    if (response.content) {
      if (typeof response.content === 'string') return response.content;
      if (Array.isArray(response.content)) {
        const textBlocks = response.content.filter(block => block.type === 'text');
        return textBlocks.map(block => block.text).join('\n');
      }
    }
    return '';
  }

  /**
   * Reset conversation history
   */
  resetConversation() {
    this.conversationHistory = [];
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      id: this.id,
      type: this.type,
      name: this.config?.name || this.type,
      status: this.status,
      currentTask: this.currentTask,
      resultsCount: this.results.length,
      errorsCount: this.errors.length,
      lastActive: new Date()
    };
  }

  /**
   * Check if agent can handle a specific action
   */
  canHandle(action) {
    return this.config?.capabilities?.includes(action) || false;
  }
}
