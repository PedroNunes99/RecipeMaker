import { BaseAgent } from './base-agent.js';
import { loadConfig } from '../shared/utils.js';

/**
 * Testing Agent - Writes unit tests, integration tests, and e2e tests
 */
export class TesterAgent extends BaseAgent {
  constructor() {
    super();
    this.initializeConfig();
  }

  async initializeConfig() {
    const configs = await loadConfig('.agent/config/agents.json');
    this.config = configs.agents.tester;
    this.type = 'tester';
    this.id = `tester-${Date.now()}`;
  }

  /**
   * System prompt for the Testing Agent
   */
  getSystemPrompt() {
    return `You are an expert testing agent specialized in writing comprehensive tests for software applications.

Your role in the RecipeMaker project:
- Write unit tests for React components and Python functions
- Write integration tests for API endpoints
- Write end-to-end tests for user workflows
- Update existing tests when code changes
- Generate test data and fixtures

Technology Stack:
- Frontend Testing: React Testing Library, Vitest/Jest
- Backend Testing: Pytest, unittest
- E2E Testing: Playwright or Cypress (to be set up if needed)

Guidelines:
1. Write clear, descriptive test names
2. Follow AAA pattern: Arrange, Act, Assert
3. Test both happy paths and edge cases
4. Mock external dependencies appropriately
5. Write tests that are fast, reliable, and maintainable
6. Aim for good code coverage
7. Include both positive and negative test cases

Test Structure:
- Unit tests should test individual functions/components in isolation
- Integration tests should test API endpoints and database interactions
- E2E tests should test complete user workflows

For React components:
- Test rendering
- Test user interactions
- Test props and state changes
- Test API calls and data display

For Python code:
- Test function logic
- Test API endpoints
- Test database operations
- Test error handling

You have access to these tools:
- read_file: Read files from the project
- write_file: Write or create test files
- execute_command: Run tests
- search_code: Find code to test
- list_files: List existing test files

Always respond with your reasoning and the tests you're creating.`;
  }

  /**
   * Perform a testing task
   */
  async performTask(task) {
    this.resetConversation();

    const prompt = this.buildTaskPrompt(task);
    const response = await this.callClaude(this.getSystemPrompt(), prompt);

    return {
      action: task.action,
      description: task.description,
      response: this.extractTextFromResponse(response),
      testsCreated: this.extractTestFiles(response),
      timestamp: new Date()
    };
  }

  /**
   * Build a prompt based on the task type
   */
  buildTaskPrompt(task) {
    const baseInfo = `Task: ${task.description}\nAction: ${task.action}\n\n`;

    switch (task.action) {
      case 'write-unit-tests':
        return baseInfo + `Please write unit tests:
1. Read the code that needs testing
2. Identify all functions/components to test
3. Write comprehensive unit tests
4. Cover edge cases and error scenarios
5. Run the tests to ensure they pass

Code to test:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'write-integration-tests':
        return baseInfo + `Please write integration tests:
1. Identify API endpoints or integrations to test
2. Write tests that cover the full integration flow
3. Test both success and error scenarios
4. Include database setup/teardown if needed
5. Run the tests

Integration details:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'write-e2e-tests':
        return baseInfo + `Please write end-to-end tests:
1. Identify user workflows to test
2. Write tests that simulate real user interactions
3. Test the complete flow from UI to database
4. Include setup and teardown

Workflow details:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'write-tests':
        return baseInfo + `Please write appropriate tests for the recent changes:
1. Analyze what was changed
2. Determine what type of tests are needed
3. Write comprehensive tests
4. Run the tests to verify they pass

Changed files:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'update-tests':
        return baseInfo + `Please update existing tests:
1. Read the existing tests
2. Read the code changes
3. Update tests to match new functionality
4. Add new tests if needed
5. Run tests to verify they pass

Update details:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'write-regression-test':
        return baseInfo + `Please write a regression test for the bug fix:
1. Understand the bug that was fixed
2. Write a test that would have caught the bug
3. Verify the test passes with the fix
4. Ensure the test will catch the bug if it reappears

Bug details:
${JSON.stringify(task.metadata, null, 2)}`;

      default:
        return baseInfo + `Please complete this testing task:\n${JSON.stringify(task.metadata, null, 2)}`;
    }
  }

  /**
   * Extract list of test files from response
   */
  extractTestFiles(response) {
    const files = [];
    const toolUses = response.content.filter(block => block.type === 'tool_use');

    for (const tool of toolUses) {
      if (tool.name === 'write_file' && this.isTestFile(tool.input.file_path)) {
        files.push(tool.input.file_path);
      }
    }

    return files;
  }

  /**
   * Check if a file is a test file
   */
  isTestFile(filePath) {
    return filePath.includes('.test.') ||
           filePath.includes('.spec.') ||
           filePath.includes('test_') ||
           filePath.includes('/__tests__/');
  }
}

export default TesterAgent;
