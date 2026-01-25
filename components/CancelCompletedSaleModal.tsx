
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CompletedSale } from '../types';

interface CancelCompletedSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    sale: CompletedSale | null;
}

const modalRoot = document.getElementById('modal-root');

const CANCELLATION_REASONS = [
    "Desistência do Cliente",
    "Produto Errado",
    "Erro de Preço",
    "Produto com Defeito",
    "Erro do Operador"
];

const CancelCompletedSaleModal: React.FC<CancelCompletedSaleModalProps> = ({ isOpen, onClose, onConfirm, sale }) => {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (isOpen) {
            setReason(''); // Reset reason when modal opens
        }
    }, [isOpen]);

    if (!isOpen || !sale || !modalRoot) return null;

    const handleConfirm = () => {
        if (!reason) {
            alert('Por favor, selecione um motivo para o estorno.');
            return;
        }
        onConfirm(reason);
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-800/50">
                        <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white ml-4">Estornar Venda Concluída</h2>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-md mb-4 text-sm">
                    <p><strong>ID da Venda:</strong> {sale.id}</p>
                    <p><strong>Data:</strong> {sale.date}</p>
                    <p><strong>Valor Total:</strong> <span className="font-bold text-lg">R$ {sale.total.toFixed(2)}</span></p>
                </div>
                
                <div>
                    <label htmlFor="reason-select" className="block text-sm font-medium text-gray-300 mb-1">
                        Motivo do Estorno (Obrigatório)
                    </label>
                    <select
                        id="reason-select"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        <option value="">Selecione um motivo...</option>
                        {CANCELLATION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                
                <p className="text-red-400 font-semibold mt-4 text-sm text-center">
                    Esta ação irá retornar os produtos ao estoque e registrar uma movimentação negativa no caixa. Não pode ser desfeita.
                </p>

                <div className="flex justify-end space-x-4 mt-8">
                    <button onClick={onClose} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-md transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!reason}
                        className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        Confirmar Estorno
                    </button>
                </div>
            </div>
        </div>
    );
    
    return ReactDOM.createPortal(modalContent, modalRoot);
};

export default CancelCompletedSaleModal;
