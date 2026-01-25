
import React from 'react';
import { DashboardAlert } from '../../types';

interface AlertsPanelProps {
    alerts: DashboardAlert[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
    const getAlertStyles = (type: 'critical' | 'warning') => {
        switch (type) {
            case 'critical':
                return {
                    bg: 'bg-red-500/5',
                    borderColor: 'border-red-500/30',
                    iconColor: 'text-red-400',
                    dotColor: 'bg-red-500',
                    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                };
            case 'warning':
            default:
                return {
                    bg: 'bg-amber-500/5',
                    borderColor: 'border-amber-500/30',
                    iconColor: 'text-amber-400',
                    dotColor: 'bg-amber-500',
                    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                };
        }
    };

    return (
        <div className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-md shadow-2xl transition-all hover:border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        Alertas e Avisos
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Notificações importantes do sistema</p>
                </div>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-3 custom-scrollbar">
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-gray-600 opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                        <p className="text-xs font-bold uppercase tracking-widest">Tudo regular por aqui</p>
                    </div>
                ) : (
                    alerts.map(alert => {
                        const styles = getAlertStyles(alert.type);
                        return (
                            <div key={alert.id} className={`group relative flex items-start p-4 rounded-xl border ${styles.bg} ${styles.borderColor} transition-all hover:bg-white/5`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gray-950 flex items-center justify-center ${styles.iconColor} border border-white/5`}>
                                    {styles.icon}
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-xs font-bold text-gray-300 leading-snug">{alert.message}</p>
                                    <p className="text-[10px] text-gray-500 mt-1 font-mono uppercase italic">{alert.timestamp.toLocaleTimeString('pt-BR')}</p>
                                </div>
                                <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${styles.dotColor} animate-pulse shadow-[0_0_8px] shadow-current`}></div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default AlertsPanel;
