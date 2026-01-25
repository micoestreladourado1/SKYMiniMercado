
import React, { useState, useMemo } from 'react';
import { CompletedSale, Employee } from '../types';
import CancelCompletedSaleModal from './CancelCompletedSaleModal';
import SaleDetailsModal from './SaleDetailsModal';

interface SalesScreenProps {
    sales: CompletedSale[];
    loggedInUser: Employee;
    onReverseCompletedSale: (saleId: number, reason: string) => void;
}

type StatusFilter = 'all' | 'completed' | 'reversed' | 'cancelled';

const SalesScreen: React.FC<SalesScreenProps> = ({ sales, loggedInUser, onReverseCompletedSale }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [saleForDetails, setSaleForDetails] = useState<CompletedSale | null>(null);
    const [saleForReversal, setSaleForReversal] = useState<CompletedSale | null>(null);

    const filteredSales = useMemo(() => {
        const parseBrazilianDate = (dateStr: string) => {
            return new Date(dateStr);
        };

        return sales
            .filter(sale => {
                if (statusFilter === 'all') return true;
                return sale.status === statusFilter;
            })
            .filter(sale => {
                const term = searchTerm.toLowerCase();
                if (!term) return true;
                return (
                    sale.id.toString().includes(term) ||
                    sale.operatorName.toLowerCase().includes(term) ||
                    sale.paymentMethod.toLowerCase().includes(term)
                );
            })
            .filter(sale => {
                if (!startDate && !endDate) return true;
                const saleDate = parseBrazilianDate(sale.date);
                if (startDate) {
                    const filterStartDate = new Date(`${startDate}T00:00:00`);
                    if (saleDate < filterStartDate) return false;
                }
                if (endDate) {
                    const filterEndDate = new Date(`${endDate}T00:00:00`);
                    if (saleDate > filterEndDate) return false;
                }
                return true;
            })
            .sort((a, b) => {
                const dateA = parseBrazilianDate(a.date).getTime();
                const dateB = parseBrazilianDate(b.date).getTime();
                return dateB - dateA;
            });
    }, [sales, searchTerm, statusFilter, startDate, endDate]);

    const totalFilteredValue = useMemo(() => {
        return filteredSales.reduce((sum, sale) => {
            if (sale.status === 'completed' || sale.status === 'reversed') { // Reversed sales still count as revenue initially
                return sum + sale.total;
            }
            return sum;
        }, 0);
    }, [filteredSales]);


    const handleConfirmReversal = (reason: string) => {
        if (saleForReversal) {
            onReverseCompletedSale(saleForReversal.id, reason);
        }
        setSaleForReversal(null);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setStartDate('');
        setEndDate('');
    };

    const statusInfo = {
        completed: { label: 'Concluída', style: 'bg-green-500/20 text-green-300' },
        cancelled: { label: 'Cancelada', style: 'bg-red-500/20 text-red-300' },
        reversed: { label: 'Estornada', style: 'bg-yellow-500/20 text-yellow-400' }
    };

    return (
        <>
            <div className="p-6 h-screen flex flex-col">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-white">Histórico de Vendas</h1>
                    <p className="text-gray-400">Consulte, audite e gerencie todas as transações realizadas.</p>
                </header>

                <div className="mb-6 bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 flex justify-between items-center">
                    <span className="text-lg font-medium text-white">Total Vendas (Filtrado):</span>
                    <span className="text-2xl font-bold text-cyan-400">R$ {totalFilteredValue.toFixed(2)}</span>
                </div>

                <div className="mb-4 flex flex-wrap gap-4 items-center p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                    <div className="flex gap-2">
                        {(['all', 'completed', 'reversed', 'cancelled'] as StatusFilter[]).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${statusFilter === status ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {status === 'all' ? 'Todas' : statusInfo[status]?.label || status}
                            </button>
                        ))}
                    </div>
                    <div className="relative flex-grow min-w-[250px]">
                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por ID, operador, pgto..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-400">De:</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-400">Até:</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    </div>
                    <button onClick={clearFilters} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                        Limpar Filtros
                    </button>
                </div>


                <div className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden flex flex-col">
                    <div className="overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/60 sticky top-0">
                                <tr>
                                    <th className="p-4 font-semibold">ID Venda</th>
                                    <th className="p-4 font-semibold">Data/Hora</th>
                                    <th className="p-4 font-semibold">Operador</th>
                                    <th className="p-4 font-semibold text-center">Itens</th>
                                    <th className="p-4 font-semibold">Pagamento</th>
                                    <th className="p-4 font-semibold text-center">Status</th>
                                    <th className="p-4 font-semibold text-right">Valor</th>
                                    <th className="p-4 font-semibold text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center p-16 text-gray-500">Nenhuma venda encontrada com os filtros aplicados.</td></tr>
                                ) : (
                                    filteredSales.map(sale => {
                                        const currentStatus = statusInfo[sale.status];
                                        const isInactive = sale.status === 'cancelled' || sale.status === 'reversed';
                                        return (
                                            <tr key={sale.id} className={`border-b border-gray-700/50 hover:bg-gray-700/20 ${isInactive ? 'opacity-60' : ''}`}>
                                                <td className="p-4 font-mono text-gray-400">#{sale.id}</td>
                                                <td className="p-4">{new Date(sale.date).toLocaleString('pt-BR')}</td>
                                                <td className="p-4">{sale.operatorName}</td>
                                                <td className="p-4 text-center">{sale.cart.reduce((sum, item) => sum + item.quantity, 0)}</td>
                                                <td className="p-4">{sale.paymentMethod}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${currentStatus.style}`}>
                                                        {currentStatus.label}
                                                    </span>
                                                </td>
                                                <td className={`p-4 text-right font-bold ${isInactive ? 'line-through text-gray-500' : ''}`}>
                                                    R$ {sale.total.toFixed(2)}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center items-center gap-1">
                                                        <button onClick={() => setSaleForDetails(sale)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors" title="Ver Detalhes">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" /></svg>
                                                        </button>
                                                        {sale.status === 'completed' && loggedInUser.permissions.canCancelSale && (
                                                            <button onClick={() => setSaleForReversal(sale)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors" title="Estornar Venda">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM10 18a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <SaleDetailsModal
                isOpen={!!saleForDetails}
                onClose={() => setSaleForDetails(null)}
                sale={saleForDetails}
            />

            <CancelCompletedSaleModal
                isOpen={!!saleForReversal}
                onClose={() => setSaleForReversal(null)}
                onConfirm={handleConfirmReversal}
                sale={saleForReversal}
            />
        </>
    );
};

export default SalesScreen;
