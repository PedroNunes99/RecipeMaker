#!/usr/bin/env node

import { OrchestratorAgent } from './agents/orchestrator.js';
import { Logger, loadConfig } from './shared/utils.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.agent/.env' });

const logger = new Logger('TaskRunner');

async function runTestingTask() {
  try {
    logger.info('='.repeat(60));
    logger.info('Starting Frontend Testing Setup Task');
    logger.info('='.repeat(60));

    // Initialize orchestrator
    logger.info('Initializing orchestrator...');
    const orchestrator = new OrchestratorAgent();
    await orchestrator.initializeConfig();
    await orchestrator.initializeAgents();

    logger.info('✓ All agents initialized');
    logger.info('');

    // Load task specification
    logger.info('Loading task specification...');
    const taskSpec = await loadConfig('.agent/tasks/testing-setup-task.json');

    // Create task for Developer Agent: Setup testing infrastructure
    logger.info('Starting Step 1: Setting up testing infrastructure...');
    logger.info('');

    const setupTask = {
      id: 'setup-tests-1',
      type: 'feature',
      action: 'implement-feature',
      description: 'Set up testing infrastructure for React frontend',
      assignedAgent: 'developer',
      metadata: {
        requirements: taskSpec.requirements.developer.tasks.join('\n'),
        context: taskSpec.context,
        projectRoot: process.cwd().replace(/\\/g, '/')
      },
      status: 'pending',
      createdAt: new Date()
    };

    const setupResult = await orchestrator.assignTask(setupTask);

    if (setupResult.success) {
      logger.info('✓ Testing infrastructure setup completed!');
      logger.info('');
      logger.info('Result:', setupResult.result.response);
    } else {
      logger.error('✗ Setup failed:', setupResult.error);
      process.exit(1);
    }

    // Create task for Tester Agent: Write tests
    logger.info('');
    logger.info('Starting Step 2: Writing component tests...');
    logger.info('');

    const testingTask = {
      id: 'write-tests-2',
      type: 'testing',
      action: 'write-unit-tests',
      description: 'Write comprehensive tests for all React components',
      assignedAgent: 'tester',
      metadata: {
        requirements: taskSpec.requirements.tester.tasks.join('\n'),
        componentsToTest: taskSpec.context.componentsToTest,
        context: taskSpec.context
      },
      status: 'pending',
      createdAt: new Date()
    };

    const testingResult = await orchestrator.assignTask(testingTask);

    if (testingResult.success) {
      logger.info('✓ Component tests written!');
      logger.info('');
      logger.info('Result:', testingResult.result.response);
    } else {
      logger.error('✗ Test writing failed:', testingResult.error);
    }

    // Create task for Validator Agent: Run tests
    logger.info('');
    logger.info('Starting Step 3: Validating tests...');
    logger.info('');

    const validationTask = {
      id: 'validate-tests-3',
      type: 'validation',
      action: 'run-tests',
      description: 'Run tests and validate they pass',
      assignedAgent: 'validator',
      metadata: {
        requirements: taskSpec.requirements.validator.tasks.join('\n'),
        testCommand: 'cd client && npm test'
      },
      status: 'pending',
      createdAt: new Date()
    };

    const validationResult = await orchestrator.assignTask(validationTask);

    if (validationResult.success) {
      logger.info('✓ Tests validated!');
      logger.info('');
      logger.info('Result:', validationResult.result.response);
    } else {
      logger.warn('⚠ Validation had issues:', validationResult.error);
    }

    // Create task for Documenter Agent: Create documentation
    logger.info('');
    logger.info('Starting Step 4: Creating documentation...');
    logger.info('');

    const docTask = {
      id: 'document-tests-4',
      type: 'documentation',
      action: 'create-user-guide',
      description: 'Create testing documentation and guide',
      assignedAgent: 'documenter',
      metadata: {
        requirements: taskSpec.requirements.documenter.tasks.join('\n'),
        context: taskSpec.context
      },
      status: 'pending',
      createdAt: new Date()
    };

    const docResult = await orchestrator.assignTask(docTask);

    if (docResult.success) {
      logger.info('✓ Documentation created!');
      logger.info('');
      logger.info('Result:', docResult.result.response);
    } else {
      logger.error('✗ Documentation failed:', docResult.error);
    }

    // Summary
    logger.info('');
    logger.info('='.repeat(60));
    logger.info('Task Completed!');
    logger.info('='.repeat(60));
    logger.info('');
    logger.info('Summary:');
    logger.info(`  Setup: ${setupResult.success ? '✓' : '✗'}`);
    logger.info(`  Tests: ${testingResult.success ? '✓' : '✗'}`);
    logger.info(`  Validation: ${validationResult.success ? '✓' : '✗'}`);
    logger.info(`  Documentation: ${docResult.success ? '✓' : '✗'}`);
    logger.info('');

    if (setupResult.success && testingResult.success) {
      logger.info('🎉 Frontend testing infrastructure is ready!');
      logger.info('Run tests with: cd client && npm test');
    }

  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the task
runTestingTask();
