# RecipeMaker 🍳

A modern, AI-powered recipe management application with an autonomous multi-agent development system.

## Features

- **Recipe Management**: Create, store, and manage your favorite recipes
- **AI-Powered**: Generate recipes using AI assistance
- **Ingredient Database**: Comprehensive ingredient database with nutritional information
- **Nutrition Tracking**: Automatic nutritional calculations
- **Beautiful UI**: Modern, responsive interface built with React and Tailwind CSS

## Technology Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Modern ES modules

### Backend
- Python
- FastAPI
- Prisma ORM
- SQLite database

### AI/ML
- Ollama (local) for recipe generation
- Multi-agent autonomous development system

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd RecipeMaker
   ```

2. **Set up the client**
   ```bash
   cd client
   npm install
   ```

3. **Set up the server**
   ```bash
   cd server
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Set up the database**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   python seed.py  # Optional: Load sample data
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   uvicorn main:app --reload --port 8000
   ```

2. **Start the frontend**
   ```bash
   cd client
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Autonomous Development System

This project includes an advanced multi-agent system for autonomous development! See [.agent/README.md](.agent/README.md) for details.

### Quick Start with Agents

1. **Set up the agent system**
   ```bash
   cd .agent
   npm install
   cp .env.example .env
   # Configure OLLAMA_URL and LLM_MODEL in .env
   ```

2. **Start the agent system**
   ```bash
   npm start
   ```

3. **Available workflows**
   - `workflow feature-development` - Full feature development cycle
   - `workflow bug-fix` - Bug fixing workflow
   - `workflow continuous-improvement` - Autonomous code improvements

## Project Structure

```
RecipeMaker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   └── package.json
├── server/                 # Python backend
│   ├── agents/             # AI recipe generation agents
│   ├── services/           # Business logic
│   ├── prisma/             # Database schema
│   ├── main.py             # FastAPI app
│   └── seed.py             # Database seeding
└── .agent/                 # Autonomous development system
    ├── agents/             # AI development agents
    ├── config/             # Agent configurations
    ├── shared/             # Shared utilities
    └── index.js            # Agent CLI
```

## API Endpoints

### Recipes
- `GET /recipes` - List recipes with optional search/filter/sort/pagination
  - Query params: `q`, `minCalories`, `maxCalories`, `minProtein`, `sortBy`, `sortOrder`, `limit`, `offset`
- `POST /recipes/manual` - Create recipe manually
- `POST /recipes/ai-generate` - Generate recipe with AI

### Ingredients
- `GET /ingredients` - List all ingredients
- `GET /ingredients/search` - Search ingredients
- `GET /ingredients/{id}/purchase` - Get purchase links

## Development

### Frontend Development
```bash
cd client
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
```

### Backend Development
```bash
cd server
uvicorn main:app --reload  # Start with auto-reload
pytest                      # Run tests
```

### Database Migrations
```bash
cd server
npx prisma migrate dev     # Create migration
npx prisma generate        # Generate Prisma client
npx prisma studio          # Open database GUI
```

## Contributing

This project uses an autonomous agent system for development. To contribute:

1. Use the agent system to propose changes
2. Review agent-generated code
3. Submit pull requests

### Using Agents for Development

```bash
cd .agent
npm start

# Create a new feature
agent> task Add export functionality to recipes

# Fix a bug
agent> workflow bug-fix

# Plan a complex feature
agent> plan Add user authentication system with social login
```

## License

MIT

## Support

For issues or questions:
- Create an issue on GitHub
- Check the [agent system documentation](.agent/README.md)
- Review the API documentation at `/docs`

## Roadmap

- [ ] User authentication
- [ ] Recipe sharing
- [ ] Meal planning
- [ ] Shopping list generation
- [ ] Mobile app
- [ ] Recipe recommendations
- [ ] Social features

---

Built with ❤️ using autonomous AI agents
