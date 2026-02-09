# Getting Started with the Multi-Agent System

## Prerequisites

Before you begin, ensure you have:
- An Anthropic API key (get one at https://console.anthropic.com/)
- Node.js 18+ installed
- Git configured

## Step 1: Configure Your API Key

1. Navigate to the agent directory:
   ```bash
   cd .agent
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

## Step 2: Start the Agent System

```bash
npm start
```

You should see:
```
============================================================
RecipeMaker Multi-Agent Development System
============================================================
Initializing orchestrator...
System initialized successfully

agent>
```

## Step 3: Try Your First Command

Let's check the system status:
```bash
agent> status
```

List all available agents:
```bash
agent> agents
```

## Step 4: Run Your First Task

Let's have the Developer Agent implement a simple feature:

```bash
agent> task Add a footer component to the main app with copyright text
```

The system will:
1. Assign the task to the Developer Agent
2. The agent will read existing files
3. Create the footer component
4. Show you the results

## Step 5: Run a Full Workflow

Let's run the bug-fix workflow as an example:

```bash
agent> workflow bug-fix
```

Note: Since this is an example, it will need actual bug details. For now, let's try something simpler.

## Example Workflows

### Example 1: Add a New Feature

```bash
agent> plan Add a favorites feature where users can mark recipes as favorites
```

This will:
1. Analyze the requirements
2. Create a detailed task plan
3. Ask if you want to execute it

### Example 2: Improve Code Quality

```bash
agent> task Refactor the RecipeCard component to extract reusable parts
```

### Example 3: Add Tests

```bash
agent> task Write unit tests for the IngredientManager component
```

## Understanding Agent Roles

- **Developer Agent**: Writes code, implements features, fixes bugs
- **Tester Agent**: Writes unit, integration, and e2e tests
- **Validator Agent**: Runs tests, linters, checks builds
- **Documenter Agent**: Creates and maintains documentation
- **Orchestrator**: Coordinates all agents and manages workflows

## Tips for Success

1. **Start Simple**: Begin with small tasks to understand how agents work
2. **Be Specific**: Clear task descriptions get better results
3. **Review Changes**: Always review what agents modify before committing
4. **Use Workflows**: For complex features, use predefined workflows
5. **Check Metrics**: Use `metrics` command to track performance

## Common Commands

```bash
# Show help
agent> help

# Check system status
agent> status

# List agents
agent> agents

# Run a workflow
agent> workflow feature-development

# Create a task
agent> task <description>

# Create a plan
agent> plan <requirements>

# View metrics
agent> metrics

# View modified files
agent> files

# Exit
agent> exit
```

## Troubleshooting

### Agent Not Responding
- Check your internet connection
- Verify your API key is correct
- Check the Claude API status

### Task Fails
- Review the error message
- Ensure file paths are correct
- Try breaking the task into smaller steps

### Need Help?
```bash
agent> help
```

## Next Steps

1. Try implementing a simple feature
2. Run the test workflow to add tests
3. Experiment with the documentation workflow
4. Set up autonomous mode for continuous improvements

## Advanced Usage

### Custom Workflows

Edit [.agent/config/workflows.json](.agent/config/workflows.json) to create custom workflows.

### Agent Configuration

Edit [.agent/config/agents.json](.agent/config/agents.json) to customize agent behavior.

### Git Integration

To enable automatic commits and PRs, add to your `.env`:
```
AUTO_COMMIT=true
GITHUB_TOKEN=your_token
GITHUB_REPO=your_username/recipemaker
```

## Ready to Start!

You now have a powerful autonomous development system. Try it out and watch as AI agents help you build, test, and document your application!

Happy coding! 🚀
