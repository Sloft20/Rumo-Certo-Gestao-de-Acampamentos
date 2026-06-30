import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, History, FileText, Edit2, Trash2, Clock, User, Calendar, MessageSquare, X, Paperclip } from 'lucide-react';
import { obterColuna, formatarMoeda, formatarData } from '../utils/formatters';
import { gerarRecibo } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';
import CustomSelect from './CustomSelect';

export default function HistoricoList({ 
  termoBuscaHistorico, setTermoBuscaHistorico,
  filtroTipoHistorico, setFiltroTipoHistorico,
  filtroDataInicio, setFiltroDataInicio,
  filtroDataFim, setFiltroDataFim,
  historicoFiltrado,
  prepararEdicao, excluirRegistro 
}) {

  // NOVO: Estado que controla qual transação está aberta no Modal
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

  const opcoesTipoTransacao = [
    { value: 'TODOS', label: 'Todas as Transações' },
    { value: 'ENTRADA', label: 'Apenas Entradas' },
    { value: 'SAIDA', label: 'Apenas Saídas' }
  ];

  return (
    <div className="pb-24">
      
      {/* PAINEL DE FILTROS AVANÇADOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6" style={{ zIndex: 10 }}>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="label-moderna" style={{ marginBottom: '6px', display: 'block' }}>Buscar Registo</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all" style={{ height: '48px' }}>
              <Search size={20} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Procurar acampante ou categoria..." 
                value={termoBuscaHistorico} 
                onChange={(e) => setTermoBuscaHistorico(e.target.value)} 
                className="w-full bg-transparent border-none outline-none ml-3 text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>
          <div className="w-full md:w-64" style={{ zIndex: 100 }}>
            <CustomSelect 
              label="Tipo de Transação"
              value={filtroTipoHistorico}
              onChange={(e) => setFiltroTipoHistorico(e.target.value)}
              options={opcoesTipoTransacao}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4 pt-4 border-t border-slate-100 items-start md:items-center">
           <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold w-full md:w-auto">
             <Calendar size={18} className="text-slate-400" />
             Período:
           </div>
           
           <div className="flex flex-1 gap-2 items-center w-full">
             <input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500 transition-all" style={{ height: '42px' }} />
             <span className="text-slate-400 font-medium text-sm">até</span>
             <input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500 transition-all" style={{ height: '42px' }} />
           </div>

           {temFiltroAtivo && (
             <button onClick={limparFiltros} className="mt-2 md:mt-0 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors w-full md:w-auto text-right md:ml-4">Limpar Filtros</button>
           )}
        </div>
      </div>

      {/* ESTADO VAZIO */}
      {historicoFiltrado.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <div style={{ backgroundColor: '#f1f5f9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}><History size={32} color="#94a3b8" /></div>
          <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '18px' }}>Nenhum Lançamento Encontrado</h3>
          <p style={{ margin: 0, fontSize: '15px' }}>Tente remover ou alterar os filtros aplicados acima.</p>
        </div>
      )}   

      {/* LISTA DE RESULTADOS - AGORA MINIMALISTA */}
      {historicoFiltrado.map((item, index) => {
        const isEntrada = obterColuna(item, 'Tipo') === 'ENTRADA';
        if (!obterColuna(item, 'Descrição')) return null;
        
        return (
          <div 
            key={index} 
            className="cartao" 
            onClick={() => setTransacaoSelecionada(item)}
            style={{ padding: '16px', display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer', transition: 'all 0.2s ease' }}
          >
            <div style={{ backgroundColor: isEntrada ? '#d1fae5' : '#fee2e2', padding: '12px', borderRadius: '14px', marginRight: '16px' }}>
              {isEntrada ? <TrendingUp color="#10b981" size={20} /> : <TrendingDown color="#ef4444" size={20} />}
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 className="text-slate-900" style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {obterColuna(item, 'Descrição')}
              </h4>
              <small className="text-slate-500" style={{ fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {formatarData(obterColuna(item, 'Data'))} • {obterColuna(item, 'Categoria')}
                {item.foi_editado && (
                  <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px' }}>
                    EDITADO
                  </span>
                )}
              </small>
            </div>
            
            <div style={{ textAlign: 'right', marginLeft: '12px' }}>
              <b style={{ color: isEntrada ? '#10b981' : '#ef4444', fontSize: '16px' }}>
                {isEntrada ? '+' : '-'}{formatarMoeda(obterColuna(item, 'Valor Pago'))}
              </b>
            </div>
          </div>
        );
      })}

      {/* MODAL DE DETALHES (TIPO BANCO) */}
      {transacaoSelecionada && (() => {
        const ts = transacaoSelecionada;
        const isEntradaModal = obterColuna(ts, 'Tipo') === 'ENTRADA';
        const temIdModal = obterColuna(ts, 'ID');
        const observacaoModal = obterColuna(ts, 'Observação');
        const urlAnexoModal = ts['anexo_url'];

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white" style={{ width: '100%', maxWidth: '500px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)', maxHeight: '90vh', overflowY: 'auto' }}>
              
              {/* Cabeçalho do Modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 className="text-slate-900" style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Detalhes do Registo</h3>
                <button 
                  onClick={() => setTransacaoSelecionada(null)} 
                  className="bg-slate-100 text-slate-500"
                  style={{ border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Valor em Destaque */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div className="text-slate-500" style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>
                  {obterColuna(ts, 'Categoria')}
                </div>
                <div style={{ fontSize: '36px', fontWeight: '800', color: isEntradaModal ? '#10b981' : '#ef4444', letterSpacing: '-1px' }}>
                  {isEntradaModal ? '+' : '-'} {formatarMoeda(obterColuna(ts, 'Valor Pago'))}
                </div>
                <div className="text-slate-400" style={{ fontSize: '14px', fontWeight: '600', marginTop: '4px' }}>
                  Via {obterColuna(ts, 'Forma de Pagamento')}
                </div>
              </div>

              {/* Grelha de Informações */}
              <div className="bg-slate-50 border border-slate-200" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', padding: '16px', borderRadius: '16px' }}>
                <div>
                  <span className="text-slate-400" style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Acampante / Ref.</span>
                  <span className="text-slate-700" style={{ fontSize: '15px', fontWeight: '700' }}>{obterColuna(ts, 'Descrição')}</span>
                </div>
                <div>
                  <span className="text-slate-400" style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Data</span>
                  <span className="text-slate-700" style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} className="text-slate-400" /> {formatarData(obterColuna(ts, 'Data'))}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400" style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Hora exata</span>
                  <span className="text-slate-700" style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} className="text-slate-400" /> {exibirHora(obterColuna(ts, 'Hora')) || '--:--'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400" style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Operador de Caixa</span>
                  <span className="text-slate-700" style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} className="text-slate-400" /> {obterColuna(ts, 'Operador') || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Observação (Se Existir) */}
              {observacaoModal && (
                <div className="bg-slate-50 border border-slate-200" style={{ marginBottom: '24px', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #0d9488' }}>
                  <span className="text-slate-500" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}>
                    <MessageSquare size={14} /> Observação
                  </span>
                  <span className="text-slate-700" style={{ fontSize: '14px', fontStyle: 'italic', lineHeight: '1.5' }}>
                    "{observacaoModal}"
                  </span>
                </div>
              )}
              {/* BOTÃO DE ANEXO (AGORA ABRE NA MESMA TELA) */}
              {urlAnexoModal && (
                <button 
                  type="button"
                  onClick={() => setAnexoParaVisualizar(urlAnexoModal)} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    width: '100%', 
                    padding: '12px', 
                    marginBottom: '16px', 
                    borderRadius: '14px', 
                    backgroundColor: document.body.classList.contains('dark') ? '#1e293b' : '#f1f5f9', 
                    color: document.body.classList.contains('dark') ? '#38bdf8' : '#0284c7', 
                    fontWeight: '700', 
                    fontSize: '14px',
                    cursor: 'pointer',
                    border: `1px solid ${document.body.classList.contains('dark') ? '#0369a1' : '#bae6fd'}`,
                    transition: '0.2s'
                  }}
                >
                  <Paperclip size={18} />
                  <span>Ver Comprovante Anexado</span>
                </button>
              )}

              {/* Botões de Ação */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                {temIdModal && (
                  <button 
                    onClick={() => { excluirRegistro(temIdModal); setTransacaoSelecionada(null); }} 
                    style={{ flex: 1, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '14px', padding: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '12px', transition: '0.2s' }}
                  >
                    <Trash2 size={20} /> Excluir
                  </button>
                )}
                {temIdModal && (
                  <button 
                    onClick={() => { prepararEdicao(ts); setTransacaoSelecionada(null); }} 
                    style={{ flex: 1, background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '14px', padding: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '12px', transition: '0.2s' }}
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
                    style={{ flex: 1, background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '14px', padding: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '12px', transition: '0.2s' }}
                  >
                    <FileText size={20} /> Recibo
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })()}
      {/* MODAL SUPREMO DE VISUALIZAÇÃO DE ANEXO (Z-INDEX 10000) */}
      {anexoParaVisualizar && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(6px)' }}>
          
          {/* Barra superior com botão de fechar */}
          <div style={{ width: '100%', maxWidth: '750px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#f8fafc', fontWeight: '700', fontSize: '14px' }}>Visualizador de Documento</span>
            <button 
              onClick={() => setAnexoParaVisualizar(null)}
              style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Janela Inteligente (Detecta se é PDF ou Foto) */}
          <div style={{ width: '100%', maxWidth: '750px', height: '75vh', backgroundColor: '#0f172a', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155' }}>
            {anexoParaVisualizar.toLowerCase().includes('.pdf') ? (
              <iframe src={anexoParaVisualizar} style={{ width: '100%', height: '100%', border: 'none' }} title="Comprovante PDF" />
            ) : (
              <img src={anexoParaVisualizar} alt="Comprovante" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            )}
          </div>

          {/* Plano B de segurança para navegadores mobile chatos */}
          <a href={anexoParaVisualizar} target="_blank" rel="noopener noreferrer" style={{ marginTop: '14px', color: '#38bdf8', fontSize: '12px', fontWeight: '600', textDecoration: 'underline' }}>
            O arquivo não abriu aqui dentro? Clique para abrir em nova aba ↗
          </a>

        </div>
      )}

    </div>
  );
}
