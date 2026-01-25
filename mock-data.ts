
import { Product, Customer, Category, Unit, Employee, CompletedSale, ReceivableEntry, SystemSettings } from './types';

export const MOCK_UNITS: Unit[] = [
    { id: 1, name: 'Unidade', abbreviation: 'UN' },
    { id: 2, name: 'Quilograma', abbreviation: 'KG' },
    { id: 3, name: 'Litro', abbreviation: 'L' },
    { id: 4, name: 'Pacote', abbreviation: 'PCT' },
    { id: 5, name: 'Garrafa', abbreviation: 'GRF' },
];

export const MOCK_CATEGORIES: Category[] = [
    { id: 1, name: 'Laticínios' },
    { id: 2, name: 'Padaria' },
    { id: 3, name: 'Mercearia' },
    { id: 4, name: 'Bebidas' },
    { id: 5, name: 'Higiene' },
    { id: 6, name: 'Hortifruti' },
];

export const MOCK_PRODUCTS: Product[] = [
    // FIX: Changed categoryId to category_id and unitId to unit_id to match the Product interface.
    { id: 1, barcode: '789001', name: 'Leite Integral', description: 'Embalagem 1L', price: 5.49, cost_price: 3.80, stock_quantity: 150, min_stock_alert: 20, active: true, category_id: 1, unit_id: 3 },
    // FIX: Changed categoryId to category_id and unitId to unit_id to match the Product interface.
    { id: 2, barcode: '789002', name: 'Pão de Forma', description: 'Pacote 500g', price: 8.20, cost_price: 5.50, stock_quantity: 80, min_stock_alert: 15, active: true, category_id: 2, unit_id: 4 },
    // FIX: Changed categoryId to category_id and unitId to unit_id to match the Product interface.
    { id: 3, barcode: '789003', name: 'Café Solúvel', description: 'Pote 100g', price: 12.90, cost_price: 9.20, stock_quantity: 60, min_stock_alert: 10, active: true, category_id: 3, unit_id: 1 },
    // FIX: Changed categoryId to category_id and unitId to unit_id to match the Product interface.
    { id: 4, barcode: '789004', name: 'Arroz Branco Tipo 1', description: 'Pacote 5kg', price: 28.50, cost_price: 21.00, stock_quantity: 120, min_stock_alert: 30, active: true, category_id: 3, unit_id: 4 },
    // FIX: Changed categoryId to category_id and unitId to unit_id to match the Product interface.
    { id: 5, barcode: '789005', name: 'Feijão Carioca', description: '1kg', price: 9.99, cost_price: 7.50, stock_quantity: 200, min_stock_alert: 40, active: true, category_id: 3, unit_id: 4 },
    // FIX: Changed categoryId to category_id and unitId to unit_id to match the Product interface.
    { id: 6, barcode: '789006', name: 'Óleo de Soja', description: 'Garrafa 900ml', price: 7.89, cost_price: 6.10, stock_quantity: 180, min_stock_alert: 25, active: true, category_id: 3, unit_id: 5 },
    // FIX: Changed categoryId to category_id and unitId to unit_id to match the Product interface.
    { id: 7, barcode: '789007', name: 'Refrigerante Cola', description: 'Garrafa 2L', price: 8.50, cost_price: 5.00, stock_quantity: 90, min_stock_alert: 20, active: true, category_id: 4, unit_id: 5 },
    // FIX: Changed categoryId to category_id and unitId to unit_id to match the Product interface.
    { id: 8, barcode: '789008', name: 'Sabonete em Barra', description: 'Unidade', price: 2.50, cost_price: 1.40, stock_quantity: 300, min_stock_alert: 50, active: true, category_id: 5, unit_id: 1 },
    // FIX: Changed categoryId to category_id and unitId to unit_id to match the Product interface.
    { id: 9, barcode: '789009', name: 'Creme Dental', description: 'Embalagem 90g', price: 4.25, cost_price: 2.80, stock_quantity: 250, min_stock_alert: 30, active: false, category_id: 5, unit_id: 1 },
    // FIX: Changed categoryId to category_id and unitId to unit_id to match the Product interface.
    { id: 10, barcode: '789010', name: 'Biscoito Recheado', description: 'Sabor Chocolate', price: 3.99, cost_price: 2.50, stock_quantity: 130, min_stock_alert: 20, active: true, category_id: 3, unit_id: 4 },
];

export const MOCK_CUSTOMERS: Customer[] = [
    { id: 1, name: 'João da Silva', cpf: '111.222.333-44' },
    { id: 2, name: 'Maria Oliveira', phone: '(11) 98765-4321' },
    { id: 3, name: 'Carlos Pereira' },
    { id: 4, name: 'Cliente Avulso' },
];

export const MOCK_EMPLOYEES: Employee[] = [
    {
        id: '1',
        name: 'Ana Silva',
        role: 'Diretor',
        email: 'anasilva@skymini.com',
        isActive: true,
        permissions: {
            canAccessPdv: true,
            canManageProducts: true,
            canManageCategoriesUnits: true,
            canAccessReceivables: true,
            canAccessInternalUse: true,
            canManageEmployees: true,
            canViewDashboard: true,
            canCancelSale: true,
        }
    },
    {
        id: '2',
        name: 'Bruno Costa',
        role: 'Operador de Caixa',
        email: 'brunocosta@skymini.com',
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
    },
    {
        id: '3',
        name: 'Carlos Martins',
        role: 'Gerente Geral',
        email: 'carlosmartins@skymini.com',
        isActive: true,
        permissions: {
            canAccessPdv: true,
            canManageProducts: true,
            canManageCategoriesUnits: true,
            canAccessReceivables: true,
            canAccessInternalUse: true,
            canManageEmployees: true,
            canViewDashboard: true,
            canCancelSale: true,
        }
    },
    {
        id: '4',
        name: 'Admin',
        role: 'Diretor',
        email: 'admin@skymini.com',
        isActive: true,
        permissions: {
            canAccessPdv: true,
            canManageProducts: true,
            canManageCategoriesUnits: true,
            canAccessReceivables: true,
            canAccessInternalUse: true,
            canManageEmployees: true,
            canViewDashboard: true,
            canCancelSale: true,
        }
    },
    {
        id: '5',
        name: 'Mico',
        role: 'Diretor',
        email: 'micoestreladourado1@gmail.com',
        isActive: true,
        permissions: {
            canAccessPdv: true,
            canManageProducts: true,
            canManageCategoriesUnits: true,
            canAccessReceivables: true,
            canAccessInternalUse: true,
            canManageEmployees: true,
            canViewDashboard: true,
            canCancelSale: true,
        }
    }
];

export const MOCK_SALES: CompletedSale[] = [
    { id: 1, cart: [{ ...MOCK_PRODUCTS[0], quantity: 2 }], subtotal: 10.98, discount: 0, total: 10.98, paymentMethod: 'Dinheiro', amountPaid: 15.00, change: 4.02, date: new Date().toLocaleString('pt-BR'), operatorName: 'Bruno Costa', cashierNumber: 1, status: 'completed', payments: [{ method: 'Dinheiro', amount: 10.98 }] },
    { id: 2, cart: [{ ...MOCK_PRODUCTS[2], quantity: 1 }, { ...MOCK_PRODUCTS[3], quantity: 1 }], subtotal: 41.40, discount: 0, total: 41.40, paymentMethod: 'Cartão Crédito', amountPaid: 41.40, change: 0, date: new Date().toLocaleString('pt-BR'), operatorName: 'Bruno Costa', cashierNumber: 1, status: 'completed', payments: [{ method: 'Cartão Crédito', amount: 41.40 }] },
    { id: 3, cart: [{ ...MOCK_PRODUCTS[6], quantity: 1 }], subtotal: 8.50, discount: 0, total: 8.50, paymentMethod: 'PIX', amountPaid: 8.50, change: 0, date: new Date().toLocaleString('pt-BR'), operatorName: 'Ana Silva', cashierNumber: 1, status: 'completed', payments: [{ method: 'PIX', amount: 8.50 }] },
    { id: 4, cart: [{ ...MOCK_PRODUCTS[1], quantity: 2 }], subtotal: 16.40, discount: 0, total: 16.40, paymentMethod: 'Cartão Débito', amountPaid: 16.40, change: 0, date: new Date().toLocaleString('pt-BR'), operatorName: 'Bruno Costa', cashierNumber: 1, status: 'completed', payments: [{ method: 'Cartão Débito', amount: 16.40 }] },
    { id: 5, cart: [{ ...MOCK_PRODUCTS[4], quantity: 3 }], subtotal: 29.97, discount: 0, total: 29.97, paymentMethod: 'Dinheiro', amountPaid: 30.00, change: 0.03, date: new Date().toLocaleString('pt-BR'), operatorName: 'Ana Silva', cashierNumber: 1, status: 'completed', payments: [{ method: 'Dinheiro', amount: 29.97 }] },
    { id: 6, cart: [{ ...MOCK_PRODUCTS[5], quantity: 1 }], subtotal: 7.89, discount: 0, total: 7.89, paymentMethod: 'PIX', amountPaid: 7.89, change: 0, date: new Date().toLocaleString('pt-BR'), operatorName: 'Bruno Costa', cashierNumber: 1, status: 'completed', payments: [{ method: 'PIX', amount: 7.89 }] },
];

export const MOCK_RECEIVABLES: ReceivableEntry[] = [
    {
        id: 1,
        customerName: 'João da Silva',
        cart: [{ ...MOCK_PRODUCTS[7], quantity: 1 }],
        total: 2.50,
        date: '10/01/2026, 18:13:58'
    }
];

export const MOCK_SETTINGS: SystemSettings = {
    general: {
        companyName: 'Supermercado Exemplo LTDA',
        tradingName: 'SKYMiniMercado',
        cnpj: '11.145.678/0001-99',
        address: 'Rua das Flores, 123 - Centro, Cidade Exemplo, EX, 12345-678',
        logoUrl: '',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        currency: 'BRL',
        autoDateTime: true,
        dailySalesGoal: 1200,
    }
};