
import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Product, Category, Unit } from '../types';
import ProductViewModal from './ProductViewModal';
import ConfirmationModal from './ConfirmationModal';

interface ProductManagementScreenProps {
    products: Product[];
    categories: Category[];
    units: Unit[];
    onAddProduct: (newProduct: Omit<Product, 'id'>) => Promise<boolean>;
    onUpdateProduct: (updatedProduct: Product) => void;
    onDeleteProduct: (productId: number) => void;
    onImportProducts: (importedProducts: Omit<Product, 'id'>[]) => void;
    onForceDelete: (barcode: string) => void;
    onDeleteAll: () => void;
}

const ProductManagementScreen: React.FC<ProductManagementScreenProps> = ({ products, categories, units, onAddProduct, onUpdateProduct, onDeleteProduct, onImportProducts, onForceDelete, onDeleteAll }) => {
    const [formState, setFormState] = useState({
        barcode: '',
        name: '',
        description: '',
        price: '',
        costPrice: '',
        stock: '',
        minStock: '',
        category_id: '',
        unit_id: '',
        isActive: true,
    });
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('active'); // Default to active filtered

    const activeCount = React.useMemo(() => products.filter(p => p.active).length, [products]);
    const inactiveCount = React.useMemo(() => products.filter(p => !p.active).length, [products]);

    const filteredProducts = products.filter(product => {
        const lowerTerm = searchTerm.toLowerCase();
        const matchesSearch = (
            (product.name && product.name.toLowerCase().includes(lowerTerm)) ||
            (product.barcode && product.barcode.includes(lowerTerm))
        );

        if (!matchesSearch) return false;

        if (filterStatus === 'all') return true;
        if (filterStatus === 'active') return product.active === true;
        if (filterStatus === 'inactive') return product.active === false;

        return true;
    });

    const getCountLabel = () => {
        switch (filterStatus) {
            case 'active': return 'Total de cadastros ativos:';
            case 'inactive': return 'Total de cadastros inativos:';
            default: return 'Total de cadastros:';
        }
    };

    const getCountValue = () => {
        switch (filterStatus) {
            case 'active': return activeCount;
            case 'inactive': return inactiveCount;
            default: return products.length;
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showToolsModal, setShowToolsModal] = useState(false);
    const [forceDeleteBarcode, setForceDeleteBarcode] = useState('');

    const handleToolsClick = () => setShowToolsModal(true);

    const executeForceDelete = () => {
        if (!forceDeleteBarcode) return;
        if (window.confirm(`Tem certeza que deseja forçar a exclusão do produto com código "${forceDeleteBarcode}"?`)) {
            onForceDelete(forceDeleteBarcode.trim());
            setForceDeleteBarcode('');
        }
    };

    const executeDeleteAll = () => {
        const confirm1 = window.confirm("ATENÇÃO: Isso apagará TODOS os produtos do banco de dados. Tem certeza?");
        if (confirm1) {
            const confirm2 = window.confirm("Última chance: Digite 'SIM' para confirmar (mentira, só clique OK). Isso é irreversível.");
            if (confirm2) {
                onDeleteAll();
                setShowToolsModal(false);
            }
        }
    };

    const resetForm = () => {
        setFormState({
            barcode: '', name: '', description: '', price: '', costPrice: '', stock: '',
            minStock: '', category_id: '', unit_id: '', isActive: true,
        });
        setEditingProduct(null);
    };

    useEffect(() => {
        if (editingProduct) {
            setFormState({
                barcode: editingProduct.barcode,
                name: editingProduct.name,
                description: editingProduct.description || '',
                price: String(editingProduct.price),
                costPrice: String(editingProduct.cost_price),
                stock: String(editingProduct.stock_quantity),
                minStock: String(editingProduct.min_stock_alert),
                category_id: String(editingProduct.category_id),
                unit_id: String(editingProduct.unit_id),
                isActive: editingProduct.active,
            });
            window.scrollTo(0, 0);
        } else {
            resetForm();
        }
    }, [editingProduct]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { barcode, name, description, price, stock, costPrice, minStock, category_id, unit_id } = formState;

        if (!barcode || !name || !price || !stock || !costPrice || !minStock || !category_id || !unit_id) {
            alert('Todos os campos, exceto descrição, são obrigatórios.');
            return;
        }

        const productData = {
            barcode,
            name,
            description,
            price: parseFloat(price),
            cost_price: parseFloat(costPrice),
            stock_quantity: parseFloat(stock),
            min_stock_alert: parseFloat(minStock),
            category_id: parseInt(category_id, 10),
            unit_id: parseInt(unit_id, 10),
            active: formState.isActive,
            total_sold: editingProduct ? editingProduct.total_sold : 0,
        };

        if (editingProduct) {
            if (products.some(p => p.barcode === barcode && p.id !== editingProduct.id)) {
                alert('Já existe outro produto com este código de barras.');
                return;
            }
            onUpdateProduct({ ...editingProduct, ...productData });
            alert('Produto atualizado com sucesso!');
            resetForm();
        } else {
            // Check local duplicate first (optimization)
            if (products.some(p => p.barcode === barcode)) {
                alert('Já existe um produto com este código de barras carregado na lista atual.');
                return;
            }

            // Call async add product and wait for result
            const success = await onAddProduct(productData);

            if (success) {
                alert('Produto cadastrado com sucesso!');
                resetForm();
            }
            // If success is false, App.tsx has already shown an alert with the specific error.
        }
    };

    const handleDelete = (product: Product) => {
        setProductToDelete(product);
    };

    const handleConfirmDelete = () => {
        if (productToDelete) {
            onDeleteProduct(productToDelete.id);
            if (editingProduct && editingProduct.id === productToDelete.id) {
                resetForm();
            }
            setProductToDelete(null);
        }
    };

    const calculateProfitMargin = (price: number, cost_price: number) => {
        if (price <= 0 || cost_price <= 0) return 0;
        return ((price - cost_price) / price) * 100;
    };

    const handleExportXLSX = () => {
        const headers = [
            'Código de Barras', 'Nome do Produto', 'Preço Venda (R$)', 'Preço Custo (R$)',
            'Estoque Atual', 'Alerta Mínimo', 'Status', 'ID Categoria', 'ID Unidade', 'Descrição'
        ];

        const dataRows = products.map(p => [
            p.barcode,
            p.name,
            p.price,
            p.cost_price,
            p.stock_quantity,
            p.min_stock_alert,
            p.active ? 'Ativo' : 'Inativo',
            p.category_id,
            p.unit_id,
            p.description || ''
        ]);

        const dataToExport = [headers, ...dataRows];
        const ws = XLSX.utils.aoa_to_sheet(dataToExport);

        // Opcional: Definir larguras das colunas para melhor visualização
        ws['!cols'] = [
            { wch: 20 }, // Cód. de Barras
            { wch: 40 }, // Nome
            { wch: 15 }, // Preço Venda
            { wch: 15 }, // Preço Custo
            { wch: 15 }, // Estoque
            { wch: 15 }, // Alerta Mínimo
            { wch: 10 }, // Status
            { wch: 12 }, // ID Categoria
            { wch: 12 }, // ID Unidade
            { wch: 50 }  // Descrição
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
        XLSX.writeFile(wb, 'produtos_skymini.xlsx');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    throw new Error("Não foi possível ler o arquivo.");
                }
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json<any>(worksheet);

                if (json.length === 0) {
                    throw new Error("A planilha está vazia.");
                }

                const requiredHeaders = [
                    'Código de Barras', 'Nome do Produto', 'Preço Venda (R$)', 'Preço Custo (R$)',
                    'Estoque Atual', 'Alerta Mínimo', 'Status', 'ID Categoria', 'ID Unidade'
                ];

                const actualHeaders = Object.keys(json[0]);
                const missingHeaders = requiredHeaders.filter(h => !actualHeaders.includes(h));

                if (missingHeaders.length > 0) {
                    throw new Error(`O cabeçalho da planilha está incompleto. Faltando: ${missingHeaders.join(', ')}`);
                }

                const importedProducts: Omit<Product, 'id'>[] = json.map((row, index) => {
                    if (!row['Código de Barras'] || !row['Nome do Produto'] || row['Preço Venda (R$)'] == null) {
                        throw new Error(`Erro na linha ${index + 2}: Dados essenciais (Código de Barras, Nome do Produto, Preço Venda) estão faltando.`);
                    }

                    return {
                        barcode: String(row['Código de Barras']),
                        name: String(row['Nome do Produto']),
                        price: Number(row['Preço Venda (R$)']),
                        cost_price: Number(row['Preço Custo (R$)']),
                        stock_quantity: Number(row['Estoque Atual']),
                        min_stock_alert: Number(row['Alerta Mínimo']),
                        active: String(row['Status']).toLowerCase() === 'ativo',
                        category_id: parseInt(row['ID Categoria'], 10),
                        unit_id: parseInt(row['ID Unidade'], 10),
                        description: row['Descrição'] ? String(row['Descrição']) : '',
                        total_sold: 0,
                    };
                });

                onImportProducts(importedProducts);

            } catch (error: any) {
                alert(`Erro ao processar o arquivo XLSX: ${error.message}`);
            } finally {
                if (event.target) {
                    event.target.value = ''; // Reseta o input de arquivo
                }
            }
        };

        reader.onerror = () => {
            alert("Erro ao ler o arquivo.");
        };

        reader.readAsArrayBuffer(file);
    };

    // ... (rest of the component)

    return (
        <>
            <div className="flex h-screen">
                <main className="flex-1 p-6 flex flex-col">
                    <header className="mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Gerenciamento de Produtos</h1>
                                <p className="text-gray-400">Adicione novos produtos e visualize o estoque.</p>
                                <div className="mt-1 text-sm text-gray-400">
                                    {getCountLabel()} <span className="text-cyan-400 font-bold">{getCountValue()}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Search Input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar produto..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-gray-700 text-white rounded-md pl-10 pr-10 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none w-64"
                                    />
                                    <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                    </svg>
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
                                            title="Limpar busca"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                                    <button
                                        onClick={() => setFilterStatus('active')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filterStatus === 'active' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                    >
                                        Ativos
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('inactive')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filterStatus === 'inactive' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                    >
                                        Inativos
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filterStatus === 'all' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                    >
                                        Todos
                                    </button>
                                </div>

                                <button onClick={handleImportClick} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Importar Produtos
                                </button>
                                <button onClick={handleExportXLSX} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Exportar Produtos
                                </button>
                                <button onClick={handleToolsClick} className="flex items-center gap-2 bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-800 font-bold py-2 px-4 rounded-md transition-colors text-sm" title="Ferramentas de Manutenção">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                                    </svg>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileImport}
                                    accept=".xlsx, .xls"
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                        {/* Formulário de Cadastro/Edição */}
                        <div className="lg:col-span-1 bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 overflow-y-auto">
                            {/* (Form content preserved) */}
                            <h2 className="text-xl font-bold text-white mb-4">{editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Cód. de Barras</label>
                                    <input type="text" name="barcode" value={formState.barcode} onChange={handleFormChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Produto</label>
                                    <input type="text" name="name" value={formState.name} onChange={handleFormChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Descrição (Opcional)</label>
                                    <textarea name="description" value={formState.description} onChange={handleFormChange} rows={2} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Categoria</label>
                                        <select name="category_id" value={formState.category_id} onChange={handleFormChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                            <option value="">Selecione...</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Unidade</label>
                                        <select name="unit_id" value={formState.unit_id} onChange={handleFormChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                            <option value="">Selecione...</option>
                                            {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Preço Venda (R$)</label>
                                        <input type="number" step="0.01" name="price" value={formState.price} onChange={handleFormChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Preço Compra (R$)</label>
                                        <input type="number" step="0.01" name="costPrice" value={formState.costPrice} onChange={handleFormChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Estoque Atual</label>
                                        <input type="number" step="0.001" name="stock" value={formState.stock} onChange={handleFormChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Estoque Mínimo</label>
                                        <input type="number" step="0.001" name="minStock" value={formState.minStock} onChange={handleFormChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setFormState(p => ({ ...p, isActive: true }))} className={`flex-1 p-2 rounded-md text-sm font-bold transition-all ${formState.isActive ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>Ativo</button>
                                        <button type="button" onClick={() => setFormState(p => ({ ...p, isActive: false }))} className={`flex-1 p-2 rounded-md text-sm font-bold transition-all ${!formState.isActive ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>Inativo</button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 pt-2">
                                    <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-md transition-colors">
                                        {editingProduct ? 'Salvar Alterações' : 'Salvar Produto'}
                                    </button>
                                    {editingProduct && (
                                        <button type="button" onClick={resetForm} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded-md transition-colors">
                                            Cancelar Edição
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Lista de Produtos */}
                        <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden flex flex-col">
                            <div className="overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-900/60 sticky top-0">
                                        <tr>
                                            <th className="p-4 font-semibold w-24 text-center">Status</th>
                                            <th className="p-4 font-semibold">Produto</th>
                                            <th className="p-4 font-semibold text-right">Preço Venda</th>
                                            <th className="p-4 font-semibold text-right">Lucro (%)</th>
                                            <th className="p-4 font-semibold text-center">Estoque</th>
                                            <th className="p-4 font-semibold text-center">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map(product => (
                                            <tr key={product.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${product.active ? 'bg-green-500/20 text-green-300' : 'bg-gray-600/50 text-gray-400'}`}>
                                                        {product.active ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div>{product.name}</div>
                                                    <div className="text-xs text-gray-400 font-mono">{product.barcode}</div>
                                                </td>
                                                <td className="p-4 text-right">R$ {product.price.toFixed(2)}</td>
                                                <td className={`p-4 text-right font-medium ${calculateProfitMargin(product.price, product.cost_price) < 20 ? 'text-red-400' : 'text-green-400'}`}>
                                                    {calculateProfitMargin(product.price, product.cost_price).toFixed(1)}%
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className={`font-bold ${product.stock_quantity <= product.min_stock_alert ? 'text-red-400' : 'text-white'}`}>
                                                        {product.stock_quantity}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Mín: {product.min_stock_alert}</div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <button onClick={() => setViewingProduct(product)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors" aria-label="Visualizar">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                                        </button>
                                                        <button onClick={() => setEditingProduct(product)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-full transition-colors" aria-label="Editar">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(product)} className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-full transition-colors" aria-label="Excluir">
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
                </main>
            </div>
            {/* Tools Modal */}
            {
                showToolsModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Ferramentas Avançadas
                                </h2>
                                <button onClick={() => setShowToolsModal(false)} className="text-gray-400 hover:text-white">✕</button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Exclusão Forçada por Código de Barras</label>
                                    <p className="text-xs text-gray-400 mb-3">Use isso se um produto estiver dando erro de "já existe" mas não aparece na lista.</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Código de Barras"
                                            value={forceDeleteBarcode}
                                            onChange={(e) => setForceDeleteBarcode(e.target.value)}
                                            className="flex-1 bg-gray-900 border border-gray-600 rounded-md p-2 text-white text-sm"
                                        />
                                        <button
                                            onClick={executeForceDelete}
                                            className="bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-900/50 font-bold px-3 rounded-md transition-colors text-sm"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-red-900/10 p-4 rounded-lg border border-red-900/30">
                                    <label className="block text-sm font-medium text-red-400 mb-2">Zona de Perigo</label>
                                    <button
                                        onClick={executeDeleteAll}
                                        className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        APAGAR TODOS OS PRODUTOS
                                    </button>
                                    <p className="text-xs text-red-400 mt-2 text-center">Ação irreversível. Use com cautela.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <ProductViewModal
                isOpen={!!viewingProduct}
                onClose={() => setViewingProduct(null)}
                product={viewingProduct}
                categoryName={categories.find(c => c.id === viewingProduct?.category_id)?.name || 'N/A'}
                unitName={units.find(u => u.id === viewingProduct?.unit_id)?.name || 'N/A'}
            />

            <ConfirmationModal
                isOpen={!!productToDelete}
                onClose={() => setProductToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Produto"
                message={
                    <>
                        <p className="text-gray-300">
                            Tem certeza que deseja excluir permanentemente o produto:
                        </p>
                        <p className="font-bold text-white my-2 bg-gray-900/50 p-2 rounded-md">
                            {productToDelete?.name}
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

export default ProductManagementScreen;
