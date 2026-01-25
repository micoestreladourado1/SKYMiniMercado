
import React from 'react';
import { Employee, DashboardData } from '../types';
import KpiCard from './dashboard/KpiCard';
import SalesByHourChart from './dashboard/SalesByHourChart';
import RealtimeSalesTable from './dashboard/RealtimeSalesTable';
import AlertsPanel from './dashboard/AlertsPanel';
import CashierStatusGrid from './dashboard/CashierStatusGrid';
import DailyGoalProgress from './dashboard/DailyGoalProgress';
import TopProducts from './dashboard/TopProducts';
import PaymentMethodsChart from './dashboard/PaymentMethodsChart';

interface DashboardScreenProps {
    loggedInUser: Employee;
    data: DashboardData | null;
    loading: boolean;
    onReverseCompletedSale: (saleId: number, reason: string) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ loggedInUser, data, loading, onReverseCompletedSale }) => {

    if (loading) {
        return <div className="p-6 text-center">Carregando dados do dashboard...</div>;
    }

    if (!data) {
        return <div className="p-6 text-center text-red-500">Erro ao carregar os dados.</div>;
    }

    const { kpis, salesByHour, recentSales, cashierStates, alerts, salesGoal, topSellingProducts, salesByPaymentMethod } = data;

    // Controle de acesso baseado no perfil
    const canViewFinancial = ['Diretor', 'Gerente Geral', 'Financeiro'].includes(loggedInUser.role);
    const canViewOperational = ['Diretor', 'Gerente Geral', 'Gerente Loja', 'Supervisor Caixa'].includes(loggedInUser.role);


    return (
        <div className="p-4 md:p-8 space-y-8 bg-gray-950 min-h-screen text-gray-100">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Dashboard de Operações
                    </h1>
                    <p className="text-gray-400 font-medium mt-1">
                        Visão analítica em tempo real. Bem-vindo, <span className="text-cyan-400">{loggedInUser.name}</span>.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Sistema Ativo</span>
                    </div>
                </div>
            </header>

            {/* Seção de KPIs Principais - 4 Principais em destaque */}
            {canViewFinancial && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard title="Faturamento Hoje" value={`R$ ${kpis.revenueToday.toFixed(2)}`} icon="currency" highlight />
                    <KpiCard title="Faturamento Mês" value={`R$ ${kpis.revenueMonth.toFixed(2)}`} icon="chart" />
                    <KpiCard title="Vendas Hoje" value={kpis.salesCountToday.toString()} icon="receipt" />
                    <KpiCard title="Ticket Médio" value={`R$ ${kpis.averageTicket.toFixed(2)}`} icon="cart" />
                </div>
            )}

            {/* Bento Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-max">

                {/* Vendas por Hora - Grande destaque */}
                <div className="lg:col-span-8 group">
                    {canViewOperational && <SalesByHourChart data={salesByHour} />}
                </div>

                {/* Meta Diária - Destaque lateral */}
                <div className="lg:col-span-4">
                    {canViewFinancial && <DailyGoalProgress goal={salesGoal.goal} current={kpis.revenueToday} progress={salesGoal.progress} />}
                </div>

                {/* Produtos Mais Vendidos */}
                <div className="lg:col-span-4 h-full">
                    {canViewOperational && <TopProducts products={topSellingProducts} />}
                </div>

                {/* Meios de Pagamento */}
                <div className="lg:col-span-4 h-full">
                    {canViewFinancial && <PaymentMethodsChart data={salesByPaymentMethod} />}
                </div>

                {/* Coluna Operacional Lateral (Caixas + Alertas) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {canViewOperational && <CashierStatusGrid cashiers={cashierStates} />}
                    {canViewOperational && <AlertsPanel alerts={alerts} />}
                </div>

                {/* Tabela de Vendas Recentes - Full Width */}
                <div className="lg:col-span-12">
                    {canViewOperational && <RealtimeSalesTable
                        sales={recentSales}
                        loggedInUser={loggedInUser}
                        onReverseSale={onReverseCompletedSale}
                    />}
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;