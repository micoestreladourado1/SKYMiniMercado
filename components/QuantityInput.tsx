
import React, { useState } from 'react';

/**
 * Componente de input especializado para quantidades de produtos, projetado para PDVs.
 * Implementa um mecanismo de entrada "estilo calculadora" para valores decimais (até 3 casas),
 * ideal para produtos vendidos por peso (ex: quilogramas).
 *
 * Esta versão atualiza a quantidade no componente pai apenas ao sair do campo (on blur) ou
 * ao pressionar Enter, proporcionando uma experiência de edição mais estável e prevenindo
 * que itens sejam removidos acidentalmente durante a digitação.
 *
 * Como funciona:
 * - Ao focar, o input é redefinido para "0,000" para uma nova entrada.
 * - Conforme o usuário digita os números, eles são preenchidos da direita para a esquerda (ex: '123' vira '0,123').
 * - A alteração é confirmada (chamando a prop `onChange`) apenas quando o campo perde o foco ou o usuário pressiona Enter.
 * - Isso evita que o carrinho principal seja atualizado a cada tecla pressionada, resolvendo o problema onde digitar '0' removia o item.
 */
interface QuantityInputProps {
    value: number;
    onChange: (value: number) => void;
}

const QuantityInput: React.FC<QuantityInputProps> = ({ value, onChange }) => {
    // Mantém o valor em string durante a edição. É nulo quando não está editando.
    const [editingValue, setEditingValue] = useState<string | null>(null);

    // Quando não está editando, exibe o valor formatado da prop.
    // Quando está editando, exibe a string de edição atual.
    const displayValue = editingValue === null
        ? value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
        : editingValue;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        // Ao focar, inicia a edição. Inicializa com '0,000' conforme solicitado.
        setEditingValue('0,000');
        // Usa um timeout para garantir que a chamada select() funcione de forma confiável nos navegadores.
        setTimeout(() => e.target.select(), 0);
    };

    const handleBlur = () => {
        if (editingValue === null) return;

        // Analisa o valor final da string de edição.
        const digits = editingValue.replace(/\D/g, '');
        const finalNumericValue = parseInt(digits || '0', 10) / 1000;

        // Se o valor mudou, chama o handler onChange do pai.
        if (Math.abs(finalNumericValue - value) > 1e-9) { // Compara floats com cuidado
            onChange(finalNumericValue);
        }

        // Para de editar. O componente agora exibirá o valor das props novamente.
        setEditingValue(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, '');

        // Formata os dígitos para a string de exibição durante a digitação.
        const integerPart = digits.slice(0, -3) || '0';
        const fractionalPart = digits.slice(-3).padStart(3, '0');
        const formattedInteger = parseInt(integerPart, 10).toLocaleString('pt-BR');
        const formatted = `${formattedInteger},${fractionalPart}`;
        
        setEditingValue(formatted);
    };

    // Lida com a tecla Enter para confirmar a alteração e Escape para cancelar.
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        } else if (e.key === 'Escape') {
            // No Escape, cancela a edição e reverte para o valor original.
            setEditingValue(null);
            e.currentTarget.blur();
        }
    };

    return (
        <input
            type="text"
            inputMode="decimal"
            value={displayValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-24 bg-gray-900/50 text-white text-center text-lg rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
    );
};

export default QuantityInput;
