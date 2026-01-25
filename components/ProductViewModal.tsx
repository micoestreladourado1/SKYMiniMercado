
import React from 'react';
import ReactDOM from 'react-dom';
import { Product } from '../types';

interface ProductViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    categoryName: string;
    unitName: string;
}

const modalRoot = document.getElementById('modal-root');

const DetailRow: React.FC<{ label: string; value: string | number | React.ReactNode; isHighlighted?: boolean }> = ({ label, value, isHighlighted }) => (
    <div className="grid grid-cols-2 gap-2 py-2 border-b border-gray-700/50">
        <span className="font-medium text-gray-400">{label}</span>
        <span className={`text-right ${isHighlighted ? 'font-bold text-cyan-300' : 'text-white'}`}>{value}</span>
    </div>
);

const ProductViewModal: React.FC<ProductViewModalProps> = ({ isOpen, onClose, product, categoryName, unitName }) => {
    if (!isOpen || !product || !modalRoot) return null;

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                        <p className="font-mono text-gray-400">{product.barcode}</p>
                    </div>
                     <span className={`px-3 py-1 text-sm font-bold rounded-full ${product.active ? 'bg-green-500/20 text-green-300' : 'bg-gray-600/50 text-gray-400'}`}>
                        {product.active ? 'Ativo' : 'Inativo'}
                    </span>
                </div>

                <div className="space-y-1">
                    <DetailRow label="Categoria" value={categoryName} />
                    <DetailRow label="Unidade de Medida" value={unitName} />
                    <DetailRow label="Preço de Venda" value={`R$ ${product.price.toFixed(2)}`} isHighlighted />
                    <DetailRow label="Preço de Custo" value={`R$ ${product.cost_price.toFixed(2)}`} />
                    <DetailRow label="Estoque Atual" value={`${product.stock_quantity}`} isHighlighted />
                    <DetailRow label="Estoque Mínimo" value={product.min_stock_alert} />
                </div>

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

export default ProductViewModal;