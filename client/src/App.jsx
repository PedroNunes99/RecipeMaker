import React, { useState } from 'react';
import RecipeDetail from './components/RecipeDetail';
import IngredientManager from './components/IngredientManager';

function App() {
  const [activeTab, setActiveTab] = useState('recipes');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);

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
            onEdit={(recipe) => {
              setEditingRecipe(recipe);
              setSelectedRecipe(null);
              setActiveTab('create');
            }}
          />
        ) : editingRecipe ? (
          <RecipeCreator
            existingRecipe={editingRecipe}
            onComplete={() => {
              setEditingRecipe(null);
              setActiveTab('recipes');
              window.location.reload();
            }}
            onGenerated={(recipe) => { setSelectedRecipe(recipe); }}
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
            recipe={recipe}
            onClick={() => onSelectRecipe(recipe)}
          />
        ))}
      </div>
    </div>
  );
};

const RecipeCard = ({ title, description, category, onClick, recipe }) => (
  <div
    onClick={onClick}
    className="glass-panel overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-pointer"
  >
    <div className="h-48 bg-gradient-to-br from-sage-100 to-sage-200 flex items-center justify-center relative overflow-hidden">
      {recipe?.imageUrl ? (
        <img
          src={recipe.imageUrl}
          alt={title}
          className="w-full h-full object-cover absolute inset-0"
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-sage-600/5 group-hover:bg-sage-600/10 transition-colors"></div>
          <div className="text-sage-300 font-bold italic text-4xl opacity-30 uppercase tracking-widest">Recipe</div>
        </>
      )}
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
          <span>{Math.round(recipe?.totalCalories || 0)} kcal</span>
          <span>{Math.round(recipe?.totalProtein || 0)}g P</span>
        </div>
        <button className="text-sage-600 text-sm font-black hover:text-sage-800 transition-colors">Details →</button>
      </div>
    </div>
  </div>
);

const RecipeCreator = ({ onGenerated, existingRecipe = null, onComplete = null }) => {
  const [mode, setMode] = useState('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (prompt) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/recipes/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('AI generation failed');
      }

      const data = await response.json();

      // Switch to manual mode with pre-filled data
      setGeneratedRecipe(data);
      setMode('manual');

    } catch (e) {
      console.error("AI Generation failed", e);
      setError("Failed to generate recipe. Please try again or check if Ollama is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Determine which recipe data to pass to ManualForm
  const recipeForForm = generatedRecipe || existingRecipe;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8">
        {existingRecipe ? 'Edit Recipe' : generatedRecipe ? 'Review & Edit AI Recipe' : 'Create New Recipe'}
      </h1>

      {isGenerating ? (
        <div className="glass-panel p-20 flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 border-4 border-sage-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-2xl font-black italic text-sage-600">Cultivating your recipe...</div>
          <p className="text-sage-400 animate-pulse text-center max-w-sm">
            AI is generating your recipe with matched ingredients and nutrition data.
          </p>
        </div>
      ) : (
        <>
          {/* Show mode switcher only if not editing and no generated recipe */}
          {!existingRecipe && !generatedRecipe && (
            <div className="glass-panel p-2 flex space-x-2 w-fit mb-8 bg-white/20">
              <button
                onClick={() => setMode('manual')}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${
                  mode === 'manual'
                    ? 'bg-sage-600 text-white shadow-lg shadow-sage-900/10'
                    : 'text-sage-400'
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${
                  mode === 'ai'
                    ? 'bg-sage-600 text-white shadow-lg shadow-sage-900/10'
                    : 'text-sage-400'
                }`}
              >
                AI Generate
              </button>
            </div>
          )}

          {/* Show error if generation failed */}
          {error && (
            <div className="glass-panel p-6 mb-8 bg-red-50 border border-red-200">
              <div className="flex items-start space-x-3">
                <span className="text-red-500 text-2xl">⚠️</span>
                <div>
                  <h3 className="font-bold text-red-700 mb-1">Generation Failed</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setMode('ai');
                    }}
                    className="mt-3 text-red-700 underline text-sm font-bold"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="glass-panel p-8 md:p-12">
            {mode === 'manual' && (
              <ManualForm
                existingRecipe={recipeForForm}
                onComplete={onComplete || (() => window.location.reload())}
              />
            )}
            {mode === 'ai' && <AIForm onGenerate={handleGenerate} />}
          </div>
        </>
      )}
    </div>
  );
};

const ManualForm = ({ existingRecipe = null, onComplete = null }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    servings: 1,
    ingredients: [],
    steps: []
  });

  // Initialize form data from existing recipe when editing or AI pre-fill
  React.useEffect(() => {
    if (existingRecipe) {
      setFormData({
        title: existingRecipe.title || '',
        description: existingRecipe.description || '',
        servings: existingRecipe.servings || 1,
        ingredients: existingRecipe.ingredients?.map(ri => {
          // Handle both DB format (nested ri.ingredient) and AI format (flat object)
          if (ri.ingredient) {
            return {
              ...ri.ingredient,
              quantity: ri.quantity,
              unit: ri.unit,
              ingredientId: ri.ingredient.id
            };
          }
          return {
            id: ri.id,
            name: ri.name,
            calories: ri.calories,
            protein: ri.protein,
            carbohydrates: ri.carbohydrates,
            fats: ri.fats,
            quantity: ri.quantity,
            unit: ri.unit,
            ingredientId: ri.ingredientId || ri.id
          };
        }) || [],
        steps: existingRecipe.steps?.map(s => ({
          order: s.order,
          instruction: s.instruction,
          notes: s.notes || null
        })) || []
      });
    }
  }, [existingRecipe]);

  // Calculate nutrition preview when ingredients change
  React.useEffect(() => {
    const calculatePreview = async () => {
      if (formData.ingredients.length === 0) {
        setNutritionPreview(null);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/recipes/calculate-nutrition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ingredients: formData.ingredients })
        });

        if (response.ok) {
          const data = await response.json();
          setNutritionPreview(data);
        }
      } catch (e) {
        console.error("Failed to calculate nutrition", e);
      }
    };

    calculatePreview();
  }, [formData.ingredients]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState({
    quantity: '',
    unit: 'g'
  });
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const [currentInstruction, setCurrentInstruction] = useState('');
  const [currentNotes, setCurrentNotes] = useState('');
  const [error, setError] = useState(null);
  const [nutritionPreview, setNutritionPreview] = useState(null);

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
        instruction: currentInstruction,
        notes: currentNotes || null
      }]
    });
    setCurrentInstruction('');
    setCurrentNotes('');
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      // Only treat as editing if the recipe has a DB id (AI-generated recipes don't)
      const isEditing = existingRecipe?.id ? true : false;
      const url = isEditing
        ? `http://localhost:8000/recipes/${existingRecipe.id}`
        : 'http://localhost:8000/recipes/manual';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        if (onComplete) {
          onComplete(); // Call the completion callback
        } else {
          window.location.reload(); // Fallback: refresh to show changes
        }
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

          {nutritionPreview && (
            <div className="glass-panel p-6 bg-gradient-to-br from-sage-50 to-white animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="font-black text-sage-600 uppercase text-[10px] tracking-widest mb-4">Nutrition Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-sage-800">{Math.round(nutritionPreview.calories)}</div>
                  <div className="text-[10px] uppercase font-bold text-sage-400 tracking-widest">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-sage-800">{Math.round(nutritionPreview.protein)}g</div>
                  <div className="text-[10px] uppercase font-bold text-sage-400 tracking-widest">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-sage-800">{Math.round(nutritionPreview.carbs)}g</div>
                  <div className="text-[10px] uppercase font-bold text-sage-400 tracking-widest">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-sage-800">{Math.round(nutritionPreview.fat)}g</div>
                  <div className="text-[10px] uppercase font-bold text-sage-400 tracking-widest">Fat</div>
                </div>
              </div>
            </div>
          )}

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
              className="glass-input h-24 mb-3"
            ></textarea>
            <textarea
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              placeholder="Optional: Add a tip or note for this step..."
              className="glass-input h-16 mb-4 text-sm"
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
                <div className="flex-1">
                  <p className="text-sage-800 py-2">{s.instruction}</p>
                  {s.notes && (
                    <p className="text-sage-500 text-sm italic pl-2 border-l-2 border-sage-200">
                      Tip: {s.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={prevStep} className="px-6 py-2 text-sage-400 font-bold hover:text-sage-600 transition-colors">Back</button>
            <button onClick={handleSubmit} disabled={formData.steps.length === 0} className="btn-primary bg-gradient-to-r from-sage-500 to-sage-600">
              {existingRecipe?.id ? 'Update Recipe 🌿' : 'Save Recipe 🌿'}
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

const AIForm = ({ onGenerate }) => {
  const [input, setInput] = useState('');

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Describe Your Recipe</h2>
        <p className="text-slate-400">
          Tell the AI what kind of recipe you want. Be specific about ingredients,
          dietary restrictions, cuisine type, or cooking style.
        </p>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. A high-protein Mediterranean dinner with chicken, under 600 calories, for 2 people"
        className="glass-input h-48 mb-6"
      ></textarea>

      <button
        onClick={() => onGenerate(input)}
        disabled={!input.trim()}
        className="w-full bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-sage-900/10 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        Generate Recipe with AI ✨
      </button>

      <div className="mt-4 text-center text-xs text-sage-400">
        <p>Powered by local Ollama LLM - 100% private and free</p>
      </div>
    </div>
  );
};

export default App;
