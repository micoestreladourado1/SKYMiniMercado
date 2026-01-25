
// Import React to make the JSX namespace available.
import React from 'react';
import { AppScreen } from '../types';

interface SidebarProps {
    currentScreen: AppScreen;
    setCurrentScreen: (screen: AppScreen) => void;
}

const NavButton: React.FC<{
    screen: AppScreen;
    currentScreen: AppScreen;
    onClick: (screen: AppScreen) => void;
    // FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    icon: React.ReactElement;
    label: string;
}> = ({ screen, currentScreen, onClick, icon, label }) => {
    const isActive = screen === currentScreen;
    return (
        <button
            onClick={() => onClick(screen)}
            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentScreen, setCurrentScreen }) => {
    return (
        <aside className="w-64 bg-gray-900 border-r border-gray-700/50 flex-shrink-0 flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-gray-700/50">
                <svg className="w-8 h-8 mr-2 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h9.75a2.25 2.25 0 0 1 2.25 2.25Z" />
                </svg>
                <h1 className="text-xl font-bold text-white">SKYMiniMercado</h1>
            </div>
            <nav className="flex-1 p-3 space-y-1">
                <NavButton
                    screen="dashboard"
                    currentScreen={currentScreen}
                    onClick={setCurrentScreen}
                    label="Dashboard"
                    icon={<svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>}
                />
                <NavButton
                    screen="pos"
                    currentScreen={currentScreen}
                    onClick={setCurrentScreen}
                    label="PDV"
                    icon={<svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" /></svg>}
                />
                <NavButton
                    screen="sales"
                    currentScreen={currentScreen}
                    onClick={setCurrentScreen}
                    label="Vendas"
                    icon={<svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>}
                />
                <NavButton
                    screen="cashier"
                    currentScreen={currentScreen}
                    onClick={setCurrentScreen}
                    label="Caixa"
                    icon={<svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125h.375m18 0h.375a1.125 1.125 0 0 0 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125h-.375m-18 0h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375" /></svg>}
                />
                <NavButton
                    screen="products"
                    currentScreen={currentScreen}
                    onClick={setCurrentScreen}
                    label="Produtos"
                    icon={<svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6A1.125 1.125 0 0 1 2.25 10.875v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" /></svg>}
                />
                <NavButton
                    screen="stock"
                    currentScreen={currentScreen}
                    onClick={setCurrentScreen}
                    label="Estoque"
                    icon={<svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>}
                />
                <NavButton
                    screen="shoppingList"
                    currentScreen={currentScreen}
                    onClick={setCurrentScreen}
                    label="Lista de compra"
                    icon={<svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>}
                />
                <NavButton
                    screen="categories"
                    currentScreen={currentScreen}
                    onClick={setCurrentScreen}
                    label="Categorias"
                    icon={<svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>}
                />
                <NavButton
                    screen="units"
                    currentScreen={currentScreen}
                    onClick={setCurrentScreen}
                    label="Unidades"
                    icon={<svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75v-2.25m0 2.25l2.25-1.313M12 21.75l-2.25-1.313M12 21.75v-2.25m6-13.5l2.25-1.313M18 5.25l-2.25-1.313M18 5.25v2.25m-12 0l2.25-1.313M6 5.25l-2.25-1.313M6 5.25v2.25" /></svg>}
                />
                <NavButton
                    screen="customers"
                    currentScreen={currentScreen}
                    onClick={setCurrentScreen}
                    label="Clientes"
                    icon={<svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.125-2.31 9.584 9.584 0 0 0-2.625-3.75m-16.5 3.75a9.375 9.375 0 0 1 16.5 0M12 12.75a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" /></svg>}
                />
                <NavButton
                    screen="receivables"
                    currentScreen={currentScreen}
                    onClick={setCurrentScreen}
                    label="Contas a Receber"
                    icon={<svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>}
                />
                <NavButton
                    screen="internalUse"
                    currentScreen={currentScreen}
                    onClick={setCurrentScreen}
                    label="Uso Interno"
                    icon={<svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>}
                />
                <NavButton
                    screen="employees"
                    currentScreen={currentScreen}
                    onClick={setCurrentScreen}
                    label="Funcionários"
                    icon={<svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.928A9.083 9.083 0 0 1 12 3.75a9.083 9.083 0 0 1 5.25 1.905m-7.5 3.512A9.083 9.083 0 0 1 12 6.75a9.083 9.083 0 0 1 5.25 1.905m-7.5 3.512A9.083 9.083 0 0 1 12 9.75a9.083 9.083 0 0 1 5.25 1.905m-7.5 3.512A9.083 9.083 0 0 1 12 12.75a9.083 9.083 0 0 1 5.25 1.905m-7.5 3.512A9.083 9.083 0 0 1 12 15.75a9.083 9.083 0 0 1 5.25 1.905m-7.5 3.512A9.083 9.083 0 0 1 12 18.75a9.083 9.083 0 0 1 5.25 1.905m-10.5-9.252A9.083 9.083 0 0 1 3.75 12.75a9.083 9.083 0 0 1-1.905 5.25m3.512-7.5a9.083 9.083 0 0 1-1.905 5.25m3.512-7.5a9.083 9.083 0 0 1-1.905 5.25m3.512-7.5a9.083 9.083 0 0 1-1.905 5.25m3.512-7.5a9.083 9.083 0 0 1-1.905 5.25M12 3.75a9.083 9.083 0 0 1-5.25 1.905m7.5 14.25a9.083 9.083 0 0 1-5.25 1.905m7.5-1.905a9.083 9.083 0 0 1-5.25 1.905m3.512-7.5a9.083 9.083 0 0 1-1.905 5.25m-3.512-7.5a9.083 9.083 0 0 1-1.905 5.25" /></svg>}
                />
            </nav>
            <div className="p-4 border-t border-gray-700/50">
                <NavButton
                    screen="settings"
                    currentScreen={currentScreen}
                    onClick={setCurrentScreen}
                    label="Configurações"
                    icon={<svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15 0H3.75m16.5 0h-1.5m-1.5 0a3 3 0 0 0-3-3m-3 3a3 3 0 0 0-3-3m-3 3a3 3 0 0 0-3-3m0 0a3 3 0 0 0 3 3m3-3a3 3 0 0 0 3-3m-3 3a3 3 0 0 0 3-3m0 0a3 3 0 0 0-3 3m3 3a3 3 0 0 0-3-3m3 3a3 3 0 0 0 3 3m-3-3a3 3 0 0 0 3 3m0 0a3 3 0 0 0-3-3m-3 3a3 3 0 0 0-3 3" /></svg>}
                />
            </div>
        </aside>
    );
};

export default Sidebar;