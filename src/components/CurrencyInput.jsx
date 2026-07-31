import React from 'react';

export default function CurrencyInput({ value, onChange, label, placeholder, required = false }) {
  
  // Função que aplica a máscara em tempo real
  const handleMudanca = (e) => {
    // Remove tudo o que não for número
    const apenasNumeros = e.target.value.replace(/\D/g, '');
    
    if (!apenasNumeros) {
      onChange({ target: { value: '' } });
      return;
    }

    // Converte para decimal (ex: 1500 -> 15.00)
    const valorDecimal = (Number(apenasNumeros) / 100).toFixed(2);
    
    // Dispara o evento como se fosse um input nativo
    onChange({ target: { value: valorDecimal } });
  };

  // Função que formata o valor atual para exibir na tela
  const exibirValorFormatado = () => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        type="text"
        inputMode="numeric"
        value={exibirValorFormatado()}
        onChange={handleMudanca}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all placeholder-slate-400 font-bold"
      />
    </div>
  );
}