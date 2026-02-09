import { BaseAgent } from './base-agent.js';
import { loadConfig, Logger, generateTaskId } from '../shared/utils.js';
import { TaskStatus } from '../shared/types.js';
import DeveloperAgent from './developer.js';
import TesterAgent from './tester.js';
import ValidatorAgent from './validator.js';
import DocumenterAgent from './documenter.js';

/**
 * Orchestrator Agent - Coordinates all agents and manages workflows
 */
export class OrchestratorAgent extends BaseAgent {
  constructor() {
    super();
    this.initializeConfig();
    this.agents = new Map();
    this.taskQueue = [];
    this.completedTasks = [];
    this.workflows = null;
    this.logger = new Logger('Orchestrator');
  }

  async initializeConfig() {
    const configs = await loadConfig('.agent/config/agents.json');
    this.config = configs.agents.orchestrator;
    this.type = 'orchestrator';
    this.id = `orchestrator-${Date.now()}`;

    // Load workflows
    this.workflows = await loadConfig('.agent/config/workflows.json');
  }

  /**
   * Initialize all agents
   */
  async initializeAgents() {
    this.logger.info('Initializing agents...');

    const developer = new DeveloperAgent();
    const tester = new TesterAgent();
    const validator = new ValidatorAgent();
    const documenter = new DocumenterAgent();

    await developer.initializeConfig();
    await tester.initializeConfig();
    await validator.initializeConfig();
    await documenter.initializeConfig();

    this.agents.set('developer', developer);
    this.agents.set('tester', tester);
    this.agents.set('validator', validator);
    this.agents.set('documenter', documenter);

    this.logger.info('All agents initialized');
  }

  /**
   * System prompt for the Orchestrator Agent
   */
  getSystemPrompt() {
    return `You are the orchestrator agent responsible for coordinating all other agents in the development workflow.

Your role:
- Analyze requirements and break them into tasks
- Assign tasks to appropriate agents
- Coordinate workflow execution
- Handle task dependencies
- Resolve conflicts between agents
- Monitor progress
- Make decisions about priorities

Available Agents:
- Developer Agent: Implements features, fixes bugs, refactors code
- Tester Agent: Writes tests
- Validator Agent: Runs tests and validates builds
- Documenter Agent: Creates and maintains documentation

Workflow Management:
- Break down complex tasks into smaller tasks
- Ensure dependencies are respected
- Handle failures and retries
- Coordinate multiple agents working in parallel when possible
- Make strategic decisions about what to do next

Decision Making:
- Prioritize tasks based on impact and dependencies
- Decide when to retry failed tasks
- Determine if a task needs to be split into subtasks
- Choose the right agent for each task

You have access to these tools:
- read_file: Read project files
- execute_command: Run commands
- search_code: Analyze codebase
- list_files: Explore project structure

Provide clear reasoning for your decisions and task assignments.`;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowName, context = {}) {
    this.logger.info(`Starting workflow: ${workflowName}`);

    const workflow = this.workflows.workflows[workflowName];
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowName}`);
    }

    const results = [];
    const completedSteps = new Set();

    for (const step of workflow.steps) {
      // Check dependencies
      const depsComplete = step.dependencies?.every(dep => completedSteps.has(dep)) ?? true;

      if (!depsComplete) {
        this.logger.warn(`Skipping step ${step.id} - dependencies not met`);
        continue;
      }

      this.logger.info(`Executing step: ${step.description}`);

      try {
        const task = this.createTaskFromStep(step, context);
        const result = await this.assignTask(task);

        results.push({
          step: step.id,
          success: result.success,
          result: result.result
        });

        if (result.success) {
          completedSteps.add(step.id);

          // Execute success steps
          if (step.onSuccess) {
            context.previousResult = result.result;
          }
        } else {
          // Handle failure
          if (step.onFailure) {
            this.logger.warn(`Step failed, executing failure handler`);
            // Could execute failure steps here
          }

          if (!step.optional) {
            throw new Error(`Required step failed: ${step.description}`);
          }
        }
      } catch (error) {
        this.logger.error(`Step ${step.id} failed:`, error);

        if (!step.optional) {
          throw error;
        }
      }
    }

    this.logger.info(`Workflow ${workflowName} completed`);
    return results;
  }

  /**
   * Create a task from a workflow step
   */
  createTaskFromStep(step, context) {
    return {
      id: generateTaskId(),
      type: 'workflow-step',
      action: step.action,
      description: step.description,
      assignedAgent: step.agent,
      metadata: context,
      status: TaskStatus.PENDING,
      createdAt: new Date()
    };
  }

  /**
   * Assign a task to an agent
   */
  async assignTask(task) {
    const agent = this.agents.get(task.assignedAgent);

    if (!agent) {
      throw new Error(`Agent not found: ${task.assignedAgent}`);
    }

    this.logger.info(`Assigning task to ${task.assignedAgent}: ${task.description}`);

    task.status = TaskStatus.IN_PROGRESS;
    task.updatedAt = new Date();

    const result = await agent.executeTask(task);

    if (result.success) {
      task.status = TaskStatus.COMPLETED;
      this.completedTasks.push(task);
    } else {
      task.status = TaskStatus.FAILED;
    }

    task.result = result;
    task.updatedAt = new Date();

    return result;
  }

  /**
   * Analyze requirements and create a task plan
   */
  async analyzeAndPlan(requirements) {
    this.resetConversation();

    const prompt = `Analyze these requirements and create a detailed task plan:

Requirements:
${requirements}

Please:
1. Break down the requirements into specific tasks
2. Assign each task to the appropriate agent (developer, tester, validator, documenter)
3. Identify dependencies between tasks
4. Suggest the order of execution
5. Identify any risks or challenges

Respond with a structured plan in JSON format:
{
  "tasks": [
    {
      "id": "task-1",
      "description": "...",
      "agent": "developer",
      "action": "implement-feature",
      "dependencies": [],
      "metadata": {...}
    }
  ],
  "risks": [...],
  "estimatedTime": "..."
}`;

    const response = await this.callClaude(this.getSystemPrompt(), prompt);
    const text = this.extractTextFromResponse(response);

    // Parse JSON from response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error('Failed to parse task plan', error);
    }

    return { tasks: [], risks: [], estimatedTime: 'unknown' };
  }

  /**
   * Execute a task plan
   */
  async executePlan(plan) {
    this.logger.info('Executing task plan');

    const results = [];

    for (const task of plan.tasks) {
      // Check dependencies
      const depsComplete = task.dependencies?.every(depId =>
        this.completedTasks.find(t => t.id === depId)
      ) ?? true;

      if (!depsComplete) {
        this.logger.warn(`Skipping task ${task.id} - dependencies not met`);
        continue;
      }

      const result = await this.assignTask(task);
      results.push(result);

      if (!result.success) {
        this.logger.error(`Task failed: ${task.description}`);
        // Could implement retry logic here
      }
    }

    return results;
  }

  /**
   * Get status of all agents
   */
  getAllAgentsStatus() {
    const status = {};

    for (const [name, agent] of this.agents) {
      status[name] = agent.getStatus();
    }

    return status;
  }

  /**
   * Start autonomous operation mode
   */
  async startAutonomousMode() {
    this.logger.info('Starting autonomous operation mode');

    // This could be enhanced to:
    // 1. Monitor file changes
    // 2. Analyze codebase regularly
    // 3. Suggest improvements
    // 4. Execute continuous improvement workflow
    // 5. Generate reports

    this.logger.info('Autonomous mode active - monitoring project');
  }
}

export default OrchestratorAgent;
