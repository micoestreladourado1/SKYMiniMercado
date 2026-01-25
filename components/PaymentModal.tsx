
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { PaymentMethod, Customer } from '../types';
import CurrencyInput from './CurrencyInput';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (details: {
        payments: Array<{ method: PaymentMethod; amount: number; }>;
        totalPaid: number;
        change: number;
        discount: number;
    }) => void;
    onFiadoConfirm: (customerName: string, discount: number) => void;
    onInternalUseConfirm: () => void;
    total: number;
    customers: Customer[];
}

const modalRoot = document.getElementById('modal-root');

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, onFiadoConfirm, onInternalUseConfirm, total, customers }) => {
    const [payments, setPayments] = useState<Array<{ method: PaymentMethod; amount: number }>>([]);
    const [currentMethod, setCurrentMethod] = useState<PaymentMethod>('Dinheiro');
    const [currentAmount, setCurrentAmount] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [discount, setDiscount] = useState(0);

    const amountInputRef = useRef<HTMLInputElement>(null);
    const subtotal = total;

    const finalTotal = useMemo(() => {
        const calculated = subtotal - discount;
        return calculated < 0 ? 0 : calculated;
    }, [subtotal, discount]);

    const { totalPaid, remainingAmount } = useMemo(() => {
        const paid = payments.reduce((acc, p) => acc + p.amount, 0);
        return {
            totalPaid: paid,
            remainingAmount: finalTotal - paid,
        };
    }, [payments, finalTotal]);

    const change = useMemo(() => {
        return totalPaid > finalTotal ? totalPaid - finalTotal : 0;
    }, [totalPaid, finalTotal]);

    useEffect(() => {
        if (isOpen) {
            resetState();
        }
    }, [isOpen]);

    // Update the input value when the remaining amount changes (e.g. discount applied)
    useEffect(() => {
        if (isOpen) {
            setCurrentAmount(remainingAmount > 0 ? remainingAmount.toFixed(2).replace('.', ',') : '');
        }
    }, [isOpen, remainingAmount]);

    // Focus only when opening or adding/removing payments, NOT when typing discount
    useEffect(() => {
        if (isOpen && remainingAmount > 0.001) {
            setTimeout(() => amountInputRef.current?.focus(), 100);
        }
    }, [isOpen, payments.length]);


    const resetState = () => {
        setPayments([]);
        setCurrentMethod('Dinheiro');
        setCurrentAmount('');
        setSelectedCustomerId('');
        setDiscount(0);
    };

    const handleDiscountChange = (newDiscount: number) => {
        if (newDiscount > subtotal) {
            setDiscount(subtotal);
        } else if (newDiscount < 0) {
            setDiscount(0);
        } else {
            setDiscount(newDiscount);
        }
    };

    const handleAddPayment = () => {
        const amount = parseFloat(currentAmount.replace(',', '.')) || 0;
        if (amount <= 0) {
            alert('O valor do pagamento deve ser maior que zero.');
            return;
        }

        if (currentMethod !== 'Dinheiro' && amount > remainingAmount + 0.001) { // Tolerância para float
            alert(`O valor para ${currentMethod} não pode exceder o restante de R$ ${remainingAmount.toFixed(2)}.`);
            return;
        }

        setPayments([...payments, { method: currentMethod, amount }]);
        setCurrentAmount('');
    };

    const handleRemovePayment = (index: number) => {
        setPayments(payments.filter((_, i) => i !== index));
    };

    const handleConfirm = () => {
        if (remainingAmount > 0.001) {
            alert('Ainda há um valor restante a ser pago.');
            return;
        }
        onConfirm({ payments, totalPaid, change, discount });
        resetState();
    };

    const handleFiado = () => {
        if (!selectedCustomerId) {
            alert('Por favor, selecione um cliente para a venda fiado.');
            return;
        }
        const customer = customers.find(c => c.id === parseInt(selectedCustomerId, 10));
        if (customer) {
            onFiadoConfirm(customer.name, discount);
            resetState();
        }
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    if (!isOpen || !modalRoot) return null;

    const paymentMethods: PaymentMethod[] = ['Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'PIX'];

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-4 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-3">Finalizar Venda</h2>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                    <div>
                        <label htmlFor="customer-select" className="block text-xs font-medium text-gray-300 mb-1">Cliente (Opcional)</label>
                        <select
                            id="customer-select"
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            <option value="">Selecione um cliente...</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="discount-input" className="block text-xs font-medium text-gray-300 mb-1">Desconto (R$)</label>
                        <CurrencyInput
                            value={discount}
                            onChange={handleDiscountChange}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center mb-3 p-2 bg-gray-900/50 rounded-lg">
                    <div>
                        <p className="text-xs text-gray-400">Subtotal</p>
                        <p className="text-lg font-bold text-gray-300">R$ {subtotal.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Total a Pagar</p>
                        <p className="text-xl font-bold text-cyan-400">R$ {finalTotal.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Total Pago</p>
                        <p className="text-xl font-bold text-green-400">R$ {totalPaid.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Restante</p>
                        <p className={`text-xl font-bold ${remainingAmount > 0 ? 'text-red-400' : 'text-gray-200'}`}>
                            R$ {Math.max(0, remainingAmount).toFixed(2)}
                        </p>
                    </div>
                </div>

                {payments.length > 0 && (
                    <div className="mb-2 space-y-1 max-h-20 overflow-y-auto pr-2">
                        {payments.map((p, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-700/50 p-1.5 rounded-md text-sm">
                                <span className="text-white font-medium">{p.method}: R$ {p.amount.toFixed(2)}</span>
                                <button onClick={() => handleRemovePayment(index)} className="text-red-400 hover:text-red-300">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {remainingAmount > 0.001 && (
                    <div className="mb-3 p-3 border border-gray-700 rounded-lg">
                        <p className="text-base font-semibold text-gray-300 mb-2">Adicionar Pagamento</p>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {paymentMethods.map(method => (
                                <button
                                    key={method}
                                    onClick={() => setCurrentMethod(method)}
                                    className={`py-2 px-1 rounded-md text-xs font-bold transition-all duration-200 ${currentMethod === method ? 'bg-cyan-600 text-white ring-2 ring-cyan-400' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                ref={amountInputRef}
                                type="text"
                                inputMode="decimal"
                                value={currentAmount}
                                onChange={e => setCurrentAmount(e.target.value)}
                                className="flex-1 w-full bg-gray-900 border border-gray-600 text-white text-xl text-center rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                placeholder="0,00"
                            />
                            <button onClick={handleAddPayment} className="px-4 py-2 h-full bg-green-600 hover:bg-green-500 text-white font-bold rounded-md transition-colors text-base">
                                Adicionar
                            </button>
                        </div>
                    </div>
                )}

                {payments.length === 0 && (
                    <div className="mb-3">
                        <p className="text-base font-semibold text-gray-300 mb-2">Outras Formas</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={handleFiado} className="py-2 rounded-md text-sm font-bold transition-all duration-200 bg-gray-700 text-gray-300 hover:bg-gray-600">
                                Fiado (Total)
                            </button>
                            <button onClick={onInternalUseConfirm} className="py-2 rounded-md text-sm font-bold transition-all duration-200 bg-gray-700 text-gray-300 hover:bg-gray-600">
                                Empresa (Total)
                            </button>
                        </div>
                    </div>
                )}

                <div className="mb-3 p-3 bg-gray-900/50 rounded-lg text-center">
                    <p className="text-gray-400 text-base">Troco</p>
                    <p className="text-2xl font-bold text-green-400">R$ {change.toFixed(2)}</p>
                </div>

                <div className="flex justify-end space-x-4 mt-4">
                    <button onClick={handleClose} className="px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-md transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={remainingAmount > 0.001}
                        className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        Confirmar Pagamento
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, modalRoot);
};

export default PaymentModal;
