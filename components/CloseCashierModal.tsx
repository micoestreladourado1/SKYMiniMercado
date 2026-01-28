
import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import jsPDF from 'jspdf';
import { CashierState, CompletedSale, PaymentMethod, CashierClosingSummary, SystemSettings } from '../types';
import CurrencyInput from './CurrencyInput';

interface CloseCashierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmClose: () => void;
    cashierState: CashierState;
    sessionSales: CompletedSale[]; // Kept for backward compatibility if used elsewhere, but we use allSales for financial summary
    allSales: CompletedSale[];
}

const modalRoot = document.getElementById('modal-root');

const CloseCashierModal: React.FC<CloseCashierModalProps & { settings?: SystemSettings }> = ({ isOpen, onClose, onConfirmClose, cashierState, sessionSales, allSales, settings }) => {
    const [step, setStep] = useState<'input' | 'summary'>('input');
    const [countedCash, setCountedCash] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setStep('input');
            setCountedCash(0);
        }
    }, [isOpen]);

    const summary = useMemo<CashierClosingSummary | null>(() => {
        if (cashierState.status !== 'open' || !cashierState.openTime) return null;

        // Helper function for date parsing (matching Dashboard logic)
        const parseBrazilianDateString = (dateStr: string): Date | null => {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
        };

        const todayStr = new Date().toLocaleDateString('pt-BR');

        // Filter allSales to only include financially completed sales from TODAY (matches Dashboard)
        const financiallyCompletedSalesToday = allSales.filter(s => {
            const saleDate = parseBrazilianDateString(s.date);
            const isToday = saleDate ? saleDate.toLocaleDateString('pt-BR') === todayStr : false;
            return s.status === 'completed' && s.paymentMethod !== 'Fiado' && isToday;
        });

        const payments: { [key in PaymentMethod]?: number } & { total: number } = { total: 0 };

        financiallyCompletedSalesToday.forEach(sale => {
            // Use the same logic as Dashboard for consistency
            if (sale.payments && sale.payments.length > 0) {
                // Multi-payment: normalize amounts to ensure they sum to sale.total
                const paymentsSum = sale.payments.reduce((sum, p) => sum + p.amount, 0);

                sale.payments.forEach(p => {
                    if (p.method !== 'Fiado') {
                        // Normalize if there's a discrepancy between payments sum and sale.total
                        const amount = Math.abs(paymentsSum - sale.total) < 0.01
                            ? p.amount
                            : (p.amount / paymentsSum) * sale.total;
                        payments[p.method] = (payments[p.method] || 0) + amount;
                    }
                });
            } else if (sale.paymentMethod && sale.paymentMethod !== 'Fiado' && sale.paymentMethod !== 'Múltiplo') {
                // Single payment method: use sale.total directly
                const method = sale.paymentMethod as PaymentMethod;
                payments[method] = (payments[method] || 0) + sale.total;
            }
            payments.total += sale.total;
        });

        const expectedInCash = (cashierState.openingBalance || 0) + (payments['Dinheiro'] || 0);
        const expectedTotal = (cashierState.openingBalance || 0) + payments.total;

        const openTime = new Date(cashierState.openTime.split(', ')[0].split('/').reverse().join('-') + 'T' + cashierState.openTime.split(', ')[1]);
        const closeTime = new Date();
        const durationMs = closeTime.getTime() - openTime.getTime();
        const durationHours = Math.floor(durationMs / 3600000);
        const durationMinutes = Math.floor((durationMs % 3600000) / 60000);
        const duration = `${durationHours}h ${durationMinutes}min`;

        const general = settings?.general;

        return {
            establishment: {
                name: general?.companyName || 'SKYMiniMercado',
                cnpj: general?.cnpj || 'N/A',
                address: general?.address || 'N/A',
            },
            cashierInfo: {
                number: cashierState.cashierNumber || 1,
                closingTime: closeTime.toLocaleString('pt-BR'),
            },
            operatorInfo: {
                name: cashierState.operatorName || 'N/A',
            },
            period: {
                openTime: cashierState.openTime,
                closeTime: closeTime.toLocaleString('pt-BR'),
                duration: duration,
            },
            salesSummary: {
                grossSales: payments.total,
                netSales: payments.total,
            },
            payments,
            movements: {
                openingBalance: cashierState.openingBalance || 0,
            },
            conference: {
                expectedInCash,
                expectedTotal,
                countedCash,
                difference: countedCash - expectedInCash,
            }
        };
    }, [cashierState, allSales, countedCash, settings]);

    const generateClosingPdf = (summaryData: CashierClosingSummary) => {
        const pdfWidth = 80; // Changed to 80mm standard thermal
        const leftMargin = 4;
        const rightMargin = pdfWidth - 4;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [pdfWidth, 300] // Long format
        });

        let y = 8;
        const lineSpacing = 4.2;
        const smallSpacing = 3;

        pdf.setFont('courier', 'normal');

        const drawSeparator = () => {
            pdf.setFontSize(8);
            pdf.text('------------------------------------------', pdfWidth / 2, y, { align: 'center' });
            y += smallSpacing;
        };

        const drawSectionHeader = (title: string) => {
            drawSeparator();
            pdf.setFont('courier', 'bold');
            pdf.setFontSize(9);
            pdf.text(title, pdfWidth / 2, y, { align: 'center' });
            y += lineSpacing;
            drawSeparator();
            pdf.setFontSize(8);
            pdf.setFont('courier', 'normal');
        };

        const drawRow = (label: string, value: string) => {
            pdf.text(label.toUpperCase(), leftMargin, y);
            pdf.text(value, rightMargin, y, { align: 'right' });
            y += lineSpacing;
        };

        // Header
        pdf.setFont('courier', 'bold');
        pdf.setFontSize(10);
        pdf.text(summaryData.establishment.name.toUpperCase(), pdfWidth / 2, y, { align: 'center' });
        y += lineSpacing;

        pdf.setFontSize(7);
        pdf.setFont('courier', 'normal');
        if (summaryData.establishment.cnpj !== 'N/A') {
            pdf.text(`CNPJ: ${summaryData.establishment.cnpj}`, pdfWidth / 2, y, { align: 'center' });
            y += smallSpacing;
        }
        if (summaryData.establishment.address !== 'N/A') {
            const splitAddress = pdf.splitTextToSize(summaryData.establishment.address, pdfWidth - 10);
            pdf.text(splitAddress, pdfWidth / 2, y, { align: 'center' });
            y += (splitAddress.length * smallSpacing);
        }
        y += 2;

        pdf.setFontSize(9);
        pdf.setFont('courier', 'bold');
        pdf.text('FECHAMENTO DE CAIXA', pdfWidth / 2, y, { align: 'center' });
        y += lineSpacing + 2;

        // Sections
        drawSectionHeader('DADOS DA SESSAO');
        drawRow('Caixa:', String(summaryData.cashierInfo.number));
        drawRow('Operador:', summaryData.operatorInfo.name);
        drawRow('Abertura:', summaryData.period.openTime);
        drawRow('Fechamento:', summaryData.period.closeTime);
        drawRow('Duracao:', summaryData.period.duration);

        drawSectionHeader('RESUMO FINANCEIRO');
        drawRow('Vendas Brutas:', `R$ ${summaryData.salesSummary.grossSales.toFixed(2)}`);
        pdf.setFont('courier', 'bold');
        drawRow('Vendas Liquidas:', `R$ ${summaryData.salesSummary.netSales.toFixed(2)}`);
        pdf.setFont('courier', 'normal');

        drawSectionHeader('FORMAS DE PAGAMENTO');
        Object.entries(summaryData.payments).filter(([key]) => key !== 'total').forEach(([method, total]) => {
            const displayValue = total as number;

            if (displayValue > 0) {
                drawRow(`${method}:`, `R$ ${displayValue.toFixed(2)}`);
            }
        });

        drawSectionHeader('CONFERENCIA DE DINHEIRO');
        drawRow('Fundo Inicial:', `R$ ${summaryData.movements.openingBalance.toFixed(2)}`);
        drawRow('Vendas (Din):', `R$ ${(summaryData.payments['Dinheiro'] || 0).toFixed(2)}`);
        drawRow('Esperado em Din:', `R$ ${summaryData.conference.expectedInCash.toFixed(2)}`);
        drawRow('Valor Digitado:', `R$ ${summaryData.conference.countedCash.toFixed(2)}`);

        drawSeparator();
        pdf.setFontSize(10);
        pdf.setFont('courier', 'bold');
        const diff = summaryData.conference.difference;
        let diffLabel = 'DIFERENCA:';
        let diffText = `R$ ${diff.toFixed(2)}`;
        if (Math.abs(diff) < 0.01) diffText += ' (OK)';
        else if (diff > 0) diffText += ' (SOBRA)';
        else diffText += ' (FALTA)';
        drawRow(diffLabel, diffText);

        y += 10;
        pdf.setFontSize(8);
        pdf.setFont('courier', 'normal');
        pdf.text('________________________________', pdfWidth / 2, y, { align: 'center' });
        y += 4;
        pdf.text('ASSINATURA DO OPERADOR', pdfWidth / 2, y, { align: 'center' });

        const date = new Date();
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
        pdf.save(`fechamento-caixa-${formattedDate}.pdf`);
    };

    const handleConfirmAndPrint = () => {
        if (summary) {
            generateClosingPdf(summary);
        }
        onConfirmClose();
    };

    if (!isOpen || !modalRoot) return null;

    const renderDifference = () => {
        const diff = summary!.conference.difference;
        if (Math.abs(diff) < 0.01) {
            return <span className="text-gray-300">R$ 0,00 (Zerado)</span>;
        }
        if (diff > 0) {
            return <span className="text-green-400">R$ {diff.toFixed(2)} (Sobra)</span>;
        }
        return <span className="text-red-400">R$ {diff.toFixed(2)} (Falta)</span>;
    };

    const renderInputStep = () => (
        <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Fechamento de Caixa</h2>
            <div className="space-y-4">
                <label className="block text-lg font-medium text-gray-300 mb-1 text-center">
                    Qual o valor total em <span className="font-bold text-cyan-400">Dinheiro</span> contado no caixa?
                </label>
                <CurrencyInput
                    value={countedCash}
                    onChange={setCountedCash}
                    className="w-full bg-gray-900 border border-gray-600 text-white text-4xl text-center rounded-md p-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
            </div>
            <div className="flex justify-end space-x-4 mt-8">
                <button onClick={onClose} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-md transition-colors">Cancelar</button>
                <button onClick={() => setStep('summary')} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-md transition-colors">Conferir Resumo</button>
            </div>
        </div>
    );

    const ReportRow: React.FC<{ label: string; value: string | number; isBold?: boolean }> = ({ label, value, isBold }) => (
        <div className="flex justify-between">
            <span>{label}</span>
            <span className={isBold ? 'font-bold' : ''}>
                {typeof value === 'number' ? `R$ ${value.toFixed(2)}` : value}
            </span>
        </div>
    );

    const ReportSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div>
            <h3 className="text-sm font-bold border-b-2 border-dashed border-gray-600 pb-1 mb-2 uppercase">{title}</h3>
            <div className="space-y-1 text-sm">{children}</div>
        </div>
    );


    const renderSummaryStep = () => {
        if (!summary) return <div>Erro ao carregar o resumo.</div>;

        return (
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 border border-gray-700 flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-4 text-center">Relatório de Fechamento de Caixa</h2>
                <div className="flex-1 bg-gray-900/50 p-4 rounded-md overflow-y-auto max-h-[60vh] font-mono text-gray-300 space-y-4">

                    <ReportSection title="1. Identificação do Estabelecimento">
                        <p>{summary.establishment.name}</p>
                        <p>CNPJ: {summary.establishment.cnpj}</p>
                        <p>{summary.establishment.address}</p>
                    </ReportSection>

                    <ReportSection title="2. Identificação do Caixa">
                        <ReportRow label="Número do Caixa:" value={summary.cashierInfo.number} />
                        <ReportRow label="Data/Hora Fechamento:" value={summary.cashierInfo.closingTime} />
                    </ReportSection>

                    <ReportSection title="3. Identificação do Operador">
                        <ReportRow label="Nome do Operador:" value={summary.operatorInfo.name} />
                    </ReportSection>

                    <ReportSection title="4. Período do Caixa">
                        <ReportRow label="Abertura:" value={summary.period.openTime} />
                        <ReportRow label="Fechamento:" value={summary.period.closeTime} />
                        <ReportRow label="Tempo de Operação:" value={summary.period.duration} />
                    </ReportSection>

                    <ReportSection title="5. Resumo de Vendas">
                        <ReportRow label="Total de Vendas Brutas:" value={summary.salesSummary.grossSales} />
                        <ReportRow label="Total Líquido de Vendas:" value={summary.salesSummary.netSales} isBold />
                    </ReportSection>

                    <ReportSection title="6. Formas de Pagamento">
                        {Object.entries(summary.payments).filter(([key]) => key !== 'total').map(([method, total]) => {
                            const displayValue = total as number;

                            return (
                                <ReportRow key={method} label={`${method}:`} value={displayValue} />
                            );
                        })}
                    </ReportSection>

                    <ReportSection title="7. Movimentações de Caixa">
                        <ReportRow label="Fundo de Caixa Inicial:" value={summary.movements.openingBalance} />
                    </ReportSection>

                    <ReportSection title="8. Conferência Final (Dinheiro)">
                        <ReportRow label="Total em Dinheiro Esperado (Fundo+Vendas):" value={summary.conference.expectedInCash} isBold />
                        <div className="my-2 border-t border-dashed border-gray-700"></div>
                        <ReportRow label="Valor Digitado (Contado):" value={summary.conference.countedCash} />
                        <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-gray-600">
                            <span>DIFERENÇA:</span>
                            {renderDifference()}
                        </div>
                    </ReportSection>

                </div>
                <div className="flex justify-between items-center mt-6">
                    <button onClick={() => setStep('input')} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-md transition-colors">Voltar</button>
                    <button onClick={handleConfirmAndPrint} className="px-6 py-3 bg-red-800 hover:bg-red-700 text-white font-bold rounded-md transition-colors">Confirmar Fechamento</button>
                </div>
            </div>
        );
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            {step === 'input' ? renderInputStep() : renderSummaryStep()}
        </div>
    );

    return ReactDOM.createPortal(modalContent, modalRoot);
};

export default CloseCashierModal;
