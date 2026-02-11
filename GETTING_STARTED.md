# Getting Started with the Multi-Agent System

## Prerequisites

Before you begin, ensure you have:
- Ollama installed and running
- Node.js 18+ installed
- Git configured

## Step 1: Configure Environment

1. Navigate to the agent directory:
   ```bash
   cd .agent
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Ensure Ollama URL and model are set:
   ```env
   OLLAMA_URL=http://localhost:11434
   LLM_MODEL=deepseek-coder:33b
   ```

## Step 2: Start Ollama and Download Model

```bash
ollama serve
ollama pull deepseek-coder:33b
```

## Step 3: Start the Agent System

```bash
cd .agent
npm start
```

You should see:
```
============================================================
RecipeMaker Multi-Agent Development System
============================================================
LLM Provider: ollama
Checking Ollama connection...
Ollama connected
Initializing orchestrator...
System initialized successfully

agent>
```

## Step 4: Try Your First Command

```bash
agent> status
agent> agents
agent> task Add a footer component to the app
```

## Common Commands

```bash
agent> help
agent> status
agent> agents
agent> workflow feature-development
agent> task <description>
agent> plan <requirements>
agent> metrics
agent> files
agent> exit
```

## Troubleshooting

### Cannot connect to Ollama
- Start Ollama: `ollama serve`
- Confirm service is reachable at `http://localhost:11434`

### Model not found
- Download model: `ollama pull deepseek-coder:33b`

### Task fails
- Review the error output
- Try a smaller, more specific task description

## Next Steps

1. Run a small task through the Developer agent
2. Run `workflow bug-fix`
3. Review generated file changes and tests
