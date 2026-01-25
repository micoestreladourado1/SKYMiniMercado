
import React from 'react';
import ReactDOM from 'react-dom';
import { CompletedSale } from '../types';

interface SaleDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: CompletedSale | null;
}

const modalRoot = document.getElementById('modal-root');

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({ isOpen, onClose, sale }) => {
    if (!isOpen || !sale || !modalRoot) return null;

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Detalhes da Venda #{sale.id}</h2>
                        <p className="font-mono text-gray-400">{new Date(sale.date).toLocaleString('pt-BR')}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4 p-4 bg-gray-900/50 rounded-lg text-sm">
                    <div>
                        <p className="text-gray-400">Operador</p>
                        <p className="font-bold text-white">{sale.operatorName}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Status</p>
                        <p className="font-bold text-white capitalize">{sale.status}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Subtotal</p>
                        <p className="font-bold text-white">R$ {sale.subtotal.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Total Final</p>
                        <p className="text-xl font-bold text-cyan-400">R$ {sale.total.toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden flex flex-col max-h-80">
                    <div className="overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-900/60 sticky top-0">
                                <tr>
                                    <th className="p-3 font-semibold">Produto</th>
                                    <th className="p-3 font-semibold text-center">Qtd.</th>
                                    <th className="p-3 font-semibold text-right">Preço Unit.</th>
                                    <th className="p-3 font-semibold text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.cart.map(item => (
                                    <tr key={item.id} className="border-b border-gray-700/50 last:border-0">
                                        <td className="p-3">{item.name}</td>
                                        <td className="p-3 text-center">{item.quantity}</td>
                                        <td className="p-3 text-right">R$ {item.price.toFixed(2)}</td>
                                        <td className="p-3 text-right font-medium">R$ {(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {(sale.status === 'reversed' && sale.cancellationReason) && (
                    <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-700/50 rounded-lg text-sm">
                        <p><strong>Motivo do Estorno:</strong> {sale.cancellationReason}</p>
                        <p><strong>Estornado por:</strong> {sale.reversedBy} em {sale.reversedAt}</p>
                    </div>
                )}
                {sale.discount > 0 && (
                    <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg text-sm text-center">
                        <p><strong>Desconto Aplicado:</strong> <span className="font-bold text-white">R$ {sale.discount.toFixed(2)}</span></p>
                    </div>
                )}


                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-md transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, modalRoot);
};

export default SaleDetailsModal;
