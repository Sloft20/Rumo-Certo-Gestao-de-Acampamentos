import React from 'react';
import { formatarMoeda } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';

export default function DashboardOverview({ carregando, saldoCaixa, totalReceitas, totalDespesas, receitasPix, receitasDinheiro, modoPrivacidade }) {

  // Gerador de Skeletons Dinâmicos
  const renderizarValor = (valor, classeSkeleton = "h-8 w-32") => {
    if (carregando) {
      return <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700/50 ${classeSkeleton}`}></div>;
    }
    return modoPrivacidade ? 'R$ •••••' : formatarMoeda(valor);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      
      {/* CARTÃO PRINCIPAL */}
      <Card className="bg-slate-900 border-slate-800 text-white shadow-lg md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Wallet size={16} className="text-teal-400" />
            Saldo em Caixa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold tracking-tight mb-4">
            {renderizarValor(saldoCaixa, "h-10 w-48 bg-slate-700 dark:bg-slate-800")}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5 font-medium bg-slate-800 px-2.5 py-1 rounded-md">
              <ArrowRightLeft size={14} className="text-sky-400 shrink-0" /> 
              Pix: {renderizarValor(receitasPix, "h-4 w-16 bg-slate-700 dark:bg-slate-800")}
            </span>
            <span className="flex items-center gap-1.5 font-medium bg-slate-800 px-2.5 py-1 rounded-md">
              <Wallet size={14} className="text-emerald-400 shrink-0" /> 
              Dinheiro: {renderizarValor(receitasDinheiro, "h-4 w-16 bg-slate-700 dark:bg-slate-800")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* CARTÃO SECUNDÁRIO: RECEITAS */}
      <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <TrendingUp size={16} /> Total Recebido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {renderizarValor(totalReceitas, "h-8 w-32")}
          </div>
        </CardContent>
      </Card>

      {/* CARTÃO SECUNDÁRIO: DESPESAS */}
      <Card className="bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <TrendingDown size={16} /> Despesas Operacionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
            {renderizarValor(totalDespesas, "h-8 w-32")}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}