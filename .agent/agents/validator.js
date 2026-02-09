import { BaseAgent } from './base-agent.js';
import { loadConfig } from '../shared/utils.js';

/**
 * Validator Agent - Runs tests, checks code quality, validates builds
 */
export class ValidatorAgent extends BaseAgent {
  constructor() {
    super();
    this.initializeConfig();
  }

  async initializeConfig() {
    const configs = await loadConfig('.agent/config/agents.json');
    this.config = configs.agents.validator;
    this.type = 'validator';
    this.id = `validator-${Date.now()}`;
  }

  /**
   * System prompt for the Validator Agent
   */
  getSystemPrompt() {
    return `You are an expert validation agent specialized in running tests, checking code quality, and validating builds.

Your role in the RecipeMaker project:
- Run all tests (unit, integration, e2e)
- Check code quality with linters
- Validate TypeScript types
- Check build processes
- Run security scans
- Verify code meets standards

Technology Stack:
- Frontend: ESLint, Vite build
- Backend: Python linting, Pytest
- Type Checking: TypeScript

Guidelines:
1. Run all relevant tests based on what changed
2. Report test failures clearly
3. Check for linting errors
4. Validate builds complete successfully
5. Identify security vulnerabilities
6. Provide actionable feedback

Validation Checks:
- Run npm test in client/
- Run pytest in server/
- Run npm run lint in client/
- Run npm run build in client/
- Check for common issues

Report Format:
- Overall status (PASS/FAIL)
- Test results summary
- Linting errors (if any)
- Build status
- Recommendations for fixes

You have access to these tools:
- execute_command: Run tests, linters, builds
- read_file: Read configuration files
- search_code: Find potential issues
- list_files: Check project structure

Always provide clear, actionable feedback.`;
  }

  /**
   * Perform a validation task
   */
  async performTask(task) {
    this.resetConversation();

    const prompt = this.buildTaskPrompt(task);
    const response = await this.callClaude(this.getSystemPrompt(), prompt);

    return {
      action: task.action,
      description: task.description,
      response: this.extractTextFromResponse(response),
      validationResults: this.extractValidationResults(response),
      timestamp: new Date()
    };
  }

  /**
   * Build a prompt based on the task type
   */
  buildTaskPrompt(task) {
    const baseInfo = `Task: ${task.description}\nAction: ${task.action}\n\n`;

    switch (task.action) {
      case 'run-tests':
        return baseInfo + `Please run all tests:
1. Run frontend tests (npm test in client/)
2. Run backend tests (pytest in server/)
3. Report results clearly
4. Identify any failures

Modified files:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'run-tests-and-validate':
        return baseInfo + `Please run complete validation:
1. Run all tests
2. Run linters
3. Check builds
4. Report overall status
5. Provide recommendations if anything fails

Context:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'run-linter':
        return baseInfo + `Please run linters:
1. Run ESLint on frontend
2. Run Python linters on backend
3. Report any errors or warnings
4. Suggest fixes

Files to check:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'check-types':
        return baseInfo + `Please check TypeScript types:
1. Run type checking
2. Report any type errors
3. Suggest fixes

Files to check:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'validate-build':
        return baseInfo + `Please validate the build:
1. Run npm run build in client/
2. Check for build errors
3. Report build status
4. Check output size and warnings`;

      case 'security-scan':
        return baseInfo + `Please run security scan:
1. Check for vulnerable dependencies
2. Look for security issues in code
3. Report findings
4. Suggest remediation`;

      default:
        return baseInfo + `Please complete this validation task:\n${JSON.stringify(task.metadata, null, 2)}`;
    }
  }

  /**
   * Extract validation results from response
   */
  extractValidationResults(response) {
    const text = this.extractTextFromResponse(response);

    return {
      passed: text.toLowerCase().includes('pass') && !text.toLowerCase().includes('fail'),
      hasErrors: text.toLowerCase().includes('error'),
      hasWarnings: text.toLowerCase().includes('warning'),
      summary: text
    };
  }
}

export default ValidatorAgent;
