import React, { useState } from 'react';
import RecipeDetail from './components/RecipeDetail';
import IngredientManager from './components/IngredientManager';

function App() {
  const [activeTab, setActiveTab] = useState('recipes');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  return (
    <div className="min-h-screen max-w-7xl mx-auto p-4 md:p-8">
      <header className="glass-panel flex flex-col md:flex-row justify-between items-center p-4 md:px-8 mb-8 sticky top-4 z-50">
        <div className="text-2xl font-black tracking-tight mb-4 md:mb-0 text-sage-800">
          Recipe<span className="text-sage-600">Maker</span>
        </div>
        <nav className="flex space-x-2 md:space-x-4">
          <TabButton active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} label="Recipes" />
          <TabButton active={activeTab === 'create'} onClick={() => setActiveTab('create')} label="Create" />
          <TabButton active={activeTab === 'ingredients'} onClick={() => setActiveTab('ingredients')} label="Ingredients" />
        </nav>
      </header>

      <main>
        {selectedRecipe ? (
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={() => setSelectedRecipe(null)}
          />
        ) : (
          <>
            {activeTab === 'recipes' && <RecipeList onSelectRecipe={setSelectedRecipe} />}
            {activeTab === 'create' && <RecipeCreator onGenerated={(recipe) => { setSelectedRecipe(recipe); }} />}
            {activeTab === 'ingredients' && <IngredientManager />}
          </>
        )}
      </main>
    </div>
  );
}

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl font-bold transition-all ${active
      ? 'bg-sage-600 text-white shadow-lg shadow-sage-900/10'
      : 'text-sage-500 hover:text-sage-700 hover:bg-white/40'
      }`}
  >
    {label}
  </button>
);

const RecipeList = ({ onSelectRecipe }) => {
  const [recipes, setRecipes] = React.useState([]);

  React.useEffect(() => {
    fetch('http://localhost:8000/recipes')
      .then(res => res.json())
      .then(data => setRecipes(data))
      .catch(err => console.error("Failed to fetch recipes", err));
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8">Your Collection</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.length === 0 && (
          <div className="lg:col-span-3 py-20 text-center glass-panel">
            <p className="text-slate-500 mb-4 text-xl">No recipes found in your collection.</p>
            <span className="text-indigo-400 font-bold italic animate-pulse">Start creating to build your library!</span>
          </div>
        )}
        {recipes.map((recipe, idx) => (
          <RecipeCard
            key={idx}
            title={recipe.title}
            description={recipe.description}
            category="Saved"
            onClick={() => onSelectRecipe(recipe)}
          />
        ))}
      </div>
    </div>
  );
};

const RecipeCard = ({ title, description, category, onClick }) => (
  <div
    onClick={onClick}
    className="glass-panel overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-pointer"
  >
    <div className="h-48 bg-gradient-to-br from-sage-100 to-sage-200 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-sage-600/5 group-hover:bg-sage-600/10 transition-colors"></div>
      <div className="text-sage-300 font-bold italic text-4xl opacity-30 uppercase tracking-widest">Recipe</div>
    </div>
    <div className="p-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-black text-sage-800">{title}</h3>
        <span className="text-[10px] uppercase tracking-widest font-black px-2 py-1 bg-sage-100 text-sage-600 rounded-lg">
          {category}
        </span>
      </div>
      <p className="text-sage-600/80 text-sm leading-relaxed">{description}</p>
      <div className="mt-6 flex justify-between items-center border-t border-sage-100 pt-4">
        <div className="flex space-x-4 text-[10px] font-bold uppercase tracking-tighter text-sage-400">
          <span>450 kcal</span>
          <span>32g P</span>
        </div>
        <button className="text-sage-600 text-sm font-black hover:text-sage-800 transition-colors">Details →</button>
      </div>
    </div>
  </div>
);

const RecipeCreator = ({ onGenerated }) => {
  const [mode, setMode] = useState('manual');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (prompt) => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8000/recipes/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();

      // Transform the backend response to the frontend format if needed
      const formattedRecipe = {
        ...data,
        calories: data.macros?.calories || data.nutritional_estimates?.calories,
        protein: data.macros?.protein || data.nutritional_estimates?.protein,
        carbs: data.macros?.carbs || data.nutritional_estimates?.carbs,
        fat: data.macros?.fat || data.nutritional_estimates?.fat,
      };

      onGenerated(formattedRecipe);
    } catch (e) {
      console.error("AI Generation failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8">Create New Recipe</h1>

      {isGenerating ? (
        <div className="glass-panel p-20 flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 border-4 border-sage-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-2xl font-black italic text-sage-600">Cultivating your recipe...</div>
          <p className="text-sage-400 animate-pulse text-center max-w-sm">
            Balancing natural flavors and optimizing nutritional density for your well-being.
          </p>
        </div>
      ) : (
        <>
          <div className="glass-panel p-2 flex space-x-2 w-fit mb-8 bg-white/20">
            <button
              onClick={() => setMode('manual')}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${mode === 'manual' ? 'bg-sage-600 text-white shadow-lg shadow-sage-900/10' : 'text-sage-400'}`}
            >
              Manual
            </button>
            <button
              onClick={() => setMode('assisted')}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${mode === 'assisted' ? 'bg-sage-600 text-white shadow-lg shadow-sage-900/10' : 'text-sage-400'}`}
            >
              AI Assisted
            </button>
            <button
              onClick={() => setMode('freestyle')}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${mode === 'freestyle' ? 'bg-sage-600 text-white shadow-lg shadow-sage-900/10' : 'text-sage-400'}`}
            >
              AI Freestyle
            </button>
          </div>

          <div className="glass-panel p-8 md:p-12">
            {mode === 'manual' && <ManualForm />}
            {mode === 'assisted' && <AIForm mode="assisted" onGenerate={handleGenerate} />}
            {mode === 'freestyle' && <AIForm mode="freestyle" onGenerate={handleGenerate} />}
          </div>
        </>
      )}
    </div>
  );
};

const ManualForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    servings: 1,
    ingredients: [],
    steps: []
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState({
    quantity: '',
    unit: 'g'
  });
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const [currentInstruction, setCurrentInstruction] = useState('');
  const [error, setError] = useState(null); // New error state

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await fetch(`http://localhost:8000/ingredients/search?q=${searchQuery}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error("Search failed", e);
    }
  };

  const addIngredient = () => {
    if (!selectedIngredient || !currentIngredient.quantity) return;
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, {
        ...selectedIngredient,
        quantity: parseFloat(currentIngredient.quantity),
        unit: currentIngredient.unit,
        ingredientId: selectedIngredient.id
      }]
    });
    setSelectedIngredient(null);
    setCurrentIngredient({ quantity: '', unit: 'g' });
    setSearchQuery('');
    setSearchResults([]);
  };

  const addStep = () => {
    if (!currentInstruction) return;
    setFormData({
      ...formData,
      steps: [...formData.steps, {
        order: formData.steps.length + 1,
        instruction: currentInstruction
      }]
    });
    setCurrentInstruction('');
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/recipes/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        window.location.reload(); // Refresh to show new recipe
      } else if (response.status === 409) {
        setError("A recipe with this title already exists. Please choose a different title.");
      } else {
        setError("Failed to save recipe. Please try again.");
      }
    } catch (e) {
      console.error("Failed to save recipe", e);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-sage-600 text-white shadow-lg shadow-sage-900/10' : 'bg-sage-100 text-sage-400'}`}>
              {s}
            </div>
            {s < 3 && <div className={`h-1 flex-1 mx-4 rounded-full ${step > s ? 'bg-sage-600' : 'bg-sage-100'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <h2 className="text-3xl font-black text-sage-800 mb-8">Recipe Basics</h2>
          <div>
            <label className="block text-xs font-bold text-sage-500 uppercase tracking-widest mb-2">Recipe Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Grandma's Special Pasta"
              className="glass-input"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-sage-500 uppercase tracking-widest mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us about your dish..."
              className="glass-input h-32"
            ></textarea>
          </div>
          <div>
            <label className="block text-xs font-bold text-sage-500 uppercase tracking-widest mb-2">Servings</label>
            <input
              type="number"
              value={formData.servings}
              onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
              className="glass-input w-32"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={nextStep} disabled={!formData.title} className="btn-primary">
              Continue to Ingredients
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <h2 className="text-3xl font-black text-sage-800 mb-4">Ingredients</h2>

          <div className="glass-panel p-6 bg-white/20">
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search ingredients..."
                className="glass-input mb-0 flex-1"
              />
              <button onClick={handleSearch} className="btn-primary">Search</button>
            </div>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-h-60 overflow-y-auto p-2">
                {searchResults.map((ing) => (
                  <div
                    key={ing.id}
                    onClick={() => setSelectedIngredient(ing)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedIngredient?.id === ing.id ? 'border-sage-500 bg-sage-50' : 'border-black/5 hover:bg-white/40'}`}
                  >
                    <div className="font-bold text-sage-800">{ing.name}</div>
                    <div className="text-xs text-sage-400 uppercase tracking-widest font-black">{ing.calories} kcal / 100g</div>
                  </div>
                ))}
              </div>
            )}

            {selectedIngredient && (
              <div className="flex gap-4 items-end animate-in fade-in duration-300 bg-sage-50/50 p-4 rounded-2xl border border-sage-100">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-sage-500 uppercase tracking-widest mb-2">Quantity</label>
                  <input
                    type="number"
                    value={currentIngredient.quantity}
                    onChange={(e) => setCurrentIngredient({ ...currentIngredient, quantity: e.target.value })}
                    className="glass-input mb-0"
                    placeholder="0"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-bold text-sage-500 uppercase tracking-widest mb-2">Unit</label>
                  <select
                    value={currentIngredient.unit}
                    onChange={(e) => setCurrentIngredient({ ...currentIngredient, unit: e.target.value })}
                    className="glass-input mb-0"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="pcs">Pieces</option>
                  </select>
                </div>
                <button onClick={addIngredient} className="btn-primary py-3">Add</button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-black text-sage-400 uppercase text-[10px] tracking-widest">Added Ingredients</h3>
            {formData.ingredients.length === 0 && <p className="text-sage-400 italic text-sm">No ingredients added yet.</p>}
            {formData.ingredients.map((ing, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 glass-panel bg-white/40">
                <span className="font-bold text-sage-800">{ing.name}</span>
                <span className="font-black text-sage-600 bg-white/60 px-3 py-1 rounded-lg shadow-sm">{ing.quantity}{ing.unit}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={prevStep} className="px-6 py-2 text-sage-400 font-bold hover:text-sage-600 transition-colors">Back</button>
            <button onClick={nextStep} disabled={formData.ingredients.length === 0} className="btn-primary">
              Next: Cooking Steps
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <h2 className="text-3xl font-black text-sage-800 mb-4">Cooking Steps</h2>

          <div className="glass-panel p-6 bg-white/20">
            <textarea
              value={currentInstruction}
              onChange={(e) => setCurrentInstruction(e.target.value)}
              placeholder="Describe this step..."
              className="glass-input h-24 mb-4"
            ></textarea>
            <div className="flex justify-end">
              <button onClick={addStep} className="btn-primary">Add Step</button>
            </div>
          </div>

          <div className="space-y-4">
            {formData.steps.map((s, idx) => (
              <div key={idx} className="flex gap-4 p-4 glass-panel bg-white/40">
                <div className="w-10 h-10 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center font-black flex-shrink-0 shadow-inner">
                  {s.order}
                </div>
                <p className="text-sage-800 py-2">{s.instruction}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={prevStep} className="px-6 py-2 text-sage-400 font-bold hover:text-sage-600 transition-colors">Back</button>
            <button onClick={handleSubmit} disabled={formData.steps.length === 0} className="btn-primary bg-gradient-to-r from-sage-500 to-sage-600">
              Save Premium Recipe 🌿
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center font-bold animate-in fade-in slide-in-from-bottom-2">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AIForm = ({ mode, onGenerate }) => {
  const [input, setInput] = useState('');
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {mode === 'assisted' ? 'Quick Input' : 'Recipe Prompt'}
        </h2>
        <p className="text-slate-400">
          {mode === 'assisted'
            ? 'Provide a list of ingredients or rough steps and our AI agent will structure it perfectly.'
            : 'Describe the kind of recipe you want and we will generate everything from scratch.'}
        </p>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'assisted' ? 'e.g. 2 chicken breasts, broccoli, soy sauce, ginger. Sear chicken, steam broccoli, mix with sauce.' : 'e.g. A quick high-protein vegetarian dinner with Mediterranean flavors under 600 calories.'}
        className="glass-input h-48 mb-6"
      ></textarea>
      <button
        onClick={() => onGenerate(input)}
        className="w-full bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-sage-900/10 transition-all transform hover:-translate-y-1"
      >
        Cultivate Premium Recipe ✨
      </button>
    </div>
  );
};

export default App;
