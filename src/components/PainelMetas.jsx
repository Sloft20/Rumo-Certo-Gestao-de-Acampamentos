import React, { useState } from 'react';
import { Target, Users, Clock, AlertCircle, BarChart3, ChevronRight, Edit2, X, TrendingDown, Wallet } from 'lucide-react';
import { formatarMoeda, obterColuna, extrairNumero } from '../utils/formatters';
import DashboardOverview from './DashboardOverview'; // IMPORTAÇÃO DO COMPONENTE DE SALDOS
import toast from 'react-hot-toast';

export default function PainelMetas({ 
  estatisticasPublico, metas, setMetas, 
  totalReceitas, totalDespesas, aplicarFiltroRapido,
  dadosDaEdicao = [],
  /* NOVOS PROPS RECEBIDOS */
  saldoCaixa, receitasPix, receitasDinheiro, modoPrivacidade 
}) {
  const percArrecadado = Math.min((totalReceitas / metas.arrecadacao) * 100, 100) || 0;
  const percGasto = Math.min((totalDespesas / metas.limiteGastos) * 100, 100) || 0;

  // Calcula o Top 3 Maiores Despesas
  const despesas = dadosDaEdicao.filter(d => obterColuna(d, 'Tipo') === 'SAIDA');
  const gastosPorCategoria = despesas.reduce((acc, curr) => {
    const cat = obterColuna(curr, 'Categoria') || 'Outros';
    const valor = extrairNumero(obterColuna(curr, 'Valor Pago'));
    acc[cat] = (acc[cat] || 0) + valor;
    return acc;
  }, {});
  
  const topDespesas = Object.entries(gastosPorCategoria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoEdicao, setTipoEdicao] = useState(''); 
  const [valorEditado, setValorEditado] = useState('');

  const abrirModal = (tipo, valorAtual) => {
    setTipoEdicao(tipo);
    setValorEditado(valorAtual.toString());
    setModalAberto(true);
  };

  const salvarMeta = (e) => {
    e.preventDefault();
    const valorNumerico = parseFloat(valorEditado.replace(',', '.'));
    if (!isNaN(valorNumerico) && valorNumerico > 0) {
      const novasMetas = { ...metas, [tipoEdicao]: valorNumerico };
      setMetas(novasMetas);
      localStorage.setItem('metas_acampamento', JSON.stringify(novasMetas));
      toast.success('Meta updated com sucesso!');
      setModalAberto(false);
    } else {
      toast.error('Insira um valor numérico válido.');
    }
  };

  return (
    <div className="pb-24 flex flex-col gap-6">
      
      {/* TÍTULO DA PÁGINA */}
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-slate-900 p-2.5 rounded-xl shadow-sm">
          <BarChart3 size={24} className="text-teal-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Dashboard Gerencial</h2>
      </div>

      {/* CARDS DE SALDO COMPACTOS ADICIONADOS NO TOPO DO RESUMO */}
      <DashboardOverview 
        saldoCaixa={saldoCaixa} 
        totalReceitas={totalReceitas} 
        totalDespesas={totalDespesas} 
        receitasPix={receitasPix}
        receitasDinheiro={receitasDinheiro}
        modoPrivacidade={modoPrivacidade}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* COLUNA ESQUERDA: FINANÇAS */}
        <div className="flex flex-col gap-6">
          
          {/* CARTÃO DE METAS E ORÇAMENTO */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-400 tracking-wider mb-6">ACOMPANHAMENTO DE DE CAIXA</h3>
            
            {/* Arrecadação */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-100 p-1.5 rounded-lg">
                    <Target size={16} className="text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-600">ARRECADÇÃO</span>
                </div>
                <span className="text-lg font-black text-emerald-500">{percArrecadado.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out rounded-full" 
                  style={{ width: `${percArrecadado}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <button onClick={() => abrirModal('arrecadacao', metas.arrecadacao)} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-teal-600 transition-colors">
                  Meta: {formatarMoeda(metas.arrecadacao)} <Edit2 size={12} />
                </button>
                <span className="text-xs font-bold text-slate-500">
                  Faltam: {formatarMoeda(Math.max(0, metas.arrecadacao - totalReceitas))}
                </span>
              </div>
            </div>

            {/* Gastos Planejados */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-rose-100 p-1.5 rounded-lg">
                    <Wallet size={16} className="text-rose-500" />
                  </div>
                  <span className="text-sm font-bold text-slate-600">ORÇAMENTO GASTO</span>
                </div>
                <span className={`text-lg font-black ${percGasto > 90 ? 'text-rose-500' : 'text-blue-500'}`}>
                  {percGasto.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${percGasto > 90 ? 'bg-rose-500' : 'bg-blue-500'}`}
                  style={{ width: `${percGasto}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <button onClick={() => abrirModal('limiteGastos', metas.limiteGastos)} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-teal-600 transition-colors">
                  Teto Máximo: {formatarMoeda(metas.limiteGastos)} <Edit2 size={12} />
                </button>
                <span className="text-xs font-bold text-slate-500">
                  Disponível: {formatarMoeda(Math.max(0, metas.limiteGastos - totalDespesas))}
                </span>
              </div>
            </div>
          </div>

          {/* CARTÃO: TOP 3 DESPESAS */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-400 tracking-wider mb-4 flex items-center gap-2">
              <TrendingDown size={16} className="text-rose-400" /> MAIORES DESPESAS
            </h3>
            
            {topDespesas.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4 font-medium">Nenhuma despesa registrada nesta edição.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {topDespesas.map(([categoria, valor], index) => {
                  const percentual = Math.min((valor / totalDespesas) * 100, 100);
                  return (
                    <div key={categoria}>
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <span className="text-xs font-black text-slate-300">#{index + 1}</span> {categoria}
                        </span>
                        <span className="text-sm font-bold text-rose-500">{formatarMoeda(valor)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-400 rounded-full" style={{ width: `${percentual}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: PARTICIPANTES */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-400 tracking-wider mt-2 md:mt-0 mb-1">RESUMO DO PÚBLICO</h3>
          
          <div onClick={() => aplicarFiltroRapido('PENDENTES')} className="bg-white rounded-2xl border-l-8 border-l-rose-500 border border-slate-200 p-5 flex items-center cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="bg-rose-50 p-3 rounded-xl mr-4">
              <AlertCircle className="text-rose-500" size={26} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 mb-0.5">COM PENDÊNCIA</p>
              <h4 className="text-2xl font-black text-slate-800 m-0 leading-none">
                {estatisticasPublico.pendentes} <span className="text-sm font-medium text-slate-400">pessoas</span>
              </h4>
            </div>
            <ChevronRight className="text-slate-300" size={24} />
          </div>

          <div onClick={() => aplicarFiltroRapido('DIARIA')} className="bg-white rounded-2xl border-l-8 border-l-blue-500 border border-slate-200 p-5 flex items-center cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="bg-blue-50 p-3 rounded-xl mr-4">
              <Clock className="text-blue-500" size={26} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 mb-0.5">VISITANTES (SÓ DIÁRIA)</p>
              <h4 className="text-2xl font-black text-slate-800 m-0 leading-none">
                {estatisticasPublico.soDiaria} <span className="text-sm font-medium text-slate-400">pessoas</span>
              </h4>
            </div>
            <ChevronRight className="text-slate-300" size={24} />
          </div>

          <div onClick={() => aplicarFiltroRapido('ACAMPAR')} className="bg-white rounded-2xl border-l-8 border-l-violet-500 border border-slate-200 p-5 flex items-center cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="bg-violet-50 p-3 rounded-xl mr-4">
              <Users className="text-violet-500" size={26} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 mb-0.5">CONFIRMADOS NO ACAMPAMENTO</p>
              <h4 className="text-2xl font-black text-slate-800 m-0 leading-none">
                {estatisticasPublico.acampar} <span className="text-sm font-medium text-slate-400">pessoas</span>
              </h4>
            </div>
            <ChevronRight className="text-slate-300" size={24} />
          </div>
        </div>

      </div>

      {/* MODAL CUSTOMIZADO (Tailwind) */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-[slideUp_0.2s_ease-out]">
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${tipoEdicao === 'arrecadacao' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}>
                  {tipoEdicao === 'arrecadacao' ? <Target size={24} /> : <Wallet size={24} />}
                </div>
                <h3 className="text-xl font-extrabold text-slate-800">
                  {tipoEdicao === 'arrecadacao' ? 'Meta de Receitas' : 'Teto de Gastos'}
                </h3>
              </div>
              <button onClick={() => setModalAberto(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarMeta}>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-bold text-slate-500">
                  Defina o novo valor previsto (R$):
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={valorEditado} 
                  onChange={(e) => setValorEditado(e.target.value)} 
                  placeholder="Ex: 5000.00" 
                  required 
                  autoFocus
                  className="w-full p-4 border-2 border-slate-200 rounded-2xl text-xl font-bold text-slate-800 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className={`flex-1 text-white py-4 rounded-xl font-bold shadow-lg transition-colors ${tipoEdicao === 'arrecadacao' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30'}`}>
                  Guardar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}