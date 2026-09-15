import { Download } from 'lucide-react';
import { supabase } from '../supabaseClient'; 

export function BotaoAuditoria({ darkMode }) { // <-- Recebe darkMode
  
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

      const cabecalho = ['Data e Hora', 'Tabela', 'Ação', 'Registro do Sistema'];
      const csvRows = [cabecalho.join(';')];

      data.forEach(log => {
        const dataFormatada = new Date(log.created_at).toLocaleString('pt-BR');
        const registroAntigo = formatarRegistro(log.old_data);
        const registroNovo = formatarRegistro(log.new_data);

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

  // Botão redesenhado para encaixar dentro do Dropdown
  return (
    <button
      onClick={exportarAuditoria}
      style={{ 
        width: '100%',
        background: darkMode ? '#334155' : '#f1f5f9', 
        border: 'none', 
        borderRadius: '8px', 
        padding: '10px 12px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '8px', 
        color: darkMode ? '#f8fafc' : '#334155', 
        cursor: 'pointer', 
        fontWeight: 700, 
        fontSize: '13px', 
        transition: '0.2s',
      }}
    >
      <Download size={16} />
      <span>Baixar Auditoria CSV</span>
    </button>
  );
}