
import React, { useState, useMemo } from 'react';
import { InternalUseEntry } from '../types';

interface InternalUseScreenProps {
    entries: InternalUseEntry[];
}

const InternalUseScreen: React.FC<InternalUseScreenProps> = ({ entries }) => {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredEntries = useMemo(() => {
        const parseBrazilianDate = (dateStr: string) => {
            return new Date(dateStr);
        };

        if (!startDate && !endDate) {
            return entries;
        }

        return entries.filter(entry => {
            const entryDate = parseBrazilianDate(entry.date);

            if (startDate) {
                const filterStartDate = new Date(`${startDate}T00:00:00`);
                if (entryDate < filterStartDate) {
                    return false;
                }
            }

            if (endDate) {
                const filterEndDate = new Date(`${endDate}T00:00:00`);
                if (entryDate > filterEndDate) {
                    return false;
                }
            }

            return true;
        });
    }, [entries, startDate, endDate]);

    const totalInternalCost = filteredEntries.reduce((sum, entry) => sum + entry.totalCost, 0);

    const toggleDetails = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="p-6 h-screen flex flex-col">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-white">Uso Interno / Consumo</h1>
                <p className="text-gray-400">Histórico de produtos retirados para uso da empresa.</p>
            </header>

            <div className="mb-6 bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 flex justify-between items-center">
                <span className="text-lg font-medium text-white">Custo Total de Consumo (Filtrado):</span>
                <span className="text-2xl font-bold text-orange-400">R$ {totalInternalCost.toFixed(2)}</span>
            </div>

            <div className="mb-4 flex flex-wrap gap-4 items-center p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                    <label htmlFor="start-date" className="text-sm text-gray-400">De:</label>
                    <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="end-date" className="text-sm text-gray-400">Até:</label>
                    <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>
                <button
                    onClick={clearFilters}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
                >
                    Limpar Filtros
                </button>
            </div>

            <div className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden flex flex-col">
                <div className="overflow-y-auto h-full">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/60 sticky top-0">
                            <tr>
                                <th className="p-4 font-semibold w-12"></th>
                                <th className="p-4 font-semibold">Data da Retirada</th>
                                <th className="p-4 font-semibold text-center">Qtd. Itens</th>
                                <th className="p-4 font-semibold text-right">Custo Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEntries.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-16 text-gray-500">
                                        Nenhuma retirada para uso interno encontrada com os filtros aplicados.
                                    </td>
                                </tr>
                            ) : (
                                filteredEntries.map(entry => (
                                    <React.Fragment key={entry.id}>
                                        <tr className="border-b border-gray-700/50 hover:bg-gray-700/20 cursor-pointer" onClick={() => toggleDetails(entry.id)}>
                                            <td className="p-4 text-center">
                                                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedId === entry.id ? 'rotate-90' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
                                                </svg>
                                            </td>
                                            <td className="p-4 font-medium">{new Date(entry.date).toLocaleString('pt-BR')}</td>
                                            <td className="p-4 text-center">{entry.cart.reduce((sum, item) => sum + item.quantity, 0)}</td>
                                            <td className="p-4 text-right font-bold text-orange-400">R$ {entry.totalCost.toFixed(2)}</td>
                                        </tr>
                                        {expandedId === entry.id && (
                                            <tr className="bg-gray-900/50">
                                                <td colSpan={4} className="p-4">
                                                    <div className="p-4 bg-gray-800 rounded-lg">
                                                        <h4 className="font-bold text-lg mb-2 text-white">Itens da Retirada</h4>
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="border-b border-gray-700">
                                                                    <th className="py-2 text-left font-semibold">Produto</th>
                                                                    <th className="py-2 text-center font-semibold">Qtd.</th>
                                                                    <th className="py-2 text-right font-semibold">Custo Unit.</th>
                                                                    <th className="py-2 text-right font-semibold">Custo Subtotal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {entry.cart.map(item => (
                                                                    <tr key={item.id} className="border-b border-gray-700/50">
                                                                        <td className="py-2">{item.name}</td>
                                                                        <td className="py-2 text-center">{item.quantity}</td>
                                                                        <td className="py-2 text-right">R$ {item.cost_price.toFixed(2)}</td>
                                                                        <td className="py-2 text-right font-medium">R$ {(item.cost_price * item.quantity).toFixed(2)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InternalUseScreen;
