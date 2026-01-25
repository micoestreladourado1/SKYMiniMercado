
import React, { useState } from 'react';
import { SystemSettings } from '../types';
import GeneralSettingsForm from './settings/GeneralSettingsForm';

interface SettingsScreenProps {
    settings: SystemSettings;
    onSave: (newSettings: SystemSettings) => void;
}

type SettingsSection = 
    | 'general' | 'store' | 'pos' | 'users' | 'sales' | 'payment' | 'stock' 
    | 'pricing' | 'receipt' | 'cancellation' | 'financial' | 'reports' 
    | 'alerts' | 'audit' | 'system';

const SETTINGS_SECTIONS: { key: SettingsSection, label: string }[] = [
    { key: 'general', label: 'Configurações Gerais' },
    { key: 'store', label: 'Loja / Filial' },
    { key: 'pos', label: 'Caixa (PDV)' },
    { key: 'users', label: 'Usuários e Perfis' },
    { key: 'sales', label: 'Vendas' },
    { key: 'payment', label: 'Formas de Pagamento' },
    { key: 'stock', label: 'Estoque' },
    { key: 'pricing', label: 'Preços' },
    { key: 'receipt', label: 'Cupom Não Fiscal' },
    { key: 'cancellation', label: 'Cancelamento e Estorno' },
    { key: 'financial', label: 'Financeiro' },
    { key: 'reports', label: 'Relatórios' },
    { key: 'alerts', label: 'Alertas Inteligentes' },
    { key: 'audit', label: 'Auditoria e Logs' },
    { key: 'system', label: 'Sistema' },
];

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, onSave }) => {
    const [activeSection, setActiveSection] = useState<SettingsSection>('general');

    const renderSection = () => {
        switch (activeSection) {
            case 'general':
                return <GeneralSettingsForm settings={settings} onSave={onSave} />;
            // Outras seções serão renderizadas aqui no futuro
            default:
                return (
                    <div className="text-center p-10 bg-gray-800/50 rounded-lg">
                        <h2 className="text-2xl font-bold text-white mb-2">Seção em Desenvolvimento</h2>
                        <p className="text-gray-400">
                            A funcionalidade para "{SETTINGS_SECTIONS.find(s => s.key === activeSection)?.label}" está sendo preparada.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="p-6 h-screen flex flex-col">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-white">Configurações do Sistema</h1>
                <p className="text-gray-400">Controle total sobre as operações do seu supermercado.</p>
            </header>

            <div className="flex-1 grid grid-cols-4 gap-6 overflow-hidden">
                {/* Menu de Navegação das Configurações */}
                <aside className="col-span-1 bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 overflow-y-auto">
                    <nav className="space-y-1">
                        {SETTINGS_SECTIONS.map(section => (
                            <button
                                key={section.key}
                                onClick={() => setActiveSection(section.key)}
                                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150 ${
                                    activeSection === section.key
                                        ? 'bg-cyan-500/20 text-cyan-300'
                                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                }`}
                            >
                                {section.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Conteúdo da Seção */}
                <main className="col-span-3 overflow-y-auto pr-2">
                    {renderSection()}
                </main>
            </div>
        </div>
    );
};

export default SettingsScreen;
