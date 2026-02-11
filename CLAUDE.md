# Claude Development Guide for RecipeMaker

This file helps Claude Code work more effectively on this project by documenting patterns, mistakes, and guidelines.

## Project Overview

**RecipeMaker** - AI-powered recipe management application with autonomous multi-agent development system

### Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Python, FastAPI, Prisma ORM, SQLite
- **Agent System**: 5 specialized AI agents (Developer, Tester, Validator, Documenter, Orchestrator)
- **LLM (Dev Agents)**: Ollama with DeepSeek Coder 33B (local, free)
- **LLM (Recipe AI)**: Ollama with Mistral (configurable via `OLLAMA_MODEL` env var)

## Architecture

```
RecipeMaker/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.jsx       # Main app
│   │   └── main.jsx      # Entry point
│   └── package.json
├── server/               # Python backend
│   ├── agents/           # AI recipe generation (CookingExpertAgent + Ollama)
│   ├── services/         # Business logic
│   │   ├── ai_service.py         # Orchestrates LLM + ingredient matching
│   │   ├── ingredient_service.py # CRUD + NutritionService
│   │   ├── ingredient_matcher.py # Fuzzy matching AI→DB ingredients
│   │   ├── ollama_client.py      # Async Ollama API client
│   │   └── usda_service.py       # USDA FoodData Central API
│   ├── models/           # Pydantic request/response models
│   ├── tests/            # pytest test suite (34+ tests)
│   ├── prisma/           # Database schema
│   └── main.py           # FastAPI app (full CRUD + AI endpoints)
└── .agent/               # Autonomous development system
    ├── agents/           # 5 AI agents
    ├── config/           # Agent configurations
    └── index.js          # Agent CLI
```

## Development Patterns

### Component Structure
- Use functional components with hooks
- Tailwind for styling (no custom CSS files)
- Props: destructure in function params
- State: useState for local, lift up when shared

### API Integration
- Backend URL: `http://localhost:8000`
- Use fetch API (no axios)
- Error handling: try/catch with user feedback
- Loading states: show spinners/feedback

### Naming Conventions
- Components: PascalCase (e.g., `RecipeCard.jsx`)
- Functions: camelCase (e.g., `handleSubmit`)
- Files: kebab-case for utils (e.g., `api-client.js`)
- CSS classes: Tailwind utility classes

## Common Mistakes & Solutions

### ❌ Mistake 1: Configuring agents with models not downloaded
**Problem**: Agent config specified codellama, llama3, mistral but only deepseek-coder:33b was downloaded
**Solution**: All agents now use deepseek-coder:33b. Only download multiple models if needed for specialization
**Date**: 2026-02-09
**Fixed By**: Auto-detection and config update

### ❌ Mistake 2: Adding dependencies without checking
**Problem**: Installing packages that aren't needed
**Solution**: Always check if functionality can be achieved with existing dependencies first

### ❌ Mistake 2: Not testing error states
**Problem**: Components break when API fails
**Solution**: Always add error handling and test error scenarios

### ❌ Mistake 3: Hardcoding URLs
**Problem**: API URLs hardcoded in components
**Solution**: Use environment variables or config file

### ❌ Mistake 4: Missing loading states
**Problem**: No feedback during async operations
**Solution**: Always show loading spinners/skeleton loaders

### ❌ Mistake 5: Large components
**Problem**: Components with 500+ lines
**Solution**: Break into smaller, reusable components

### ❌ Mistake 6: Multiple AI modes confusing users
**Problem**: RecipeCreator had 3 modes (Manual, AI Assisted, AI Freestyle) with duplicate mock logic
**Solution**: Simplified to 2 modes (Manual, AI Generate). AI generates recipe then pre-fills ManualForm for consistency
**Date**: 2026-02-10
**Fixed By**: Unified AI flow with ManualForm pre-fill pattern

### ❌ Mistake 7: Not reading files before editing
**Problem**: Edit tool fails if file hasn't been Read first in the conversation
**Solution**: Always Read a file before attempting to Edit it
**Date**: 2026-02-10

## Git Workflow

### Commit Messages
Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `test`: Add/update tests
- `docs`: Documentation
- `refactor`: Code refactoring
- `style`: Formatting, styling
- `chore`: Maintenance tasks

Example: `feat: add favorites button to recipe cards`

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes

### PR Requirements
- ✅ All tests pass
- ✅ Code linted (no ESLint errors)
- ✅ Documentation updated
- ✅ Reviewed by at least 1 person (or Claude!)

## Agent System Guidelines

### When to Use Agents vs. Direct Development
- **Use Agents**: Complex workflows, batch operations, autonomous tasks
- **Use Direct (Claude Code)**: Quick fixes, interactive development, learning

### Agent Task Patterns
- Keep tasks focused and specific
- Provide context about project structure
- Let agents work autonomously
- Review output before committing

## Testing Guidelines

### Frontend Tests
- **Unit tests**: Test components in isolation
- **Integration tests**: Test component interactions
- **Coverage target**: 70%+ for critical paths

### Backend Tests
- **Unit tests**: Test individual functions
- **API tests**: Test endpoints with pytest
- **Coverage target**: 80%+

### Test File Naming
- React: `ComponentName.test.jsx`
- Python: `test_module_name.py`

## Code Quality Standards

### ESLint Rules
- No console.log in production code
- No unused variables
- Prefer const over let
- Use arrow functions

### Python Standards
- PEP 8 compliance
- Type hints for function signatures
- Docstrings for public functions
- Max line length: 100 characters

## Security Considerations

### Never Commit
- API keys (use .env)
- Database files (dev.db)
- User credentials
- Sensitive configuration

### Validate Input
- All user input on frontend AND backend
- Sanitize before database queries
- Check file uploads

## Performance Guidelines

### Frontend
- Lazy load routes and heavy components
- Optimize images (use WebP)
- Minimize bundle size
- Use React.memo for expensive components

### Backend
- Index database queries
- Cache frequent queries
- Limit API response sizes
- Use pagination for lists

## Common Commands

### Development
```bash
# Start frontend
cd client && npm run dev

# Start backend
cd server && uvicorn main:app --reload

# Start Ollama (for AI recipe generation)
ollama serve
# Pull model (first time only)
ollama pull mistral

# Start agents
cd .agent && npm start

# Run tests
cd client && npm test
cd server && pytest

# Run only AI integration tests
cd server && pytest tests/test_ai_integration.py -v
```

### Git
```bash
# Create feature branch
git checkout -b feature/feature-name

# Commit with agents
git add .
git commit -m "feat: description

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Create PR
gh pr create --title "Feature: description" --body "Details..."
```

## Decision Log

### 2026-02-09: Multi-Agent System
**Decision**: Use Ollama (free local LLMs) instead of Claude API
**Reason**: Cost efficiency, unlimited usage, privacy
**Model**: DeepSeek Coder 33B for development tasks

### 2026-02-09: Testing Setup
**Decision**: Use Vitest + React Testing Library
**Reason**: Fast, modern, good TypeScript support, Vite-native

### 2026-02-09: Agent Execution Mode - Advisory vs Autonomous
**Decision**: Agents operate in "Advisory Mode" (provide instructions, don't execute)
**Reason**:
- Ollama doesn't natively support tool calling like Claude API
- Safer during development - human reviews before execution
- Perfect hybrid: AI agents plan, Claude Code executes
- Maintains control while leveraging AI for planning & code generation
**Alternative**: Full autonomy requires Claude API or custom tool parser
**Documentation**: See `.agent/AUTONOMOUS_MODE.md` for implementation guide

### 2026-02-10: Recipe CRUD with Auto-Nutrition
**Decision**: Auto-calculate nutrition from ingredient quantities on recipe create/update
**Reason**: Ensures accurate, consistent nutrition data without manual entry
**Implementation**: NutritionService sums (ingredient nutrition × quantity) for all recipe ingredients

### 2026-02-10: AI Recipe Generation with Ollama
**Decision**: Use Ollama (Mistral model) for recipe generation from natural language
**Reason**: Free, local, private; configurable model via env vars for future server hosting
**Architecture**: Prompt → Ollama → JSON extraction → IngredientMatcher (fuzzy) → ManualForm pre-fill
**Fallback**: Mock recipe data when Ollama is unavailable
**Config**: `OLLAMA_URL`, `OLLAMA_MODEL`, `LLM_FALLBACK_MODE` in server/.env

### 2026-02-10: Unified AI Flow (ManualForm Pre-fill)
**Decision**: AI-generated recipes pre-fill ManualForm instead of showing directly in RecipeDetail
**Reason**: Consistent user experience — all recipes go through same ingredient selection flow
**Pattern**: `AIForm → generate → setGeneratedRecipe → switch to ManualForm → user reviews & saves`

## Resources

- **React Docs**: https://react.dev
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Tailwind Docs**: https://tailwindcss.com
- **Ollama Models**: https://ollama.com/library

## Notes for Claude

- Always read CLAUDE.md before starting work
- Update this file when patterns change
- Log mistakes to prevent repetition
- Ask user if uncertain about architectural decisions
- Prefer existing patterns over new approaches
- Test changes before committing

## API Endpoints

### Recipes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recipes` | List all recipes |
| GET | `/recipes/{id}` | Get single recipe with ingredients |
| POST | `/recipes` | Create recipe (auto-calculates nutrition) |
| PUT | `/recipes/{id}` | Update recipe (recalculates nutrition) |
| DELETE | `/recipes/{id}` | Delete recipe and its ingredient links |
| GET | `/recipes/search?q=term` | Search recipes by title, description, tags |
| POST | `/recipes/ai-generate` | Generate recipe from natural language prompt |

### Ingredients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ingredients` | List all ingredients |
| POST | `/ingredients` | Create ingredient |
| GET | `/ingredients/search?q=term` | Search local ingredients |
| GET | `/ingredients/usda-search?q=term` | Search USDA FoodData Central |
| POST | `/ingredients/import-usda` | Import ingredient from USDA data |

---

**Last Updated**: 2026-02-10
**Status**: Active Development
**Maintained By**: Claude Code + Autonomous Agents
