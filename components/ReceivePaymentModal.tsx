
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ReceivableEntry, PaymentMethod } from '../types';

interface ReceivePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentMethod: PaymentMethod) => void;
    receivable: ReceivableEntry | null;
}

const modalRoot = document.getElementById('modal-root');

const PAYMENT_METHODS: PaymentMethod[] = ['Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'PIX'];

const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({ isOpen, onClose, onConfirm, receivable }) => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Dinheiro');

    useEffect(() => {
        if (isOpen) {
            setPaymentMethod('Dinheiro');
        }
    }, [isOpen]);

    if (!isOpen || !receivable || !modalRoot) return null;

    const handleConfirm = () => {
        onConfirm(paymentMethod);
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Receber Pagamento</h2>
                
                <div className="bg-gray-900/50 p-4 rounded-md mb-6 text-sm">
                    <p className="flex justify-between"><span>Cliente:</span> <span className="font-bold text-white">{receivable.customerName}</span></p>
                    <p className="flex justify-between mt-2"><span>Valor a Pagar:</span> <span className="font-bold text-xl text-cyan-400">R$ {receivable.total.toFixed(2)}</span></p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Forma de Pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {PAYMENT_METHODS.map(method => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={`p-3 rounded-md font-bold transition-all duration-200 ${paymentMethod === method ? 'bg-cyan-600 text-white ring-2 ring-cyan-400' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                {method}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                    <button onClick={onClose} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-md transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-md transition-colors"
                    >
                        Confirmar Recebimento
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, modalRoot);
};

export default ReceivePaymentModal;
