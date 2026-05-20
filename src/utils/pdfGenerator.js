import jsPDF from 'jspdf';
import { formatarMoeda, formatarData, obterColuna, extrairNumero } from './formatters';

// Função auxiliar para carregar a logo da pasta public e converter para o PDF
const carregarLogo = async () => {
  try {
    const response = await fetch('/logo.png');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Não foi possível carregar a logo para o PDF.");
    return null;
  }
};

// ==========================================
// GERAR RECIBO (NOVO DESIGN CORPORATIVO)
// ==========================================
export const gerarRecibo = async (transacao) => {
  const doc = new jsPDF();
  const logoBase64 = await carregarLogo();
  
  // --- CABEÇALHO (Fundo Navy) ---
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 210, 45, 'F');
  
  // --- FAIXA DE DESTAQUE (Verde-Água) ---
  doc.setFillColor(13, 148, 136); // #0d9488
  doc.rect(0, 45, 210, 3, 'F');

  // Adiciona a logo se existir
  let textX = 20;
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 20, 10, 24, 24);
    textX = 55; // Empurra o texto para o lado se tiver logo
  }

  // Título do Recibo (Branco)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('RECIBO DE PAGAMENTO', textX, 28);
  
  // --- CORPO DO RECIBO ---
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Recebemos de:', 20, 70);
  
  doc.setTextColor(15, 23, 42); // Navy Escuro
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(transacao.nome || 'Não informado', 20, 78);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('A importância de:', 20, 95);
  
  // Valor em Destaque (Verde-Água)
  doc.setTextColor(13, 148, 136); // Teal
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(formatarMoeda(transacao.valor), 20, 105);

  // Detalhes da Transação
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Referente a:', 20, 125);
  doc.setFont('helvetica', 'bold');
  doc.text(`${transacao.categoria}`, 45, 125);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Forma de Pagto:', 20, 135);
  doc.setFont('helvetica', 'bold');
  doc.text(`${transacao.formaPagamento}`, 55, 135);

  doc.setFont('helvetica', 'normal');
  doc.text('Data da operação:', 20, 145);
  doc.setFont('helvetica', 'bold');
  doc.text(formatarData(transacao.data), 55, 145);

  // --- RODAPÉ E ASSINATURA ---
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(20, 180, 190, 180);
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('Documento gerado automaticamente pelo Sistema Rumo Certo.', 105, 190, null, null, 'center');

  const nomeArquivo = `Recibo_${transacao.nome.replace(/\s+/g, '_')}.pdf`;
  doc.save(nomeArquivo);
};

// ==========================================
// GERAR BALANCETE GERENCIAL (NOVO DESIGN)
// ==========================================
export const gerarBalancetePDF = async (edicao, totais, dados, estatisticasPublico) => {
  const doc = new jsPDF();
  const logoBase64 = await carregarLogo();

  // --- CABEÇALHO ---
  doc.setFillColor(15, 23, 42); 
  doc.rect(0, 0, 210, 45, 'F');
  doc.setFillColor(13, 148, 136); 
  doc.rect(0, 45, 210, 3, 'F');

  let textX = 20;
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 20, 10, 24, 24);
    textX = 55; 
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(`BALANCETE GERENCIAL`, textX, 24);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Edição ${edicao} • Gerado em: ${new Date().toLocaleString('pt-BR')}`, textX, 32);

  // --- RESUMO GERAL ---
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Visão Geral Financeira', 20, 65);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Total de Receitas (+):', 20, 75);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Verde
  doc.text(formatarMoeda(totais.receitas), 70, 75);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('Total de Despesas (-):', 20, 85);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(239, 68, 68); // Vermelho
  doc.text(formatarMoeda(totais.despesas), 70, 85);

  // Linha de saldo
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 92, 190, 92);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('SALDO EM CAIXA:', 20, 102);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  // Verde se positivo, Vermelho se negativo
  doc.setTextColor(totais.saldo >= 0 ? 16 : 239, totais.saldo >= 0 ? 185 : 68, totais.saldo >= 0 ? 129 : 68);
  doc.text(formatarMoeda(totais.saldo), 70, 102);

  // --- RECEITAS POR PAGAMENTO ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Formas de Recebimento', 20, 125);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`PIX:`, 20, 135);
  doc.text(formatarMoeda(totais.pix), 50, 135);
  doc.text(`Dinheiro/Outros:`, 20, 142);
  doc.text(formatarMoeda(totais.dinheiro), 50, 142);

  // --- PERFIL DO PÚBLICO ---
  let yPos = 165;
  if (estatisticasPublico) {
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('3. Perfil dos Participantes', 20, yPos);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Total de Inscritos Únicos: ${estatisticasPublico.totalInscritos}`, 25, yPos + 10);
    doc.text(`• Acampantes Confirmados: ${estatisticasPublico.acampar}`, 25, yPos + 17);
    doc.text(`• Visitantes (Só Diária): ${estatisticasPublico.soDiaria}`, 25, yPos + 24);
    doc.text(`• Participantes com Pendência: ${estatisticasPublico.pendentes}`, 25, yPos + 31);
    yPos += 45;
  }

  // --- DETALHAMENTO DE DESPESAS ---
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('4. Despesas por Categoria', 20, yPos);

  const despesas = dados.filter(d => obterColuna(d, 'Tipo') === 'SAIDA');
  const gastosPorCategoria = despesas.reduce((acc, curr) => {
    const cat = obterColuna(curr, 'Categoria') || 'Outros';
    const valor = extrairNumero(obterColuna(curr, 'Valor Pago'));
    acc[cat] = (acc[cat] || 0) + valor;
    return acc;
  }, {});

  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  if (Object.keys(gastosPorCategoria).length === 0) {
    doc.text('Nenhuma despesa registrada nesta edição.', 25, yPos);
  } else {
    Object.entries(gastosPorCategoria)
      .sort((a, b) => b[1] - a[1]) 
      .forEach(([cat, valor]) => {
        // Se a lista ficar muito longa, cria nova página
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${cat}:`, 25, yPos);
        doc.text(formatarMoeda(valor), 85, yPos);
        yPos += 7;
      });
  }

  // --- RODAPÉ ---
  const ultimaPagina = doc.internal.getNumberOfPages();
  for (let i = 1; i <= ultimaPagina; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 280, 190, 280);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('Documento gerado automaticamente pelo Sistema Rumo Certo.', 105, 287, null, null, 'center');
  }

  doc.save(`Balancete_Rumo_Certo_${edicao}.pdf`);
};