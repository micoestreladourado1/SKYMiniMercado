
import React, { useState, useMemo } from 'react';
import { ReceivableEntry, PaymentMethod } from '../types';
import ReceivePaymentModal from './ReceivePaymentModal';

interface AccountsReceivableScreenProps {
    receivables: ReceivableEntry[];
    onPayReceivable: (receivableId: number, paymentMethod: PaymentMethod) => void;
    onDeleteReceivable: (id: number) => void;
}

const AccountsReceivableScreen: React.FC<AccountsReceivableScreenProps> = ({ receivables, onPayReceivable, onDeleteReceivable }) => {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [payingReceivable, setPayingReceivable] = useState<ReceivableEntry | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    const filteredReceivables = useMemo(() => {
        const parseBrazilianDate = (dateStr: string) => {
            return new Date(dateStr);
        };

        return receivables.filter(entry => {
            const matchesSearchTerm = entry.customerName.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesDate = true;
            if (selectedDate) {
                const entryDate = parseBrazilianDate(entry.date);
                const filterDate = new Date(`${selectedDate}T00:00:00`);
                matchesDate = entryDate.getFullYear() === filterDate.getFullYear() &&
                    entryDate.getMonth() === filterDate.getMonth() &&
                    entryDate.getDate() === filterDate.getDate();
            }

            return matchesSearchTerm && matchesDate;
        });
    }, [receivables, searchTerm, selectedDate]);

    const totalReceivable = filteredReceivables.reduce((sum, entry) => sum + entry.total, 0);

    const toggleDetails = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleConfirmPayment = (paymentMethod: PaymentMethod) => {
        if (payingReceivable) {
            onPayReceivable(payingReceivable.id, paymentMethod);
        }
        setPayingReceivable(null);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedDate('');
    };

    return (
        <>
            <div className="p-6 h-screen flex flex-col">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-white">Contas a Receber</h1>
                    <p className="text-gray-400">Gerencie as vendas a prazo (fiado).</p>
                </header>

                <div className="mb-6 bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 flex justify-between items-center">
                    <span className="text-lg font-medium text-white">Total a Receber (Filtrado):</span>
                    <span className="text-2xl font-bold text-cyan-400">R$ {totalReceivable.toFixed(2)}</span>
                </div>

                <div className="mb-4 flex flex-wrap gap-4 items-center p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                    <div className="relative flex-grow min-w-[250px]">
                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por nome do cliente..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
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
                                    <th className="p-4 font-semibold">Cliente</th>
                                    <th className="p-4 font-semibold">Data</th>
                                    <th className="p-4 font-semibold text-right">Valor Total</th>
                                    <th className="p-4 font-semibold text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReceivables.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center p-16 text-gray-500">
                                            Nenhuma conta a receber encontrada com os filtros aplicados.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReceivables.map(entry => (
                                        <React.Fragment key={entry.id}>
                                            <tr className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                                <td className="p-4 font-medium">{entry.customerName}</td>
                                                <td className="p-4 text-gray-400">{new Date(entry.date).toLocaleDateString('pt-BR')}</td>
                                                <td className="p-4 text-right font-bold">R$ {entry.total.toFixed(2)}</td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => toggleDetails(entry.id)}
                                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors" title="Ver Detalhes"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => setPayingReceivable(entry)}
                                                            className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded-full transition-colors" title="Receber Pagamento"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 0 0 .41-1.412A9.957 9.957 0 0 0 10 12c-2.31 0-4.438.784-6.131 2.095Z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm('Tem certeza que deseja excluir este registro de conta a receber? Esta ação não pode ser desfeita.')) {
                                                                    onDeleteReceivable(entry.id);
                                                                }
                                                            }}
                                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-full transition-colors" title="Excluir"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedId === entry.id && (
                                                <tr className="bg-gray-900/50">
                                                    <td colSpan={4} className="p-4">
                                                        <div className="p-4 bg-gray-800 rounded-lg">
                                                            <h4 className="font-bold text-lg mb-2 text-white">Itens da Venda</h4>
                                                            <table className="w-full text-sm">
                                                                <thead>
                                                                    <tr className="border-b border-gray-700">
                                                                        <th className="py-2 text-left font-semibold">Produto</th>
                                                                        <th className="py-2 text-center font-semibold">Qtd.</th>
                                                                        <th className="py-2 text-right font-semibold">Preço Unit.</th>
                                                                        <th className="py-2 text-right font-semibold">Subtotal</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {entry.cart.map(item => (
                                                                        <tr key={item.id} className="border-b border-gray-700/50 last:border-b-0">
                                                                            <td className="py-2">{item.name}</td>
                                                                            <td className="py-2 text-center">{item.quantity}</td>
                                                                            <td className="py-2 text-right">R$ {item.price.toFixed(2)}</td>
                                                                            <td className="py-2 text-right font-medium">R$ {(item.price * item.quantity).toFixed(2)}</td>
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
            <ReceivePaymentModal
                isOpen={!!payingReceivable}
                onClose={() => setPayingReceivable(null)}
                onConfirm={handleConfirmPayment}
                receivable={payingReceivable}
            />
        </>
    );
};

export default AccountsReceivableScreen;
