
import React from 'react';
import { CashierState } from '../../types';

interface CashierStatusGridProps {
    cashiers: Pick<CashierState, 'id' | 'cashierNumber' | 'status' | 'operatorName'>[];
}

const CashierStatusGrid: React.FC<CashierStatusGridProps> = ({ cashiers }) => {

    const getStatusStyles = (status: 'open' | 'closed' | 'divergence') => {
        switch (status) {
            case 'open':
                return {
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/30',
                    dot: 'bg-green-400',
                    textColor: 'text-green-400',
                    label: 'Ativo'
                };
            case 'divergence':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/30',
                    dot: 'bg-red-400',
                    textColor: 'text-red-400',
                    label: 'Atenção'
                };
            case 'closed':
            default:
                return {
                    bg: 'bg-gray-800/40',
                    border: 'border-gray-700/50',
                    dot: 'bg-gray-600',
                    textColor: 'text-gray-500',
                    label: 'Offline'
                };
        }
    };

    return (
        <div className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-md shadow-2xl transition-all hover:border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                        Monitor de PDVs
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Status dos caixas em operação</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {cashiers.map(cashier => {
                    const styles = getStatusStyles(cashier.status);
                    const isOpen = cashier.status === 'open';

                    return (
                        <div key={cashier.id} className={`flex items-center justify-between p-4 rounded-xl border ${styles.border} ${styles.bg} transition-all hover:shadow-lg`}>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center border border-gray-700/50 text-white font-black">
                                        {cashier.cashierNumber}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-950 ${styles.dot} ${isOpen ? 'animate-pulse' : ''}`}></div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">PDV {cashier.cashierNumber}</p>
                                    <p className="text-xs text-gray-400 italic font-medium">{isOpen ? cashier.operatorName : 'Nenhum operador'}</p>
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${styles.textColor} bg-white/5`}>
                                {styles.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CashierStatusGrid;
