// src/components/PaymentModal.jsx
import React from 'react';
import { formatarMoeda } from '../utils/formatters';
import { Paperclip, X } from 'lucide-react';

export default function PaymentModal({
  acampanteSelecionado,
  setAcampanteSelecionado,
  enviarNovoPagamento,
  novoPagamento,
  setNovoPagamento,
  formaPagamentoAdicional,
  setFormaPagamentoAdicional,
  arquivoAnexoPagamento,
  setArquivoAnexoPagamento
}) {
  if (!acampanteSelecionado) return null;

  // Detecta automaticamente se o site está rodando no Modo Escuro
  const isDark = document.body.classList.contains('dark');

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
      <form onSubmit={enviarNovoPagamento} className="cartao" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>{acampanteSelecionado.Descrição}</h3>
        <p style={{ margin: '0 0 24px 0', color: '#d97706', fontWeight: '700', fontSize: '16px' }}>
          Falta: {formatarMoeda(acampanteSelecionado['Saldo Devedor'])}
        </p>
        
        <label className="label-moderna">Valor Recebido (R$)</label>
        <input 
          type="number" 
          step="0.01"
          value={novoPagamento} 
          onChange={e => setNovoPagamento(e.target.value)} 
          placeholder="0.00" 
          required 
          className="input-moderno" 
          style={{ marginBottom: '20px' }} 
        />
        
        <label className="label-moderna">Método de Pagamento</label>
        <select 
          value={formaPagamentoAdicional} 
          onChange={e => setFormaPagamentoAdicional(e.target.value)} 
          className="input-moderno" 
          style={{ marginBottom: '20px' }}
        >
          <option value="PIX">Pix</option>
          <option value="DINHEIRO">Dinheiro</option>
          <option value="CARTÃO">Cartão</option>
        </select>

        {/* CAMPO DE ANEXO DO COMPROVANTE */}
        <div style={{ marginBottom: '28px', textAlign: 'left' }}>
          <label className="label-moderna">Comprovante (Opcional)</label>

          {!arquivoAnexoPagamento ? (
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: `2px dashed ${isDark ? '#475569' : '#cbd5e1'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#94a3b8' : '#64748b', transition: '0.2s' }}>
              <Paperclip size={16} />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Anexar foto ou PDF</span>
              <input 
                type="file" 
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setArquivoAnexoPagamento(e.target.files[0]);
                  }
                }}
              />
            </label>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '12px', backgroundColor: isDark ? '#064e3b' : '#ecfdf5', border: `1px solid ${isDark ? '#047857' : '#10b981'}`, color: isDark ? '#a7f3d0' : '#065f46' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <Paperclip size={16} />
                <span style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                  {arquivoAnexoPagamento.name}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setArquivoAnexoPagamento(null)}
                style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button" 
            onClick={() => { setAcampanteSelecionado(null); if(setArquivoAnexoPagamento) setArquivoAnexoPagamento(null); }} 
            style={{ flex: 1, padding: '14px', backgroundColor: isDark ? '#334155' : '#f1f5f9', border: 'none', borderRadius: '12px', fontWeight: '700', color: isDark ? '#cbd5e1' : '#64748b', cursor: 'pointer', transition: '0.2s' }}
          >
            Cancelar
          </button>
          <button type="submit" style={{ flex: 1, padding: '14px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Confirmar</button>
        </div>
      </form>
    </div>
  );
}