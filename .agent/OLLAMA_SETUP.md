# Ollama Setup Guide - FREE Local LLMs

This guide will help you set up Ollama to run the agent system completely FREE with no API costs!

## Step 1: Install Ollama

### Windows

1. Download Ollama from: https://ollama.com/download/windows
2. Run the installer (`OllamaSetup.exe`)
3. Follow the installation wizard
4. Ollama will start automatically

### Verify Installation

Open a terminal and run:
```bash
ollama --version
```

You should see something like: `ollama version 0.1.x`

## Step 2: Download Models

Ollama supports many models. Here are the best ones for development:

### Recommended: DeepSeek Coder (Best for Coding)

```bash
# 33B model - Excellent for coding (requires 20GB RAM)
ollama pull deepseek-coder:33b

# 6.7B model - Good for coding (requires 8GB RAM)
ollama pull deepseek-coder:6.7b
```

### Alternative Models

```bash
# Llama 3 - General purpose
ollama pull llama3

# CodeLlama - Code-focused
ollama pull codellama

# Mistral - Fast and capable
ollama pull mistral

# Gemma 2 - Google's model
ollama pull gemma2
```

## Step 3: Test Ollama

```bash
# Test if Ollama is running
ollama list

# Chat with a model
ollama run deepseek-coder:33b
```

Type a message and press Enter. Type `/bye` to exit.

## Step 4: Configure the Agent System

The agent system is already configured to use Ollama! Check [.env](.env):

```env
LLM_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
LLM_MODEL=deepseek-coder:33b
```

## Step 5: Start the Agent System

```bash
npm start
```

You should see:
```
============================================================
RecipeMaker Multi-Agent Development System
============================================================
LLM Client initialized with provider: ollama
Initializing orchestrator...
System initialized successfully
```

## Model Recommendations by Task

| Agent | Recommended Model | RAM Required | Speed | Quality |
|-------|------------------|--------------|-------|---------|
| **Developer** | deepseek-coder:33b | 20GB | Medium | ⭐⭐⭐⭐⭐ |
| **Developer** | deepseek-coder:6.7b | 8GB | Fast | ⭐⭐⭐⭐ |
| **Tester** | codellama | 8GB | Fast | ⭐⭐⭐⭐ |
| **Validator** | llama3 | 8GB | Fast | ⭐⭐⭐⭐ |
| **Documenter** | mistral | 8GB | Fast | ⭐⭐⭐⭐ |

## Hardware Requirements

| Model Size | RAM Required | Speed | Use Case |
|------------|--------------|-------|----------|
| 7B models | 8GB RAM | Fast | Quick tasks, testing |
| 13B models | 16GB RAM | Medium | Balanced performance |
| 33B models | 20GB+ RAM | Slower | Best quality coding |

## Customizing Models per Agent

Edit [config/agents.json](config/agents.json):

```json
{
  "agents": {
    "developer": {
      "model": "deepseek-coder:33b",  // Best coding model
      ...
    },
    "tester": {
      "model": "codellama",  // Fast for tests
      ...
    },
    "validator": {
      "model": "llama3",  // Fast validation
      ...
    }
  }
}
```

## Troubleshooting

### Ollama Not Running

```bash
# Windows: Start Ollama
# It should start automatically, but if not:
# Search for "Ollama" in Start Menu and run it
```

### Model Not Found

```bash
# List installed models
ollama list

# Download missing model
ollama pull deepseek-coder:33b
```

### Out of Memory

If you get memory errors:
1. Use a smaller model: `deepseek-coder:6.7b` instead of `33b`
2. Close other applications
3. Restart Ollama: Close from system tray and restart

### Slow Performance

1. Use smaller models (6.7B instead of 33B)
2. Reduce MAX_TOKENS in `.env`
3. Consider using GPU acceleration if available

## Performance Tips

1. **Keep Ollama Running**: Don't close it, models stay loaded in RAM
2. **Use Smaller Models for Simple Tasks**: Validator/Tester don't need 33B
3. **Batch Similar Tasks**: Models perform better when warmed up
4. **GPU Acceleration**: Ollama automatically uses GPU if available (NVIDIA/AMD)

## Comparing Ollama vs Claude API

| Aspect | Ollama (Local) | Claude API |
|--------|---------------|------------|
| **Cost** | FREE ♾️ | $3-75 per 1M tokens |
| **Speed** | Medium | Fast |
| **Quality** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Privacy** | 100% Private | Data sent to Anthropic |
| **Requires** | Good PC | Internet + API key |
| **Best For** | Unlimited development | Critical production tasks |

## Next Steps

1. ✅ Ollama installed
2. ✅ Model downloaded
3. ✅ Agent system configured
4. ✅ Ready to start!

Run:
```bash
npm start
```

Then try:
```bash
agent> status
agent> task Add a simple hello world function
```

Enjoy unlimited FREE AI-powered development! 🚀
