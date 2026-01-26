
export interface Unit {
  id: number;
  name: string; // e.g., Unidade, Quilograma, Litro
  abbreviation: string; // e.g., UN, KG, L
}

export interface Category {
  id: number;
  name: string; // e.g., Laticínios, Padaria, Mercearia
}

export interface Product {
  id: number;
  barcode: string;
  name: string;
  description?: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock_alert: number;
  active: boolean;
  category_id: number;
  unit_id: number;
  total_sold: number;
  on_shopping_list?: boolean;
  image_url?: string;
  created_at?: string;
}

export type EmployeeRole = 'Diretor' | 'Gerente Geral' | 'Gerente Loja' | 'Financeiro' | 'Supervisor Caixa' | 'Operador de Caixa';


export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  email?: string;
  isActive: boolean;
  permissions: {
    canAccessPdv: boolean;
    canManageProducts: boolean;
    canManageCategoriesUnits: boolean;
    canAccessReceivables: boolean;
    canAccessInternalUse: boolean;
    canManageEmployees: boolean;
    canViewDashboard: boolean;
    canCancelSale: boolean;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = 'Dinheiro' | 'Cartão Crédito' | 'Cartão Débito' | 'PIX' | 'Fiado' | 'Empresa';

export interface CompletedSale {
  id: number;
  cart: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string; // Pode ser 'Múltiplo'
  amountPaid: number;
  change: number;
  date: string;
  operatorName: string;
  cashierNumber: number;
  status: 'completed' | 'cancelled' | 'reversed';
  payments?: Array<{ method: PaymentMethod; amount: number }>; // Detalhes para multi-pagamento
  cancellationReason?: string;
  reversedBy?: string;
  reversedAt?: string;
}

export interface ReceivableEntry {
  id: number;
  customerName: string;
  cart: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  date: string; // ISO string format (e.g., "2026-01-19T15:20:00.000Z") for proper date parsing
}

export interface Customer {
  id: number;
  name: string;
  cpf?: string;
  phone?: string;
}

export interface InternalUseEntry {
  id: number;
  date: string; // ISO string format (e.g., "2026-01-19T15:20:00.000Z") for proper date parsing
  cart: CartItem[];
  totalCost: number;
}

export type AppScreen = 'dashboard' | 'pos' | 'sales' | 'products' | 'receivables' | 'internalUse' | 'categories' | 'units' | 'employees' | 'cashier' | 'stock' | 'customers' | 'settings' | 'shoppingList';

export type CashierStatus = 'open' | 'closed' | 'divergence';

export interface CashierState {
  id: number;
  status: CashierStatus;
  openingBalance?: number;
  operatorName?: string;
  openTime?: string;
  cashierNumber?: number;
  sessionSales?: CompletedSale[];
}

export interface CashierClosingSummary {
  establishment: { name: string; cnpj: string; address: string; };
  cashierInfo: { number: number; closingTime: string; };
  operatorInfo: { name: string; };
  period: { openTime: string; closeTime: string; duration: string; };
  salesSummary: { grossSales: number; netSales: number; };
  payments: { [key in PaymentMethod]?: number } & { total: number };
  movements: { openingBalance: number; };
  conference: { expectedInCash: number; expectedTotal: number; countedCash: number; difference: number; };
}

// Tipos para o Dashboard
export interface SalesByHour {
  hour: number;
  total: number;
}

export interface SalesByPaymentMethod {
  method: PaymentMethod | string;
  total: number;
}

export interface StockAlert {
  productName: string;
  quantity: number;
  minAlert: number;
}

export interface DashboardAlert {
  id: string;
  type: 'critical' | 'warning';
  message: string;
  timestamp: Date;
}

export interface DashboardData {
  kpis: {
    revenueToday: number;
    revenueMonth: number;
    salesCountToday: number;
    averageTicket: number;
    customersServed: number;
    dailyLosses: number;
    saleCancellations: number;
  };
  salesGoal: {
    goal: number;
    progress: number;
  };
  topSellingProducts: {
    productId: number;
    name: string;
    quantitySold: number;
  }[];
  salesByHour: SalesByHour[];
  salesByPaymentMethod: SalesByPaymentMethod[];
  recentSales: CompletedSale[];
  cashierStates: Pick<CashierState, 'id' | 'cashierNumber' | 'status' | 'operatorName'>[];
  stockAlerts: StockAlert[];
  alerts: DashboardAlert[];
}

// Tipos para o Módulo de Configurações
export interface GeneralSettings {
  companyName: string;
  tradingName: string;
  cnpj: string;
  address: string;
  logoUrl: string;
  timezone: string;
  language: string;
  currency: string;
  autoDateTime: boolean;
  dailySalesGoal: number;
}

export interface SystemSettings {
  general: GeneralSettings;
  // Futuras seções de configuração serão adicionadas aqui
}
