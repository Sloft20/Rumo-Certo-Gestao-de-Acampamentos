import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { formatarMoeda } from '../utils/formatters';

export default function DashboardOverview({ 
  saldoCaixa, totalReceitas, totalDespesas, 
  receitasPix, receitasDinheiro, modoPrivacidade 
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
      
      {/* SALDO - Ocupa a largura toda no celular (2 colunas), e 1 no PC */}
      <div className="col-span-2 md:col-span-1 bg-slate-900 rounded-2xl p-4 md:p-6 text-white relative overflow-hidden flex flex-col justify-center shadow-sm">
         <DollarSign className="absolute right-[-15px] bottom-[-15px] text-slate-800 opacity-40" size={100} />
         <p className="text-slate-400 text-xs font-bold tracking-wider mb-0.5 z-10">SALDO EM CAIXA</p>
         <h2 className="text-3xl font-black z-10">
           {modoPrivacidade ? 'R$ •••••' : formatarMoeda(saldoCaixa)}
         </h2>
      </div>

      {/* RECEITAS - Fica lado a lado com despesas no celular */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-center shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp size={16} className="text-emerald-500" />
          <span className="text-xs font-bold text-emerald-500">RECEITAS</span>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800">
          {modoPrivacidade ? 'R$ •••••' : formatarMoeda(totalReceitas)}
        </h3>
        
        {/* Ocultei os detalhes do PIX no celular (hidden), mas mostro no PC (md:flex) */}
        <div className="hidden md:flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase">
          <span>PIX: {formatarMoeda(receitasPix)}</span>
          <span>DIN: {formatarMoeda(receitasDinheiro)}</span>
        </div>
      </div>

      {/* DESPESAS - Fica lado a lado com receitas no celular */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-center shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingDown size={16} className="text-rose-500" />
          <span className="text-xs font-bold text-rose-500">DESPESAS</span>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800">
          {modoPrivacidade ? 'R$ •••••' : formatarMoeda(totalDespesas)}
        </h3>
      </div>

    </div>
  );
}