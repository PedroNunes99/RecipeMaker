# Quick Start - Ollama Agent System

This agent system now runs on a single provider path (Ollama) and a single default model (`deepseek-coder:33b`).

## 1. Install Ollama

- Download: https://ollama.com/download/windows
- Verify:
  ```bash
  ollama --version
  ```

## 2. Download Required Model

```bash
ollama pull deepseek-coder:33b
```

## 3. Configure and Start Agents

```bash
cd .agent
cp .env.example .env
npm start
```

Expected startup output includes:
- `LLM Provider: ollama`
- `Checking Ollama connection...`
- `Ollama connected`

## 4. Run a Command

```bash
agent> status
agent> task Add validation for recipe title input
```

## Notes

- Provider switching has been removed.
- Anthropic/OpenAI paths are not part of this runtime.
- If Ollama is unavailable, startup will fail fast with clear instructions.
