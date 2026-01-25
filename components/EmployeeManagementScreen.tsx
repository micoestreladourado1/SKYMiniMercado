
import React, { useState, useEffect } from 'react';
import { Employee, EmployeeRole } from '../types';

interface EmployeeManagementScreenProps {
    employees: Employee[];
    onAddEmployee: (newEmployee: Omit<Employee, 'id'>, password: string) => void;
    onUpdateEmployee: (updatedEmployee: Employee) => void;
    onDeleteEmployee: (employeeId: string) => void;
}

const initialFormState: Omit<Employee, 'id'> = {
    name: '',
    role: 'Operador de Caixa',
    email: '',
    isActive: true,
    permissions: {
        canAccessPdv: true,
        canManageProducts: false,
        canManageCategoriesUnits: false,
        canAccessReceivables: false,
        canAccessInternalUse: false,
        canManageEmployees: false,
        canViewDashboard: false,
        canCancelSale: false,
    }
};

const permissionLabels: { key: keyof Employee['permissions']; label: string }[] = [
    { key: 'canAccessPdv', label: 'Acessar PDV' },
    { key: 'canManageProducts', label: 'Gerenciar Produtos' },
    { key: 'canManageCategoriesUnits', label: 'Gerenciar Cat/Unid' },
    { key: 'canAccessReceivables', label: 'Contas a Receber' },
    { key: 'canAccessInternalUse', label: 'Acessar Uso Interno' },
    { key: 'canManageEmployees', label: 'Gerenciar Funcionários' },
    { key: 'canViewDashboard', label: 'Ver Dashboard' },
    { key: 'canCancelSale', label: 'Cancelar Venda' },
];

const EmployeeManagementScreen: React.FC<EmployeeManagementScreenProps> = ({ employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee }) => {
    const [formState, setFormState] = useState<Omit<Employee, 'id'>>(initialFormState);
    const [password, setPassword] = useState('');
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const resetForm = () => {
        setFormState(initialFormState);
        setPassword('');
        setEditingEmployee(null);
    };

    useEffect(() => {
        if (editingEmployee) {
            setFormState({
                name: editingEmployee.name,
                role: editingEmployee.role,
                email: editingEmployee.email || '',
                isActive: editingEmployee.isActive,
                permissions: { ...editingEmployee.permissions }
            });
            setPassword(''); // Don't show password on edit
        } else {
            resetForm();
        }
    }, [editingEmployee]);

    useEffect(() => {
        const role = formState.role;
        let newPermissions: Employee['permissions'] = {
            canAccessPdv: false, canManageProducts: false, canManageCategoriesUnits: false,
            canAccessReceivables: false, canAccessInternalUse: false, canManageEmployees: false,
            canViewDashboard: false, canCancelSale: false,
        };

        if (['Diretor', 'Gerente Geral', 'Gerente Loja', 'Financeiro'].includes(role)) {
            newPermissions = {
                canAccessPdv: true, canManageProducts: true, canManageCategoriesUnits: true,
                canAccessReceivables: true, canAccessInternalUse: true, canManageEmployees: true,
                canViewDashboard: true, canCancelSale: true,
            };
        } else if (role === 'Supervisor Caixa') {
            newPermissions.canAccessPdv = true;
            newPermissions.canAccessReceivables = true;
        } else if (role === 'Operador de Caixa') {
            newPermissions.canAccessPdv = true;
        }

        setFormState(prev => ({ ...prev, permissions: newPermissions }));
    }, [formState.role]);
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormState(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [name as keyof Employee['permissions']]: checked
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formState.name?.trim() || !formState.role?.trim() || !formState.email?.trim() || (!editingEmployee && !password.trim())) {
            alert('Nome, Cargo, E-mail e Senha são obrigatórios.');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formState.email!)) {
            alert('Por favor, insira um e-mail válido.');
            return;
        }

        if (!editingEmployee && password.length < 6) {
            alert('A senha deve conter no mínimo 6 caracteres.');
            return;
        }

        const employeeData = { ...formState };

        if (editingEmployee) {
            // A lógica de atualização de senha será tratada separadamente com Supabase Auth
            onUpdateEmployee({ ...editingEmployee, ...employeeData });
            alert('Funcionário atualizado com sucesso!');
        } else {
            onAddEmployee(employeeData, password);
        }
        resetForm();
    };
    
    const handleDelete = (employee: Employee) => {
        if (window.confirm(`Tem certeza que deseja excluir o funcionário "${employee.name}"?`)) {
            onDeleteEmployee(employee.id);
            if (editingEmployee && editingEmployee.id === employee.id) {
                resetForm();
            }
        }
    };

    return (
        <div className="p-6 h-screen flex flex-col">
            <header className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Gerenciamento de Funcionários</h1>
                        <p className="text-gray-400">Adicione novos funcionários e gerencie suas permissões.</p>
                    </div>
                    <div>
                        <button 
                            onClick={resetForm}
                            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                            </svg>
                            Adicionar Novo
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                <div className="lg:col-span-1 bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 overflow-y-auto">
                    <h2 className="text-xl font-bold text-white mb-4">{editingEmployee ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
                            <input type="text" name="name" value={formState.name} onChange={handleFormChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
                            <input type="email" name="email" value={formState.email} onChange={handleFormChange} placeholder="nomesobrenome@skymini.com" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Cargo</label>
                                <select name="role" value={formState.role} onChange={handleFormChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    {['Diretor', 'Gerente Geral', 'Gerente Loja', 'Financeiro', 'Supervisor Caixa', 'Operador de Caixa'].map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500 pr-10"
                                        minLength={6}
                                        placeholder={editingEmployee ? 'Deixe em branco para não alterar' : ''}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white"
                                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m0 0l-2.122 2.122" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.022 7-9.542 7S3.732 16.057 2.458 12z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <fieldset className="border border-gray-700 rounded-lg p-4">
                            <legend className="px-2 text-lg font-semibold text-white">Permissões de Acesso</legend>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-2">
                                {permissionLabels.map(({ key, label }) => (
                                    <label key={key} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name={key}
                                            checked={formState.permissions[key]}
                                            onChange={handlePermissionChange}
                                            className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <span className="text-gray-300 text-sm">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setFormState(p => ({ ...p, isActive: true }))} className={`flex-1 p-2 rounded-md text-sm font-bold transition-all ${formState.isActive ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>Ativo</button>
                                <button type="button" onClick={() => setFormState(p => ({ ...p, isActive: false }))} className={`flex-1 p-2 rounded-md text-sm font-bold transition-all ${!formState.isActive ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>Inativo</button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-md transition-colors">
                                {editingEmployee ? 'Salvar Alterações' : 'Salvar Funcionário'}
                            </button>
                            {editingEmployee && (
                                <button type="button" onClick={resetForm} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded-md transition-colors">
                                    Cancelar Edição
                                </button>
                            )}
                        </div>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden flex flex-col">
                    <div className="overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/60 sticky top-0">
                                <tr>
                                    <th className="p-4 font-semibold">Funcionário</th>
                                    <th className="p-4 font-semibold">Cargo</th>
                                    <th className="p-4 font-semibold text-center">Status</th>
                                    <th className="p-4 font-semibold text-center">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(employee => (
                                    <tr key={employee.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                        <td className="p-4">
                                            <div className="font-medium">{employee.name}</div>
                                            <div className="text-sm text-gray-400">{employee.email || 'N/A'}</div>
                                        </td>
                                        <td className="p-4 text-gray-400">{employee.role}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${employee.isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-600/50 text-gray-400'}`}>
                                                {employee.isActive ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button onClick={() => setEditingEmployee(employee)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-full transition-colors" aria-label="Editar">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(employee)} className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-full transition-colors" aria-label="Excluir">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeManagementScreen;
