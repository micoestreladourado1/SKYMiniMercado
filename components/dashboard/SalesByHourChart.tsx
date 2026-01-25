
import React, { useState } from 'react';
import { SalesByHour } from '../../types';

interface SalesByHourChartProps {
    data: SalesByHour[];
}

const SalesByHourChart: React.FC<SalesByHourChartProps> = ({ data }) => {
    const [hoveredBar, setHoveredBar] = useState<{ hour: number; total: number; x: number; y: number } | null>(null);

    const chartHeight = 250;
    const chartWidth = 1000;
    const padding = 20;
    const innerHeight = chartHeight - padding * 2;
    const innerWidth = chartWidth - padding * 2;
    const barWidth = innerWidth / data.length;
    const maxValue = Math.max(...data.map(d => d.total), 1);

    return (
        <div className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-md shadow-2xl h-full flex flex-col transition-all hover:border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Fluxo de Vendas (Hora)
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Faturamento distribuído ao longo do dia</p>
                </div>
            </div>

            <div className="relative flex-1 min-h-[250px]">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full drop-shadow-2xl">
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.2" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
                        <line
                            key={i}
                            x1={padding}
                            y1={padding + innerHeight * (1 - tick)}
                            x2={innerWidth + padding}
                            y2={padding + innerHeight * (1 - tick)}
                            className="stroke-gray-800/50"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    ))}

                    {data.map((item, index) => {
                        const barHeight = (item.total / maxValue) * innerHeight;
                        const x = padding + index * barWidth;
                        const y = padding + innerHeight - barHeight;

                        return (
                            <g key={item.hour} className="group/bar">
                                <rect
                                    x={x + 2}
                                    y={y}
                                    width={barWidth - 4}
                                    height={barHeight}
                                    rx="4"
                                    fill="url(#barGradient)"
                                    className="transition-all duration-300 hover:opacity-100 opacity-80"
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const svgRect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                                        setHoveredBar({
                                            hour: item.hour,
                                            total: item.total,
                                            x: (rect.left + rect.width / 2) - svgRect.left,
                                            y: rect.top - svgRect.top
                                        });
                                    }}
                                    onMouseLeave={() => setHoveredBar(null)}
                                />
                                {item.total > 0 && (
                                    <circle
                                        cx={x + barWidth / 2}
                                        cy={y}
                                        r="2"
                                        className="fill-cyan-400 group-hover/bar:fill-white transition-colors"
                                        filter="url(#glow)"
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>

                {hoveredBar && (
                    <div
                        className="absolute bg-gray-900/95 border border-cyan-500/50 text-white text-[10px] rounded-lg py-2 px-3 pointer-events-none shadow-2xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-2 z-50 flex flex-col items-center"
                        style={{ left: `${(hoveredBar.x / chartWidth) * 100}%`, top: `${(hoveredBar.y / chartHeight) * 100}%` }}
                    >
                        <span className="font-black text-xs text-cyan-400">{hoveredBar.hour}:00</span>
                        <span className="font-mono mt-0.5">R$ {hoveredBar.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <div className="absolute w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-cyan-500/50 -bottom-1 left-1/2 -translate-x-1/2"></div>
                    </div>
                )}
            </div>

            <div className="flex justify-between mt-4 px-2">
                <span className="text-[10px] font-bold text-gray-600">00:00</span>
                <span className="text-[10px] font-bold text-gray-600">12:00</span>
                <span className="text-[10px] font-bold text-gray-600">23:00</span>
            </div>
        </div>
    );
};

export default SalesByHourChart;
