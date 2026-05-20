// src/components/PaymentModal.jsx
import React from 'react';
import { formatarMoeda } from '../utils/formatters';

export default function PaymentModal({
  acampanteSelecionado,
  setAcampanteSelecionado,
  enviarNovoPagamento,
  novoPagamento,
  setNovoPagamento,
  formaPagamentoAdicional,
  setFormaPagamentoAdicional
}) {
  if (!acampanteSelecionado) return null;

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
          style={{ marginBottom: '32px' }}
        >
          <option value="PIX">Pix</option>
          <option value="DINHEIRO">Dinheiro</option>
        </select>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={() => setAcampanteSelecionado(null)} style={{ flex: 1, padding: '14px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '12px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}>Cancelar</button>
          <button type="submit" style={{ flex: 1, padding: '14px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Confirmar</button>
        </div>
      </form>
    </div>
  );
}