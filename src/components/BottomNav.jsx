import React, { useState } from 'react';
import { PlusCircle, ScrollText, PieChart, Menu, ChevronLeft } from 'lucide-react';
import IconeTenda from './IconeTenda';

export default function BottomNav({ telaAtual, setTelaAtual }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { id: 'LISTA', label: 'Início', icon: IconeTenda },
    { id: 'NOVO', label: 'Lançar', icon: PlusCircle },
    { id: 'HISTORICO', label: 'Histórico', icon: ScrollText },
    { id: 'RESUMO', label: 'Resumo', icon: PieChart }
  ];

  return (
    <>
      {/* Estilo injetado apenas para empurrar o conteúdo do App.jsx para a direita quando o menu desktop abre */}
      <style>
        {`
          @media (min-width: 768px) {
            .container-aplicacao {
              padding-left: ${isExpanded ? '260px' : '110px'} !important;
              transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
          }
        `}
      </style>

      <nav className={`
        fixed z-[1000] transition-all duration-300 ease-in-out backdrop-blur-xl
        
        /* === MOBILE === */
        bottom-0 left-0 w-full flex flex-row justify-around items-center
        bg-white/90 dark:bg-slate-900/90
        border-t border-slate-200 dark:border-slate-800
        rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)]
        pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 px-2
        
        /* === DESKTOP === */
        md:top-0 md:bottom-auto md:h-screen md:flex-col md:justify-center
        md:rounded-none md:rounded-r-[32px] md:border-t-0 md:border-r
        md:pb-6 md:pt-6
        ${isExpanded ? 'md:w-[240px] md:items-start md:px-4' : 'md:w-[86px] md:items-center md:px-2'}
      `}>
        
        {/* BOTÃO DE EXPANDIR (APENAS DESKTOP) */}
        <button 
          className={`
            hidden md:flex absolute top-8
            ${isExpanded ? 'right-6' : 'left-1/2 -translate-x-1/2'}
            p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 
            dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors
          `}
          onClick={() => setIsExpanded(!isExpanded)} 
          title={isExpanded ? 'Recolher Menu' : 'Expandir Menu'}
        >
          {isExpanded ? <ChevronLeft size={24} /> : <Menu size={24} />}
        </button>

        {/* ITENS DE NAVEGAÇÃO */}
        <div className="flex w-full md:flex-col justify-around md:justify-center gap-1 md:gap-4">
          {navItems.map((item) => {
            const isActive = telaAtual === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setTelaAtual(item.id)}
                className={`
                  group flex flex-col md:flex-row items-center
                  ${isExpanded ? 'md:justify-start' : 'md:justify-center'}
                  gap-1 md:gap-4 md:w-full md:p-3 rounded-2xl
                  transition-all duration-300 ease-out outline-none
                  ${isActive 
                    ? 'text-teal-600 dark:text-teal-400' 
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}
                `}
              >
                {/* ÍCONE COM FUNDO DINÂMICO */}
                <div className={`
                  relative flex items-center justify-center shrink-0
                  w-[38px] h-[38px] md:w-12 md:h-12 rounded-full transition-all duration-300
                  ${isActive 
                    ? 'bg-teal-600 text-white dark:bg-teal-400 dark:text-slate-900 shadow-md shadow-teal-500/30 -translate-y-1 md:translate-y-0' 
                    : 'bg-transparent text-slate-400 dark:text-slate-500 group-hover:bg-slate-100 dark:group-hover:bg-slate-800/50'}
                `}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="transition-all duration-300" />
                </div>
                
                {/* TEXTO DO BOTÃO (Correção aplicada aqui) */}
                <span className={`
                  text-[10px] md:text-[15px] whitespace-nowrap transition-all duration-300
                  ${isActive ? 'font-extrabold opacity-100 -translate-y-0.5 md:translate-y-0' : 'font-semibold opacity-70'}
                  ${isExpanded ? 'md:block' : 'md:hidden'}
                `}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}