import React from 'react';
import { Search, Users, CheckSquare, Square, CheckCircle2, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { formatarMoeda } from '../utils/formatters';

export default function AcampanteList({ 
  carregando,
  termoBusca, setTermoBusca, acampantesFiltrados, setAcampanteSelecionado,
  mostrarApenasDevedores, setMostrarApenasDevedores,
  modoLote, setModoLote, selecionadosLote, setSelecionadosLote, setModalLoteAberto,
  filtroCategoria, setFiltroCategoria
}) {
  
  const toggleSelecao = (acampante) => {
    if(selecionadosLote.find(a => a.Descrição === acampante.Descrição)) {
      setSelecionadosLote(selecionadosLote.filter(a => a.Descrição !== acampante.Descrição));
    } else {
      if (acampante['Saldo Devedor'] > 0) {
        setSelecionadosLote([...selecionadosLote, acampante]);
      }
    }
  };

  const totalDevedorLote = selecionadosLote.reduce((acc, curr) => acc + curr['Saldo Devedor'], 0);

  const handleFiltroClick = (tipo) => {
    if (tipo === 'PENDENTES') { setMostrarApenasDevedores(true); setFiltroCategoria('TODOS'); } 
    else if (tipo === 'DIARIA') { setMostrarApenasDevedores(false); setFiltroCategoria('DIARIA'); } 
    else if (tipo === 'ACAMPAR') { setMostrarApenasDevedores(false); setFiltroCategoria('ACAMPAR'); } 
    else { setMostrarApenasDevedores(false); setFiltroCategoria('TODOS'); }
  };

  const getFiltroAtivo = () => {
    if (mostrarApenasDevedores) return 'PENDENTES';
    if (filtroCategoria === 'DIARIA') return 'DIARIA';
    if (filtroCategoria === 'ACAMPAR') return 'ACAMPAR';
    return 'TODOS';
  };

  const filtroAtivo = getFiltroAtivo();

  return (
    <div className={`transition-all duration-300 ${modoLote ? 'pb-[140px]' : 'pb-[90px]'}`}>
      
      {/* BARRA SUPERIOR (BUSCA + PILLS) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-6 transition-colors">
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <div className="w-full flex-1 flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
            <Search size={20} className="text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Procurar acampante..." 
              value={termoBusca} 
              onChange={(e) => setTermoBusca(e.target.value)} 
              className="w-full bg-transparent border-none outline-none ml-3 text-slate-700 dark:text-slate-200 placeholder-slate-400 font-medium" 
            />
          </div>
          <button 
            onClick={() => { setModoLote(!modoLote); setSelecionadosLote([]); }} 
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shrink-0 ${
              modoLote 
                ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' 
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
            }`}
          >
            <Users size={18} /> <span>{modoLote ? 'Cancelar Lote' : 'Pagar Lote'}</span>
          </button>
        </div>

        {/* PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => handleFiltroClick('TODOS')} className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all ${filtroAtivo === 'TODOS' ? 'bg-slate-800 text-white dark:bg-slate-700 shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>Todos</button>
          <button onClick={() => handleFiltroClick('PENDENTES')} className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-1.5 ${filtroAtivo === 'PENDENTES' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
            {filtroAtivo === 'PENDENTES' && <AlertCircle size={14} />} Pendentes
          </button>
          <button onClick={() => handleFiltroClick('DIARIA')} className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-1.5 ${filtroAtivo === 'DIARIA' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
            {filtroAtivo === 'DIARIA' && <Clock size={14} />} Só Diária
          </button>
          <button onClick={() => handleFiltroClick('ACAMPAR')} className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-1.5 ${filtroAtivo === 'ACAMPAR' ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
            {filtroAtivo === 'ACAMPAR' && <CheckCircle size={14} />} Acampar
          </button>
        </div>
      </div>

      {/* MENSAGEM DE VAZIO (Ocultada durante o carregamento) */}
      {!carregando && acampantesFiltrados.length === 0 && (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400 animate-in fade-in duration-300">
          <div className="bg-slate-100 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Nenhum resultado</h3>
          <p className="text-sm">Não encontramos nenhum acampante com esse filtro.</p>
        </div>
      )}

      {/* LISTA DE ACAMPANTES OU SKELETON LOADERS */}
      <div className="flex flex-col gap-3">
        {carregando ? (
          /* SKELETONS A PISCAR */
          [...Array(5)].map((_, i) => (
            <div key={`skel-${i}`} className="flex justify-between items-center p-4 rounded-xl border-y border-r border-l-[6px] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse">
              <div className="flex items-center gap-4 w-full">
                <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 shrink-0"></div>
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                </div>
              </div>
              <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0 ml-4"></div>
            </div>
          ))
        ) : (
          /* LISTA REAL COM DADOS */
          acampantesFiltrados.map((a, i) => {
            const isSelecionado = selecionadosLote.find(sel => sel.Descrição === a.Descrição);
            const isDevedor = a['Saldo Devedor'] > 0;
            
            return (
              <div key={i} 
                onClick={() => {
                  if (modoLote) { toggleSelecao(a); } 
                  else if (isDevedor) { setAcampanteSelecionado(a); }
                }} 
                className={`
                  flex justify-between items-center p-4 rounded-xl border-y border-r border-l-[6px] 
                  transition-all duration-200 group animate-in fade-in slide-in-from-bottom-2
                  ${(modoLote || isDevedor) ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}
                  ${isDevedor ? 'border-l-amber-500' : 'border-l-emerald-500'}
                  ${isSelecionado 
                    ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50 shadow-[0_0_0_2px_#3b82f6]' 
                    : 'bg-white border-y-slate-100 border-r-slate-100 dark:bg-slate-900 dark:border-y-slate-800 dark:border-r-slate-800'}
                `}
              >
                <div className="flex items-center gap-3">
                  {modoLote && (
                    <div className={`transition-colors ${isSelecionado ? 'text-blue-600 dark:text-blue-400' : (isDevedor ? 'text-slate-300 dark:text-slate-600' : 'text-slate-200 dark:text-slate-800')}`}>
                      {isSelecionado ? <CheckSquare size={24} /> : <Square size={24} className={isDevedor ? 'opacity-100' : 'opacity-30'} />}
                    </div>
                  )}
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
                      {a.Descrição} 
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                        {a.Categoria}
                      </span>
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Pago: <b className="text-emerald-500 dark:text-emerald-400">{formatarMoeda(a['Valor Pago'])}</b> de {formatarMoeda(a['Valor Total'])}
                    </p>
                  </div>
                </div>
                
                {!modoLote && isDevedor && (
                  <div className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors group-hover:bg-amber-200 dark:group-hover:bg-amber-500/30">
                    + PAGAR
                  </div>
                )}
                {!modoLote && !isDevedor && (
                  <CheckCircle2 size={24} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* BARRA FLUTUANTE DO LOTE */}
      {modoLote && selecionadosLote.length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white p-4 sm:px-6 rounded-2xl flex justify-between items-center shadow-2xl z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div>
            <p className="text-xs sm:text-sm text-slate-400 font-semibold mb-1">
              {selecionadosLote.length} pessoa(s) selecionada(s)
            </p>
            <h4 className="text-base sm:text-lg font-bold text-slate-100">
              Dívida: <span className="text-amber-400">{formatarMoeda(totalDevedorLote)}</span>
            </h4>
          </div>
          <button 
            onClick={() => setModalLoteAberto(true)} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20"
          >
            Avançar
          </button>
        </div>
      )}
    </div>
  );
}