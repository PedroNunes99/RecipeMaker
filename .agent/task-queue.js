#!/usr/bin/env node

import { OrchestratorAgent } from './agents/orchestrator.js';
import { Logger, generateTaskId } from './shared/utils.js';
import AutoPRWorkflow from './workflows/auto-pr-workflow.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.agent/.env' });

const logger = new Logger('TaskQueue');

/**
 * Task Queue Manager
 * Processes multiple tasks sequentially with auto-PR after each
 */
class TaskQueueManager {
  constructor() {
    this.orchestrator = null;
    this.prWorkflow = new AutoPRWorkflow();
    this.queue = [];
    this.completedTasks = [];
    this.autoPR = process.env.AUTO_PR === 'true';
  }

  /**
   * Initialize
   */
  async initialize() {
    logger.info('Initializing Task Queue Manager...');

    this.orchestrator = new OrchestratorAgent();
    await this.orchestrator.initializeConfig();
    await this.orchestrator.initializeAgents();

    logger.info('✓ Task Queue Manager ready');
  }

  /**
   * Add task to queue
   */
  addTask(taskConfig) {
    const task = {
      id: generateTaskId(),
      ...taskConfig,
      status: 'queued',
      createdAt: new Date()
    };

    this.queue.push(task);
    logger.info(`✓ Task queued: ${task.description}`);
    logger.info(`  Queue size: ${this.queue.length}`);

    return task.id;
  }

  /**
   * Add multiple tasks
   */
  addTasks(taskConfigs) {
    return taskConfigs.map(config => this.addTask(config));
  }

  /**
   * Process entire queue
   */
  async processQueue() {
    logger.info('='.repeat(60));
    logger.info(`Starting Queue Processing (${this.queue.length} tasks)`);
    logger.info('='.repeat(60));

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      await this.processTask(task);
    }

    logger.info('='.repeat(60));
    logger.info('Queue Processing Complete!');
    logger.info('='.repeat(60));
    logger.info(`Total tasks completed: ${this.completedTasks.length}`);
  }

  /**
   * Process single task
   */
  async processTask(task) {
    logger.info('');
    logger.info(`Processing Task: ${task.description}`);
    logger.info('-'.repeat(60));

    task.status = 'in_progress';
    task.startedAt = new Date();

    try {
      // Execute task
      const result = await this.orchestrator.assignTask(task);

      task.status = result.success ? 'completed' : 'failed';
      task.result = result;
      task.completedAt = new Date();

      if (result.success) {
        logger.info(`✓ Task completed: ${task.description}`);

        // Auto-create PR if enabled
        if (this.autoPR && result.result?.filesModified) {
          logger.info('Creating PR...');
          const prResult = await this.prWorkflow.createPR(
            task.description,
            result.result.filesModified,
            result.result.response
          );

          task.prUrl = prResult.prUrl;
          task.branch = prResult.branch;

          if (prResult.success) {
            logger.info(`✓ PR created: ${prResult.prUrl}`);
          }
        }

        this.completedTasks.push(task);
      } else {
        logger.error(`✗ Task failed: ${task.description}`);
        logger.error(`  Error: ${result.error}`);
      }

    } catch (error) {
      logger.error(`✗ Task error: ${task.description}`, error);
      task.status = 'error';
      task.error = error.message;
      task.completedAt = new Date();
    }

    logger.info('-'.repeat(60));
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queued: this.queue.length,
      completed: this.completedTasks.length,
      tasks: [
        ...this.queue.map(t => ({ ...t, position: 'queued' })),
        ...this.completedTasks.map(t => ({ ...t, position: 'completed' }))
      ]
    };
  }

  /**
   * Clear completed tasks
   */
  clearCompleted() {
    this.completedTasks = [];
    logger.info('✓ Cleared completed tasks');
  }
}

// Export for use in other scripts
export default TaskQueueManager;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new TaskQueueManager();

  async function main() {
    await manager.initialize();

    // Example: Add tasks to queue
    manager.addTasks([
      {
        type: 'feature',
        action: 'implement-feature',
        description: 'Add error boundaries to React components',
        assignedAgent: 'developer',
        metadata: {
          requirements: 'Add React error boundaries to catch and handle component errors gracefully'
        }
      },
      {
        type: 'testing',
        action: 'write-tests',
        description: 'Add tests for error boundary',
        assignedAgent: 'tester',
        metadata: {
          requirements: 'Write tests for error boundary component'
        }
      },
      {
        type: 'documentation',
        action: 'document-feature',
        description: 'Document error handling pattern',
        assignedAgent: 'documenter',
        metadata: {
          requirements: 'Document the error boundary implementation and usage'
        }
      }
    ]);

    // Process queue
    await manager.processQueue();

    logger.info('');
    logger.info('Final Status:', manager.getStatus());
  }

  main().catch(error => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
}
