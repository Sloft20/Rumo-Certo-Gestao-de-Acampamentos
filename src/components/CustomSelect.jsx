import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ value, onChange, options, label, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  // Normaliza as opções para aceitar tanto strings puras quanto objetos { value, label }
  const opcoesNormalizadas = options.map(opt => 
    typeof opt === 'object' ? opt : { value: opt, label: opt }
  );

  // Encontra o item selecionado no momento
  const opcaoSelecionada = opcoesNormalizadas.find(opt => opt.value === value);
  const textoExibido = opcaoSelecionada ? opcaoSelecionada.label : 'Selecione...';

  const handleSelect = (val) => {
    // Simula a estrutura de um evento nativo (e.target.value) para manter compatibilidade
    onChange({ target: { value: val } });
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      
      {/* Gatilho Visual do Dropdown */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all flex justify-between items-center cursor-pointer select-none"
      >
        <span className="font-medium truncate pr-2">{textoExibido}</span>
        <ChevronDown 
          size={18} 
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Camada invisível para fechar o dropdown ao clicar fora */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 z-[9998]"
        />
      )}

      {/* Lista de Opções Absoluta */}
      {isOpen && (
        <div 
          className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-800 z-[9999] max-h-[220px] overflow-y-auto p-1.5 animate-in slide-in-from-top-2 fade-in duration-150"
        >
          {opcoesNormalizadas.map((opt, index) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={index}
                onClick={() => handleSelect(opt.value)}
                className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors mb-0.5 last:mb-0 ${
                  isSelected 
                    ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold' 
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