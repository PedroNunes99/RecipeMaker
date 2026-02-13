#!/usr/bin/env node

import { OrchestratorAgent } from './agents/orchestrator.js';
import { messageBus, stateManager } from './shared/communication.js';
import { Logger } from './shared/utils.js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config({ path: '.agent/.env' });

const logger = new Logger('AgentSystem');

/**
 * Main Agent System
 */
class AgentSystem {
  constructor() {
    this.orchestrator = null;
    this.running = false;
    this.messageBus = messageBus;
    this.stateManager = stateManager;
  }

  /**
   * Initialize the system
   */
  async initialize() {
    logger.info('='.repeat(60));
    logger.info('RecipeMaker Multi-Agent Development System');
    logger.info('='.repeat(60));

    logger.info('LLM Provider: ollama');

    // Check if Ollama is running
    logger.info('Checking Ollama connection...');
    try {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      const response = await fetch(`${ollamaUrl}/api/tags`);

      if (!response.ok) {
        logger.error('Ollama is not responding');
        logger.info('');
        logger.info('Please install and start Ollama:');
        logger.info('1. Download from: https://ollama.com/download');
        logger.info('2. Install and start Ollama');
        logger.info('3. Download model: ollama pull deepseek-coder:33b');
        logger.info('');
        logger.info('See OLLAMA_SETUP.md for detailed instructions');
        process.exit(1);
      }

      const data = await response.json();
      const models = data.models || [];

      logger.info('Ollama connected');
      logger.info(`Available models: ${models.length > 0 ? models.map(m => m.name).join(', ') : 'None'}`);

      if (models.length === 0) {
        logger.warn('No models downloaded');
        logger.info('Download model with: ollama pull deepseek-coder:33b');
      }

      logger.info('');
    } catch (error) {
      logger.error('Cannot connect to Ollama');
      logger.error(error.message);
      logger.info('');
      logger.info('Is Ollama running? Start it first.');
      logger.info('See OLLAMA_SETUP.md for setup instructions');
      process.exit(1);
    }

    logger.info('Initializing orchestrator...');
    this.orchestrator = new OrchestratorAgent();
    await this.orchestrator.initializeConfig();
    await this.orchestrator.initializeAgents();

    logger.info('System initialized successfully');
    logger.info('');

    this.running = true;
  }

  /**
   * Start the interactive CLI
   */
  async startInteractive() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'agent> '
    });

    this.showHelp();
    rl.prompt();

    rl.on('line', async (line) => {
      const command = line.trim();

      try {
        await this.handleCommand(command);
      } catch (error) {
        logger.error('Command failed:', error);
      }

      if (this.running) {
        rl.prompt();
      } else {
        rl.close();
      }
    });

    rl.on('close', () => {
      logger.info('Goodbye!');
      process.exit(0);
    });
  }

  /**
   * Handle CLI commands
   */
  async handleCommand(command) {
    const [cmd, ...args] = command.split(' ');

    switch (cmd) {
      case 'help':
        this.showHelp();
        break;

      case 'status':
        this.showStatus();
        break;

      case 'workflow':
        const workflowName = args[0];
        if (!workflowName) {
          logger.error('Usage: workflow <name>');
          logger.info('Available workflows: feature-development, bug-fix, continuous-improvement');
          break;
        }
        await this.runWorkflow(workflowName);
        break;

      case 'task':
        const taskDescription = args.join(' ');
        if (!taskDescription) {
          logger.error('Usage: task <description>');
          break;
        }
        await this.createTask(taskDescription);
        break;

      case 'plan':
        const requirements = args.join(' ');
        if (!requirements) {
          logger.error('Usage: plan <requirements>');
          break;
        }
        await this.createPlan(requirements);
        break;

      case 'agents':
        this.listAgents();
        break;

      case 'metrics':
        this.showMetrics();
        break;

      case 'files':
        this.showModifiedFiles();
        break;

      case 'autonomous':
        await this.orchestrator.startAutonomousMode();
        break;

      case 'clear':
        console.clear();
        break;

      case 'exit':
      case 'quit':
        this.running = false;
        break;

      default:
        logger.error(`Unknown command: ${cmd}`);
        logger.info('Type "help" for available commands');
    }
  }

  /**
   * Show help message
   */
  showHelp() {
    console.log('');
    console.log('Available Commands:');
    console.log('  help                          Show this help message');
    console.log('  status                        Show system status');
    console.log('  workflow <name>               Run a workflow (feature-development, bug-fix, etc.)');
    console.log('  task <description>            Create and execute a task');
    console.log('  plan <requirements>           Analyze requirements and create a plan');
    console.log('  agents                        List all agents and their status');
    console.log('  metrics                       Show performance metrics');
    console.log('  files                         Show modified files');
    console.log('  autonomous                    Start autonomous operation mode');
    console.log('  clear                         Clear screen');
    console.log('  exit/quit                     Exit the system');
    console.log('');
  }

  /**
   * Show system status
   */
  showStatus() {
    const snapshot = this.stateManager.getSnapshot();

    console.log('');
    console.log('System Status:');
    console.log('  Active Agents:', snapshot.agents.length);
    console.log('  Tasks in Queue:', snapshot.taskQueue.length);
    console.log('  Completed Tasks:', snapshot.completedTasks.length);
    console.log('  Modified Files:', snapshot.modifiedFiles.length);
    console.log('');
  }

  /**
   * List all agents
   */
  listAgents() {
    const status = this.orchestrator.getAllAgentsStatus();

    console.log('');
    console.log('Agents:');
    for (const [name, agentStatus] of Object.entries(status)) {
      console.log(`  ${name.padEnd(15)} [${agentStatus.status}] - ${agentStatus.name}`);
    }
    console.log('');
  }

  /**
   * Show metrics
   */
  showMetrics() {
    const metrics = this.stateManager.getMetrics();

    console.log('');
    console.log('Performance Metrics:');
    console.log('  Tasks Completed:', metrics.tasksCompleted);
    console.log('  Tasks Failed:', metrics.tasksFailed);
    console.log('  Success Rate:', `${((metrics.tasksCompleted / (metrics.tasksCompleted + metrics.tasksFailed)) * 100).toFixed(1)}%`);
    console.log('  Active Agents:', metrics.activeAgents);
    console.log('');
  }

  /**
   * Show modified files
   */
  showModifiedFiles() {
    const files = this.stateManager.getModifiedFiles();

    console.log('');
    console.log('Modified Files:');
    if (files.length === 0) {
      console.log('  No files modified yet');
    } else {
      files.forEach(file => console.log(`  - ${file}`));
    }
    console.log('');
  }

  /**
   * Run a workflow
   */
  async runWorkflow(workflowName) {
    logger.info(`Starting workflow: ${workflowName}`);

    try {
      const results = await this.orchestrator.executeWorkflow(workflowName, {});
      logger.info('Workflow completed successfully');
      console.log('');
      console.log('Results:', JSON.stringify(results, null, 2));
    } catch (error) {
      logger.error('Workflow failed:', error);
    }
  }

  /**
   * Create and execute a task
   */
  async createTask(description) {
    logger.info(`Creating task: ${description}`);

    const task = {
      id: `task-${Date.now()}`,
      type: 'adhoc',
      description,
      assignedAgent: 'developer',
      action: 'implement-feature',
      metadata: { requirements: description },
      status: 'pending',
      createdAt: new Date()
    };

    try {
      const result = await this.orchestrator.assignTask(task);
      logger.info('Task completed');
      console.log('');
      console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
      logger.error('Task failed:', error);
    }
  }

  /**
   * Create a plan from requirements
   */
  async createPlan(requirements) {
    logger.info('Analyzing requirements...');

    try {
      const plan = await this.orchestrator.analyzeAndPlan(requirements);
      logger.info('Plan created');
      console.log('');
      console.log('Plan:', JSON.stringify(plan, null, 2));

      // Ask if user wants to execute the plan
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('\nExecute this plan? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          logger.info('Executing plan...');
          const results = await this.orchestrator.executePlan(plan);
          logger.info('Plan execution completed');
          console.log('');
          console.log('Results:', JSON.stringify(results, null, 2));
        }
        rl.close();
      });
    } catch (error) {
      logger.error('Failed to create plan:', error);
    }
  }
}

// Start the system
async function main() {
  const system = new AgentSystem();
  await system.initialize();
  await system.startInteractive();
}

main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
