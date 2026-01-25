
import { useState, useEffect } from 'react';
import { DashboardData, CompletedSale, Product, SalesByHour, PaymentMethod, CashierState, DashboardAlert, SystemSettings, InternalUseEntry } from '../types';

// Simula a obtenção de dados iniciais e a escuta de atualizações em tempo real (como do Supabase)
const useDashboardData = (initialSales: CompletedSale[], initialProducts: Product[], internalUseEntries: InternalUseEntry[], settings: SystemSettings, cashierSessions: any[]) => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Helper function para parsear de forma confiável o formato de data "dd/mm/yyyy, HH:MM:SS"
        const parseBrazilianDateString = (dateStr: string): Date | null => {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
        };

        // Função para processar os dados e calcular os KPIs
        const processData = (sales: CompletedSale[], products: Product[], internalUse: InternalUseEntry[], cashierSessions: any[]): DashboardData => {
            const todayStr = new Date().toLocaleDateString('pt-BR');

            const salesToday = sales.filter(s => {
                const saleDate = parseBrazilianDateString(s.date);
                return saleDate ? saleDate.toLocaleDateString('pt-BR') === todayStr : false;
            });

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Vendas que representam faturamento (exclui vendas a prazo 'Fiado' e vendas estornadas)
            const financiallyCompletedSalesToday = salesToday.filter(s => s.status === 'completed' && s.paymentMethod !== 'Fiado');

            const allFinanciallyCompletedSales = sales.filter(s => {
                const saleDate = parseBrazilianDateString(s.date);
                return s.status === 'completed' &&
                    s.paymentMethod !== 'Fiado' &&
                    saleDate &&
                    saleDate.getMonth() === currentMonth &&
                    saleDate.getFullYear() === currentYear;
            });

            // Ranking de todos os produtos (ordenados por mais vendidos para que o seletor funcione com todo o catálogo)
            const topSellingProducts = products
                .map(p => ({ productId: p.id, name: p.name, quantitySold: p.total_sold || 0 }))
                .sort((a, b) => b.quantitySold - a.quantitySold);

            const revenueToday = financiallyCompletedSalesToday.reduce((sum, s) => sum + s.total, 0);
            const salesCountToday = financiallyCompletedSalesToday.length;
            const averageTicket = salesCountToday > 0 ? revenueToday / salesCountToday : 0;
            const revenueMonth = allFinanciallyCompletedSales.reduce((sum, s) => sum + s.total, 0);
            const customersServed = salesCountToday;

            const dailyLosses = internalUse
                .filter(entry => {
                    const entryDate = parseBrazilianDateString(entry.date);
                    return entryDate ? entryDate.toLocaleDateString('pt-BR') === todayStr : false;
                })
                .reduce((sum, entry) => sum + entry.totalCost, 0);

            const saleCancellations = salesToday.filter(s => s.status === 'cancelled').length;
            const goal = settings.general.dailySalesGoal;
            const progress = goal > 0 ? (revenueToday / goal) * 100 : 0;
            const salesGoal = { goal, progress: Math.min(progress, 100) };

            const salesByHour: SalesByHour[] = Array.from({ length: 24 }, (_, i) => ({ hour: i, total: 0 }));
            financiallyCompletedSalesToday.forEach(sale => {
                const saleDate = parseBrazilianDateString(sale.date);
                if (saleDate) {
                    const hour = saleDate.getHours();
                    salesByHour[hour].total += sale.total;
                }
            });

            // Aggregate payment methods (only count each sale once)
            // Initialize all payment methods with 0 to ensure they all appear in the chart
            const paymentTotals: { [key: string]: number } = {
                'Dinheiro': 0,
                'Cartão Débito': 0,
                'Cartão Crédito': 0,
                'PIX': 0
            };

            financiallyCompletedSalesToday.forEach(sale => {
                // CRITICAL: Always use sale.total as the authoritative amount to ensure
                // the sum of payment methods equals revenueToday
                if (sale.payments && sale.payments.length > 0) {
                    // Multi-payment: distribute the sale.total across payment methods
                    const paymentsSum = sale.payments.reduce((sum, p) => sum + p.amount, 0);

                    sale.payments.forEach(p => {
                        if (p.method !== 'Fiado') {
                            // Use the payment amount directly, but ensure it's from the sale.total
                            // If there's a discrepancy, we trust sale.total
                            const amount = Math.abs(paymentsSum - sale.total) < 0.01
                                ? p.amount
                                : (p.amount / paymentsSum) * sale.total;
                            paymentTotals[p.method] = (paymentTotals[p.method] || 0) + amount;
                        }
                    });
                } else if (sale.paymentMethod && sale.paymentMethod !== 'Fiado') {
                    // Single payment method: use sale.total directly
                    paymentTotals[sale.paymentMethod] = (paymentTotals[sale.paymentMethod] || 0) + sale.total;
                }
            });

            // Create array with all payment methods, filtering out only those with 0 value
            // But keep the main 4 payment methods even if they're 0
            const mainPaymentMethods = ['Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'PIX'];
            const salesByPaymentMethod = Object.entries(paymentTotals)
                .filter(([method]) => mainPaymentMethods.includes(method) || paymentTotals[method] > 0)
                .map(([method, total]) => ({ method, total }))
                .sort((a, b) => {
                    // Sort by total descending, but keep main payment methods first
                    const aIsMain = mainPaymentMethods.includes(a.method);
                    const bIsMain = mainPaymentMethods.includes(b.method);
                    if (aIsMain && !bIsMain) return -1;
                    if (!aIsMain && bIsMain) return 1;
                    return b.total - a.total;
                });

            // VALIDATION: Ensure payment totals sum equals revenueToday
            const paymentMethodsSum = salesByPaymentMethod.reduce((sum, pm) => sum + pm.total, 0);
            const difference = Math.abs(revenueToday - paymentMethodsSum);
            if (difference > 0.01) {
                console.warn('⚠️ DISCREPANCY DETECTED:');
                console.warn(`  Faturamento Hoje: R$ ${revenueToday.toFixed(2)}`);
                console.warn(`  Soma Métodos Pagamento: R$ ${paymentMethodsSum.toFixed(2)}`);
                console.warn(`  Diferença: R$ ${difference.toFixed(2)}`);
                console.warn('  Payment breakdown:', salesByPaymentMethod);
            } else {
                console.log('✅ Validation OK: Faturamento Hoje = Soma Métodos de Pagamento');
                console.log(`  Total: R$ ${revenueToday.toFixed(2)}`);
            }


            const recentSales = [...sales].sort((a, b) => {
                const dateA = parseBrazilianDateString(a.date)?.getTime() || 0;
                const dateB = parseBrazilianDateString(b.date)?.getTime() || 0;
                return dateB - dateA;
            }).slice(0, 10);

            // Processar estados dos caixas a partir das sessões
            const cashierStates: Pick<CashierState, 'id' | 'cashierNumber' | 'status' | 'operatorName'>[] = cashierSessions.map(s => ({
                id: s.id,
                cashierNumber: s.cashier_number,
                status: s.status as any,
                operatorName: s.employees?.name || s.operator_name || 'Operador'
            }));

            const alerts: DashboardAlert[] = products
                .filter(p => p.active && p.stock_quantity <= p.min_stock_alert)
                .map(p => ({
                    id: `stock-${p.id}`,
                    type: 'warning',
                    message: `Estoque baixo para ${p.name}: ${p.stock_quantity} un.`,
                    timestamp: new Date(),
                }));

            return {
                kpis: { revenueToday, revenueMonth, salesCountToday, averageTicket, customersServed, dailyLosses, saleCancellations },
                salesGoal,
                topSellingProducts,
                salesByHour,
                salesByPaymentMethod,
                recentSales,
                cashierStates,
                stockAlerts: [],
                alerts,
            };
        };

        const initialData = processData(initialSales, initialProducts, internalUseEntries, cashierSessions);
        setData(initialData);
        setLoading(false);

    }, [initialSales, initialProducts, internalUseEntries, settings, cashierSessions]);

    return { data, loading };
};

export default useDashboardData;
