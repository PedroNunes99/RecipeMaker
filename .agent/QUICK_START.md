# 🚀 Quick Start - FREE Agent System with Ollama

Your agent system is now configured to use **100% FREE local LLMs** with Ollama!

## ✅ What's Done

- ✅ Agent system installed
- ✅ Configured for Ollama (free local LLMs)
- ✅ 5 specialized agents ready:
  - Developer Agent (deepseek-coder:33b)
  - Testing Agent (codellama)
  - Validator Agent (llama3)
  - Documentation Agent (mistral)
  - Orchestrator Agent (deepseek-coder:33b)

## 📥 Step 1: Install Ollama (5 minutes)

### Windows Installation

1. **Download Ollama**:
   - Go to: https://ollama.com/download/windows
   - Download `OllamaSetup.exe`

2. **Install**:
   - Run the installer
   - Follow the wizard
   - Ollama will start automatically in the background

3. **Verify Installation**:
   ```bash
   ollama --version
   ```
   You should see: `ollama version 0.1.x` or similar

## 📦 Step 2: Download AI Models (10-30 minutes)

Open a terminal and run these commands. They will download the AI models:

### Essential Models (Recommended)

```bash
# DeepSeek Coder 33B - Best for coding (20GB download, needs 20GB RAM)
ollama pull deepseek-coder:33b

# CodeLlama - For testing (4GB download, needs 8GB RAM)
ollama pull codellama

# Llama3 - For validation (4GB download, needs 8GB RAM)
ollama pull llama3

# Mistral - For documentation (4GB download, needs 8GB RAM)
ollama pull mistral
```

### Alternative if Low on RAM

If you have less than 20GB RAM, use smaller models:

```bash
# DeepSeek Coder 6.7B - Still good for coding (4GB download, needs 8GB RAM)
ollama pull deepseek-coder:6.7b

# Then update .env:
# Change: LLM_MODEL=deepseek-coder:6.7b
```

### Check Downloaded Models

```bash
ollama list
```

You should see your downloaded models listed.

## ▶️ Step 3: Start the Agent System

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
✓ Ollama connected
✓ Available models: deepseek-coder:33b, codellama, llama3, mistral
Initializing orchestrator...
System initialized successfully

agent>
```

## 🎮 Step 4: Try Your First Command

### Check Status

```bash
agent> status
```

### List All Agents

```bash
agent> agents
```

### Create a Simple Task

```bash
agent> task Add a simple greeting function to the app
```

The Developer Agent will:
1. Analyze your codebase
2. Create the function
3. Show you the result

All 100% FREE! 🎉

## 📚 Common Commands

```bash
# Get help
agent> help

# Check system status
agent> status

# List agents
agent> agents

# Create a task
agent> task <description>

# Run a workflow
agent> workflow feature-development

# View metrics
agent> metrics

# Exit
agent> exit
```

## 🎯 Example Tasks to Try

```bash
# Add a new feature
agent> task Add a "favorites" button to each recipe card

# Fix a bug
agent> task Fix the search not returning partial matches

# Write tests
agent> task Write unit tests for the RecipeCard component

# Generate documentation
agent> task Create API documentation for all endpoints

# Refactor code
agent> task Refactor the IngredientManager to use custom hooks
```

## ⚙️ Configuration

### Change Models

Edit [.env](.env):

```env
LLM_MODEL=deepseek-coder:33b  # Change this to any Ollama model
```

### Configure Individual Agent Models

Edit [config/agents.json](config/agents.json) to use different models per agent.

## 🔧 Troubleshooting

### "Cannot connect to Ollama"

**Solution**: Start Ollama
- Windows: Search for "Ollama" in Start Menu and run it
- Or just run: `ollama serve`

### "Model not found"

**Solution**: Download the model
```bash
ollama pull deepseek-coder:33b
```

### "Out of memory"

**Solution**: Use smaller models
```bash
ollama pull deepseek-coder:6.7b
# Update .env: LLM_MODEL=deepseek-coder:6.7b
```

### Agent responses are slow

**Solutions**:
1. Use smaller models (6.7B instead of 33B)
2. Reduce MAX_TOKENS in .env
3. Close other applications
4. Ensure GPU is being used (Ollama auto-detects)

## 💰 Cost Comparison

| Option | Cost | Speed | Quality |
|--------|------|-------|---------|
| **Ollama (You!)** | $0 FREE | Medium | ⭐⭐⭐⭐ |
| Claude Sonnet API | $3-15 per 1M tokens | Fast | ⭐⭐⭐⭐⭐ |
| Claude Opus API | $15-75 per 1M tokens | Fast | ⭐⭐⭐⭐⭐ |

With Ollama: **Unlimited usage, $0 cost!** 🎉

## 🚀 Next Steps

1. ✅ Install Ollama
2. ✅ Download models
3. ✅ Start agent system
4. Try example tasks above
5. Read [full documentation](README.md)
6. Explore [workflows](config/workflows.json)

## 📖 More Resources

- **Full Setup Guide**: [OLLAMA_SETUP.md](OLLAMA_SETUP.md)
- **Agent Documentation**: [README.md](README.md)
- **Ollama Models**: https://ollama.com/library

## 🎊 You're Ready!

You now have a powerful, **completely FREE** AI development system. The agents can:
- ✅ Write code
- ✅ Create tests
- ✅ Generate documentation
- ✅ Fix bugs
- ✅ Refactor code

All running locally on your machine with no API costs!

**Questions?** Check [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for detailed troubleshooting.

Happy coding! 🚀✨
