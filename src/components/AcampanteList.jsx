import React from 'react';
import { Search, Users, CheckSquare, Square, CheckCircle2, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { formatarMoeda } from '../utils/formatters';

export default function AcampanteList({ 
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

  // ==========================================
  // LÓGICA DAS PILLS DE FILTRO RÁPIDO
  // ==========================================
  const handleFiltroClick = (tipo) => {
    if (tipo === 'PENDENTES') {
      setMostrarApenasDevedores(true);
      setFiltroCategoria('TODOS');
    } else if (tipo === 'DIARIA') {
      setMostrarApenasDevedores(false);
      setFiltroCategoria('DIARIA');
    } else if (tipo === 'ACAMPAR') {
      setMostrarApenasDevedores(false);
      setFiltroCategoria('ACAMPAR');
    } else {
      setMostrarApenasDevedores(false);
      setFiltroCategoria('TODOS');
    }
  };

  const getFiltroAtivo = () => {
    if (mostrarApenasDevedores) return 'PENDENTES';
    if (filtroCategoria === 'DIARIA') return 'DIARIA';
    if (filtroCategoria === 'ACAMPAR') return 'ACAMPAR';
    return 'TODOS';
  };

  const filtroAtivo = getFiltroAtivo();

  return (
    <div style={{ paddingBottom: modoLote ? '140px' : '90px' }}>
      
      {/* ========================================== */}
      {/* NOVA BARRA SUPERIOR (BUSCA + PILLS)        */}
      {/* ========================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
        
        {/* LINHA 1: Pesquisa e Botão de Lote */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <div className="w-full flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
            <Search size={20} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Procurar acampante..." 
              value={termoBusca} 
              onChange={(e) => setTermoBusca(e.target.value)} 
              className="w-full bg-transparent border-none outline-none ml-3 text-slate-700 placeholder-slate-400 font-medium" 
            />
          </div>
          
          <button 
            onClick={() => { setModoLote(!modoLote); setSelecionadosLote([]); }} 
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${modoLote ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'}`}
          >
            <Users size={18} /> <span>{modoLote ? 'Cancelar Lote' : 'Pagar Lote'}</span>
          </button>
        </div>

        {/* LINHA 2: Pills (Deslizantes no Telemóvel) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button 
            onClick={() => handleFiltroClick('TODOS')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all ${filtroAtivo === 'TODOS' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
          >
            Todos
          </button>
          
          <button 
            onClick={() => handleFiltroClick('PENDENTES')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-1.5 ${filtroAtivo === 'PENDENTES' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
          >
            {filtroAtivo === 'PENDENTES' && <AlertCircle size={14} />} Pendentes
          </button>

          <button 
            onClick={() => handleFiltroClick('DIARIA')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-1.5 ${filtroAtivo === 'DIARIA' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
          >
            {filtroAtivo === 'DIARIA' && <Clock size={14} />} Só Diária
          </button>

          <button 
            onClick={() => handleFiltroClick('ACAMPAR')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-1.5 ${filtroAtivo === 'ACAMPAR' ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
          >
            {filtroAtivo === 'ACAMPAR' && <CheckCircle size={14} />} Acampar
          </button>
        </div>
      </div>

      {/* MENSAGEM DE VAZIO */}
      {acampantesFiltrados.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <div style={{ backgroundColor: '#f1f5f9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}><Search size={32} color="#94a3b8" /></div>
          <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '18px' }}>Nenhum resultado</h3>
          <p style={{ margin: 0, fontSize: '15px' }}>Não encontramos nenhum acampante com esse filtro.</p>
        </div>
      )}

      {/* LISTA DE ACAMPANTES (Design mantido para segurança) */}
      {acampantesFiltrados.map((a, i) => {
        const isSelecionado = selecionadosLote.find(sel => sel.Descrição === a.Descrição);
        const isDevedor = a['Saldo Devedor'] > 0;
        
        return (
          <div key={i} className="cartao" 
            onClick={() => {
              if (modoLote) { toggleSelecao(a); } 
              else if (isDevedor) { setAcampanteSelecionado(a); }
            }} 
            style={{ 
              padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', 
              cursor: (modoLote || isDevedor) ? 'pointer' : 'default', 
              borderLeft: isDevedor ? '6px solid #f59e0b' : '6px solid #10b981',
              backgroundColor: isSelecionado ? '#f8fafc' : 'white',
              boxShadow: isSelecionado ? '0 0 0 2px #2563eb' : 'none',
              transition: 'all 0.2s ease'
            }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {modoLote && (
                <div style={{ color: isSelecionado ? '#2563eb' : (isDevedor ? '#cbd5e1' : '#f1f5f9') }}>
                  {isSelecionado ? <CheckSquare size={24} /> : <Square size={24} opacity={isDevedor ? 1 : 0.3} />}
                </div>
              )}
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>
                  {a.Descrição} 
                  <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 'bold' }}>{a.Categoria}</span>
                </h4>
                <small style={{ color: '#64748b', fontSize: '13px' }}>
                  Pago: <b style={{color: '#10b981'}}>{formatarMoeda(a['Valor Pago'])}</b> de {formatarMoeda(a['Valor Total'])}
                </small>
              </div>
            </div>
            
            {!modoLote && isDevedor && (
              <div style={{ background: '#fef3c7', color: '#d97706', fontWeight: 'bold', fontSize: '12px', padding: '6px 12px', borderRadius: '8px' }}>+ PAGAR</div>
            )}
            {!modoLote && !isDevedor && (
              <CheckCircle2 color="#10b981" size={24} />
            )}
          </div>
        )
      })}

      {/* BARRA FLUTUANTE DE CONFORMAÇÃO DO LOTE */}
      {modoLote && selecionadosLote.length > 0 && (
        <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: '500px', background: '#1e293b', color: 'white', padding: '16px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 1000, animation: 'slideUp 0.3s ease-out' }}>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>{selecionadosLote.length} pessoa(s) selecionada(s)</p>
            <h4 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>Dívida: <span style={{ color: '#f59e0b'}}>{formatarMoeda(totalDevedorLote)}</span></h4>
          </div>
          <button onClick={() => setModalLoteAberto(true)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
            Avançar
          </button>
        </div>
      )}
    </div>
  );
}