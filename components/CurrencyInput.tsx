
import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number; // O valor é sempre um número (ex: 123.45)
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, placeholder, className }) => {
  const [displayValue, setDisplayValue] = useState('0,00');

  useEffect(() => {
    // Atualiza a exibição somente se o valor da prop for diferente do valor atualmente exibido
    const numericDisplayValue = Number(displayValue.replace(/\./g, '').replace(',', '.'))
    if (Math.abs(value - numericDisplayValue) > 1e-9) {
       setDisplayValue(value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '');

    if (digits) {
      const numericValue = parseInt(digits, 10) / 100;
      onChange(numericValue);
      // Formatação para exibição
      const integerPart = digits.slice(0, -2).padStart(1, '0');
      const fractionalPart = digits.slice(-2).padStart(2, '0');
      const formattedInteger = parseInt(integerPart, 10).toLocaleString('pt-BR');
      setDisplayValue(`${formattedInteger},${fractionalPart}`);
    } else {
      onChange(0);
      setDisplayValue('0,00');
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder || 'R$ 0,00'}
      className={className}
    />
  );
};

export default CurrencyInput;
