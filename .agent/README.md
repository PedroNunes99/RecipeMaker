# RecipeMaker Multi-Agent Development System

An autonomous multi-agent system for continuous development, testing, validation, and documentation of the RecipeMaker project.

## Overview

This system consists of specialized AI agents that work together to autonomously develop, test, validate, and document your application:

- **Developer Agent**: Implements features, fixes bugs, and refactors code
- **Testing Agent**: Writes comprehensive tests (unit, integration, e2e)
- **Validator Agent**: Runs tests, linters, and validates builds
- **Documentation Agent**: Generates and maintains all documentation
- **Orchestrator Agent**: Coordinates all agents and manages workflows

## Installation

1. **Install dependencies:**
   ```bash
   cd .agent
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   ```

3. **Configure Ollama in `.env`:**
   ```env
   OLLAMA_URL=http://localhost:11434
   LLM_MODEL=deepseek-coder:33b
   ```

## Usage

### Start the Interactive CLI

```bash
npm start
```

### Available Commands

- `help` - Show all available commands
- `status` - Display system status
- `workflow <name>` - Run a predefined workflow
- `task <description>` - Create and execute an ad-hoc task
- `plan <requirements>` - Analyze requirements and create an execution plan
- `agents` - List all agents and their current status
- `metrics` - Show performance metrics
- `files` - Show files modified in the current session
- `autonomous` - Start autonomous operation mode
- `exit` - Exit the system

### Example Workflows

#### Feature Development
```bash
agent> workflow feature-development
```

This workflow:
1. Analyzes requirements
2. Implements the feature
3. Writes tests
4. Validates the implementation
5. Generates documentation
6. Prepares a pull request

#### Bug Fix
```bash
agent> workflow bug-fix
```

This workflow:
1. Investigates the bug
2. Implements the fix
3. Writes regression tests
4. Validates the fix
5. Updates documentation

#### Continuous Improvement
```bash
agent> workflow continuous-improvement
```

This workflow runs autonomously to:
1. Analyze the codebase
2. Identify improvement opportunities
3. Prioritize improvements
4. Implement the highest priority item
5. Test and validate

### Creating Custom Tasks

```bash
agent> task Add a search feature to the ingredients page
```

### Planning Complex Features

```bash
agent> plan Add user authentication with JWT, including login, register, and password reset
```

The orchestrator will analyze the requirements, break them down into tasks, and propose an execution plan.

## Configuration

### Agent Configuration

Edit [config/agents.json](config/agents.json) to customize:
- Model selection (Ollama models)
- Token limits
- Temperature settings
- Tools available to each agent
- Permissions

### Workflow Configuration

Edit [config/workflows.json](config/workflows.json) to:
- Create new workflows
- Modify existing workflows
- Define triggers (manual, scheduled, event-based)
- Set up dependencies between steps

### Environment Variables

- `OLLAMA_URL` - Ollama base URL
- `LLM_MODEL` - Model used by agents
- `AGENT_MODE` - Operation mode (autonomous/manual)
- `AUTO_COMMIT` - Auto-commit changes (true/false)
- `AUTO_PUSH` - Auto-push to remote (true/false)
- `REQUIRE_APPROVAL` - Require user approval for actions (true/false)
- `CHECK_INTERVAL` - Interval for autonomous checks (ms)
- `MAX_CONCURRENT_AGENTS` - Maximum agents running simultaneously

## Architecture

### Agent Communication

Agents communicate through a centralized message bus:
- Pub/sub messaging pattern
- Message history tracking
- Broadcast capability

### State Management

Shared state manager tracks:
- Agent status
- Task queue
- Completed tasks
- Modified files
- Performance metrics

### Tool System

Agents have access to these tools:
- `read_file` - Read project files
- `write_file` - Create/modify files
- `execute_command` - Run shell commands
- `search_code` - Search codebase
- `list_files` - List directories

## Workflows

### Feature Development Workflow

```
Requirements → Analyze → Implement → Write Tests → Validate → Document → PR
```

### Bug Fix Workflow

```
Bug Report → Investigate → Fix → Regression Test → Validate → Update Docs
```

### Continuous Improvement Workflow

```
Analyze Codebase → Prioritize → Implement → Test → Validate
```

## Autonomous Operation

The system can operate autonomously to:
- Monitor code changes
- Suggest improvements
- Implement minor fixes
- Update documentation
- Run periodic quality checks

Start autonomous mode:
```bash
agent> autonomous
```

## Git Integration

The system can automatically:
- Create commits with meaningful messages
- Create branches for features
- Prepare pull requests
- Push to remote repositories

Configure in `.env`:
```
AUTO_COMMIT=true
GITHUB_TOKEN=your_token
GITHUB_REPO=username/recipemaker
```

## Best Practices

1. **Start Small**: Begin with single tasks before running full workflows
2. **Review Changes**: Always review agent changes before committing
3. **Set Permissions**: Configure `REQUIRE_APPROVAL=true` initially
4. **Monitor Metrics**: Use `metrics` command to track performance
5. **Customize Workflows**: Adapt workflows to your team's process

## Troubleshooting

### Ollama Connection Issues
```
Error: Cannot connect to Ollama
```
Solution: Start Ollama with `ollama serve` and verify `OLLAMA_URL`

### Agent Failures
```
Error: Task failed
```
Solution: Check the logs for details, review the task requirements

### Tool Execution Errors
```
Error: Tool execution failed
```
Solution: Verify file paths and command syntax

## Extending the System

### Add a New Agent

1. Create new agent class extending `BaseAgent`
2. Implement the `performTask` method
3. Define system prompt
4. Register in orchestrator

### Add a New Workflow

1. Add workflow definition to `config/workflows.json`
2. Define steps and dependencies
3. Specify agents and actions

### Add Custom Tools

1. Define tool in `shared/tools.js`
2. Implement tool execution logic
3. Add to tool definitions list

## Contributing

This agent system is part of the RecipeMaker project. To contribute:
1. Test changes thoroughly
2. Update documentation
3. Follow existing patterns
4. Submit pull requests

## License

Same as RecipeMaker project.
