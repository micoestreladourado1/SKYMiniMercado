
import React, { useState } from 'react';
import { CompletedSale, Employee } from '../../types';
import CancelCompletedSaleModal from '../CancelCompletedSaleModal';

interface RealtimeSalesTableProps {
    sales: CompletedSale[];
    loggedInUser: Employee;
    onReverseSale: (saleId: number, reason: string) => void;
}

const RealtimeSalesTable: React.FC<RealtimeSalesTableProps> = ({ sales, loggedInUser, onReverseSale }) => {
    const [saleToReverse, setSaleToReverse] = useState<CompletedSale | null>(null);

    const handleConfirmReversal = (reason: string) => {
        if (saleToReverse) {
            onReverseSale(saleToReverse.id, reason);
        }
        setSaleToReverse(null);
    };

    return (
        <>
            <div className="bg-gray-950/40 border border-gray-800/50 rounded-2xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-md transition-all hover:border-gray-700/50">
                <div className="p-6 flex items-center justify-between border-b border-gray-800/50">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Fluxo Recente de Vendas
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Monitoramento de transações em tempo real</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Tempo Real</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-900/50 border-b border-gray-800/50">
                                <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-widest">Hora / PDV</th>
                                <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-widest">Operador</th>
                                <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">Pagamento</th>
                                <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
                                <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-widest text-right">Valor Total</th>
                                <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">Opções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((sale, index) => {
                                const statusInfo = {
                                    completed: { label: 'Concluída', style: 'bg-green-500/10 text-green-400 border-green-500/20' },
                                    cancelled: { label: 'Cancelada', style: 'bg-red-500/10 text-red-400 border-red-500/20' },
                                    reversed: { label: 'Estornada', style: 'bg-amber-500/10 text-amber-500 border-amber-500/20' }
                                };
                                const currentStatus = statusInfo[sale.status] || { label: sale.status, style: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
                                const isNew = index === 0 && sale.status === 'completed';

                                return (
                                    <tr
                                        key={sale.id}
                                        className={`group hover:bg-white/[0.02] transition-colors ${isNew ? 'animate-pulse-bg' : ''} ${sale.status !== 'completed' ? 'opacity-60' : ''}`}
                                    >
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white">{new Date(sale.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className="text-[10px] font-bold text-gray-600 uppercase">Caixa {sale.cashierNumber}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700/50 flex items-center justify-center text-[10px] font-black text-cyan-400">
                                                    {sale.operatorName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-gray-300">{sale.operatorName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-xs font-bold text-gray-400 bg-gray-900/50 px-3 py-1 rounded-lg border border-gray-800/50">
                                                {sale.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${currentStatus.style}`}>
                                                {currentStatus.label}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`text-base font-black font-mono ${sale.status !== 'completed' ? 'line-through text-gray-600' : 'text-white'}`}>
                                                R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {sale.status === 'completed' && loggedInUser.permissions.canCancelSale && (
                                                <button
                                                    onClick={() => setSaleToReverse(sale)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Estornar Venda"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <style>{`
                        @keyframes pulse-bg {
                            0%, 100% { background-color: transparent; }
                            50% { background-color: rgba(0, 255, 255, 0.1); }
                        }
                        .animate-pulse-bg {
                            animation: pulse-bg 2s ease-in-out;
                        }
                    `}</style>
                </div>
            </div>

            <CancelCompletedSaleModal
                isOpen={!!saleToReverse}
                onClose={() => setSaleToReverse(null)}
                onConfirm={handleConfirmReversal}
                sale={saleToReverse}
            />
        </>
    );
};

export default RealtimeSalesTable;
