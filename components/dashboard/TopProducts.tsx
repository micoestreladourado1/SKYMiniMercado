
import React, { useState } from 'react';

interface TopProductsProps {
    products: {
        productId: number;
        name: string;
        quantitySold: number;
    }[];
}

const TopProducts: React.FC<TopProductsProps> = ({ products }) => {
    // Carregar preferência do localStorage ou usar 10 como padrão
    const [visibleCount, setVisibleCount] = useState(() => {
        const saved = localStorage.getItem('dashboard_top_products_count');
        return saved ? Math.max(1, parseInt(saved)) : 10;
    });

    const updateCount = (newCount: number) => {
        const value = Math.max(1, newCount);
        setVisibleCount(value);
        localStorage.setItem('dashboard_top_products_count', value.toString());
    };

    const handleCountChange = (amount: number) => {
        updateCount(visibleCount + amount);
    };

    const showingCount = Math.min(visibleCount, products.length);

    // Função para determinar a cor do ranking
    const getRankStyle = (index: number) => {
        if (index === 0) return 'text-yellow-400 border-yellow-500/30 bg-yellow-400/10';
        if (index === 1) return 'text-slate-300 border-slate-400/30 bg-slate-400/10';
        if (index === 2) return 'text-amber-600 border-amber-700/30 bg-amber-700/10';
        return 'text-gray-500 border-gray-700/30 bg-gray-800/20';
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 flex flex-col h-full shadow-lg backdrop-blur-sm transition-all hover:border-gray-600/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
                        Produtos Mais Vendidos
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                        Exibindo <span className="text-cyan-400 font-bold">{showingCount}</span> de <span className="text-white font-medium">{products.length}</span> itens no catálogo
                    </p>
                </div>

                <div className="flex items-center gap-1 bg-gray-900/80 p-1 rounded-xl border border-gray-700 shadow-inner">
                    <button
                        onClick={() => handleCountChange(-1)}
                        className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all flex items-center justify-center text-white cursor-pointer select-none border border-gray-700/50"
                        title="Ver menos"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                    </button>

                    <div className="px-2 group">
                        <input
                            type="number"
                            value={visibleCount}
                            onChange={(e) => updateCount(parseInt(e.target.value) || 1)}
                            className="w-12 bg-transparent text-center font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-lg"
                        />
                    </div>

                    <button
                        onClick={() => handleCountChange(1)}
                        className="w-8 h-8 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 active:scale-95 transition-all flex items-center justify-center text-white cursor-pointer select-none border border-cyan-500/30"
                        title="Ver mais"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '450px' }}>
                <div className="space-y-2">
                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                            <p>Nenhum produto cadastrado no sistema.</p>
                        </div>
                    ) : (
                        products.slice(0, visibleCount).map((product, index) => (
                            <div
                                key={`${product.productId}-${index}`}
                                className={`flex items-center gap-3 p-3 rounded-xl border border-transparent transition-all hover:border-gray-700 hover:bg-white/5 group`}
                            >
                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg border font-bold text-xs ${getRankStyle(index)}`}>
                                    {index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-semibold truncate ${product.quantitySold > 0 ? 'text-gray-100' : 'text-gray-500'}`}>
                                        {product.name}
                                    </h4>
                                    {product.quantitySold === 0 && (
                                        <span className="text-[10px] text-gray-600 uppercase font-bold tracking-tighter">Sem vendas</span>
                                    )}
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end">
                                        <span className={`font-mono font-bold text-lg ${product.quantitySold > 0 ? 'text-white' : 'text-gray-600'}`}>
                                            {product.quantitySold % 1 === 0 ? product.quantitySold : product.quantitySold.toFixed(3)}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">un</span>
                                    </div>
                                    <div className="h-1 w-full bg-gray-700/50 rounded-full mt-1 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${index < 3 ? 'bg-cyan-500' : 'bg-gray-600'}`}
                                            style={{ width: products[0].quantitySold > 0 ? `${(product.quantitySold / products[0].quantitySold) * 100}%` : '0%' }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {products.length > visibleCount && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <button
                        onClick={() => updateCount(visibleCount + 10)}
                        className="w-full py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1"
                    >
                        Carregar mais 10 produtos
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default TopProducts;
