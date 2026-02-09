import Anthropic from '@anthropic-ai/sdk';
import { Logger } from './utils.js';

const logger = new Logger('LLMClient');

/**
 * Unified LLM Client that supports multiple providers
 */
export class LLMClient {
  constructor(config) {
    this.provider = config.provider || 'ollama'; // 'ollama', 'anthropic', 'openai'
    this.config = config;

    if (this.provider === 'anthropic') {
      this.client = new Anthropic({ apiKey: config.apiKey });
    }

    logger.info(`LLM Client initialized with provider: ${this.provider}`);
  }

  /**
   * Make a completion request
   */
  async complete(messages, options = {}) {
    const modelConfig = {
      model: options.model || this.config.model,
      maxTokens: options.maxTokens || this.config.maxTokens || 4096,
      temperature: options.temperature ?? this.config.temperature ?? 0.7,
      systemPrompt: options.systemPrompt
    };

    switch (this.provider) {
      case 'ollama':
        return await this.ollamaComplete(messages, modelConfig);
      case 'anthropic':
        return await this.anthropicComplete(messages, modelConfig);
      case 'openai':
        return await this.openaiComplete(messages, modelConfig);
      default:
        throw new Error(`Unknown provider: ${this.provider}`);
    }
  }

  /**
   * Ollama completion
   */
  async ollamaComplete(messages, config) {
    const ollamaUrl = this.config.baseUrl || 'http://localhost:11434';

    // Convert messages format
    const ollamaMessages = messages.map(msg => {
      if (typeof msg.content === 'string') {
        return { role: msg.role, content: msg.content };
      } else if (Array.isArray(msg.content)) {
        // Extract text from content blocks
        const text = msg.content
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('\n');
        return { role: msg.role, content: text };
      }
      return msg;
    });

    // Add system prompt as first message if provided
    if (config.systemPrompt) {
      ollamaMessages.unshift({
        role: 'system',
        content: config.systemPrompt
      });
    }

    logger.debug(`Calling Ollama at ${ollamaUrl}/api/chat`);

    try {
      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.model,
          messages: ollamaMessages,
          stream: false,
          options: {
            temperature: config.temperature,
            num_predict: config.maxTokens
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${error}`);
      }

      const data = await response.json();

      // Convert Ollama response to Anthropic-like format
      return {
        content: [
          {
            type: 'text',
            text: data.message.content
          }
        ],
        stop_reason: 'end_turn',
        model: config.model,
        usage: {
          input_tokens: data.prompt_eval_count || 0,
          output_tokens: data.eval_count || 0
        }
      };
    } catch (error) {
      logger.error('Ollama API call failed:', error.message);
      throw error;
    }
  }

  /**
   * Anthropic completion
   */
  async anthropicComplete(messages, config) {
    const params = {
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: messages
    };

    if (config.systemPrompt) {
      params.system = config.systemPrompt;
    }

    return await this.client.messages.create(params);
  }

  /**
   * OpenAI completion (if needed in the future)
   */
  async openaiComplete(messages, config) {
    // Placeholder for OpenAI support
    throw new Error('OpenAI provider not yet implemented');
  }

  /**
   * Check if the LLM service is available
   */
  async healthCheck() {
    try {
      if (this.provider === 'ollama') {
        const ollamaUrl = this.config.baseUrl || 'http://localhost:11434';
        const response = await fetch(`${ollamaUrl}/api/tags`);

        if (!response.ok) {
          return { status: 'error', message: 'Ollama service not responding' };
        }

        const data = await response.json();
        return {
          status: 'ok',
          models: data.models?.map(m => m.name) || [],
          message: `Ollama running with ${data.models?.length || 0} models`
        };
      }

      return { status: 'ok', message: 'Provider available' };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        hint: this.provider === 'ollama' ? 'Is Ollama running? Start it with: ollama serve' : ''
      };
    }
  }
}

/**
 * Create LLM client from environment config
 */
export function createLLMClient() {
  const provider = process.env.LLM_PROVIDER || 'ollama';

  const config = {
    provider,
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    model: process.env.LLM_MODEL || 'deepseek-coder:33b',
    maxTokens: parseInt(process.env.MAX_TOKENS || '4096'),
    temperature: parseFloat(process.env.TEMPERATURE || '0.7')
  };

  return new LLMClient(config);
}
