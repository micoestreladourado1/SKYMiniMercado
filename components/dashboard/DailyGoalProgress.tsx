
import React from 'react';

interface DailyGoalProgressProps {
    goal: number;
    current: number;
    progress: number; // percentage
}

const DailyGoalProgress: React.FC<DailyGoalProgressProps> = ({ goal, current, progress }) => {
    const isGoalReached = progress >= 100;

    return (
        <div className={`relative overflow-hidden bg-gray-900/40 border ${isGoalReached ? 'border-green-500/30 bg-green-900/10' : 'border-gray-800/50'} rounded-2xl p-6 backdrop-blur-md shadow-2xl h-full flex flex-col justify-between transition-all hover:border-gray-700/50`}>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isGoalReached ? 'text-green-400' : 'text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        Meta de Venda
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Objetivo financeiro diário</p>
                </div>
                {isGoalReached && (
                    <div className="bg-green-500/20 text-green-400 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-green-500/30 animate-pulse">
                        Meta Atingida!
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="flex flex-col">
                    <div className="flex justify-between items-baseline">
                        <span className={`text-4xl font-black italic tracking-tighter ${isGoalReached ? 'text-green-400' : 'text-white'}`}>
                            R$ {current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                            de R$ {goal.toLocaleString('pt-BR')}
                        </span>
                    </div>
                </div>

                <div className="relative pt-2">
                    <div className="flex justify-between text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
                        <span>Progresso</span>
                        <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-800/80 rounded-full h-3 overflow-hidden border border-gray-700/30 shadow-inner">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_15px_rgba(34,211,238,0.4)] ${isGoalReached ? 'bg-gradient-to-r from-green-600 to-green-400 shadow-green-500/50' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        >
                            <div className="absolute top-0 right-0 w-8 h-full bg-white/20 skew-x-12 transform translate-x-4 animate-shimmer"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Restante</p>
                    <p className="text-sm font-bold text-white">
                        {current >= goal ? 'R$ 0,00' : `R$ ${(goal - current).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Status</p>
                    <p className={`text-sm font-bold ${isGoalReached ? 'text-green-400' : 'text-cyan-400'}`}>
                        {isGoalReached ? 'Excedente' : 'Em andamento'}
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    from { transform: translateX(-100%) skewX(-12deg); }
                    to { transform: translateX(200%) skewX(-12deg); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default DailyGoalProgress;
