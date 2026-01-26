
import React from 'react';
import ReactDOM from 'react-dom';
import jsPDF from 'jspdf';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCorrect: () => void;
    onConfirmAndExport: () => void;
    details: { operatorName: string; openingBalance: number } | null;
}

const modalRoot = document.getElementById('modal-root');

const CashierConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onCorrect, onConfirmAndExport, details }) => {
    if (!isOpen || !details || !modalRoot) return null;

    const openTime = new Date();

    const generateAndDownloadPdf = () => {
        try {
            const pdfWidth = 72; // Largura do papel térmico em mm
            const leftMargin = 5;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [pdfWidth, 120] // Altura é arbitrária, o conteúdo define o tamanho final
            });

            let y = 10; // Posição Y atual

            pdf.setFont('courier', 'bold');
            pdf.setFontSize(12);
            pdf.text('SKYMiniMercado', pdfWidth / 2, y, { align: 'center' });
            y += 6;

            pdf.setFont('courier', 'normal');
            pdf.setFontSize(8);
            pdf.text('Comprovante de Abertura de Caixa', pdfWidth / 2, y, { align: 'center' });
            y += 4;

            pdf.text('-----------------------------------', pdfWidth / 2, y, { align: 'center' });
            y += 5;

            pdf.setFontSize(9);
            pdf.text(`Data: ${openTime.toLocaleDateString('pt-BR')}`, leftMargin, y);
            y += 5;
            pdf.text(`Hora: ${openTime.toLocaleTimeString('pt-BR')}`, leftMargin, y);
            y += 5;
            pdf.text(`Caixa: 01`, leftMargin, y);
            y += 5;
            pdf.text(`Operador: ${details.operatorName}`, leftMargin, y);
            y += 5;

            pdf.text('-----------------------------------', pdfWidth / 2, y, { align: 'center' });
            y += 6;

            pdf.setFont('courier', 'bold');
            pdf.setFontSize(11);
            pdf.text(`VALOR: R$ ${details.openingBalance.toFixed(2).replace('.', ',')}`, leftMargin, y);

            // Inicia o download do arquivo PDF diretamente.
            pdf.save('comprovante-abertura-caixa.pdf');

        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
        }
    };

    const handleConfirmClick = () => {
        generateAndDownloadPdf();
        onConfirmAndExport();
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6 border border-gray-700 flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-4 text-center">Confirmar Abertura</h2>
                {/* O elemento visual para o usuário ver antes de confirmar */}
                <div id="visual-receipt" className="bg-white">
                    <div className="text-center font-mono text-black p-4">
                        <h3 className="text-lg font-bold">SKYMiniMercado</h3>
                        <p className="text-xs border-b border-dashed border-gray-400 pb-2 mb-2">Comprovante de Abertura de Caixa</p>
                        <div className="text-left text-sm space-y-1">
                            <p><strong>Data:</strong> {openTime.toLocaleDateString('pt-BR')}</p>
                            <p><strong>Hora:</strong> {openTime.toLocaleTimeString('pt-BR')}</p>
                            <p><strong>Caixa:</strong> 01</p>
                            <p><strong>Operador:</strong> {details.operatorName}</p>
                            <p className="font-bold text-lg mt-2 border-t border-dashed border-gray-400 pt-2">
                                VALOR: R$ {details.openingBalance.toFixed(2).replace('.', ',')}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 space-y-3">
                    <button
                        onClick={handleConfirmClick}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg py-3 rounded-md transition-colors"
                    >
                        Abrir Caixa e Exportar PDF
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onCorrect}
                            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded-md transition-colors"
                        >
                            Corrigir
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-2 rounded-md transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, modalRoot);
};

export default CashierConfirmationModal;
