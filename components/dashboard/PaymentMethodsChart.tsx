
import React from 'react';
import { PaymentMethod } from '../../types';

interface PaymentMethodsChartProps {
    data: { method: PaymentMethod | string; total: number }[];
}

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

const getArcPath = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    const startX = cx + radius * Math.cos(startRad);
    const startY = cy + radius * Math.sin(startRad);
    const endX = cx + radius * Math.cos(endRad);
    const endY = cy + radius * Math.sin(endRad);

    return `M ${cx},${cy} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;
};

const PaymentMethodsChart: React.FC<PaymentMethodsChartProps> = ({ data }) => {
    const totalValue = data.reduce((sum, item) => sum + item.total, 0);

    let startAngle = 0;
    const innerRadius = 35; // Donut radius

    const getArcPath = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;
        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

        const x1 = cx + radius * Math.cos(startRad);
        const y1 = cy + radius * Math.sin(startRad);
        const x2 = cx + radius * Math.cos(endRad);
        const y2 = cy + radius * Math.sin(endRad);

        const x3 = cx + innerRadius * Math.cos(endRad);
        const y3 = cy + innerRadius * Math.sin(endRad);
        const x4 = cx + innerRadius * Math.cos(startRad);
        const y4 = cy + innerRadius * Math.sin(startRad);

        return `M ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} L ${x3},${y3} A ${innerRadius},${innerRadius} 0 ${largeArcFlag} 0 ${x4},${y4} Z`;
    };

    return (
        <div className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-md shadow-2xl h-full flex flex-col transition-all hover:border-gray-700/50">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        Métodos de Pagamento
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Distribuição do faturamento por tipo</p>
                </div>
            </div>

            {totalValue > 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    <div className="relative w-48 h-48 drop-shadow-[0_0_20px_rgba(6,182,212,0.15)] group">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform hover:scale-105 transition-transform duration-500">
                            {data.map((item, index) => {
                                const angle = (item.total / totalValue) * 360;
                                const endAngle = startAngle + angle;
                                const path = getArcPath(50, 50, 50, startAngle, endAngle);
                                startAngle = endAngle;
                                return (
                                    <path
                                        key={index}
                                        d={path}
                                        fill={COLORS[index % COLORS.length]}
                                        className="hover:opacity-80 transition-opacity cursor-pointer stroke-gray-900/50"
                                        strokeWidth="1"
                                    />
                                );
                            })}

                            {/* Central info */}
                            <circle cx="50" cy="50" r={innerRadius - 2} className="fill-gray-950/50 backdrop-blur-xl" />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total</span>
                            <span className="text-xl font-black text-white">R$ {totalValue >= 1000 ? (totalValue / 1000).toFixed(1) + 'k' : totalValue.toFixed(0)}</span>
                        </div>
                    </div>

                    <div className="w-full space-y-3">
                        {data.map((item, index) => {
                            const percent = totalValue > 0 ? (item.total / totalValue) * 100 : 0;
                            return (
                                <div key={index} className="group/item">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className={`${item.total > 0 ? 'text-gray-400 group-hover/item:text-white' : 'text-gray-600'} transition-colors`}>{item.method}</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[10px] font-bold text-gray-500">{percent.toFixed(1)}%</span>
                                            <span className={`font-bold ${item.total > 0 ? 'text-white' : 'text-gray-600'}`}>R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-800/50 h-1 rounded-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-1000"
                                            style={{ backgroundColor: COLORS[index % COLORS.length], width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-gray-700/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <p className="text-gray-500 font-medium">Aguardando transações...</p>
                </div>
            )}
        </div>
    );
};

export default PaymentMethodsChart;
