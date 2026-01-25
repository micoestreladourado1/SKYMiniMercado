
import React, { useState, useEffect } from 'react';
import { SystemSettings, GeneralSettings } from '../../types';
import CurrencyInput from '../CurrencyInput';

interface GeneralSettingsFormProps {
    settings: SystemSettings;
    onSave: (newSettings: SystemSettings) => void;
}

const GeneralSettingsForm: React.FC<GeneralSettingsFormProps> = ({ settings, onSave }) => {
    const [formState, setFormState] = useState<GeneralSettings>(settings.general);

    useEffect(() => {
        setFormState(settings.general);
    }, [settings.general]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormState(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormState(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...settings, general: formState });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-4">1. Configurações Gerais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nome da Empresa</label>
                    <input type="text" name="companyName" value={formState.companyName} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nome Fantasia</label>
                    <input type="text" name="tradingName" value={formState.tradingName} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">CNPJ (informativo)</label>
                <input type="text" name="cnpj" value={formState.cnpj} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white md:max-w-xs" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Endereço e Contato</label>
                <textarea name="address" value={formState.address} onChange={(e) => setFormState(p => ({...p, address: e.target.value}))} rows={3} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"></textarea>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Meta de Venda Diária (R$)</label>
                 <CurrencyInput
                    value={formState.dailySalesGoal}
                    onChange={value => setFormState(prev => ({ ...prev, dailySalesGoal: value }))}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white md:max-w-xs"
                />
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-300 mb-1">Logo do Supermercado</label>
                 <div className="mt-1 flex items-center">
                    <span className="inline-block h-12 w-12 rounded-md overflow-hidden bg-gray-700">
                      {formState.logoUrl ? <img src={formState.logoUrl} alt="Logo" /> : <svg className="h-full w-full text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    </span>
                    <input type="file" className="ml-5 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"/>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Fuso Horário</label>
                    <select name="timezone" value={formState.timezone} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white">
                        <option>America/Sao_Paulo</option>
                        <option>America/Noronha</option>
                        <option>America/Manaus</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Idioma</label>
                    <select name="language" value={formState.language} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white">
                        <option value="pt-BR">Português (Brasil)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Moeda</label>
                    <select name="currency" value={formState.currency} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white">
                        <option value="BRL">Real (R$)</option>
                    </select>
                </div>
            </div>
            
            <div className="flex items-center">
                <input id="autoDateTime" name="autoDateTime" type="checkbox" checked={formState.autoDateTime} onChange={handleChange} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-cyan-500"/>
                <label htmlFor="autoDateTime" className="ml-2 block text-sm text-gray-300">Data e hora automáticas</label>
            </div>

            <div className="pt-5 border-t border-gray-700">
                <div className="flex justify-end">
                    <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-md transition-colors">
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </form>
    );
};

export default GeneralSettingsForm;
