import React, { useMemo, useState } from 'react';
import { Product } from '../types';
import * as XLSX from 'xlsx';

interface ShoppingListScreenProps {
    products: Product[];
    onClear: () => Promise<void>;
    onUpdateProduct: (product: Product) => Promise<void>;
}

const ShoppingListScreen: React.FC<ShoppingListScreenProps> = ({ products, onClear, onUpdateProduct }) => {
    const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const shoppingList = useMemo(() => {
        return products
            .filter(p => p.on_shopping_list && p.active && !dismissedIds.has(p.id))
            .map(p => {
                const suggestedQuantity = Math.ceil((p.min_stock_alert * 2) - p.stock_quantity);
                return {
                    ...p,
                    suggestedQuantity: suggestedQuantity > 0 ? suggestedQuantity : 1
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [products, dismissedIds]);

    const availableProducts = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const lowerSearch = searchTerm.toLowerCase();
        return products.filter(p =>
            p.active &&
            !p.on_shopping_list &&
            (p.name.toLowerCase().includes(lowerSearch) || p.barcode.includes(lowerSearch))
        ).slice(0, 10); // Limit results for performance
    }, [products, searchTerm]);

    const handlePrint = () => {
        window.print();
    };

    const handleDismiss = async (product: any) => {
        // Individual dismissal: set on_shopping_list to false in DB
        await onUpdateProduct({ ...product, on_shopping_list: false });
        // Also add to local dismissal just to be sure UI updates immediately if sync is slow
        setDismissedIds(prev => {
            const newSet = new Set(prev);
            newSet.add(product.id);
            return newSet;
        });
    };

    const handleAddManual = async (product: Product) => {
        await onUpdateProduct({ ...product, on_shopping_list: true });
        setSearchTerm('');
        setIsManualModalOpen(false);
    };

    const handleClearList = async () => {
        if (!window.confirm('Tem certeza que deseja zerar toda a lista de compra?')) return;
        await onClear();
        setDismissedIds(new Set());
    };

    const handleExportExcel = () => {
        if (shoppingList.length === 0) return;

        const data = shoppingList.map(p => ({
            'Código': p.barcode,
            'Produto': p.name,
            'Estoque Atual': p.stock_quantity,
            'Estoque Mínimo': p.min_stock_alert,
            'Preço Custo (R$)': p.cost_price.toFixed(2),
            'Preço Venda (R$)': p.price.toFixed(2),
            'Sugestão de Compra': p.suggestedQuantity
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Compra');

        const wscols = [
            { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }
        ];
        worksheet['!cols'] = wscols;

        const date = new Date();
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
        XLSX.writeFile(workbook, `lista-de-compra-${formattedDate}.xlsx`);
    };

    return (
        <div className="p-6 h-screen flex flex-col bg-gray-900 overflow-y-auto relative">
            <header className="mb-6 flex justify-between items-start print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-white">Lista de Compra</h1>
                    <p className="text-gray-400">Produtos adicionados automaticamente após venda com estoque baixo.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md transition-colors text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Inclusão Manual
                    </button>
                    {shoppingList.length > 0 && (
                        <button
                            onClick={handleClearList}
                            className="bg-red-900/40 hover:bg-red-900/60 text-red-200 px-4 py-2 rounded-md transition-colors text-sm border border-red-800/50"
                        >
                            Zerar Lista
                        </button>
                    )}
                    <button
                        onClick={handleExportExcel}
                        disabled={shoppingList.length === 0}
                        className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Exportar Excel
                    </button>
                    <button
                        onClick={handlePrint}
                        disabled={shoppingList.length === 0}
                        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008V12.75zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                        </svg>
                        Imprimir Lista
                    </button>
                </div>
            </header>

            {isManualModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Inclusão Manual</h2>
                            <button onClick={() => setIsManualModalOpen(false)} className="text-gray-400 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Pesquisar por nome ou código de barras..."
                                className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {availableProducts.length === 0 ? (
                                <div className="text-center p-8 text-gray-500 italic">
                                    {searchTerm.trim() ? 'Nenhum produto encontrado ou já está na lista.' : 'Digite algo para pesquisar...'}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {availableProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleAddManual(product)}
                                            className="w-full text-left p-3 hover:bg-indigo-600/20 border border-transparent hover:border-indigo-500/50 rounded-md transition-all group"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="text-white font-medium group-hover:text-indigo-200">{product.name}</div>
                                                    <div className="text-xs text-gray-400 group-hover:text-indigo-300/70">{product.barcode}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-gray-400">Estoque: {product.stock_quantity}</div>
                                                    <div className="text-indigo-400 font-bold">R$ {product.price.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="hidden print:block mb-8 text-black">
                <h1 className="text-2xl font-bold">SKYMiniMercado - Lista de Compra</h1>
                <p>Data: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>

            <div className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden flex flex-col print:border-black print:bg-white print:text-black">
                <div className="overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/60 sticky top-0 print:bg-gray-100">
                            <tr>
                                <th className="p-4 font-semibold">Produto</th>
                                <th className="p-4 font-semibold text-center">Estoque Atual</th>
                                <th className="p-4 font-semibold text-center">Estoque Mínimo</th>
                                <th className="p-4 font-semibold text-right">Preço Custo</th>
                                <th className="p-4 font-semibold text-right">Preço Venda</th>
                                <th className="p-4 font-semibold text-center text-cyan-400 print:text-black">Sugestão Compra</th>
                                <th className="p-4 font-semibold text-center print:hidden">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shoppingList.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center p-16 text-gray-500 italic">
                                        Nenhum produto pendente na lista de compra.
                                    </td>
                                </tr>
                            ) : (
                                shoppingList.map(product => (
                                    <tr key={product.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 print:border-black">
                                        <td className="p-4">
                                            <div className="font-medium text-white print:text-black">{product.name}</div>
                                            <div className="text-xs text-gray-400 font-mono print:text-gray-600">{product.barcode}</div>
                                        </td>
                                        <td className="p-4 text-center text-red-400 font-bold print:text-black">
                                            {product.stock_quantity}
                                        </td>
                                        <td className="p-4 text-center text-gray-300 print:text-black">
                                            {product.min_stock_alert}
                                        </td>
                                        <td className="p-4 text-right text-gray-300 print:text-black font-mono">
                                            R$ {product.cost_price.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-right text-gray-300 print:text-black font-mono">
                                            R$ {product.price.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-center font-bold text-xl text-yellow-400 print:text-black">
                                            {product.suggestedQuantity}
                                        </td>
                                        <td className="p-4 text-center print:hidden">
                                            <button
                                                onClick={() => handleDismiss(product)}
                                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                                title="Excluir da lista"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="mt-4 text-center text-gray-500 text-sm print:hidden">
                Total de itens pendentes: {shoppingList.length}
            </footer>
        </div>
    );
};

export default ShoppingListScreen;
