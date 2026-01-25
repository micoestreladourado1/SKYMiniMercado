
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface PasswordResetScreenProps {
    onResetComplete: () => void;
}

const PasswordResetScreen: React.FC<PasswordResetScreenProps> = ({ onResetComplete }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
        } else {
            setSuccess('Senha redefinida com sucesso! Você já pode fazer o login.');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center p-6 font-sans">
            <div className="flex items-center mb-10">
                <svg className="w-10 h-10 mr-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h9.75a2.25 2.25 0 0 1 2.25 2.25Z" />
                </svg>
                <h1 className="text-4xl font-bold text-white">SKYMiniMercado</h1>
            </div>
            
            <div className="w-full max-w-md bg-gray-800/50 border border-gray-700/50 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-white text-center mb-6">Crie sua Nova Senha</h2>
                
                {success ? (
                    <div className="text-center">
                        <p className="text-green-400 mb-6">{success}</p>
                        <button
                            onClick={onResetComplete}
                            className="w-full flex justify-center py-3 px-4 rounded-md text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-500"
                        >
                            Ir para o Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nova Senha</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Nova Senha</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white"
                            />
                        </div>
                        
                        {error && (
                            <p className="text-red-500 text-sm text-center font-semibold">{error}</p>
                        )}
                        
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 rounded-md text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-500"
                            >
                                {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PasswordResetScreen;
