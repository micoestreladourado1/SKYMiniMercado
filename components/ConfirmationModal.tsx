
import React from 'react';
import ReactDOM from 'react-dom';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
}

const modalRoot = document.getElementById('modal-root');

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen || !modalRoot) return null;

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700 text-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-800/50">
                    <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">{title}</h2>
                <div className="text-gray-400 mt-2">{message}</div>
                <div className="flex justify-center space-x-4 mt-8">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-md transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="px-6 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-md transition-colors"
                    >
                        Confirmar Exclusão
                    </button>
                </div>
            </div>
        </div>
    );
    return ReactDOM.createPortal(modalContent, modalRoot);
};

export default ConfirmationModal;
