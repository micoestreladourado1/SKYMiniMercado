
import React, { useState, useEffect } from 'react';
import { Unit } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface UnitManagementScreenProps {
    units: Unit[];
    onAddUnit: (newUnit: Omit<Unit, 'id'>) => void;
    onUpdateUnit: (updatedUnit: Unit) => void;
    onDeleteUnit: (unitId: number) => void;
}

const UnitManagementScreen: React.FC<UnitManagementScreenProps> = ({ units, onAddUnit, onUpdateUnit, onDeleteUnit }) => {
    const [name, setName] = useState('');
    const [abbreviation, setAbbreviation] = useState('');
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

    const resetForm = () => {
        setName('');
        setAbbreviation('');
        setEditingUnit(null);
    };

    useEffect(() => {
        if (editingUnit) {
            setName(editingUnit.name);
            setAbbreviation(editingUnit.abbreviation);
        } else {
            resetForm();
        }
    }, [editingUnit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const trimmedAbbr = abbreviation.trim().toUpperCase();

        if (!trimmedName || !trimmedAbbr) {
            alert('Todos os campos são obrigatórios.');
            return;
        }

        if (editingUnit) {
            if (units.some(u => (u.name.toLowerCase() === trimmedName.toLowerCase() || u.abbreviation.toLowerCase() === trimmedAbbr.toLowerCase()) && u.id !== editingUnit.id)) {
                alert('Já existe outra unidade com este nome ou abreviação.');
                return;
            }
            onUpdateUnit({ ...editingUnit, name: trimmedName, abbreviation: trimmedAbbr });
        } else {
            if (units.some(u => u.name.toLowerCase() === trimmedName.toLowerCase() || u.abbreviation.toLowerCase() === trimmedAbbr.toLowerCase())) {
                alert('Esta unidade ou abreviação já existe.');
                return;
            }
            onAddUnit({ name: trimmedName, abbreviation: trimmedAbbr });
        }
        resetForm();
    };

    const handleDeleteClick = (unit: Unit) => {
        setUnitToDelete(unit);
    };

    const handleConfirmDelete = () => {
        if (unitToDelete) {
            onDeleteUnit(unitToDelete.id);
            if (editingUnit && editingUnit.id === unitToDelete.id) {
                resetForm();
            }
            setUnitToDelete(null);
        }
    };

    return (
        <>
            <div className="p-6 h-screen flex flex-col">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-white">Gerenciamento de Unidades</h1>
                    <p className="text-gray-400">Adicione novas unidades de medida para os produtos.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                    <div className="lg:col-span-1 bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 h-fit">
                        <h2 className="text-xl font-bold text-white mb-4">{editingUnit ? 'Editar Unidade' : 'Cadastrar Nova Unidade'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Nome da Unidade</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                                    placeholder="Ex: Quilograma"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Abreviação</label>
                                <input
                                    type="text"
                                    value={abbreviation}
                                    onChange={e => setAbbreviation(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                                    placeholder="Ex: KG"
                                />
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-md transition-colors">
                                    {editingUnit ? 'Salvar Alterações' : 'Salvar Unidade'}
                                </button>
                                {editingUnit && (
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
                                        <th className="p-4 font-semibold">ID</th>
                                        <th className="p-4 font-semibold">Nome</th>
                                        <th className="p-4 font-semibold">Abreviação</th>
                                        <th className="p-4 font-semibold text-center">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {units.map(unit => (
                                        <tr key={unit.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                            <td className="p-4 w-24">{unit.id}</td>
                                            <td className="p-4">{unit.name}</td>
                                            <td className="p-4">{unit.abbreviation}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button onClick={() => setEditingUnit(unit)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-full transition-colors" aria-label="Editar">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(unit)} className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-full transition-colors" aria-label="Excluir">
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
            <ConfirmationModal
                isOpen={!!unitToDelete}
                onClose={() => setUnitToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Unidade"
                message={
                    <>
                        <p className="text-gray-300">
                            Tem certeza que deseja excluir permanentemente a unidade:
                        </p>
                        <p className="font-bold text-white my-2 bg-gray-900/50 p-2 rounded-md">
                            {unitToDelete?.name} ({unitToDelete?.abbreviation})
                        </p>
                        <p className="text-yellow-400 font-semibold text-sm">
                            Esta ação não poderá ser desfeita.
                        </p>
                    </>
                }
            />
        </>
    );
};

export default UnitManagementScreen;
