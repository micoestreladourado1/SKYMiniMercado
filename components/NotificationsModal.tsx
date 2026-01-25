
import React from 'react';
import ReactDOM from 'react-dom';
import { DashboardAlert } from '../types';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    alerts: DashboardAlert[];
}

const modalRoot = document.getElementById('modal-root');

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, alerts }) => {
    if (!isOpen || !modalRoot) return null;

    const getAlertStyles = (type: 'critical' | 'warning') => {
        switch (type) {
            case 'critical':
                return {
                    iconColor: 'text-red-400',
                    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                };
            case 'warning':
            default:
                return {
                    iconColor: 'text-yellow-400',
                    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                };
        }
    };
    
    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-700">
                 <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-white">Notificações</h2>
                     <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {alerts.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">Nenhuma notificação no momento.</p>
                    ) : (
                        alerts.map(alert => {
                            const styles = getAlertStyles(alert.type);
                            return (
                                <div key={alert.id} className="flex items-start p-4 rounded-lg bg-gray-900/50">
                                    <div className={`flex-shrink-0 ${styles.iconColor}`}>{styles.icon}</div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-md font-medium text-gray-200">{alert.message}</p>
                                        <p className="text-sm text-gray-500">{alert.timestamp.toLocaleString('pt-BR')}</p>
                                    </div>
                                </div>
                            )
                        })
                    )}
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

export default NotificationsModal;
