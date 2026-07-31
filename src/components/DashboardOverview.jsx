import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Smartphone, Banknote } from 'lucide-react';
import { formatarMoeda } from '../utils/formatters';

export default function DashboardOverview({ 
  carregando, 
  saldoCaixa, 
  totalReceitas, 
  totalDespesas, 
  receitasPix, 
  receitasDinheiro, 
  modoPrivacidade 
}) {
  
  // Função para esconder os valores quando o olhinho da privacidade está fechado
  const renderValor = (valor) => {
    if (modoPrivacidade) return '••••••••';
    if (carregando) return '...';
    return formatarMoeda(valor);
  };

  return (
    <div className="mb-6 animate-in fade-in duration-300">
      
      {/* O SUPER CARTÃO PADRÃO BANCO */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        
        {/* === PARTE SUPERIOR: SALDO E ETIQUETAS === */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
            <Wallet size={16} className="text-teal-500" />
            <span>Saldo em Caixa</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 my-2 tracking-tight">
            {renderValor(saldoCaixa)}
          </h2>
          
          {/* Etiquetas (Chips) de Métodos */}
          <div className="flex flex-wrap gap-2 mt-1">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50">
              <Smartphone size={14} className="text-blue-500" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
                Pix: {renderValor(receitasPix)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50">
              <Banknote size={14} className="text-emerald-500" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
                Dinheiro: {renderValor(receitasDinheiro)}
              </span>
            </div>
          </div>
        </div>

        {/* === DIVISÓRIA SUTIL === */}
        <div className="h-px bg-slate-100 dark:bg-slate-800 my-5" />

        {/* === RODAPÉ INTERNO: ENTRADAS E SAÍDAS === */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Bloco: Total Recebido */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 font-bold text-xs sm:text-sm">
              <TrendingUp size={16} />
              <span>Total Recebido</span>
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
              {renderValor(totalReceitas)}
            </span>
          </div>

          {/* Bloco: Despesas Operacionais */}
          <div className="flex flex-col gap-1.5 border-l border-slate-100 dark:border-slate-800 pl-4">
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-500 font-bold text-xs sm:text-sm">
              <TrendingDown size={16} />
              <span>Despesas (Gastos)</span>
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
              {renderValor(totalDespesas)}
            </span>
          </div>
          
        </div>

      </div>
    </div>
  );
}