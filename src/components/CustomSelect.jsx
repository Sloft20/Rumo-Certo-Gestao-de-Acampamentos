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
    <div style={{ position: 'relative', width: '100%' }} className={className}>
      {label && <label className="label-moderna">{label}</label>}
      
      {/* Gatilho Visual do Dropdown */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="input-moderno"
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          userSelect: 'none',
          paddingRight: '16px'
        }}
      >
        <span style={{ fontWeight: '500' }}>{textoExibido}</span>
        <ChevronDown 
          size={18} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            color: '#94a3b8'
          }} 
        />
      </div>

      {/* Camada invisível para fechar o dropdown ao clicar fora */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}
        />
      )}

      {/* Lista de Opções Absoluta */}
      {isOpen && (
        <div 
          className="dropdown-opcoes"
          style={{ 
            position: 'absolute', 
            top: 'calc(100% + 6px)', 
            left: 0, 
            right: 0, 
            backgroundColor: '#ffffff', 
            borderRadius: '14px', 
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)', 
            border: '1px solid #e2e8f0', 
            zIndex: 9999, 
            maxHeight: '220px', 
            overflowY: 'auto',
            padding: '6px',
            animation: 'slideUp 0.15s ease-out'
          }}
        >
          {opcoesNormalizadas.map((opt, index) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={index}
                onClick={() => handleSelect(opt.value)}
                className={`opcao-item ${isSelected ? 'selecionada' : ''}`}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isSelected ? '700' : '600',
                  backgroundColor: isSelected ? '#f0fdfa' : 'transparent',
                  color: isSelected ? '#0d9488' : '#334155',
                  transition: '0.15s ease',
                  marginBottom: index === opcoesNormalizadas.length - 1 ? 0 : '2px'
                }}
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