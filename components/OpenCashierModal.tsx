
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Employee } from '../types';
import CurrencyInput from './CurrencyInput';

interface OpenCashierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (details: { operatorId: string, balance: number }) => void;
    employees: Employee[];
    loggedInUser: Employee;
}

const modalRoot = document.getElementById('modal-root');

const OpenCashierModal: React.FC<OpenCashierModalProps> = ({ isOpen, onClose, onConfirm, employees, loggedInUser }) => {
    const [operatorId, setOperatorId] = useState<string>('');
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {
        if (isOpen && loggedInUser) {
            setOperatorId(String(loggedInUser.id));
            setBalance(0); // Reseta o saldo ao abrir
        }
    }, [isOpen, loggedInUser]);

    const handleSubmit = () => {
        if (!operatorId) {
            alert('Por favor, selecione um operador.');
            return;
        }
        if (balance <= 0) {
            alert('O valor de abertura deve ser maior que zero.');
            return;
        }
        onConfirm({ operatorId, balance });
    };

    if (!isOpen || !modalRoot) return null;

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">Abrir Caixa</h2>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="operator-select" className="block text-sm font-medium text-gray-300 mb-1">
                            Operador do Caixa
                        </label>
                        <select
                            id="operator-select"
                            value={operatorId}
                            onChange={(e) => setOperatorId(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            <option value="" disabled>Selecione um funcionário...</option>
                            {employees.filter(e => e.isActive).map(employee => (
                                <option key={employee.id} value={employee.id}>{employee.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="opening-balance" className="block text-sm font-medium text-gray-300 mb-1">
                            Valor de Abertura (Suprimento)
                        </label>
                        <CurrencyInput
                            value={balance}
                            onChange={setBalance}
                            className="w-full bg-gray-900 border border-gray-600 text-white text-3xl text-center rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                    <button onClick={onClose} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-md transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-md transition-colors"
                    >
                        Confirmar Abertura
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, modalRoot);
};

export default OpenCashierModal;
