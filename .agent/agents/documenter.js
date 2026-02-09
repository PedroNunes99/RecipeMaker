import { BaseAgent } from './base-agent.js';
import { loadConfig } from '../shared/utils.js';

/**
 * Documentation Agent - Generates and maintains documentation
 */
export class DocumenterAgent extends BaseAgent {
  constructor() {
    super();
    this.initializeConfig();
  }

  async initializeConfig() {
    const configs = await loadConfig('.agent/config/agents.json');
    this.config = configs.agents.documenter;
    this.type = 'documenter';
    this.id = `documenter-${Date.now()}`;
  }

  /**
   * System prompt for the Documentation Agent
   */
  getSystemPrompt() {
    return `You are an expert documentation agent specialized in creating clear, comprehensive documentation for software projects.

Your role in the RecipeMaker project:
- Generate API documentation
- Update README files
- Create user guides
- Document architecture decisions
- Generate changelogs
- Keep documentation in sync with code changes

Documentation Types:
- API Documentation: Document all endpoints, parameters, responses
- Code Documentation: JSDoc comments, Python docstrings
- User Documentation: How-to guides, tutorials
- Architecture Documentation: System design, data models
- Changelog: Track all changes

Guidelines:
1. Write clear, concise documentation
2. Include examples and use cases
3. Keep documentation up-to-date
4. Use proper formatting (Markdown)
5. Include diagrams where helpful
6. Document both happy paths and error cases
7. Make documentation discoverable

Documentation Structure:
- README.md: Project overview, setup, usage
- docs/API.md: API endpoint documentation
- docs/ARCHITECTURE.md: System architecture
- CHANGELOG.md: Version history
- Code comments: Inline documentation

For API Documentation:
- Endpoint URL and method
- Parameters (query, body, path)
- Request examples
- Response examples
- Error codes
- Authentication requirements

For Code Documentation:
- Function/method purpose
- Parameters and return values
- Usage examples
- Edge cases and limitations

You have access to these tools:
- read_file: Read code and existing docs
- write_file: Create or update documentation
- search_code: Find code to document
- list_files: Find documentation files
- execute_command: Generate docs from code

Always create documentation that helps developers and users understand and use the software effectively.`;
  }

  /**
   * Perform a documentation task
   */
  async performTask(task) {
    this.resetConversation();

    const prompt = this.buildTaskPrompt(task);
    const response = await this.callClaude(this.getSystemPrompt(), prompt);

    return {
      action: task.action,
      description: task.description,
      response: this.extractTextFromResponse(response),
      docsCreated: this.extractDocFiles(response),
      timestamp: new Date()
    };
  }

  /**
   * Build a prompt based on the task type
   */
  buildTaskPrompt(task) {
    const baseInfo = `Task: ${task.description}\nAction: ${task.action}\n\n`;

    switch (task.action) {
      case 'generate-api-docs':
        return baseInfo + `Please generate API documentation:
1. Read the API code (server/main.py and related files)
2. Document all endpoints
3. Include request/response examples
4. Document error cases
5. Create or update docs/API.md

Context:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'update-readme':
        return baseInfo + `Please update the README:
1. Read current README.md
2. Update based on recent changes
3. Ensure setup instructions are current
4. Add any new features to the documentation
5. Keep it clear and concise

Changes:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'create-user-guide':
        return baseInfo + `Please create a user guide:
1. Understand the user workflows
2. Create step-by-step instructions
3. Include screenshots or examples
4. Cover common use cases
5. Create docs/USER_GUIDE.md

Feature details:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'document-architecture':
        return baseInfo + `Please document the system architecture:
1. Analyze the codebase structure
2. Document the architecture patterns
3. Create data model diagrams (as text)
4. Document technology choices
5. Create or update docs/ARCHITECTURE.md

Project structure:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'generate-changelog':
        return baseInfo + `Please generate/update the changelog:
1. Read recent changes and commits
2. Categorize changes (Added, Changed, Fixed, etc.)
3. Update CHANGELOG.md
4. Follow Keep a Changelog format

Recent changes:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'document-feature':
        return baseInfo + `Please document this new feature:
1. Read the feature implementation
2. Update relevant documentation
3. Add to README if user-facing
4. Update API docs if applicable
5. Add to changelog

Feature details:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'detect-doc-requirements':
        return baseInfo + `Please detect what documentation needs updating:
1. Analyze recent code changes
2. Identify affected documentation
3. List what needs to be updated
4. Prioritize documentation tasks

Changed files:
${JSON.stringify(task.metadata, null, 2)}`;

      case 'update-documentation':
        return baseInfo + `Please update documentation based on code changes:
1. Read the code changes
2. Update relevant documentation
3. Ensure consistency across docs
4. Add examples if needed

Changes:
${JSON.stringify(task.metadata, null, 2)}`;

      default:
        return baseInfo + `Please complete this documentation task:\n${JSON.stringify(task.metadata, null, 2)}`;
    }
  }

  /**
   * Extract list of documentation files from response
   */
  extractDocFiles(response) {
    const files = [];
    const toolUses = response.content.filter(block => block.type === 'tool_use');

    for (const tool of toolUses) {
      if (tool.name === 'write_file' && this.isDocFile(tool.input.file_path)) {
        files.push(tool.input.file_path);
      }
    }

    return files;
  }

  /**
   * Check if a file is a documentation file
   */
  isDocFile(filePath) {
    return filePath.endsWith('.md') ||
           filePath.includes('/docs/') ||
           filePath.includes('README') ||
           filePath.includes('CHANGELOG');
  }
}

export default DocumenterAgent;
