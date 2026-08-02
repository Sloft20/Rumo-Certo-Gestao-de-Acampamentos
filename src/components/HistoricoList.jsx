import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, History, FileText, Edit2, Trash2, Clock, User, Calendar, MessageSquare, X, Paperclip, SearchX, RefreshCw } from 'lucide-react';
import { obterColuna, formatarMoeda, formatarData } from '../utils/formatters';
import { gerarRecibo } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';

export default function HistoricoList({ 
  carregando,
  termoBuscaHistorico, setTermoBuscaHistorico,
  filtroTipoHistorico, setFiltroTipoHistorico,
  filtroDataInicio, setFiltroDataInicio,
  filtroDataFim, setFiltroDataFim,
  historicoFiltrado,
  prepararEdicao, excluirRegistro 
}) {

  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
  const [anexoParaVisualizar, setAnexoParaVisualizar] = useState(null);

  const exibirHora = (horaRaw) => {
    if (!horaRaw) return null;
    const horaStr = String(horaRaw);
    if (horaStr.includes('T')) {
      return new Date(horaStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return horaStr.replace(/'/g, ''); 
  };

  const temFiltroAtivo = termoBuscaHistorico || filtroTipoHistorico !== 'TODOS' || filtroDataInicio || filtroDataFim;

  const limparFiltros = () => {
    setTermoBuscaHistorico('');
    setFiltroTipoHistorico('TODOS');
    setFiltroDataInicio('');
    setFiltroDataFim('');
  };

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      
      {/* PAINEL DE FILTROS AVANÇADOS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-6 relative z-10 transition-colors">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
          
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Buscar Registo</label>
            <div className="flex items-center h-[46px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
              <Search size={20} className="text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Procurar acampante ou categoria..." 
                value={termoBuscaHistorico} 
                onChange={(e) => setTermoBuscaHistorico(e.target.value)} 
                className="w-full bg-transparent border-none outline-none ml-3 text-slate-700 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>
          
          {/* NOVAS PÍLULAS DE FILTRO (CHIPS) */}
          <div className="w-full lg:w-auto">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 lg:hidden">Tipo de Transação</label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              {['TODOS', 'ENTRADA', 'SAIDA'].map(tipo => {
                const isActive = filtroTipoHistorico === tipo;
                const labels = { TODOS: 'Todas', ENTRADA: 'Receitas', SAIDA: 'Despesas' };
                return (
                  <button 
                    key={tipo}
                    onClick={() => setFiltroTipoHistorico(tipo)}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap text-[13px] font-bold transition-all border ${
                      isActive 
                        ? 'bg-teal-500 border-teal-500 text-white shadow-md shadow-teal-500/20' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {labels[tipo]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 items-start md:items-center">
           <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-semibold w-full md:w-auto">
             <Calendar size={18} className="text-slate-400" />
             Período:
           </div>
           
           <div className="flex flex-1 gap-2 items-center w-full">
             <input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} className="flex-1 h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 transition-all" />
             <span className="text-slate-400 font-medium text-sm">até</span>
             <input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} className="flex-1 h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 transition-all" />
           </div>

           {temFiltroAtivo && (
             <button onClick={limparFiltros} className="mt-2 md:mt-0 text-sm font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors w-full md:w-auto text-right md:ml-4">
               Limpar Filtros
             </button>
           )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* LÓGICA DE APRESENTAÇÃO: SKELETON -> EMPTY STATE -> LISTA */}
        {carregando ? (
          
          /* SKELETONS A PISCAR */
          [...Array(4)].map((_, i) => (
            <div key={`skel-${i}`} className="animate-pulse bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex justify-between items-center h-[80px]">
              <div className="flex items-center gap-4 w-2/3">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0"></div>
                <div className="flex flex-col gap-2 w-full">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-full max-w-[200px]"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2 max-w-[150px]"></div>
                </div>
              </div>
              <div className="w-16 h-5 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0 ml-4"></div>
            </div>
          ))
          
        ) : historicoFiltrado.length === 0 ? (
          
          /* ESTADO VAZIO ILUSTRADO */
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in duration-300">
            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-full mb-4">
              <SearchX size={40} className="text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Nenhum registo encontrado.</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[280px]">
              O histórico está vazio para os filtros selecionados.
            </p>
            {temFiltroAtivo && (
              <button 
                onClick={limparFiltros} 
                className="bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30 px-6 py-2.5 rounded-xl font-bold transition-all hover:bg-teal-100 dark:hover:bg-teal-500/20 flex items-center gap-2"
              >
                <RefreshCw size={18} /> Limpar Filtros
              </button>
            )}
          </div>
          
        ) : (
          
          /* LISTA REAL COM DADOS */
          historicoFiltrado.map((item, index) => {
            const isEntrada = obterColuna(item, 'Tipo') === 'ENTRADA';
            if (!obterColuna(item, 'Descrição')) return null;
            
            return (
              <div 
                key={index} 
                onClick={() => setTransacaoSelecionada(item)}
                className="flex items-center p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl cursor-pointer hover:shadow-md transition-all group animate-in fade-in slide-in-from-bottom-2"
              >
                <div className={`p-3 rounded-xl mr-4 shrink-0 transition-colors ${isEntrada ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                  {isEntrada ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-slate-900 dark:text-slate-100 text-[15px] font-bold truncate mb-0.5">
                    {obterColuna(item, 'Descrição')}
                  </h4>
                  
                  <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="shrink-0">{formatarData(obterColuna(item, 'Data'))}</span>
                    <span className="shrink-0 text-slate-300 dark:text-slate-600">•</span>
                    <span className="truncate">{obterColuna(item, 'Categoria')}</span>
                    
                    {item.foi_editado && (
                      <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider shrink-0">
                        EDITADO
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right ml-3 shrink-0">
                  <b className={`text-base ${isEntrada ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                    {isEntrada ? '+' : '-'}{formatarMoeda(obterColuna(item, 'Valor Pago'))}
                  </b>
                </div>
              </div>
            );
          })
          
        )}
      </div>

      {/* MODAL DE DETALHES (TIPO BANCO) */}
      {transacaoSelecionada && (() => {
        const ts = transacaoSelecionada;
        const isEntradaModal = obterColuna(ts, 'Tipo') === 'ENTRADA';
        const temIdModal = obterColuna(ts, 'ID');
        const observacaoModal = obterColuna(ts, 'Observação');
        const urlAnexoModal = ts['anexo_url'];

        return (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
            
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 shadow-2xl">
              
              {/* Cabeçalho do Modal */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Detalhes do Registo</h3>
                <button 
                  onClick={() => setTransacaoSelecionada(null)} 
                  className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Valor em Destaque */}
              <div className="text-center mb-8">
                <div className="text-[13px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  {obterColuna(ts, 'Categoria')}
                </div>
                <div className={`text-4xl font-extrabold tracking-tight ${isEntradaModal ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                  {isEntradaModal ? '+' : '-'} {formatarMoeda(obterColuna(ts, 'Valor Pago'))}
                </div>
                <div className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">
                  Via {obterColuna(ts, 'Forma de Pagamento')}
                </div>
              </div>

              {/* Grelha de Informações */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl mb-6">
                <div>
                  <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">Acampante / Ref.</span>
                  <span className="text-[15px] font-bold text-slate-700 dark:text-slate-200">{obterColuna(ts, 'Descrição')}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">Data</span>
                  <span className="flex items-center gap-1.5 text-[15px] font-bold text-slate-700 dark:text-slate-200">
                    <Calendar size={14} className="text-slate-400" /> {formatarData(obterColuna(ts, 'Data'))}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">Hora exata</span>
                  <span className="flex items-center gap-1.5 text-[15px] font-bold text-slate-700 dark:text-slate-200">
                    <Clock size={14} className="text-slate-400" /> {exibirHora(obterColuna(ts, 'Hora')) || '--:--'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">Operador de Caixa</span>
                  <span className="flex items-center gap-1.5 text-[15px] font-bold text-slate-700 dark:text-slate-200">
                    <User size={14} className="text-slate-400" /> {obterColuna(ts, 'Operador') || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Observação (Se Existir) */}
              {observacaoModal && (
                <div className="bg-teal-50 dark:bg-teal-500/10 border-l-4 border-teal-500 p-4 rounded-xl mb-6">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide mb-2">
                    <MessageSquare size={14} /> Observação
                  </span>
                  <span className="text-sm italic text-teal-900 dark:text-teal-200 leading-relaxed">
                    "{observacaoModal}"
                  </span>
                </div>
              )}

              {/* BOTÃO DE ANEXO */}
              {urlAnexoModal && (
                <button 
                  type="button"
                  onClick={() => setAnexoParaVisualizar(urlAnexoModal)} 
                  className="w-full flex items-center justify-center gap-2 p-3 mb-6 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 rounded-xl font-bold text-sm hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors"
                >
                  <Paperclip size={18} />
                  <span>Ver Comprovativo Anexado</span>
                </button>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-3 mt-8">
                {temIdModal && (
                  <button 
                    onClick={() => { excluirRegistro(temIdModal); setTransacaoSelecionada(null); }} 
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 p-3 rounded-xl font-bold text-xs transition-colors"
                  >
                    <Trash2 size={20} /> Excluir
                  </button>
                )}
                {temIdModal && (
                  <button 
                    onClick={() => { prepararEdicao(ts); setTransacaoSelecionada(null); }} 
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 p-3 rounded-xl font-bold text-xs transition-colors"
                  >
                    <Edit2 size={20} /> Editar
                  </button>
                )}
                {isEntradaModal && (
                  <button 
                    onClick={() => { 
                      gerarRecibo({ nome: obterColuna(ts, 'Descrição'), valor: obterColuna(ts, 'Valor Pago'), categoria: obterColuna(ts, 'Categoria'), formaPagamento: obterColuna(ts, 'Forma de Pagamento'), data: obterColuna(ts, 'Data') }); 
                      toast.success('Recibo descarregado!'); 
                    }} 
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 p-3 rounded-xl font-bold text-xs transition-colors"
                  >
                    <FileText size={20} /> Recibo
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL SUPREMO DE VISUALIZAÇÃO DE ANEXO */}
      {anexoParaVisualizar && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10000] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          
          <div className="w-full max-w-3xl flex justify-between items-center mb-4">
            <span className="text-white font-bold text-sm">Visualizador de Documento</span>
            <button 
              onClick={() => setAnexoParaVisualizar(null)}
              className="bg-slate-800 hover:bg-slate-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="w-full max-w-3xl h-[75vh] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-700 shadow-2xl">
            {anexoParaVisualizar.toLowerCase().includes('.pdf') ? (
              <iframe src={anexoParaVisualizar} className="w-full h-full border-none" title="Comprovativo PDF" />
            ) : (
              <img src={anexoParaVisualizar} alt="Comprovativo" className="max-w-full max-h-full object-contain" />
            )}
          </div>

          <a href={anexoParaVisualizar} target="_blank" rel="noopener noreferrer" className="mt-4 text-sky-400 text-sm font-semibold hover:underline">
            O ficheiro não abriu aqui dentro? Clique para abrir em nova aba ↗
          </a>

        </div>
      )}

    </div>
  );
}