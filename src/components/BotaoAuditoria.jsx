import { Download } from 'lucide-react';
import { supabase } from '../supabaseClient'; 

export function BotaoAuditoria() {
  
  const formatarRegistro = (dadosBrutos) => {
    if (!dadosBrutos) return '';
    try {
      const obj = typeof dadosBrutos === 'string' ? JSON.parse(dadosBrutos) : dadosBrutos;
      
      const desc = obj.descricao || 'Sem descrição';
      const tipo = obj.tipo || '-';
      const cat = obj.categoria || '-';
      const pag = obj.forma_pagamento || '-';
      const op = obj.operador || 'Sistema';
      
      const valor = obj.valor_pago 
        ? parseFloat(obj.valor_pago).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
        : 'R$ 0,00';

      return `${desc} (${tipo}: ${cat}) | Valor: ${valor} via ${pag} | Caixa: ${op}`;
    } catch (e) {
      return 'Dados legados/Erro de formatação';
    }
  };

  const exportarAuditoria = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        alert("Nenhum registro de auditoria encontrado ainda.");
        return;
      }

      // 1. Agora temos apenas 1 coluna unificada para os dados da transação
      const cabecalho = ['Data e Hora', 'Tabela', 'Ação', 'Registro do Sistema'];
      const csvRows = [cabecalho.join(';')];

      data.forEach(log => {
        const dataFormatada = new Date(log.created_at).toLocaleString('pt-BR');
        
        const registroAntigo = formatarRegistro(log.old_data);
        const registroNovo = formatarRegistro(log.new_data);

        // 2. Inteligência que define o que mostrar baseado na Ação
        let registroFinal = '';
        if (log.action === 'INSERT') {
          registroFinal = registroNovo;
        } else if (log.action === 'DELETE') {
          registroFinal = registroAntigo;
        } else if (log.action === 'UPDATE') {
          registroFinal = `DE: [${registroAntigo}] --> PARA: [${registroNovo}]`;
        } else {
          registroFinal = registroNovo || registroAntigo;
        }

        const linha = [
          dataFormatada,
          log.table_name,
          log.action,
          `"${registroFinal.replace(/"/g, '""')}"`
        ];
        csvRows.push(linha.join(';'));
      });

      const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.setAttribute('download', `Auditoria_Rumo_Certo_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erro ao gerar auditoria:", err);
      alert("Erro ao baixar auditoria. Verifique o console.");
    }
  };

  // 3. O botão agora usa "hidden sm:inline" (vira apenas um ícone no telemóvel) 
  // e adota o mesmo padding/border-radius dos outros botões do App.jsx
  return (
    <button
      onClick={exportarAuditoria}
      title="Baixar Auditoria"
      style={{ 
        background: '#1e293b', 
        border: '1px solid #334155', 
        borderRadius: '14px', 
        padding: '10px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        color: '#f8fafc', 
        cursor: 'pointer', 
        fontWeight: 700, 
        fontSize: '13px', 
        transition: '0.2s',
      }}
    >
      <Download size={18} />
      <span className="hidden sm:inline">Auditoria</span>
    </button>
  );
}