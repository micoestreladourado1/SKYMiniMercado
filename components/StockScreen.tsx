
import React, { useState, useMemo } from 'react';
import { Product } from '../types';

interface StockScreenProps {
    products: Product[];
}

const StockScreen: React.FC<StockScreenProps> = ({ products }) => {
    const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        return products
            .filter(p => {
                if (filter === 'low') return p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_alert;
                if (filter === 'out') return p.stock_quantity <= 0;
                return true;
            })
            .filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [products, filter, searchTerm]);

    const stockSummary = useMemo(() => {
        const totalItems = products.reduce((sum, p) => sum + p.stock_quantity, 0);
        const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_alert).length;
        const outOfStockCount = products.filter(p => p.stock_quantity <= 0).length;
        const totalStockValue = products.reduce((sum, p) => sum + (p.cost_price * p.stock_quantity), 0);
        return { totalItems, lowStockCount, outOfStockCount, totalStockValue };
    }, [products]);

    const handleExportLowStockCSV = () => {
        if (filter !== 'low' || filteredProducts.length === 0) {
            alert("Nenhum produto com estoque baixo para exportar.");
            return;
        }

        const headers = [
            'barcode', 
            'name', 
            'stock_quantity', 
            'min_stock_alert', 
            'cost_price', 
            'price', 
            'suggested_purchase_quantity'
        ];

        const csvRows = [
            headers.join(','),
            ...filteredProducts.map(p => {
                const suggestedQuantity = Math.ceil((p.min_stock_alert * 2) - p.stock_quantity);
                return [
                    p.barcode,
                    `"${p.name.replace(/"/g, '""')}"`, // Handle names with quotes
                    p.stock_quantity,
                    p.min_stock_alert,
                    p.cost_price,
                    p.price,
                    suggestedQuantity
                ].join(',');
            })
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        
        const date = new Date();
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
        link.setAttribute('download', `estoque-baixo-${formattedDate}.csv`);

        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    return (
        <div className="p-6 h-screen flex flex-col">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-white">Controle de Estoque</h1>
                <p className="text-gray-400">Monitore os níveis de estoque dos seus produtos.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400">Total de Itens em Estoque</h3>
                    <p className="text-3xl font-bold text-white">{stockSummary.totalItems.toLocaleString('pt-BR')}</p>
                </div>
                 <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400">Valor do Estoque (Custo)</h3>
                    <p className="text-3xl font-bold text-cyan-400">R$ {stockSummary.totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400">Produtos com Estoque Baixo</h3>
                    <p className="text-3xl font-bold text-yellow-400">{stockSummary.lowStockCount}</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400">Produtos Fora de Estoque</h3>
                    <p className="text-3xl font-bold text-red-500">{stockSummary.outOfStockCount}</p>
                </div>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <div className="flex gap-2">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Todos</button>
                    <button onClick={() => setFilter('low')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'low' ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Estoque Baixo</button>
                    <button onClick={() => setFilter('out')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'out' ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Zerado</button>
                </div>
                <div className="flex items-center gap-2">
                     {filter === 'low' && (
                        <button
                            onClick={handleExportLowStockCSV}
                            disabled={filteredProducts.length === 0}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                            title={filteredProducts.length === 0 ? "Nenhum produto com estoque baixo para exportar" : "Exportar lista de estoque baixo"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Exportar CSV
                        </button>
                    )}
                    <div className="relative">
                         <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input 
                            type="text"
                            placeholder="Buscar produto..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden flex flex-col">
                <div className="overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/60 sticky top-0">
                            <tr>
                                <th className="p-4 font-semibold">Produto</th>
                                <th className="p-4 font-semibold text-center">Estoque Atual</th>
                                <th className="p-4 font-semibold text-right">Preço Custo</th>
                                <th className="p-4 font-semibold text-right">Preço Venda</th>
                                <th className="p-4 font-semibold text-center">Sug. Compra</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-16 text-gray-500">
                                        Nenhum produto encontrado com os filtros selecionados.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(product => {
                                    const suggestedQuantity = product.stock_quantity <= product.min_stock_alert 
                                        ? Math.ceil((product.min_stock_alert * 2) - product.stock_quantity) 
                                        : 0;
                                    
                                    return (
                                        <tr key={product.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                            <td className="p-4">
                                                <div>{product.name}</div>
                                                <div className="text-xs text-gray-400 font-mono">{product.barcode}</div>
                                            </td>
                                            <td className={`p-4 text-center font-bold text-lg ${product.stock_quantity <= product.min_stock_alert ? 'text-red-400' : 'text-white'}`}>
                                                {product.stock_quantity}
                                                <div className="text-xs text-gray-500">Mín: {product.min_stock_alert}</div>
                                            </td>
                                            <td className="p-4 text-right text-gray-300">R$ {product.cost_price.toFixed(2)}</td>
                                            <td className="p-4 text-right font-medium">R$ {product.price.toFixed(2)}</td>
                                            <td className={`p-4 text-center font-bold text-lg ${suggestedQuantity > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                                {suggestedQuantity > 0 ? suggestedQuantity : '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockScreen;
