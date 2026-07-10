import React, { useState } from 'react';
import { Target, Users, Clock, AlertCircle, BarChart3, ChevronRight, Edit2, X, TrendingDown, Wallet } from 'lucide-react';
import { formatarMoeda, obterColuna, extrairNumero } from '../utils/formatters';
import DashboardOverview from './DashboardOverview';
import toast from 'react-hot-toast';

export default function PainelMetas({ 
  estatisticasPublico = { pendentes: 0, soDiaria: 0, acampar: 0 },
  metas = { arrecadacao: 1, limiteGastos: 1 }, 
  setMetas, 
  totalReceitas = 0, 
  totalDespesas = 0, 
  aplicarFiltroRapido,
  dadosDaEdicao = [],
  saldoCaixa = 0, receitasPix = 0, receitasDinheiro = 0, modoPrivacidade = false 
}) {
  const percArrecadado = metas?.arrecadacao ? Math.min((totalReceitas / metas.arrecadacao) * 100, 100) : 0;
  const percGasto = metas?.limiteGastos ? Math.min((totalDespesas / metas.limiteGastos) * 100, 100) : 0;

  const despesas = dadosDaEdicao.filter(d => obterColuna(d, 'Tipo') === 'SAIDA');
  const gastosPorCategoria = despesas.reduce((acc, curr) => {
    const cat = obterColuna(curr, 'Categoria') || 'Outros';
    const valor = extrairNumero(obterColuna(curr, 'Valor Pago'));
    acc[cat] = (acc[cat] || 0) + valor;
    return acc;
  }, {});
  
  const topDespesas = Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const [modalAberto, setModalAberto] = useState(false);
  const [tipoEdicao, setTipoEdicao] = useState(''); 
  const [valorEditado, setValorEditado] = useState('');

  const abrirModal = (tipo, valorAtual) => {
    setTipoEdicao(tipo); setValorEditado(valorAtual.toString()); setModalAberto(true);
  };

  const salvarMeta = (e) => {
    e.preventDefault();
    const valorNumerico = parseFloat(valorEditado.replace(',', '.'));
    if (!isNaN(valorNumerico) && valorNumerico > 0) {
      const novasMetas = { ...metas, [tipoEdicao]: valorNumerico };
      setMetas(novasMetas);
      localStorage.setItem('metas_acampamento', JSON.stringify(novasMetas));
      toast.success('Meta atualizada com sucesso!');
      setModalAberto(false);
    } else { toast.error('Insira um valor numérico válido.'); }
  };

  return (
    <div className="pb-24 flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-slate-900 dark:bg-slate-800 p-2.5 rounded-xl shadow-sm border border-transparent dark:border-slate-700 transition-colors">
          <BarChart3 size={24} className="text-teal-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 transition-colors">Dashboard Gerencial</h2>
      </div>

      <DashboardOverview saldoCaixa={saldoCaixa} totalReceitas={totalReceitas} totalDespesas={totalDespesas} receitasPix={receitasPix} receitasDinheiro={receitasDinheiro} modoPrivacidade={modoPrivacidade} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-6">ACOMPANHAMENTO DE CAIXA</h3>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-100 dark:bg-emerald-500/20 p-1.5 rounded-lg transition-colors"><Target size={16} className="text-emerald-600 dark:text-emerald-400" /></div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">ARRECADAÇÃO</span>
                </div>
                <span className="text-lg font-black text-emerald-500 dark:text-emerald-400">{percArrecadado.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: `${percArrecadado}%` }}></div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <button onClick={() => abrirModal('arrecadacao', metas.arrecadacao)} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Meta: {formatarMoeda(metas.arrecadacao)} <Edit2 size={12} />
                </button>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Faltam: {formatarMoeda(Math.max(0, metas.arrecadacao - totalReceitas))}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-rose-100 dark:bg-rose-500/20 p-1.5 rounded-lg transition-colors"><Wallet size={16} className="text-rose-500 dark:text-rose-400" /></div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">ORÇAMENTO GASTO</span>
                </div>
                <span className={`text-lg font-black ${percGasto > 90 ? 'text-rose-500 dark:text-rose-400' : 'text-blue-500 dark:text-blue-400'}`}>{percGasto.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                <div className={`h-full transition-all duration-1000 ease-out rounded-full ${percGasto > 90 ? 'bg-rose-500 dark:bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-blue-500 dark:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'}`} style={{ width: `${percGasto}%` }}></div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <button onClick={() => abrirModal('limiteGastos', metas.limiteGastos)} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Teto Máximo: {formatarMoeda(metas.limiteGastos)} <Edit2 size={12} />
                </button>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Disponível: {formatarMoeda(Math.max(0, metas.limiteGastos - totalDespesas))}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-4 flex items-center gap-2"><TrendingDown size={16} className="text-rose-400" /> MAIORES DESPESAS</h3>
            {topDespesas.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4 font-medium">Nenhuma despesa registada.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {topDespesas.map(([categoria, valor], index) => {
                  const percentual = Math.min((valor / totalDespesas) * 100, 100);
                  return (
                    <div key={categoria}>
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><span className="text-xs font-black text-slate-300 dark:text-slate-600">#{index + 1}</span> {categoria}</span>
                        <span className="text-sm font-bold text-rose-500 dark:text-rose-400">{formatarMoeda(valor)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                        <div className="h-full bg-rose-400 dark:bg-rose-500 rounded-full" style={{ width: `${percentual}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-2 md:mt-0 mb-1">RESUMO DO PÚBLICO</h3>
          <div onClick={() => aplicarFiltroRapido('PENDENTES')} className="bg-white dark:bg-slate-900 rounded-2xl border-l-[6px] border-l-rose-500 border-y border-r border-y-slate-200 border-r-slate-200 dark:border-y-slate-800 dark:border-r-slate-800 p-5 flex items-center cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all group">
            <div className="bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl mr-4 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 transition-colors"><AlertCircle className="text-rose-500 dark:text-rose-400" size={26} /></div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-0.5">COM PENDÊNCIA</p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 m-0 leading-none transition-colors">{estatisticasPublico.pendentes} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">pessoas</span></h4>
            </div>
            <ChevronRight className="text-slate-300 dark:text-slate-600" size={24} />
          </div>
          <div onClick={() => aplicarFiltroRapido('DIARIA')} className="bg-white dark:bg-slate-900 rounded-2xl border-l-[6px] border-l-blue-500 border-y border-r border-y-slate-200 border-r-slate-200 dark:border-y-slate-800 dark:border-r-slate-800 p-5 flex items-center cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all group">
            <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl mr-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors"><Clock className="text-blue-500 dark:text-blue-400" size={26} /></div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-0.5">VISITANTES (SÓ DIÁRIA)</p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 m-0 leading-none transition-colors">{estatisticasPublico.soDiaria} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">pessoas</span></h4>
            </div>
            <ChevronRight className="text-slate-300 dark:text-slate-600" size={24} />
          </div>
          <div onClick={() => aplicarFiltroRapido('ACAMPAR')} className="bg-white dark:bg-slate-900 rounded-2xl border-l-[6px] border-l-violet-500 border-y border-r border-y-slate-200 border-r-slate-200 dark:border-y-slate-800 dark:border-r-slate-800 p-5 flex items-center cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all group">
            <div className="bg-violet-50 dark:bg-violet-500/10 p-3 rounded-xl mr-4 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 transition-colors"><Users className="text-violet-500 dark:text-violet-400" size={26} /></div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-0.5">CONFIRMADOS NO ACAMPAMENTO</p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 m-0 leading-none transition-colors">{estatisticasPublico.acampar} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">pessoas</span></h4>
            </div>
            <ChevronRight className="text-slate-300 dark:text-slate-600" size={24} />
          </div>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${tipoEdicao === 'arrecadacao' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                  {tipoEdicao === 'arrecadacao' ? <Target size={24} /> : <Wallet size={24} />}
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{tipoEdicao === 'arrecadacao' ? 'Meta de Receitas' : 'Teto de Gastos'}</h3>
              </div>
              <button onClick={() => setModalAberto(false)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={salvarMeta}>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-bold text-slate-500 dark:text-slate-400">Defina o novo valor previsto (R$):</label>
                <input type="number" step="0.01" value={valorEditado} onChange={(e) => setValorEditado(e.target.value)} placeholder="Ex: 5000.00" required autoFocus className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xl font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all placeholder-slate-400 dark:placeholder-slate-600" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
                <button type="submit" className={`flex-1 text-white py-4 rounded-xl font-bold shadow-lg transition-colors ${tipoEdicao === 'arrecadacao' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30'}`}>Guardar Meta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}