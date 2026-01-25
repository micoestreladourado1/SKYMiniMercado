
import React, { useState, useEffect, useRef } from 'react';
import { CartItem, CompletedSale, PaymentMethod, Product, Customer, Employee, CashierState } from '../types';
import PaymentModal from './PaymentModal';
import ReceiptModal from './ReceiptModal';
import QuantityInput from './QuantityInput';
import CancelSaleModal from './CancelSaleModal';

interface PosScreenProps {
    loggedInUser: Employee;
    cashierState: CashierState;
    products: Product[];
    customers: Customer[];
    onFiadoSale: (cart: CartItem[], customerName: string, discount: number) => void;
    onInternalUse: (cart: CartItem[]) => void;
    onSaleComplete: (saleData: Omit<CompletedSale, 'id'>) => void;
    onCancelSale: (cart: CartItem[], total: number) => void;
}

const PosScreen: React.FC<PosScreenProps> = ({ loggedInUser, cashierState, products, customers, onFiadoSale, onInternalUse, onSaleComplete, onCancelSale }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isReceiptModalOpen, setReceiptModalOpen] = useState(false);
    const [isCancelModalOpen, setCancelModalOpen] = useState(false);
    const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const keyDownHandlerRef = useRef<(e: KeyboardEvent) => void>();

    useEffect(() => {
        const newTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotal(newTotal);
    }, [cart]);

    useEffect(() => {
        if (inputValue.trim().length > 1) {
            const lowerInput = inputValue.toLowerCase();
            const matchingProducts = products.filter(p =>
                (p.name.toLowerCase().includes(lowerInput) ||
                    (p.barcode && p.barcode.includes(lowerInput))) &&
                p.active
            );
            setSuggestions(matchingProducts);
            setShowSuggestions(matchingProducts.length > 0);
            setSelectedIndex(matchingProducts.length > 0 ? 0 : -1);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setSelectedIndex(-1);
        }
    }, [inputValue, products]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
                suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Scroll selected item into view
    useEffect(() => {
        if (showSuggestions && suggestionsRef.current && selectedIndex >= 0) {
            const selectedElement = suggestionsRef.current.querySelectorAll('li')[selectedIndex];
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex, showSuggestions]);

    const handleFinalizeSale = () => {
        if (cart.length > 0) {
            setPaymentModalOpen(true);
        } else {
            alert("Adicione itens ao carrinho para finalizar a venda.");
        }
    };

    const handleFormSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (inputValue.trim()) {
            addProductToCart(inputValue.trim());
            setInputValue('');
            setShowSuggestions(false);
        }
    };

    useEffect(() => {
        keyDownHandlerRef.current = (e: KeyboardEvent) => {
            if (isPaymentModalOpen || isReceiptModalOpen || isCancelModalOpen) {
                return;
            }

            switch (e.key) {
                case 'F9':
                    e.preventDefault();
                    handleFinalizeSale();
                    break;
                case 'F2':
                    e.preventDefault();
                    if (inputValue.trim()) {
                        handleFormSubmit();
                    } else {
                        inputRef.current?.focus();
                    }
                    break;
                case 'F4':
                    e.preventDefault();
                    if (loggedInUser.permissions.canCancelSale && cart.length > 0) {
                        setCancelModalOpen(true);
                    }
                    break;
            }
        };
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (keyDownHandlerRef.current) {
                keyDownHandlerRef.current(e);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


    const addProductToCart = (searchTerm: string) => {
        let product = products.find(p => p.barcode === searchTerm);

        if (!product) {
            const matchingProducts = products.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.active
            );
            if (matchingProducts.length === 1) {
                product = matchingProducts[0];
            } else if (matchingProducts.length > 1) {
                // Auto-select the first match if multiple are found (Smart Enter)
                // This satisfies "auto-fill" behavior for partial or full name matches
                product = matchingProducts[0];
            }
        }

        if (!product) {
            alert("Produto não encontrado!");
            return;
        }

        if (!product.active) {
            alert("Este produto está inativo e não pode ser vendido.");
            return;
        }

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const handleSuggestionClick = (product: Product) => {
        addProductToCart(product.barcode);
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const removeItem = (productId: number) => {
        setCart(cart => cart.filter(item => item.id !== productId));
    };

    const updateItemQuantity = (productId: number, newQuantity: number) => {
        setCart(currentCart => {
            if (newQuantity <= 0) {
                return currentCart.filter(item => item.id !== productId);
            }
            return currentCart.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            );
        });
    };

    const handleConfirmPayment = (details: { payments: Array<{ method: PaymentMethod; amount: number; }>; totalPaid: number; change: number; discount: number; }) => {
        const subtotal = total;
        const saleData: Omit<CompletedSale, 'id'> = {
            cart,
            subtotal: subtotal,
            discount: details.discount,
            total: subtotal - details.discount,
            paymentMethod: details.payments.length > 1 ? 'Múltiplo' : details.payments[0].method,
            amountPaid: details.totalPaid,
            change: details.change,
            date: new Date().toISOString(),
            operatorName: loggedInUser.name,
            cashierNumber: cashierState.cashierNumber!,
            status: 'completed',
            payments: details.payments,
        };
        onSaleComplete(saleData);
        setCompletedSale({ ...saleData, id: Date.now() }); // Use temporary ID for receipt modal
        setPaymentModalOpen(false);
        setReceiptModalOpen(true);
    };

    const handleConfirmFiado = (customerName: string, discount: number) => {
        onFiadoSale(cart, customerName, discount);
        setPaymentModalOpen(false);
        alert(`Venda fiado para '${customerName}' registrada com sucesso!`);
        handleNewSale();
    };

    const handleConfirmInternalUse = () => {
        onInternalUse(cart);
        setPaymentModalOpen(false);
        alert('Saída para uso interno registrada com sucesso!');
        handleNewSale();
    };

    const handleConfirmCancelSale = () => {
        onCancelSale(cart, total);
        setCancelModalOpen(false);
        handleNewSale();
    };

    const handleNewSale = () => {
        setCart([]);
        setCompletedSale(null);
        setReceiptModalOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden">
            {cashierState.status === 'closed' && (
                <div className="absolute inset-0 bg-gray-950/90 flex flex-col items-center justify-center z-50 p-6 text-center backdrop-blur-sm">
                    <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-2xl shadow-red-500/10">
                        <svg className="w-10 h-10 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase italic">Caixa Fechado</h2>
                    <p className="text-gray-400 text-lg font-medium max-w-md">Para iniciar as operações de venda, por favor, realize a abertura do caixa no menu lateral.</p>
                </div>
            )}

            <div className="flex-none p-4 md:p-6 border-b border-gray-800/50 bg-gray-900/20 backdrop-blur-md">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-900 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">PDV - Frente de Caixa</h1>
                            <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">Operador: {loggedInUser.name}</span>
                                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/5 border border-cyan-400/10 px-2 py-0.5 rounded">PDV #0{cashierState.cashierNumber || '1'}</span>
                                <div className="hidden md:flex items-center gap-2 ml-4 border-l border-white/10 pl-4">
                                    <div className="flex items-center gap-1.5">
                                        <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-cyan-400 text-[9px] font-black">F2</kbd>
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Busca</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-red-500 text-[9px] font-black">F4</kbd>
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Cancel</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-green-500 text-[9px] font-black">F9</kbd>
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Finaliz</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {cashierState.status === 'open' ? (
                            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 font-black text-[10px] tracking-[0.2em] px-5 py-2.5 rounded-full shadow-lg shadow-green-500/5">
                                <div className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </div>
                                <span>TERMINAL ATIVO</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] tracking-[0.2em] px-5 py-2.5 rounded-full shadow-lg shadow-red-500/5">
                                <div className="relative flex h-2 w-2">
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </div>
                                <span>TERMINAL BLOQUEADO</span>
                            </div>
                        )}
                    </div>
                </header>
            </div>

            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* Left Section: Search & Cart */}
                <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
                    <form onSubmit={handleFormSubmit} className="mb-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <svg className="w-6 h-6 text-cyan-500 transition-colors group-focus-within:text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                                </svg>
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onFocus={() => {
                                    if (suggestions.length > 0) {
                                        setShowSuggestions(true);
                                        setSelectedIndex(0);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (showSuggestions && suggestions.length > 0) {
                                        if (e.key === 'ArrowDown') {
                                            e.preventDefault();
                                            setSelectedIndex(prev => (prev + 1) % suggestions.length);
                                        } else if (e.key === 'ArrowUp') {
                                            e.preventDefault();
                                            setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                                        } else if (e.key === 'Enter' && selectedIndex >= 0) {
                                            e.preventDefault();
                                            handleSuggestionClick(suggestions[selectedIndex]);
                                        } else if (e.key === 'Escape') {
                                            setShowSuggestions(false);
                                        }
                                    }
                                }}
                                placeholder="Escaneie o barcode ou busque o produto (F2)..."
                                className="w-full bg-gray-900 border border-gray-800 text-white text-xl font-medium rounded-2xl py-5 pl-16 pr-6 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all focus:outline-none placeholder:text-gray-600 shadow-2xl"
                                autoComplete="off"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div ref={suggestionsRef} className="absolute z-20 w-full mt-3 bg-gray-900 border border-gray-800 rounded-2xl shadow-3xl max-h-80 overflow-y-auto backdrop-blur-xl custom-scrollbar flex flex-col divide-y divide-gray-800/50 overflow-hidden ring-1 ring-white/5">
                                    {suggestions.map((product, index) => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => handleSuggestionClick(product)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`flex items-center justify-between px-6 py-4 text-left transition-all ${index === selectedIndex ? 'bg-cyan-600 text-white' : 'hover:bg-white/5 text-gray-300'}`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-black italic uppercase tracking-tighter text-lg leading-tight">{product.name}</span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${index === selectedIndex ? 'text-cyan-100' : 'text-gray-500'}`}>{product.barcode}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="font-black font-mono text-xl tracking-tighter">R$ {product.price.toFixed(2)}</span>
                                                <span className={`text-[10px] font-bold uppercase ${product.stock_quantity > 0 ? (index === selectedIndex ? 'text-green-200' : 'text-green-500/80') : 'text-red-500'}`}>Estoque: {product.stock_quantity}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </form>

                    <div className="flex-1 bg-gray-900/40 border border-gray-800/50 rounded-2xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-md">
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-900/80 border-b border-gray-800/50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 font-black italic uppercase tracking-widest text-[10px] text-gray-500">Produto selecionado</th>
                                        <th className="px-6 py-4 font-black italic uppercase tracking-widest text-[10px] text-gray-500 text-center">Quantidade</th>
                                        <th className="px-6 py-4 font-black italic uppercase tracking-widest text-[10px] text-gray-500 text-center">Estoque</th>
                                        <th className="px-6 py-4 font-black italic uppercase tracking-widest text-[10px] text-gray-500 text-right">Unitário</th>
                                        <th className="px-6 py-4 font-black italic uppercase tracking-widest text-[10px] text-gray-500 text-right">Subtotal</th>
                                        <th className="px-6 py-4 w-12 text-center text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/30">
                                    {cart.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-24 px-6 text-gray-600">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center text-gray-700">
                                                        <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-xl font-bold text-gray-500 italic uppercase">Carrinho Vazio</div>
                                                        <div className="text-xs font-medium text-gray-600 uppercase tracking-tighter mt-1">Aguardando leitura do código de barras...</div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        cart.map(item => (
                                            <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors border-l-2 border-transparent hover:border-cyan-500/50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-black text-white italic uppercase tracking-tighter">{item.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-500 font-mono tracking-widest">{item.barcode}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                                            className="w-8 h-8 rounded-lg text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-all flex items-center justify-center border border-gray-700/50"
                                                            aria-label="Diminuir"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4"></path></svg>
                                                        </button>
                                                        <div className="w-16">
                                                            <QuantityInput
                                                                value={item.quantity}
                                                                onChange={(newQuantity) => updateItemQuantity(item.id, newQuantity)}
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 rounded-lg text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-all flex items-center justify-center border border-gray-700/50"
                                                            aria-label="Aumentar"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v12m6-6H6"></path></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`text-[11px] font-black uppercase tracking-tighter rounded-full border px-2 py-0.5 ${item.stock_quantity <= item.min_stock_alert ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-gray-800/50 text-gray-400 border-gray-700/50'}`}>
                                                        {item.stock_quantity.toLocaleString('pt-BR')} {item.unit_abbreviation || 'UN'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-bold text-gray-400 font-mono italic">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-lg font-black text-white font-mono tracking-tighter">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Summary */}
                <aside className="w-full lg:w-[420px] bg-gray-900/60 border-l border-gray-800/50 p-4 md:px-6 md:py-4 flex flex-col shadow-2xl backdrop-blur-3xl lg:h-full overflow-y-auto custom-scrollbar">
                    <div className="flex-1 flex flex-col justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 2v-6m-8 9h11a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>
                                Resumo da Venda
                            </h2>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Subtotal</span>
                                    <span className="text-lg font-bold text-gray-300 font-mono tracking-tighter">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Descontos</span>
                                    <span className="text-lg font-bold text-red-500/80 font-mono tracking-tighter">R$ 0,00</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Itens</span>
                                    <span className="text-lg font-bold text-gray-300 font-mono tracking-tighter">{cart.reduce((sum, item) => sum + item.quantity, 0).toLocaleString('pt-BR')} UN</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className="bg-gray-950/50 border border-white/5 rounded-2xl p-4 md:p-5 mb-4 shadow-inner overflow-hidden relative group">
                                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] block mb-1">Valor Total</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-black text-cyan-400 italic font-mono">R$</span>
                                    <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tighter tabular-nums drop-shadow-2xl">
                                        {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleFinalizeSale}
                                    disabled={cart.length === 0}
                                    className="w-full h-14 bg-gradient-to-br from-cyan-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 disabled:from-gray-800 disabled:to-gray-900 text-white font-black text-lg italic tracking-tighter uppercase rounded-xl transition-all shadow-xl shadow-cyan-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    <span>Finalizar Venda</span>
                                    <kbd className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded border border-white/10 not-italic font-bold">F9</kbd>
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setCart([])}
                                        disabled={cart.length === 0}
                                        className="h-10 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 font-bold uppercase tracking-widest text-[9px] rounded-lg transition-all border border-white/5 active:scale-95"
                                    >
                                        Limpar
                                    </button>
                                    {loggedInUser.permissions.canCancelSale && (
                                        <button
                                            onClick={() => setCancelModalOpen(true)}
                                            disabled={cart.length === 0}
                                            className="h-10 bg-red-950/20 hover:bg-red-900/30 text-red-500 font-bold uppercase tracking-widest text-[9px] rounded-lg transition-all border border-red-500/10 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                                        >
                                            Cancelar <kbd className="text-[8px] bg-black/40 px-1 py-0.5 rounded border border-white/5 opacity-60 not-italic">F4</kbd>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                onConfirm={handleConfirmPayment}
                onFiadoConfirm={handleConfirmFiado}
                onInternalUseConfirm={handleConfirmInternalUse}
                total={total}
                customers={customers}
            />

            <ReceiptModal
                isOpen={isReceiptModalOpen}
                onNewSale={handleNewSale}
                saleData={completedSale}
            />

            <CancelSaleModal
                isOpen={isCancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={handleConfirmCancelSale}
            />
        </div>
    );
};

export default PosScreen;