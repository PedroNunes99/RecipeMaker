import { BaseAgent } from './base-agent.js';
import { loadConfig } from '../shared/utils.js';

/**
 * Developer Agent - Implements features, fixes bugs, refactors code
 */
export class DeveloperAgent extends BaseAgent {
  constructor() {
    super();
    this.initializeConfig();
  }

  async initializeConfig() {
    const configs = await loadConfig('.agent/config/agents.json');
    this.config = configs.agents.developer;
    this.type = 'developer';
    this.id = `developer-${Date.now()}`;
  }

  /**
   * System prompt for the Developer Agent
   */
  getSystemPrompt() {
    return `You are an expert software development agent specialized in implementing features, fixing bugs, and refactoring code.

Your role in the RecipeMaker project:
- Implement new features for both the React frontend (client/) and Python FastAPI backend (server/)
- Fix bugs and resolve issues
- Refactor code to improve quality and maintainability
- Optimize performance
- Add proper error handling

Technology Stack:
- Frontend: React, Vite, Tailwind CSS
- Backend: Python, FastAPI, Prisma ORM
- Database: SQLite (dev.db)

Guidelines:
1. Always read existing code before making changes
2. Follow existing code patterns and conventions
3. Write clean, maintainable code
4. Add comments for complex logic
5. Consider edge cases and error handling
6. Ensure changes don't break existing functionality
7. Use the tools available to read files, write files, and execute commands

When implementing features:
- Break down the task into smaller steps
- Implement both frontend and backend changes if needed
- Ensure proper API integration between client and server
- Follow REST API conventions

You have access to these tools:
- read_file: Read files from the project
- write_file: Write or create files
- execute_command: Run shell commands (tests, linters, etc.)
- search_code: Search for patterns in code
- list_files: List files in directories

Always respond with your reasoning and the actions you're taking.`;
  }

  /**
   * Perform a development task
   */
  async performTask(task) {
    this.resetConversation();

    const prompt = this.buildTaskPrompt(task);
    const response = await this.callClaude(this.getSystemPrompt(), prompt);

    return {
      action: task.action,
      description: task.description,
      response: this.extractTextFromResponse(response),
      filesModified: this.extractModifiedFiles(response),
      timestamp: new Date()
    };
  }

  /**
   * Build a prompt based on the task type
   */
  buildTaskPrompt(task) {
    const baseInfo = `Task: ${task.description}\nAction: ${task.action}\n\n`;

    switch (task.action) {
      case 'implement-feature':
        return baseInfo + `Please implement this feature:
1. Analyze the existing codebase to understand the architecture
2. Implement the feature following existing patterns
3. Add proper error handling
4. Ensure the feature works with both frontend and backend if applicable
5. Provide a summary of changes made

Feature details:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'fix-bug':
        return baseInfo + `Please fix this bug:
1. Investigate the issue by reading relevant files
2. Identify the root cause
3. Implement a fix
4. Verify the fix doesn't break other functionality

Bug details:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'refactor-code':
        return baseInfo + `Please refactor the specified code:
1. Read the current implementation
2. Identify improvement opportunities
3. Refactor while maintaining functionality
4. Explain the improvements made

Refactor details:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'fix-failing-tests':
        return baseInfo + `Tests are failing. Please fix them:
1. Read the test failures
2. Identify what's causing the failures
3. Fix the code or tests as needed
4. Verify tests pass

Test failure details:
${JSON.stringify(task.metadata, null, 2)}`;

      default:
        return baseInfo + `Please complete this task:\n${JSON.stringify(task.metadata, null, 2)}`;
    }
  }

  /**
   * Extract list of modified files from response
   */
  extractModifiedFiles(response) {
    const files = [];
    const toolUses = response.content.filter(block => block.type === 'tool_use');

    for (const tool of toolUses) {
      if (tool.name === 'write_file') {
        files.push(tool.input.file_path);
      }
    }

    return files;
  }
}

// Allow running as standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new DeveloperAgent();

  // Example task
  const testTask = {
    id: 'test-1',
    type: 'feature',
    action: 'implement-feature',
    description: 'Add user profile page',
    metadata: {
      requirements: 'Create a user profile page that displays user information and allows editing'
    }
  };

  agent.executeTask(testTask).then(result => {
    console.log('Task Result:', result);
  });
}

export default DeveloperAgent;
