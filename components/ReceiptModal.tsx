
import React from 'react';
import ReactDOM from 'react-dom';
import jsPDF from 'jspdf';
import { CompletedSale } from '../types';

interface ReceiptModalProps {
    isOpen: boolean;
    onNewSale: () => void;
    saleData: CompletedSale | null;
}

const modalRoot = document.getElementById('modal-root');

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onNewSale, saleData }) => {
    if (!isOpen || !saleData || !modalRoot) return null;

    const handlePrint = () => {
        if (!saleData) return;

        const pdfWidth = 72;
        const leftMargin = 5;
        const rightMargin = pdfWidth - 5;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [pdfWidth, 297] // A altura é ajustada dinamicamente
        });

        let y = 10;
        const lineSpacing = 4.2;
        const smallSpacing = 3;

        pdf.setFont('courier', 'normal');

        // Header
        pdf.setFont('courier', 'bold');
        pdf.setFontSize(11);
        pdf.text('SKYMiniMercado', pdfWidth / 2, y, { align: 'center' });
        y += lineSpacing;

        pdf.setFont('courier', 'normal');
        pdf.setFontSize(8);
        pdf.text('Rua das Flores, 123 - Centro', pdfWidth / 2, y, { align: 'center' });
        y += smallSpacing;
        pdf.text('CNPJ: 11.145.678/0001-99', pdfWidth / 2, y, { align: 'center' });
        y += smallSpacing;
        pdf.text('----------------------------------', pdfWidth / 2, y, { align: 'center' });
        y += lineSpacing;
        pdf.setFont('courier', 'bold');
        pdf.text('CUPOM NAO FISCAL', pdfWidth / 2, y, { align: 'center' });
        y += smallSpacing;
        pdf.setFont('courier', 'normal');
        pdf.text('----------------------------------', pdfWidth / 2, y, { align: 'center' });
        y += lineSpacing;

        // Itens
        pdf.setFontSize(8);
        saleData.cart.forEach(item => {
            const maxNameLength = 30;
            const itemName = item.name.length > maxNameLength ? item.name.substring(0, maxNameLength) : item.name;
            pdf.text(itemName, leftMargin, y);
            y += lineSpacing;

            const quantityStr = `${item.quantity.toLocaleString('pt-BR', { minimumFractionDigits: 3 })}un x R$ ${item.price.toFixed(2)}`;
            const subtotalStr = `R$ ${(item.price * item.quantity).toFixed(2)}`;
            pdf.text(quantityStr, leftMargin, y);
            pdf.text(subtotalStr, rightMargin, y, { align: 'right' });
            y += lineSpacing;
        });

        // Totais
        pdf.text('----------------------------------', pdfWidth / 2, y, { align: 'center' });
        y += lineSpacing;

        pdf.setFontSize(9);
        const drawRow = (label: string, value: string) => {
            pdf.text(label, leftMargin, y);
            pdf.text(value, rightMargin, y, { align: 'right' });
            y += lineSpacing;
        }

        drawRow('Subtotal', `R$ ${saleData.subtotal.toFixed(2)}`);
        if (saleData.discount > 0) {
            drawRow('Desconto', `- R$ ${saleData.discount.toFixed(2)}`);
        }
        pdf.setFont('courier', 'bold');
        drawRow('TOTAL', `R$ ${saleData.total.toFixed(2)}`);
        pdf.setFont('courier', 'normal');
        y += smallSpacing;

        if (saleData.payments && saleData.payments.length > 1) {
            saleData.payments.forEach(p => {
                drawRow(p.method, `R$ ${p.amount.toFixed(2)}`);
            });
        } else {
            drawRow(saleData.paymentMethod, `R$ ${saleData.amountPaid.toFixed(2)}`);
        }

        drawRow('Troco', `R$ ${saleData.change.toFixed(2)}`);

        // Footer
        pdf.text('----------------------------------', pdfWidth / 2, y, { align: 'center' });
        y += lineSpacing;

        pdf.setFontSize(8);
        pdf.text(saleData.date, pdfWidth / 2, y, { align: 'center' });
        y += smallSpacing;
        pdf.text('Obrigado pela preferência!', pdfWidth / 2, y, { align: 'center' });

        const date = new Date();
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
        pdf.save(`cupom-venda-${formattedDate}.pdf`);
    };

    const renderPaymentDetails = () => {
        if (saleData.payments && saleData.payments.length > 1) {
            return saleData.payments.map((p, index) => (
                <div key={index} className="flex justify-between">
                    <span>{p.method}</span>
                    <span>R$ {p.amount.toFixed(2)}</span>
                </div>
            ));
        }
        return (
            <div className="flex justify-between">
                <span>{saleData.paymentMethod}</span>
                <span>R$ {saleData.amountPaid.toFixed(2)}</span>
            </div>
        );
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white text-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6 flex flex-col">
                <div id="printable-receipt" className="font-mono">
                    <div className="text-center mb-4">
                        <h2 className="text-xl font-bold">SKYMiniMercado</h2>
                        <p className="text-xs">Rua das Flores, 123 - Centro</p>
                        <p className="text-xs">CNPJ: 11.145.678/0001-99</p>
                        <p className="text-xs">--------------------------------</p>
                        <h3 className="font-bold">CUPOM NÃO FISCAL</h3>
                        <p className="text-xs">--------------------------------</p>
                    </div>

                    <div className="text-xs space-y-1 flex-1 overflow-y-auto max-h-60 mb-2">
                        {saleData.cart.map(item => (
                            <div key={item.id} className="grid grid-cols-6 gap-1">
                                <div className="col-span-3 truncate">{item.name}</div>
                                <div className="text-right">{item.quantity.toLocaleString('pt-BR', { minimumFractionDigits: 3 })}x</div>
                                <div className="text-right">{item.price.toFixed(2)}</div>
                                <div className="text-right font-bold">{(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t-2 border-dashed border-gray-400 my-2"></div>

                    <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>R$ {saleData.subtotal.toFixed(2)}</span>
                        </div>
                        {saleData.discount > 0 && (
                            <div className="flex justify-between">
                                <span>Desconto</span>
                                <span>- R$ {saleData.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold">
                            <span>TOTAL</span>
                            <span>R$ {saleData.total.toFixed(2)}</span>
                        </div>

                        <div className="border-t border-dashed border-gray-400 my-1"></div>
                        {renderPaymentDetails()}

                        <div className="flex justify-between">
                            <span>Troco</span>
                            <span>R$ {saleData.change.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-400 my-2"></div>

                    <div className="text-center text-xs mt-2">
                        <p>{saleData.date}</p>
                        <p>Obrigado pela preferência!</p>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    <button
                        onClick={onNewSale}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg py-3 rounded-md transition-colors"
                    >
                        Nova Venda
                    </button>
                    <button
                        onClick={handlePrint}
                        className="w-full flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white font-bold text-lg py-3 rounded-md transition-colors"
                    >
                        <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062-.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0c1.291-.646 2.098-1.956 2.098-3.418 0-2.26-1.83-4.09-4.09-4.09S9.01 8.322 9.01 10.582c0 1.462.807 2.772 2.098 3.418m11.318 0-1.875 .937m-11.318 0 .937-.469" />
                        </svg>
                        Imprimir
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, modalRoot);
};

export default ReceiptModal;
