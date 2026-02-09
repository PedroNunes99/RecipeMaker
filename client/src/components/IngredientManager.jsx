import React, { useState } from 'react';

const IngredientManager = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isAddingCustom, setIsAddingCustom] = useState(false);

    React.useEffect(() => {
        fetch('http://localhost:8000/ingredients')
            .then(res => res.json())
            .then(data => setResults(data));
    }, []);

    const handleSearch = async () => {
        if (!searchQuery) {
            const res = await fetch('http://localhost:8000/ingredients');
            const data = await res.json();
            setResults(data);
            return;
        }
        try {
            const response = await fetch(`http://localhost:8000/ingredients/search?q=${searchQuery}`);
            const data = await response.json();
            setResults(data);
        } catch (e) {
            console.error("Search failed", e);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl md:text-5xl font-black text-sage-900">Ingredient Library</h1>
                <button
                    onClick={() => setIsAddingCustom(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <span className="text-xl">+</span> Create Custom
                </button>
            </div>

            <div className="glass-panel p-6 mb-8 flex gap-4 bg-white/40">
                <input
                    type="text"
                    placeholder="Search natural ingredients..."
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
                            <button onClick={() => setIsAddingCustom(false)} className="text-sage-400 hover:text-sage-600 transition-colors">✕</button>
                        </div>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-sage-400 uppercase tracking-[0.2em] mb-3">Name</label>
                                    <input type="text" placeholder="e.g. Garden Fresh Basil" className="glass-input" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-sage-400 uppercase tracking-[0.2em] mb-3">Category</label>
                                    <select className="glass-input appearance-none bg-white/60">
                                        <option>Vegetable</option>
                                        <option>Meat</option>
                                        <option>Dairy</option>
                                        <option>Spice</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <NutrientInput label="Calories" unit="kcal" />
                                <NutrientInput label="Protein" unit="g" />
                                <NutrientInput label="Carbs" unit="g" />
                                <NutrientInput label="Fat" unit="g" />
                            </div>

                            <div className="flex gap-4 pt-8">
                                <button type="button" className="btn-primary flex-1 shadow-sage-900/20">Save Ingredient</button>
                                <button type="button" onClick={() => setIsAddingCustom(false)} className="px-8 py-3 rounded-2xl font-bold text-sage-400 hover:text-sage-600 transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((ing, idx) => (
                    <IngredientCard key={idx} ingredient={ing} />
                ))}
            </div>
        </div>
    );
};

const NutrientInput = ({ label, unit }) => (
    <div className="flex flex-col">
        <label className="block text-[10px] font-black text-sage-400 uppercase tracking-widest mb-2">{label} ({unit})</label>
        <input type="number" placeholder="0" className="glass-input mb-0 shadow-inner" />
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

export default IngredientManager;
