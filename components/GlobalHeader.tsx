
import React, { useState, useEffect } from 'react';
import { CashierState, DashboardAlert } from '../types';

interface GlobalHeaderProps {
    cashierState: CashierState;
    alerts: DashboardAlert[];
    onBellClick: () => void;
    onLogout: () => void;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ cashierState, alerts, onBellClick, onLogout }) => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const cashierStatusInfo = {
        open: { label: 'Caixa Aberto', icon: <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>, style: 'text-green-300' },
        closed: { label: 'Caixa Fechado', icon: <span className="relative flex h-3 w-3"><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>, style: 'text-red-400' },
        divergence: { label: 'Divergência', icon: <span className="relative flex h-3 w-3"><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>, style: 'text-red-400' },
    };
    
    const status = cashierStatusInfo[cashierState.status] || cashierStatusInfo.closed;
    const alertCount = alerts.length;

    return (
        <header className="flex-shrink-0 bg-gray-900 border-b border-gray-700/50 h-16 flex items-center justify-between px-6">
            <div className={`flex items-center gap-3 font-bold text-sm ${status.style}`}>
                {status.icon}
                <span>{status.label.toUpperCase()}</span>
            </div>
            <div className="font-mono text-center text-gray-300">
                <div>{currentDateTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div className="text-lg font-bold">{currentDateTime.toLocaleTimeString('pt-BR')}</div>
            </div>
            <div className="flex items-center gap-6">
                <button onClick={onBellClick} className="relative text-gray-400 hover:text-white transition-all active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {alertCount > 0 && (
                        <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                            {alertCount}
                        </span>
                    )}
                </button>
                 <button onClick={onLogout} className="text-gray-400 hover:text-white transition-all active:scale-95" title="Sair">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default GlobalHeader;
