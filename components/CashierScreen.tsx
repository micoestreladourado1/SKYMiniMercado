import React, { useState } from 'react';
import { CashierState, Employee, SystemSettings } from '../types';
import OpenCashierModal from './OpenCashierModal';
import CashierConfirmationModal from './CashierConfirmationModal';
import CloseCashierModal from './CloseCashierModal';

interface CashierScreenProps {
    cashierState: CashierState;
    onOpenCashier: (details: { openingBalance: number; operatorName: string }) => void;
    onCloseCashier: () => void;
    employees: Employee[];
    loggedInUser: Employee;
    settings?: SystemSettings;
}

const CashierScreen: React.FC<CashierScreenProps> = ({ cashierState, onOpenCashier, onCloseCashier, employees, loggedInUser, settings }) => {
    const [isOpeningModalOpen, setOpeningModalOpen] = useState(false);
    const [isClosingModalOpen, setClosingModalOpen] = useState(false);
    const [openingDetails, setOpeningDetails] = useState<{ operatorName: string; openingBalance: number } | null>(null);

    const handleOpenCashierSubmit = (details: { operatorId: string, balance: number }) => {
        const operator = employees.find(e => e.id === details.operatorId);
        if (operator) {
            setOpeningDetails({ operatorName: operator.name, openingBalance: details.balance });
            setOpeningModalOpen(false); // Fecha o primeiro modal e prepara para abrir o segundo
        } else {
            alert('Operador não encontrado.');
        }
    };

    const handleConfirmAndExport = () => {
        if (openingDetails) {
            onOpenCashier(openingDetails);
            setOpeningDetails(null); // Limpa os detalhes e fecha o modal.
        }
    };

    const handleCloseConfirmation = () => {
        setOpeningDetails(null); // Apenas fecha o modal de confirmação
    };

    const handleCorrectDetails = () => {
        setOpeningDetails(null); // Fecha o modal de confirmação
        setOpeningModalOpen(true); // Reabre o modal de entrada
    };

    const handleConfirmCloseCashier = () => {
        onCloseCashier();
        setClosingModalOpen(false);
    };

    return (
        <>
            <div className="p-6 h-screen flex flex-col">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-white">Gerenciamento de Caixa</h1>
                    <p className="text-gray-400">Realize a abertura e o fechamento do seu caixa.</p>
                </header>

                {cashierState.status === 'open' && (
                    <div className="mb-8 bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 max-w-md mx-auto text-center">
                        <h2 className="text-xl font-bold text-green-400 mb-2">Caixa Aberto</h2>
                        <div className="text-gray-300 space-y-1">
                            <p><strong>Operador:</strong> {cashierState.operatorName}</p>
                            <p><strong>Data/Hora Abertura:</strong> {cashierState.openTime}</p>
                            <p><strong>Valor Inicial:</strong> <span className="font-bold">R$ {cashierState.openingBalance?.toFixed(2)}</span></p>
                        </div>
                    </div>
                )}


                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-full max-w-md space-y-4">
                        <button
                            onClick={() => setOpeningModalOpen(true)}
                            disabled={cashierState.status === 'open'}
                            className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold text-xl py-6 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                            </svg>
                            Abrir Caixa
                        </button>
                        <button
                            onClick={() => setClosingModalOpen(true)}
                            disabled={cashierState.status === 'closed'}
                            className="w-full flex items-center justify-center gap-3 bg-red-800 hover:bg-red-700 text-white font-bold text-xl py-6 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                            </svg>
                            Fechar Caixa
                        </button>
                    </div>
                </div>
            </div>

            <OpenCashierModal
                isOpen={isOpeningModalOpen}
                onClose={() => setOpeningModalOpen(false)}
                onConfirm={handleOpenCashierSubmit}
                employees={employees}
                loggedInUser={loggedInUser}
            />

            <CashierConfirmationModal
                isOpen={!!openingDetails}
                onClose={handleCloseConfirmation}
                onCorrect={handleCorrectDetails}
                onConfirmAndExport={handleConfirmAndExport}
                details={openingDetails}
            />

            <CloseCashierModal
                isOpen={isClosingModalOpen}
                onClose={() => setClosingModalOpen(false)}
                onConfirmClose={handleConfirmCloseCashier}
                cashierState={cashierState}
                sessionSales={cashierState.sessionSales || []}
                settings={settings}
            />
        </>
    );
};

export default CashierScreen;