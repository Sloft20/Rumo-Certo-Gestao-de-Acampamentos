import { useState, useEffect, useMemo } from 'react';
import { Wallet, RefreshCw, User, Users, Download, Eye, EyeOff, ShieldAlert, Settings, Plus, Trash2, X, ChevronDown, AlertCircle, Moon, Sun } from 'lucide-react';
import './App.css';
import { obterColuna, extrairNumero, formatarMoeda, formatarData } from './utils/formatters';
import DashboardOverview from './components/DashboardOverview';
import AcampanteList from './components/AcampanteList';
import HistoricoList from './components/HistoricoList';
import PaymentModal from './components/PaymentModal';
import TransactionForm from './components/TransactionForm';
import localforage from 'localforage';
import { Toaster, toast } from 'react-hot-toast';
import BottomNav from './components/BottomNav';
import { gerarBalancetePDF } from './utils/pdfGenerator';
import PainelMetas from './components/PainelMetas';

const API_URL = "https://script.google.com/macros/s/AKfycbyIOg66JUPX6saMRl6d2Bj_WSak-ueJovBfs17Aovf_GZ4ETWsY4QP36OPGN5Gn8hDKhA/exec";

export default function App() {
  const [telaAtual, setTelaAtual] = useState('LISTA'); 
  const [carregando, setCarregando] = useState(false);
  const [mensagemCarregando, setMensagemCarregando] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [filaOffline, setFilaOffline] = useState([]);
  const [edicaoAtiva, setEdicaoAtiva] = useState('2027');
  const [operadorCaixa, setOperadorCaixa] = useState(localStorage.getItem('operador_caixa') || '');
  const [dropdownOperadorAberto, setDropdownOperadorAberto] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS');
  const [observacao, setObservacao] = useState('');

  const [listaEdicoes, setListaEdicoes] = useState(['2027']);

  // --- NOVO: ESTADO DO MODO ESCURO ---
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('tema_rumo_certo') === 'escuro';
  });

  const [listaOperadores, setListaOperadores] = useState(() => {
    const salvos = localStorage.getItem('lista_operadores');
    return salvos ? JSON.parse(salvos) : ['Thiago', 'Mirele', 'João']; 
  });
  const [modalOperadoresAberto, setModalOperadoresAberto] = useState(false);
  const [novoOperador, setNovoOperador] = useState('');

  const [modoLote, setModoLote] = useState(false);
  const [selecionadosLote, setSelecionadosLote] = useState([]);
  const [modalLoteAberto, setModalLoteAberto] = useState(false);
  const [valorLote, setValorLote] = useState('');
  const [formaPagamentoLote, setFormaPagamentoLote] = useState('PIX');

  const [dadosPlanilha, setDadosPlanilha] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [termoBuscaHistorico, setTermoBuscaHistorico] = useState('');
  const [acampanteSelecionado, setAcampanteSelecionado] = useState(null);
  
  const [novoPagamento, setNovoPagamento] = useState('');
  const [idEmEdicao, setIdEmEdicao] = useState(null);
  const [dataEmEdicao, setDataEmEdicao] = useState(null);
  const [formaPagamentoAdicional, setFormaPagamentoAdicional] = useState('PIX');
  const [tipo, setTipo] = useState('ENTRADA');
  const [descricao, setDescricao] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [valorTotal, setValorTotal] = useState('');
  const [valorPago, setValorPago] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');

  const [filtroTipoHistorico, setFiltroTipoHistorico] = useState('TODOS');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  const [categoriasExtras, setCategoriasExtras] = useState({ ENTRADA: [], SAIDA: [] });
  const categoriasPadrao = {
    ENTRADA: ['Inscrição', 'Doação', 'Diária'],
    SAIDA: ['Chácara', 'Alimentação', 'Bebidas', 'Brindes', 'Produtos de Limpeza', 'Auxílio Van']
  };

  const listaCategoriasAtuais = [...categoriasPadrao[tipo], ...categoriasExtras[tipo]];
  const isInscricao = tipo === 'ENTRADA' && (categoriaSelecionada === 'Inscrição' || categoriaSelecionada === 'Diária');
  const saldoDevedor = (parseFloat(valorTotal || 0) - parseFloat(valorPago || 0)).toFixed(2);

  const [modoPrivacidade, setModoPrivacidade] = useState(false);
  const [mostrarApenasDevedores, setMostrarApenasDevedores] = useState(false);

  // --- NOVO: EFEITO PARA APLICAR MODO ESCURO NA TELA INTEIRA ---
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('tema_rumo_certo', 'escuro');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('tema_rumo_certo', 'claro');
    }
  }, [darkMode]);

  const baixarBalancete = () => {
    const totais = { receitas: totalReceitas, despesas: totalDespesas, saldo: saldoCaixa, pix: receitasPix, dinheiro: receitasDinheiro };
    gerarBalancetePDF(edicaoAtiva, totais, dadosDaEdicao, estatisticasPublico);
    toast.success('Balancete gerado com sucesso!');
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const carregarDadosLocais = async () => {
      try {
        const salvas = await localforage.getItem('categorias_personalizadas');
        if (salvas) setCategoriasExtras(salvas);
        const filaSalva = await localforage.getItem('fila_acampamento');
        setFilaOffline(filaSalva || []);
      } catch (err) { console.error("Erro ao carregar dados:", err); }
    };
    carregarDadosLocais(); carregarDados();
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  useEffect(() => {
    setCategoriaSelecionada(listaCategoriasAtuais[0]);
    setNovaCategoria(''); setValorTotal(''); setValorPago('');
  }, [tipo]);

  const adicionarOperador = (e) => {
    e.preventDefault();
    const nomeLimpo = novoOperador.trim();
    if (nomeLimpo && !listaOperadores.includes(nomeLimpo)) {
      const novaLista = [...listaOperadores, nomeLimpo];
      setListaOperadores(novaLista); localStorage.setItem('lista_operadores', JSON.stringify(novaLista));
      setNovoOperador(''); toast.success('Operador adicionado!');
    } else if (listaOperadores.includes(nomeLimpo)) {
      toast.error('Este operador já existe.');
    }
  };

  const removerOperador = (nome) => {
    if (listaOperadores.length === 1) { toast.error('Você precisa ter pelo menos um operador.'); return; }
    const novaLista = listaOperadores.filter(op => op !== nome);
    setListaOperadores(novaLista); localStorage.setItem('lista_operadores', JSON.stringify(novaLista));
    if (operadorCaixa === nome) { setOperadorCaixa(''); localStorage.removeItem('operador_caixa'); }
    toast.success('Operador removido!');
  };

  const aplicarFiltroRapido = (tipo) => {
    setMostrarApenasDevedores(false); setFiltroCategoria('TODOS'); setTermoBusca('');
    if (tipo === 'PENDENTES') setMostrarApenasDevedores(true);
    if (tipo === 'DIARIA') setFiltroCategoria('DIARIA');
    if (tipo === 'ACAMPAR') setFiltroCategoria('ACAMPAR');
    setTelaAtual('LISTA');
  };

  const carregarDados = async () => {
    if (navigator.onLine) {
      setMensagemCarregando('Atualizando dados...'); setCarregando(true);
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setDadosPlanilha(data); 
        const todasAsEdicoes = data.map(item => item['Edição'] || item['Edicao']);
        const edicoesUnicas = [...new Set(todasAsEdicoes)].filter(Boolean).sort();
        if (edicoesUnicas.length > 0) {
          setListaEdicoes(edicoesUnicas);
          if (!edicoesUnicas.includes(edicaoAtiva)) setEdicaoAtiva(edicoesUnicas[edicoesUnicas.length - 1]);
        }
      } catch (e) { console.log("Erro de rede.", e); }
      setCarregando(false);
    }
  };

  const dadosDaEdicao = useMemo(() => {
    return dadosPlanilha.filter(d => String(obterColuna(d, 'Edição')) === String(edicaoAtiva));
  }, [dadosPlanilha, edicaoAtiva]);

  const { totalReceitas, totalDespesas, saldoCaixa, receitasPix, receitasDinheiro } = useMemo(() => {
    let pix = 0; let dinheiro = 0;
    const receitas = dadosDaEdicao.filter(d => obterColuna(d, 'Tipo') === 'ENTRADA').reduce((acc, curr) => {
        const valor = extrairNumero(obterColuna(curr, 'Valor Pago'));
        const forma = (obterColuna(curr, 'Forma de Pagamento') || '').toUpperCase();
        if (forma.includes('PIX')) pix += valor;
        if (forma.includes('DINHEIRO')) dinheiro += valor;
        return acc + valor;
    }, 0);
    const despesas = dadosDaEdicao.filter(d => obterColuna(d, 'Tipo') === 'SAIDA').reduce((acc, curr) => acc + extrairNumero(obterColuna(curr, 'Valor Pago')), 0);
    return { totalReceitas: receitas, totalDespesas: despesas, saldoCaixa: receitas - despesas, receitasPix: pix, receitasDinheiro: dinheiro };
  }, [dadosDaEdicao]);

  const agrupamento = useMemo(() => {
    return dadosDaEdicao.filter(d => obterColuna(d, 'Tipo') === 'ENTRADA' && obterColuna(d, 'Descrição')).reduce((acc, curr) => {
        const nome = obterColuna(curr, 'Descrição').trim();
        const vPago = extrairNumero(obterColuna(curr, 'Valor Pago'));
        const vTotal = extrairNumero(obterColuna(curr, 'Valor Total'));
        const cat = obterColuna(curr, 'Categoria');

        if (!acc[nome]) {
          acc[nome] = { Descrição: nome, Categoria: cat !== 'Pagamento Adicional' ? cat : 'INSCRIÇÃO', 'Valor Total': vTotal, 'Valor Pago': vPago };
        } else {
          acc[nome]['Valor Total'] += vTotal; acc[nome]['Valor Pago'] += vPago;
          if (cat && cat !== 'Pagamento Adicional') acc[nome].Categoria = cat;
        }
        return acc;
    }, {});
  }, [dadosDaEdicao]);

  const acampantesFiltrados = useMemo(() => {
    let filtrados = Object.values(agrupamento)
      .map(a => ({ ...a, 'Saldo Devedor': a['Valor Total'] - a['Valor Pago'] }))
      .filter(a => a.Descrição.toLowerCase().includes(termoBusca.toLowerCase()));
    
    if (mostrarApenasDevedores) filtrados = filtrados.filter(a => a['Saldo Devedor'] > 0);
    if (filtroCategoria === 'DIARIA') filtrados = filtrados.filter(a => a.Categoria === 'Diária');
    if (filtroCategoria === 'ACAMPAR') filtrados = filtrados.filter(a => a.Categoria === 'Inscrição');
    return filtrados;
  }, [agrupamento, termoBusca, mostrarApenasDevedores, filtroCategoria]);

  const estatisticasPublico = useMemo(() => {
    const inscritosUnicos = Object.values(agrupamento);
    return {
      totalInscritos: inscritosUnicos.length,
      pendentes: inscritosUnicos.filter(a => (parseFloat(a['Valor Total'] || 0) - parseFloat(a['Valor Pago'] || 0)) > 0.01).length,
      soDiaria: inscritosUnicos.filter(a => a.Categoria === 'Diária').length,
      acampar: inscritosUnicos.filter(a => a.Categoria === 'Inscrição').length,
    };
  }, [agrupamento]);

  const [metas, setMetas] = useState(() => {
    const metasSalvas = localStorage.getItem('metas_acampamento');
    return metasSalvas ? JSON.parse(metasSalvas) : { arrecadacao: 15000, limiteGastos: 5000 };
  });
  
  const historicoFiltrado = useMemo(() => {
    return dadosDaEdicao.slice().reverse().filter(item => {
      const desc = (obterColuna(item, 'Descrição') || '').toLowerCase();
      const cat = (obterColuna(item, 'Categoria') || '').toLowerCase();
      const busca = termoBuscaHistorico.toLowerCase();
      const matchTexto = desc.includes(busca) || cat.includes(busca);

      const tipo = obterColuna(item, 'Tipo') || '';
      const matchTipo = filtroTipoHistorico === 'TODOS' || tipo === filtroTipoHistorico;

      let matchData = true;
      const dataItemOriginal = obterColuna(item, 'Data'); 
      if (dataItemOriginal && (filtroDataInicio || filtroDataFim)) {
        let dataItem;
        const dataStr = String(dataItemOriginal);
        if (dataStr.includes('T')) dataItem = new Date(dataStr); 
        else if (dataStr.includes('/')) {
          const partes = dataStr.split('/'); 
          if (partes.length === 3) dataItem = new Date(partes[2], partes[1] - 1, partes[0]);
        } else if (dataStr.includes('-')) dataItem = new Date(dataStr); 

        if (dataItem && !isNaN(dataItem.getTime())) {
          dataItem.setHours(0, 0, 0, 0); 
          if (filtroDataInicio) {
            const [ano, mes, dia] = filtroDataInicio.split('-');
            const dataInicio = new Date(ano, mes - 1, dia); dataInicio.setHours(0, 0, 0, 0);
            if (dataItem < dataInicio) matchData = false;
          }
          if (filtroDataFim) {
            const [ano, mes, dia] = filtroDataFim.split('-');
            const dataFim = new Date(ano, mes - 1, dia); dataFim.setHours(23, 59, 59, 999); 
            if (dataItem > dataFim) matchData = false;
          }
        }
      }
      return matchTexto && matchTipo && matchData;
    });
  }, [dadosDaEdicao, termoBuscaHistorico, filtroTipoHistorico, filtroDataInicio, filtroDataFim]);

  const abrirNovoRegistro = () => {
    setIdEmEdicao(null); setDataEmEdicao(null); setDescricao(''); setValorTotal(''); setValorPago(''); setObservacao('');
    setTelaAtual('NOVO');
  };

  const prepararEdicao = (item) => {
    // 1. Pega a data crua da planilha
    let dataCorrigida = obterColuna(item, 'Data');
    
    // 2. Se a data vier com o 'T' (ex: 2026-05-20T03:00...), nós a formatamos para DD/MM/YYYY
    if (dataCorrigida && String(dataCorrigida).includes('T')) {
      const [ano, mes, dia] = String(dataCorrigida).split('T')[0].split('-');
      dataCorrigida = `${dia}/${mes}/${ano}`;
    }

    // 3. Alimenta o estado com a data limpinha
    setIdEmEdicao(obterColuna(item, 'ID')); 
    setDataEmEdicao(dataCorrigida); 
    
    setTipo(obterColuna(item, 'Tipo')); 
    setDescricao(obterColuna(item, 'Descrição'));
    setCategoriaSelecionada(obterColuna(item, 'Categoria')); 
    setFormaPagamento(obterColuna(item, 'Forma de Pagamento') || 'PIX');
    setObservacao(obterColuna(item, 'Observação') || '');
    
    const isEntrada = obterColuna(item, 'Tipo') === 'ENTRADA';
    const cat = obterColuna(item, 'Categoria');
    
    if(isEntrada && (cat === 'Inscrição' || cat === 'Diária')) {
      setValorTotal(obterColuna(item, 'Valor Total') || '');
    } else {
      setValorTotal('');
    }
    
    setValorPago(obterColuna(item, 'Valor Pago') || '');
    setTelaAtual('NOVO');
  };
  
  const excluirRegistro = async (id) => {
    if(!id) { toast.error("Este registro antigo não possui ID."); return; }
    if(!window.confirm("Tem certeza que deseja excluir este lançamento?")) return;
    if (!navigator.onLine) { toast.error("Você precisa estar online para excluir."); return; }
    
    setMensagemCarregando('Excluindo registro...'); setCarregando(true);
    try {
      await fetch(API_URL, { method: 'POST', body: JSON.stringify({ acao: 'delete', id: id }) });
      carregarDados(); toast.success("Registro excluído com sucesso!");
    } catch (e) { toast.error("Erro ao excluir."); setCarregando(false); }
  };

  const sincronizarFila = async () => {
    if (isOffline) return;
    setMensagemCarregando('Sincronizando dados offline...'); setCarregando(true);
    let falhas = [];
    for (let reg of filaOffline) {
      try { await fetch(API_URL, { method: 'POST', body: JSON.stringify(reg) }); } 
      catch (e) { falhas.push(reg); }
    }
    setFilaOffline(falhas); await localforage.setItem('fila_acampamento', falhas); 
    if (falhas.length === 0) carregarDados(); else setCarregando(false);
  };

  const enviarPagamentoLote = async (e) => {
    e.preventDefault();
    if (!valorLote || isNaN(valorLote) || valorLote <= 0) { toast.error('Insira um valor válido'); return; }

    const totalDevedor = selecionadosLote.reduce((acc, curr) => acc + curr['Saldo Devedor'], 0);
    const valorRecebido = parseFloat(valorLote);
    
    setMensagemCarregando('Processando pagamento em lote...'); setCarregando(true);
    let novaFilaLocal = [...filaOffline];

    for (let acampante of selecionadosLote) {
      if (acampante['Saldo Devedor'] <= 0) continue; 
      const proporcao = acampante['Saldo Devedor'] / totalDevedor;
      const valorAAbater = valorRecebido * proporcao;

      const registroLote = {
        id: Date.now().toString() + Math.floor(Math.random() * 1000),
        acao: "atualizar_pagamento", edicao: edicaoAtiva, operador: operadorCaixa || 'Não identificado',
        hora: "'" + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        nome: acampante.Descrição, valorNovo: valorAAbater.toFixed(2), formaPagamento: formaPagamentoLote
      };

      if (navigator.onLine) {
        try { await fetch(API_URL, { method: 'POST', body: JSON.stringify(registroLote) }); } 
        catch (e) { novaFilaLocal.push(registroLote); }
      } else { novaFilaLocal.push(registroLote); }
    }

    setFilaOffline(novaFilaLocal); localforage.setItem('fila_acampamento', novaFilaLocal);
    carregarDados(); setModalLoteAberto(false); setModoLote(false); setSelecionadosLote([]); setValorLote('');
    toast.success('Pagamento em Lote processado!');
  };

  const guardarRegistro = async (e) => {
    e.preventDefault();
    let catFinal = categoriaSelecionada === 'OUTRA' ? novaCategoria : categoriaSelecionada;
    if (categoriaSelecionada === 'OUTRA' && novaCategoria.trim() !== '') {
      const novasExtras = { ...categoriasExtras, [tipo]: [...categoriasExtras[tipo], novaCategoria] };
      setCategoriasExtras(novasExtras); localforage.setItem('categorias_personalizadas', novasExtras);
    }

    const valorFinalPago = isInscricao ? valorPago : (valorPago || valorTotal);
    const valorFinalTotal = (tipo === 'ENTRADA' && catFinal === 'Pagamento Adicional') ? 0 : (isInscricao ? valorTotal : valorFinalPago);
    const saldoDev = valorFinalTotal - valorFinalPago;

    const registro = {
      id: idEmEdicao ? idEmEdicao : Date.now().toString(),
      acao: idEmEdicao ? "update" : "novo",
      edicao: edicaoAtiva, data: idEmEdicao ? dataEmEdicao : undefined, 
      operador: operadorCaixa || 'Não identificado', 
      hora: "'" + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), 
      tipoTransacao: tipo, descricao: descricao, valorTotal: valorFinalTotal, valorPago: valorFinalPago,   
      status: (isInscricao && saldoDev > 0) ? 'Pendente' : 'Concluído', formaPagamento: formaPagamento, categoria: catFinal,
      observacao: observacao
    };

    if (navigator.onLine) {
      setMensagemCarregando(idEmEdicao ? 'Salvando alterações...' : 'Lançando registro...'); setCarregando(true);
      try {
        await fetch(API_URL, { method: 'POST', body: JSON.stringify(registro) });
        carregarDados(); setTelaAtual('LISTA'); toast.success(idEmEdicao ? 'Atualizado com sucesso!' : 'Salvo com sucesso!');
      } catch (error) { 
        const novaFila = [...filaOffline, registro]; setFilaOffline(novaFila); localforage.setItem('fila_acampamento', novaFila); setTelaAtual('LISTA'); setCarregando(false);
      }
    } else {
      const novaFila = [...filaOffline, registro]; setFilaOffline(novaFila); localforage.setItem('fila_acampamento', novaFila); setTelaAtual('LISTA');
    }
    setIdEmEdicao(null); setDataEmEdicao(null); setDescricao(''); setValorTotal(''); setValorPago(''); setObservacao('');
  };

  const enviarNovoPagamento = async (e) => {
    e.preventDefault();
    const dadosAtualizacao = { 
        id: Date.now().toString(), acao: "atualizar_pagamento", edicao: edicaoAtiva, operador: operadorCaixa || 'Não identificado', 
        hora: "'" + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), 
        nome: acampanteSelecionado.Descrição, valorNovo: novoPagamento, formaPagamento: formaPagamentoAdicional 
    };
        
    if (navigator.onLine) {
      setMensagemCarregando('Registrando pagamento...'); setCarregando(true);
      await fetch(API_URL, { method: 'POST', body: JSON.stringify(dadosAtualizacao) });
      setAcampanteSelecionado(null); setNovoPagamento(''); carregarDados(); toast.success('Pagamento recebido!');
    } else {
      const novaFila = [...filaOffline, dadosAtualizacao]; setFilaOffline(novaFila); localforage.setItem('fila_acampamento', novaFila); setAcampanteSelecionado(null); setNovoPagamento('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: darkMode ? '#0f172a' : '#f8fafc', transition: '0.3s' }}>
      
      {/* O MOTOR MÁGICO DO MODO ESCURO */}
      <style>
        {`
          .container-aplicacao { transition: padding-left 0.3s ease; width: 100%; box-sizing: border-box; }
          @media (min-width: 768px) { .container-aplicacao { padding-left: 100px; } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

          /* COMPONENTES FILHOS NO MODO ESCURO */
          body.dark .cartao { background-color: #1e293b !important; border-color: #334155 !important; }
          body.dark .bg-white { background-color: #1e293b !important; }
          body.dark h3, body.dark h4, body.dark p, body.dark label { color: #f8fafc !important; }
          body.dark small { color: #94a3b8 !important; }
          body.dark .text-slate-900, body.dark .text-slate-800, body.dark .text-slate-700 { color: #f8fafc !important; }
          body.dark .text-slate-600, body.dark .text-slate-500, body.dark .text-slate-400 { color: #cbd5e1 !important; }
          body.dark .bg-slate-50, body.dark .bg-slate-100 { background-color: #0f172a !important; border-color: #334155 !important; }
          body.dark .border-slate-200 { border-color: #334155 !important; }
          
          /* Formulários e Inputs */
          body.dark .input-moderno, body.dark input[type="text"], body.dark input[type="number"], body.dark input[type="date"], body.dark select, body.dark textarea {
            background-color: #0f172a !important; border-color: #334155 !important; color: #f8fafc !important;
          }
          
          /* Barra de Navegação Inferior */
          body.dark .menu-navegacao { background-color: #1e293b !important; border-top-color: #334155 !important; }
          body.dark .icone-container { background-color: #0f172a !important; }

          /* Estilos específicos para o Dropdown Customizado Absoluto */
          .opcao-item:hover {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
          }

          body.dark .dropdown-opcoes {
            background-color: #1e293b !important;
            border-color: #334155 !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4) !important;
          }

          body.dark .opcao-item {
            color: #cbd5e1 !important;
          }

          body.dark .opcao-item:hover {
            background-color: #334155 !important;
            color: #f8fafc !important;
          }

          body.dark .opcao-item.selecionada {
            background-color: rgba(45, 212, 191, 0.15) !important;
            color: #2dd4bf !important;
          }
        `}
        
        
      </style>

      {carregando && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.2s ease-out', border: darkMode ? '1px solid #334155' : 'none' }}>
            <RefreshCw size={36} color="#0d9488" className="animate-spin" />
            <p style={{ margin: 0, color: darkMode ? '#f8fafc' : '#334155', fontWeight: '700', fontSize: '16px' }}>{mensagemCarregando || 'A processar...'}</p>
          </div>
        </div>
      )}

      {!acampanteSelecionado && (
        <BottomNav telaAtual={telaAtual} setTelaAtual={(tela) => tela === 'NOVO' ? abrirNovoRegistro() : setTelaAtual(tela)} />
      )}

      <div className="container-aplicacao" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        <Toaster position="top-center" reverseOrder={false} />

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', padding: '8px', borderRadius: '16px', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
              <img src="/logo.png" alt="Logo Rumo Certo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800', lineHeight: '1.2', color: darkMode ? '#f8fafc' : '#0f172a' }}>Rumo Certo</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                <select value={edicaoAtiva} onChange={(e) => setEdicaoAtiva(e.target.value)} style={{ border: 'none', background: 'transparent', color: darkMode ? '#cbd5e1' : '#64748b', fontWeight: '700', fontSize: '13px', padding: 0, outline: 'none', cursor: 'pointer' }}>
                  {listaEdicoes.map(edicao => <option key={edicao} value={edicao}>Edição {edicao}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
            
            <div style={{ position: 'relative' }}>
              <div onClick={() => setDropdownOperadorAberto(!dropdownOperadorAberto)} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: darkMode ? '#1e293b' : '#ffffff', padding: '10px 16px', borderRadius: '20px', cursor: 'pointer', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <User size={16} color={operadorCaixa ? '#0d9488' : '#ef4444'} />
                <span style={{ color: operadorCaixa ? (darkMode ? '#f8fafc' : '#0f172a') : '#ef4444', fontWeight: '700', fontSize: '13px' }}>
                  {operadorCaixa ? `Operador: ${operadorCaixa}` : 'Caixa Indefinido'}
                </span>
                <ChevronDown size={14} color="#94a3b8" style={{ marginLeft: '4px', transform: dropdownOperadorAberto ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
              </div>

              {dropdownOperadorAberto && (
                <>
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 40 }} onClick={() => setDropdownOperadorAberto(false)} />
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '220px', backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, zIndex: 50, padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', animation: 'slideUp 0.15s ease-out' }}>
                    
                    <div onClick={() => { setOperadorCaixa(''); localStorage.removeItem('operador_caixa'); setDropdownOperadorAberto(false); }} style={{ padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: !operadorCaixa ? (darkMode ? '#450a0a' : '#fee2e2') : 'transparent' }}>
                      <AlertCircle size={16} /> Ficar Indefinido
                    </div>

                    <div style={{ height: '1px', background: darkMode ? '#334155' : '#f1f5f9', margin: '4px 0' }}></div>

                    {listaOperadores.map(op => (
                      <div key={op} onClick={() => { setOperadorCaixa(op); localStorage.setItem('operador_caixa', op); setDropdownOperadorAberto(false); }} style={{ padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#334155', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: operadorCaixa === op ? (darkMode ? '#0f172a' : '#f0fdfa') : 'transparent', transition: '0.2s' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: operadorCaixa === op ? '#0d9488' : '#cbd5e1' }}></div>
                        {op}
                      </div>
                    ))}

                    <div style={{ height: '1px', background: darkMode ? '#334155' : '#f1f5f9', margin: '4px 0' }}></div>

                    <div onClick={() => { setDropdownOperadorAberto(false); setModalOperadoresAberto(true); }} style={{ padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: darkMode ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Settings size={16} /> Gerenciar Equipe
                    </div>

                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              
              {/* BOTÃO DO MODO ESCURO */}
              <button onClick={() => setDarkMode(!darkMode)} style={{ background: darkMode ? '#1e293b' : '#ffffff', border: '1px solid', borderColor: darkMode ? '#334155' : '#e2e8f0', borderRadius: '10px', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '6px', color: darkMode ? '#cbd5e1' : '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                {darkMode ? <Sun size={14} /> : <Moon size={14} />} {darkMode ? 'Claro' : 'Escuro'}
              </button>

              <button onClick={baixarBalancete} style={{ background: darkMode ? '#1e3a8a' : '#eff6ff', border: 'none', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px', color: darkMode ? '#60a5fa' : '#2563eb', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
                <Download size={14} /> Balancete
              </button>
              
              <button onClick={() => setModoPrivacidade(!modoPrivacidade)} style={{ background: darkMode ? '#1e293b' : '#ffffff', border: '1px solid', borderColor: darkMode ? '#334155' : '#e2e8f0', borderRadius: '10px', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '6px', color: darkMode ? '#cbd5e1' : '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                {modoPrivacidade ? <EyeOff size={14} /> : <Eye size={14} />} {modoPrivacidade ? 'Mostrar' : 'Ocultar'}
              </button>
              
              <button onClick={carregarDados} style={{ background: darkMode ? '#134e4a' : '#f0fdfa', border: 'none', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px', color: darkMode ? '#2dd4bf' : '#0d9488', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
                <RefreshCw size={14} /> Atualizar
              </button>
            </div>

          </div>
        </div>

        {isOffline && <div className="cartao" style={{ backgroundColor: darkMode ? '#78350f' : '#fef3c7', borderColor: darkMode ? '#92400e' : '#fde68a', color: darkMode ? '#fde68a' : '#92400e', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><AlertCircle size={20}/> MODO OFFLINE ATIVO</div>}
        {!isOffline && filaOffline.length > 0 && (
          <div className="cartao" style={{ backgroundColor: darkMode ? '#78350f' : '#fef3c7', borderColor: darkMode ? '#92400e' : '#fde68a', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
            <span style={{ color: darkMode ? '#fde68a' : '#92400e', fontWeight: '600' }}>{filaOffline.length} registros aguardando rede.</span>
            <button onClick={sincronizarFila} style={{ backgroundColor: '#d97706', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Sincronizar</button>
          </div>
        )}

        {telaAtual === 'LISTA' && (
          <div style={{ paddingBottom: '90px' }}>
            <DashboardOverview saldoCaixa={saldoCaixa} totalReceitas={totalReceitas} totalDespesas={totalDespesas} receitasPix={receitasPix} receitasDinheiro={receitasDinheiro} modoPrivacidade={modoPrivacidade} />
            <AcampanteList termoBusca={termoBusca} setTermoBusca={setTermoBusca} acampantesFiltrados={acampantesFiltrados} setAcampanteSelecionado={setAcampanteSelecionado} mostrarApenasDevedores={mostrarApenasDevedores} setMostrarApenasDevedores={setMostrarApenasDevedores} modoLote={modoLote} setModoLote={setModoLote} selecionadosLote={selecionadosLote} setSelecionadosLote={setSelecionadosLote} setModalLoteAberto={setModalLoteAberto} filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria} />
            <PaymentModal acampanteSelecionado={acampanteSelecionado} setAcampanteSelecionado={setAcampanteSelecionado} enviarNovoPagamento={enviarNovoPagamento} novoPagamento={novoPagamento} setNovoPagamento={setNovoPagamento} formaPagamentoAdicional={formaPagamentoAdicional} setFormaPagamentoAdicional={setFormaPagamentoAdicional} />
          </div>
        )}
        
        {telaAtual === 'RESUMO' && (
          <PainelMetas estatisticasPublico={estatisticasPublico} metas={metas} setMetas={setMetas} totalReceitas={totalReceitas} totalDespesas={totalDespesas} aplicarFiltroRapido={aplicarFiltroRapido} dadosDaEdicao={dadosDaEdicao} saldoCaixa={saldoCaixa} receitasPix={receitasPix} receitasDinheiro={receitasDinheiro} modoPrivacidade={modoPrivacidade} />
        )}
        
        {modalLoteAberto && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
            <div style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', width: '100%', maxWidth: '500px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', animation: 'slideUp 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', color: darkMode ? '#f8fafc' : '#0f172a' }}>Pagamento Familiar</h3>
                <button onClick={() => setModalLoteAberto(false)} style={{ background: darkMode ? '#334155' : '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: darkMode ? '#cbd5e1' : '#64748b' }}>✕</button>
              </div>
              <div style={{ background: darkMode ? '#451a03' : '#fffbeb', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>
                <p style={{ margin: 0, color: darkMode ? '#fde68a' : '#d97706', fontSize: '14px', fontWeight: '600' }}>
                  Dívida Somada do Lote: {formatarMoeda(selecionadosLote.reduce((acc, curr) => acc + curr['Saldo Devedor'], 0))}
                </p>
              </div>
              <form onSubmit={enviarPagamentoLote} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: darkMode ? '#cbd5e1' : '#475569' }}>Valor Único Recebido</label>
                  <input type="number" step="0.01" value={valorLote} onChange={(e) => setValorLote(e.target.value)} placeholder="0.00" required style={{ width: '100%', padding: '12px', border: '2px solid', borderColor: darkMode ? '#334155' : '#e2e8f0', borderRadius: '12px', fontSize: '16px', outline: 'none', backgroundColor: darkMode ? '#0f172a' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a' }} />
                  <small style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '12px', marginTop: '6px', display: 'block' }}>O sistema dividirá este valor proporcionalmente entre as {selecionadosLote.length} pessoas.</small>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: darkMode ? '#cbd5e1' : '#475569' }}>Forma de Pagamento</label>
                  <select value={formaPagamentoLote} onChange={(e) => setFormaPagamentoLote(e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid', borderColor: darkMode ? '#334155' : '#e2e8f0', borderRadius: '12px', fontSize: '16px', outline: 'none', backgroundColor: darkMode ? '#0f172a' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a' }}>
                    <option value="PIX">PIX</option><option value="DINHEIRO">Dinheiro</option><option value="CARTÃO">Cartão</option>
                  </select>
                </div>
                <button type="submit" disabled={carregando} style={{ background: '#10b981', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                  Confirmar Divisão
                </button>
              </form>
            </div>
          </div>
        )}

        {modalOperadoresAberto && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', width: '90%', maxWidth: '400px', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', animation: 'slideUp 0.2s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} color="#0d9488" />
                  <h3 style={{ margin: 0, fontSize: '18px', color: darkMode ? '#f8fafc' : '#0f172a' }}>Equipe de Caixa</h3>
                </div>
                <button onClick={() => setModalOperadoresAberto(false)} style={{ background: darkMode ? '#334155' : '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: darkMode ? '#cbd5e1' : '#64748b' }}><X size={16} /></button>
              </div>
              <form onSubmit={adicionarOperador} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input type="text" value={novoOperador} onChange={(e) => setNovoOperador(e.target.value)} placeholder="Nome do novo operador" style={{ flex: 1, padding: '12px', border: '2px solid', borderColor: darkMode ? '#334155' : '#e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: darkMode ? '#0f172a' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a' }} />
                <button type="submit" style={{ background: '#0d9488', color: 'white', border: 'none', padding: '0 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Plus size={20} /></button>
              </form>
              <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {listaOperadores.map(op => (
                  <div key={op} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: darkMode ? '#0f172a' : '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                    <span style={{ fontWeight: '600', color: darkMode ? '#f8fafc' : '#334155' }}>{op}</span>
                    <button onClick={() => removerOperador(op)} style={{ background: darkMode ? '#7f1d1d' : '#fee2e2', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#ef4444' }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {telaAtual === 'HISTORICO' && (
          <HistoricoList termoBuscaHistorico={termoBuscaHistorico} setTermoBuscaHistorico={setTermoBuscaHistorico} filtroTipoHistorico={filtroTipoHistorico} setFiltroTipoHistorico={setFiltroTipoHistorico} filtroDataInicio={filtroDataInicio} setFiltroDataInicio={setFiltroDataInicio} filtroDataFim={filtroDataFim} setFiltroDataFim={setFiltroDataFim} historicoFiltrado={historicoFiltrado} prepararEdicao={prepararEdicao} excluirRegistro={excluirRegistro} />
        )}
        

        {telaAtual === 'NOVO' && (
          <TransactionForm 
          setTelaAtual={setTelaAtual} 
          guardarRegistro={guardarRegistro} 
          tipo={tipo} setTipo={setTipo} 
          categoriaSelecionada={categoriaSelecionada} 
          setCategoriaSelecionada={setCategoriaSelecionada} 
          listaCategoriasAtuais={listaCategoriasAtuais} 
          novaCategoria={novaCategoria} 
          setNovaCategoria={setNovaCategoria} 
          descricao={descricao} setDescricao={setDescricao} 
          isInscricao={isInscricao} valorTotal={valorTotal} 
          setValorTotal={setValorTotal} valorPago={valorPago} 
          setValorPago={setValorPago} saldoDevedor={saldoDevedor} 
          formaPagamento={formaPagamento} setFormaPagamento={setFormaPagamento} 
          carregando={carregando} 
          observacao={observacao} 
          setObservacao={setObservacao} />
        )}
        
      </div>
    </div>
  );
}
