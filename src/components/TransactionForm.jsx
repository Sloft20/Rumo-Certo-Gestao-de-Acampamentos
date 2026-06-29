// src/components/TransactionForm.jsx
import React from 'react';
import { ArrowLeft, RefreshCw, AlertCircle, Paperclip, X } from 'lucide-react';
import CustomSelect from './CustomSelect'; // IMPORTAÇÃO DO NOVO DROPDOWN

export default function TransactionForm({
  setTelaAtual, guardarRegistro, tipo, setTipo,
  categoriaSelecionada, setCategoriaSelecionada, listaCategoriasAtuais,
  novaCategoria, setNovaCategoria, descricao, setDescricao,
  isInscricao, valorTotal, setValorTotal, valorPago, setValorPago,
  saldoDevedor, formaPagamento, setFormaPagamento, carregando,
  observacao, setObservacao, arquivoAnexo, setArquivoAnexo
}) {

  // Prepara as opções de categoria no formato correto
  const opcoesCategoria = [
    ...listaCategoriasAtuais.map(cat => ({ value: cat, label: cat })),
    { value: 'OUTRA', label: '+ Nova categoria...' }
  ];

  // Prepara as opções de pagamento no formato correto
  const opcoesPagamento = [
    { value: 'PIX', label: 'Pix' },
    { value: 'DINHEIRO', label: 'Dinheiro Físico' }
  ];

  return (
    <div style={{ paddingBottom: '90px' }}>
      <button onClick={() => setTelaAtual('LISTA')} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px' }}>
        <ArrowLeft size={20} /> Voltar para o Painel
      </button>
      
      <form onSubmit={guardarRegistro} className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '16px' }}>
          <button type="button" onClick={() => setTipo('ENTRADA')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: '0.2s', backgroundColor: tipo === 'ENTRADA' ? '#ffffff' : 'transparent', color: tipo === 'ENTRADA' ? '#10b981' : '#64748b', boxShadow: tipo === 'ENTRADA' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>ENTRADA</button>
          <button type="button" onClick={() => setTipo('SAIDA')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: '0.2s', backgroundColor: tipo === 'SAIDA' ? '#ffffff' : 'transparent', color: tipo === 'SAIDA' ? '#ef4444' : '#64748b', boxShadow: tipo === 'SAIDA' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>SAÍDA</button>
        </div>

        {/* SUBSTITUÍDO: Categoria Dropdown */}
        <CustomSelect 
          label="Categoria do Lançamento"
          value={categoriaSelecionada}
          onChange={(e) => setCategoriaSelecionada(e.target.value)}
          options={opcoesCategoria}
        />

        {categoriaSelecionada === 'OUTRA' && (
          <div>
            <label className="label-moderna">Nome da Nova Categoria</label>
            <input type="text" value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} required className="input-moderno" style={{ borderColor: '#3b82f6' }} />
          </div>
        )}

        <div>
          <label className="label-moderna">{tipo === 'ENTRADA' ? "Nome do Acampante / Doador" : "Fornecedor / Descrição"}</label>
          <input type="text" placeholder="Ex: João da Silva" value={descricao} onChange={e => setDescricao(e.target.value)} required className="input-moderno" />
        </div>

        {isInscricao ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label className="label-moderna">Total Combinado (R$)</label><input type="number" value={valorTotal} onChange={e => setValorTotal(e.target.value)} required className="input-moderno" placeholder="180.00" /></div>
            <div><label className="label-moderna">Recebido Agora (R$)</label><input type="number" value={valorPago} onChange={e => setValorPago(e.target.value)} required className="input-moderno" placeholder="50.00" /></div>
          </div>
        ) : (
          <div><label className="label-moderna">Valor da Operação (R$)</label><input type="number" value={valorPago} onChange={e => setValorPago(e.target.value)} required className="input-moderno" placeholder="150.00" /></div>
        )}

        {isInscricao && valorTotal && valorPago && saldoDevedor > 0 && (
           <div style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '16px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <AlertCircle size={20}/> Restará uma dívida de R$ {saldoDevedor}
           </div>
        )}

        {/* SUBSTITUÍDO: Método de Pagamento Dropdown */}
        <CustomSelect 
          label="Método de Pagamento"
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value)}
          options={opcoesPagamento}
        />

        <div>
          <label className="label-moderna">Observações (Opcional)</label>
          <textarea 
            value={observacao} 
            onChange={e => setObservacao(e.target.value)} 
            className="input-moderno" 
            placeholder="Algum detalhe importante? Ex: Faltou entregar a autorização."
            style={{ resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
          />
        </div>
        {/* CAMPO DE ANEXO (FOTO / PDF) */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: document.body.classList.contains('dark') ? '#cbd5e1' : '#334155' }}>
            Comprovante / Recibo (Opcional)
          </label>

          {!arquivoAnexo ? (
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', border: `2px dashed ${document.body.classList.contains('dark') ? '#475569' : '#cbd5e1'}`, borderRadius: '14px', cursor: 'pointer', backgroundColor: document.body.classList.contains('dark') ? '#1e293b' : '#f8fafc', color: document.body.classList.contains('dark') ? '#94a3b8' : '#64748b', transition: '0.2s' }}>
              <Paperclip size={18} />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Anexar comprovante (Foto ou PDF)</span>
              <input 
                type="file" 
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setArquivoAnexo(e.target.files[0]);
                  }
                }}
              />
            </label>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '14px', backgroundColor: document.body.classList.contains('dark') ? '#064e3b' : '#ecfdf5', border: `1px solid ${document.body.classList.contains('dark') ? '#047857' : '#10b981'}`, color: document.body.classList.contains('dark') ? '#a7f3d0' : '#065f46' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <Paperclip size={18} />
                <span style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '210px' }}>
                  {arquivoAnexo.name}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setArquivoAnexo(null)}
                style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
        
        <button disabled={carregando} type="submit" style={{ width: '100%', padding: '18px', fontSize: '16px', fontWeight: '800', backgroundColor: tipo === 'ENTRADA' ? '#10b981' : '#ef4444', color: 'white', border: 'none', borderRadius: '14px', marginTop: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {carregando ? <RefreshCw className="animate-spin" /> : (tipo === 'ENTRADA' ? 'CONCLUIR ENTRADA' : 'CONCLUIR SAÍDA')}
        </button>
      </form>
    </div>
  );
}