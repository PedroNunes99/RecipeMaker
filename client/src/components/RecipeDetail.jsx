import React from 'react';

const RecipeDetail = ({ recipe, onBack }) => {
    if (!recipe) return null;

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center space-x-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-3 hover:bg-sage-100 rounded-full transition-all group shadow-sm bg-white"
                >
                    <svg className="w-6 h-6 text-sage-600 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
                <h1 className="text-4xl font-black text-sage-900">{recipe.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-panel overflow-hidden bg-white/40">
                        <div className="h-96 bg-gradient-to-br from-sage-100 to-sage-200 flex items-center justify-center relative">
                            <span className="text-sage-300 font-black text-6xl italic opacity-30">PREMIUM KITCHEN</span>
                        </div>
                    </div>

                    <div className="glass-panel p-8 bg-white/40">
                        <h2 className="text-xs font-black text-sage-400 uppercase tracking-[0.2em] mb-8">Instructions</h2>
                        <div className="space-y-6">
                            {recipe.steps.map((step, idx) => (
                                <div key={idx} className="flex space-x-6 group">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-sage-600 text-white flex items-center justify-center font-black shadow-lg shadow-sage-900/10 transform transition-transform group-hover:scale-110">
                                        {idx + 1}
                                    </div>
                                    <p className="text-sage-700 leading-relaxed pt-2 text-lg">{step.instruction}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar/Stats */}
                <div className="space-y-8">
                    <div className="glass-panel p-8 border-l-8 border-l-sage-500 bg-white/40">
                        <h2 className="text-xs font-black text-sage-400 uppercase tracking-[0.2em] mb-6">Nutritional Profile</h2>
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <NutrientStat label="Calories" value={recipe.calories} unit="kcal" />
                            <NutrientStat label="Protein" value={recipe.protein} unit="g" />
                            <NutrientStat label="Carbs" value={recipe.carbs} unit="g" />
                            <NutrientStat label="Fat" value={recipe.fat} unit="g" />
                        </div>

                        <div className="space-y-6 bg-sage-50/50 p-6 rounded-3xl border border-sage-100">
                            <MacroBar label="Protein" percent={40} color="bg-sage-600" />
                            <MacroBar label="Carbs" percent={35} color="bg-earth-400" />
                            <MacroBar label="Fat" percent={25} color="bg-earth-600" />
                        </div>
                    </div>

                    <div className="glass-panel p-8 bg-white/40">
                        <h2 className="text-xs font-black text-sage-400 uppercase tracking-[0.2em] mb-6">Ingredients</h2>
                        <ul className="space-y-3">
                            {recipe.ingredients.map((ing, idx) => (
                                <li key={idx} className="flex justify-between items-center p-4 bg-sage-50/50 rounded-2xl border border-sage-100/50 group hover:bg-white transition-colors">
                                    <span className="text-sage-800 font-bold">{ing.name}</span>
                                    <span className="font-black text-sage-600 bg-white/60 px-3 py-1 rounded-lg text-xs">{ing.quantity} {ing.unit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NutrientStat = ({ label, value, unit }) => (
    <div className="bg-white/60 rounded-2xl p-4 text-center shadow-sm">
        <div className="text-[10px] font-black text-sage-400 uppercase tracking-widest mb-1">{label}</div>
        <div className="text-2xl font-black text-sage-900">{value}<span className="text-xs text-sage-500 ml-0.5 font-bold">{unit}</span></div>
    </div>
);

const MacroBar = ({ label, percent, color }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-sage-500">
            <span>{label}</span>
            <span>{percent}%</span>
        </div>
        <div className="h-2 w-full bg-white/60 rounded-full overflow-hidden shadow-inner">
            <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
        </div>
    </div>
);

export default RecipeDetail;
