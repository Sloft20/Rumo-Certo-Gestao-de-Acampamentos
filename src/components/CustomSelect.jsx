import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ value, onChange, options, label, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef(null);

  const opcoesNormalizadas = options.map(opt => 
    typeof opt === 'object' ? opt : { value: opt, label: opt }
  );

  const opcaoSelecionada = opcoesNormalizadas.find(opt => opt.value === value);
  const textoExibido = opcaoSelecionada ? opcaoSelecionada.label : 'Selecione...';

  const handleSelect = (val) => {
    onChange({ target: { value: val } });
    setIsOpen(false);
  };

  // ACESSIBILIDADE DE TECLADO
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      else if (highlightedIndex >= 0) handleSelect(opcoesNormalizadas[highlightedIndex].value);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      else setHighlightedIndex(prev => (prev < opcoesNormalizadas.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) setHighlightedIndex(opcoesNormalizadas.findIndex(opt => opt.value === value));
  }, [isOpen, value, opcoesNormalizadas]);

  return (
    <div className={`relative w-full ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      
      <div 
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all flex justify-between items-center cursor-pointer select-none"
      >
        <span className="font-medium truncate pr-2">{textoExibido}</span>
        <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-[9998]" />}

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-800 z-[9999] max-h-[220px] overflow-y-auto p-1.5 animate-in slide-in-from-top-2 fade-in duration-150">
          {opcoesNormalizadas.map((opt, index) => {
            const isSelected = opt.value === value;
            const isHighlighted = index === highlightedIndex;
            return (
              <div
                key={index}
                onClick={() => handleSelect(opt.value)}
                className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors mb-0.5 last:mb-0 ${
                  isSelected 
                    ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold' 
                    : isHighlighted 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                      : 'text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}