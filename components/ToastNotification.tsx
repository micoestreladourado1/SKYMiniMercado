
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ToastNotificationProps {
    message: string;
    type: 'info' | 'success' | 'error';
    onClose: () => void;
}

const modalRoot = document.getElementById('modal-root');

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto-dismiss after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [onClose]);

    const config = {
        info: {
            bgColor: 'bg-cyan-600',
            icon: (
                <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
            ),
        },
        success: {
            bgColor: 'bg-green-600',
            icon: (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            ),
        },
        error: {
            bgColor: 'bg-red-600',
            icon: (
                 <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    };
    
    const { bgColor, icon } = config[type];

    if (!modalRoot) return null;

    const toastContent = (
        <div className="fixed bottom-5 right-5 z-[100] animate-slide-in-up">
            <div className={`flex items-center ${bgColor} text-white p-4 rounded-lg shadow-lg max-w-sm`}>
                <div className="flex-shrink-0 mr-3">{icon}</div>
                <div className="flex-1 font-medium">{message}</div>
                <button onClick={onClose} className="ml-4 text-white hover:bg-white/20 rounded-full p-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
             <style>{`
                @keyframes slide-in-up {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in-up {
                    animation: slide-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );

    return ReactDOM.createPortal(toastContent, modalRoot);
};

export default ToastNotification;
