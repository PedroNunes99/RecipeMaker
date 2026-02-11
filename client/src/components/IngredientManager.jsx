import React, { useState } from 'react';

const API_BASE = 'http://localhost:8000';

const IngredientManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [searchMode, setSearchMode] = useState('local');
  const [usdaResults, setUsdaResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  const [customIngredient, setCustomIngredient] = useState({
    name: '',
    category: 'Other',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  const loadLocalIngredients = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ingredients`);
      const data = await res.json();
      setResults(data);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadLocalIngredients();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) {
      if (searchMode === 'local') {
        await loadLocalIngredients();
      } else {
        setUsdaResults([]);
      }
      return;
    }

    try {
      setIsLoading(true);
      setStatusMessage('');
      if (searchMode === 'local') {
        const response = await fetch(`${API_BASE}/ingredients/search?q=${searchQuery}`);
        const data = await response.json();
        setResults(data);
      } else {
        const response = await fetch(`${API_BASE}/ingredients/usda/search?q=${searchQuery}&limit=25`);
        const data = await response.json();
        setUsdaResults(data.results || []);
      }
    } catch (e) {
      console.error('Search failed', e);
      setStatusMessage('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUSDAImport = async (fdcId) => {
    try {
      const response = await fetch(`${API_BASE}/ingredients/usda/import/${fdcId}`, {
        method: 'POST'
      });

      if (response.ok) {
        setStatusMessage('Ingredient imported successfully.');
        setSearchMode('local');
        setSearchQuery('');
        await loadLocalIngredients();
      } else if (response.status === 409) {
        const data = await response.json();
        setStatusMessage(data.detail || 'Ingredient already exists.');
      } else {
        setStatusMessage('Failed to import ingredient.');
      }
    } catch (e) {
      console.error('Import failed', e);
      setStatusMessage('Failed to import ingredient.');
    }
  };

  const handleCreateCustom = async () => {
    if (!customIngredient.name.trim()) {
      setStatusMessage('Ingredient name is required.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customIngredient)
      });

      if (response.ok) {
        setStatusMessage('Ingredient created successfully.');
        setIsAddingCustom(false);
        setCustomIngredient({ name: '', category: 'Other', calories: 0, protein: 0, carbs: 0, fats: 0 });
        setSearchMode('local');
        await loadLocalIngredients();
      } else if (response.status === 409) {
        setStatusMessage('An ingredient with this name already exists.');
      } else {
        setStatusMessage('Failed to create ingredient.');
      }
    } catch (e) {
      console.error('Create ingredient failed', e);
      setStatusMessage('Failed to create ingredient.');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl md:text-5xl font-black text-sage-900">Ingredient Library</h1>
        <button onClick={() => setIsAddingCustom(true)} className="btn-primary flex items-center gap-2">
          <span className="text-xl leading-none">+</span> Create Custom
        </button>
      </div>

      <p className="text-sage-500 mb-6">Search your saved ingredients or import trusted USDA nutrition data.</p>

      {statusMessage && (
        <div className="mb-6 rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-700">
          {statusMessage}
        </div>
      )}

      <div className="glass-panel p-2 flex space-x-2 w-fit mb-6 bg-white/20">
        <button
          onClick={() => {
            setSearchMode('local');
            setUsdaResults([]);
            setSearchQuery('');
            loadLocalIngredients();
          }}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${searchMode === 'local' ? 'bg-sage-600 text-white shadow-lg shadow-sage-900/10' : 'text-sage-400'}`}
        >
          My Library
        </button>
        <button
          onClick={() => {
            setSearchMode('usda');
            setResults([]);
            setSearchQuery('');
          }}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${searchMode === 'usda' ? 'bg-sage-600 text-white shadow-lg shadow-sage-900/10' : 'text-sage-400'}`}
        >
          USDA Database
        </button>
      </div>

      <div className="glass-panel p-6 mb-8 flex gap-4 bg-white/40">
        <input
          type="text"
          placeholder={searchMode === 'local' ? 'Search natural ingredients...' : 'Search USDA FoodData Central...'}
          className="glass-input mb-0 flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className="px-8 btn-primary">Search</button>
      </div>

      {isAddingCustom && (
        <div className="fixed inset-0 bg-sage-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto bg-cream">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-sage-900">New Ingredient</h2>
              <button onClick={() => setIsAddingCustom(false)} className="text-sage-400 hover:text-sage-600 transition-colors">X</button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-sage-400 uppercase tracking-[0.2em] mb-3">Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Garden Fresh Basil"
                    className="glass-input"
                    value={customIngredient.name}
                    onChange={(e) => setCustomIngredient({ ...customIngredient, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-sage-400 uppercase tracking-[0.2em] mb-3">Category</label>
                  <select
                    className="glass-input appearance-none bg-white/60"
                    value={customIngredient.category}
                    onChange={(e) => setCustomIngredient({ ...customIngredient, category: e.target.value })}
                  >
                    <option>Vegetable</option>
                    <option>Meat</option>
                    <option>Dairy</option>
                    <option>Spice</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NutrientInput label="Calories" unit="kcal" value={customIngredient.calories} onChange={(value) => setCustomIngredient({ ...customIngredient, calories: value })} />
                <NutrientInput label="Protein" unit="g" value={customIngredient.protein} onChange={(value) => setCustomIngredient({ ...customIngredient, protein: value })} />
                <NutrientInput label="Carbs" unit="g" value={customIngredient.carbs} onChange={(value) => setCustomIngredient({ ...customIngredient, carbs: value })} />
                <NutrientInput label="Fat" unit="g" value={customIngredient.fats} onChange={(value) => setCustomIngredient({ ...customIngredient, fats: value })} />
              </div>

              <div className="flex gap-4 pt-8">
                <button type="button" onClick={handleCreateCustom} className="btn-primary flex-1 shadow-sage-900/20">Save Ingredient</button>
                <button type="button" onClick={() => setIsAddingCustom(false)} className="px-8 py-3 rounded-2xl font-bold text-sage-400 hover:text-sage-600 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mb-6 rounded-2xl border border-sage-100 bg-white/60 p-4 text-sm text-sage-600">Loading ingredients...</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchMode === 'local'
          ? results.map((ing) => <IngredientCard key={ing.id} ingredient={ing} />)
          : usdaResults.map((food) => <USDAFoodCard key={food.fdcId} food={food} onImport={handleUSDAImport} />)}
      </div>
    </div>
  );
};

const NutrientInput = ({ label, unit, value, onChange }) => (
  <div className="flex flex-col">
    <label className="block text-[10px] font-black text-sage-400 uppercase tracking-widest mb-2">{label} ({unit})</label>
    <input
      type="number"
      placeholder="0"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="glass-input mb-0 shadow-inner"
    />
  </div>
);

const IngredientCard = ({ ingredient }) => (
  <div className="glass-panel p-6 hover:bg-white/60 transition-all cursor-pointer group bg-white/30">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="text-xl font-black text-sage-800">{ingredient.name}</h3>
        <span className="text-[10px] uppercase font-black text-sage-400 tracking-widest">{ingredient.category}</span>
      </div>
      <div className="w-12 h-12 bg-sage-100 rounded-2xl flex items-center justify-center text-sage-600 font-black shadow-inner">
        {ingredient.name[0]}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 text-xs text-sage-500 mb-8 p-4 bg-sage-50/50 rounded-2xl">
      <div className="flex justify-between border-b border-sage-100/50 pb-2"><span>Cals</span> <span className="text-sage-800 font-bold">{ingredient.calories}</span></div>
      <div className="flex justify-between border-b border-sage-100/50 pb-2"><span>Prot</span> <span className="text-sage-800 font-bold">{ingredient.protein}g</span></div>
      <div className="flex justify-between border-b border-sage-100/50 pb-2"><span>Carb</span> <span className="text-sage-800 font-bold">{ingredient.carbs}g</span></div>
      <div className="flex justify-between border-b border-sage-100/50 pb-2"><span>Fat</span> <span className="text-sage-800 font-bold">{ingredient.fats}g</span></div>
    </div>
    <button className="w-full py-3 text-[10px] font-black text-sage-400 hover:text-sage-600 transition-colors uppercase tracking-[0.2em] border border-sage-100 rounded-xl hover:bg-white/80">
      View Purchase Info
    </button>
  </div>
);

const USDAFoodCard = ({ food, onImport }) => (
  <div className="glass-panel p-6 hover:bg-white/60 transition-all group bg-white/30">
    <div className="flex justify-between items-start mb-6">
      <div className="flex-1 pr-2">
        <h3 className="text-lg font-black text-sage-800 leading-tight mb-1">{food.description}</h3>
        <div className="flex gap-2 items-center">
          <span className="text-[9px] uppercase font-black text-sage-400 tracking-widest">{food.dataType}</span>
          <span className="text-[9px] text-sage-300">|</span>
          <span className="text-[9px] text-sage-500">FDC ID: {food.fdcId}</span>
        </div>
      </div>
      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black text-xs shadow-inner flex-shrink-0">
        USDA
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 text-xs text-sage-500 mb-6 p-4 bg-sage-50/50 rounded-2xl">
      <div className="flex justify-between border-b border-sage-100/50 pb-2"><span>Cals</span> <span className="text-sage-800 font-bold">{Math.round(food.calories)}</span></div>
      <div className="flex justify-between border-b border-sage-100/50 pb-2"><span>Prot</span> <span className="text-sage-800 font-bold">{food.protein?.toFixed(1) || 0}g</span></div>
      <div className="flex justify-between border-b border-sage-100/50 pb-2"><span>Carb</span> <span className="text-sage-800 font-bold">{food.carbohydrates?.toFixed(1) || 0}g</span></div>
      <div className="flex justify-between border-b border-sage-100/50 pb-2"><span>Fat</span> <span className="text-sage-800 font-bold">{food.fats?.toFixed(1) || 0}g</span></div>
    </div>
    <button
      onClick={() => onImport(food.fdcId)}
      className="w-full py-3 text-[10px] font-black text-white bg-sage-600 hover:bg-sage-700 transition-all uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-sage-900/10"
    >
      Import to Library
    </button>
  </div>
);

export default IngredientManager;
