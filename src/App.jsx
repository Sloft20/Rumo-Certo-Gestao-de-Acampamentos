import { useState, useEffect, useMemo } from 'react';
import { Wallet, RefreshCw, User, Users, Download, Eye, EyeOff, ShieldAlert, Settings, Plus, Trash2, X, ChevronDown, AlertCircle, Moon, Sun, Paperclip } from 'lucide-react';
import './App.css';
import { supabase } from './supabaseClient';
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

export default function App() {
  const [telaAtual, setTelaAtual] = useState('LISTA'); 
  const [carregando, setCarregando] = useState(false);
  const [mensagemCarregando, setMensagemCarregando] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [filaOffline, setFilaOffline] = useState([]);
  const [edicaoAtiva, setEdicaoAtiva] = useState(() => localStorage.getItem('edicao_ativa') || '2027');
  const [listaEdicoes, setListaEdicoes] = useState(() => {
    const salvos = localStorage.getItem('lista_edicoes');
    return salvos ? JSON.parse(salvos) : ['2026', '2027', '2028'];
  });
  const [operadorCaixa, setOperadorCaixa] = useState(localStorage.getItem('operador_caixa') || '');
  const [dropdownOperadorAberto, setDropdownOperadorAberto] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS');
  const [observacao, setObservacao] = useState('');
  const [arquivoAnexo, setArquivoAnexo] = useState(null);
  const [idParaExcluir, setIdParaExcluir] = useState(null);

  

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
  const [arquivoAnexoPagamento, setArquivoAnexoPagamento] = useState(null);
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
    SAIDA: ['Chácara', 'Alimentação', 'Bebidas', 'Brindes', 'Produtos de Limpeza', 'Auxílio Van', 'Retirada']
  };

  const listaCategoriasAtuais = [...categoriasPadrao[tipo], ...categoriasExtras[tipo]];
  const isInscricao = tipo === 'ENTRADA' && (categoriaSelecionada === 'Inscrição' || categoriaSelecionada === 'Diária');
  const saldoDevedor = (parseFloat(valorTotal || 0) - parseFloat(valorPago || 0)).toFixed(2);

  const [modoPrivacidade, setModoPrivacidade] = useState(false);
  const [mostrarApenasDevedores, setMostrarApenasDevedores] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('tema_rumo_certo', 'escuro');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('tema_rumo_certo', 'claro');
    }
  }, [darkMode]);

  useEffect(() => {
    const radarSupabase = supabase.channel('mudancas-banco')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transacoes' },
        (payload) => {
          console.log('🔄 Sincronizando tela viva em segundo plano!', payload);
          carregarDados(true); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(radarSupabase);
    };
  }, []);

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

  const carregarDados = async (silencioso = false) => {
    if (!silencioso) {
      console.log("🔎 Iniciando busca manual no Supabase...");
      setMensagemCarregando('Atualizando dados...'); 
      setCarregando(true);
    }
    
    try {
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .order('data_transacao', { ascending: false })
        .order('hora_transacao', { ascending: false });

      if (error) throw error;

      const dadosFormatados = data.map(item => ({
        'ID': item.id,
        'Edição': item.edicao || '2027',
        'Tipo': item.tipo,
        'Descrição': item.descricao,
        'Categoria': item.categoria,
        'Valor Total': item.valor_total,
        'Valor Pago': item.valor_pago,
        'Forma de Pagamento': item.forma_pagamento,
        'Operador': item.operador,
        'Observação': item.observacao,
        'Data': item.data_transacao,
        'Hora': item.hora_transacao,
        'foi_editado': item.foi_editado,
        'anexo_url': item.anexo_url
      }));

      setDadosPlanilha(dadosFormatados); 
      
    } catch (error) {
      console.error("🚨 ERRO ao buscar dados:", error);
      if (!silencioso) toast.error("Erro ao conectar com o banco de dados.");
    } finally {
      if (!silencioso) {
        setCarregando(false);
        setMensagemCarregando(''); 
      }
    }
  };

  const dadosDaEdicao = useMemo(() => {
    const filaFormatada = filaOffline.map((item, index) => ({
      'ID': `offline-${index}`,
      'Edição': item.edicao || '2027',
      'Tipo': item.tipo,
      'Descrição': item.descricao,
      'Categoria': item.categoria,
      'Valor Total': item.valor_total,
      'Valor Pago': item.valor_pago,
      'Forma de Pagamento': item.forma_pagamento,
      'Operador': item.operador,
      'Observação': item.observacao,
      'Data': item.data_transacao,
      'Hora': item.hora_transacao,
      'foi_editado': false,
      'anexo_url': null,
      'is_offline': true 
    }));

    const todosOsDados = [...dadosPlanilha, ...filaFormatada];

    return todosOsDados.filter(d => String(obterColuna(d, 'Edição')) === String(edicaoAtiva));
  }, [dadosPlanilha, filaOffline, edicaoAtiva]);

  const { totalReceitas, totalDespesas, saldoCaixa, receitasPix, receitasDinheiro } = useMemo(() => {
    let pix = 0; let dinheiro = 0;
    
    const receitas = dadosDaEdicao.filter(d => obterColuna(d, 'Tipo') === 'ENTRADA').reduce((acc, curr) => {
        const valor = extrairNumero(obterColuna(curr, 'Valor Pago'));
        const forma = (obterColuna(curr, 'Forma de Pagamento') || '').toUpperCase();
        if (forma.includes('PIX')) pix += valor;
        if (forma.includes('DINHEIRO')) dinheiro += valor;
        return acc + valor;
    }, 0);

    const despesas = dadosDaEdicao
      .filter(d => obterColuna(d, 'Tipo') === 'SAIDA' && !['Retirada', 'Lucro'].includes(obterColuna(d, 'Categoria')))
      .reduce((acc, curr) => acc + extrairNumero(obterColuna(curr, 'Valor Pago')), 0);

    const todasSaidas = dadosDaEdicao
      .filter(d => obterColuna(d, 'Tipo') === 'SAIDA')
      .reduce((acc, curr) => acc + extrairNumero(obterColuna(curr, 'Valor Pago')), 0);

    return { totalReceitas: receitas, totalDespesas: despesas, saldoCaixa: receitas - todasSaidas, receitasPix: pix, receitasDinheiro: dinheiro };
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
    return dadosDaEdicao.filter(item => {
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
    }).sort((a, b) => {
      const dataA = String(obterColuna(a, 'Data') || '').split('T')[0];
      const horaA = obterColuna(a, 'Hora') || '00:00:00';
      
      const dataB = String(obterColuna(b, 'Data') || '').split('T')[0];
      const horaB = obterColuna(b, 'Hora') || '00:00:00';

      const carimboA = new Date(`${dataA}T${horaA}`).getTime();
      const carimboB = new Date(`${dataB}T${horaB}`).getTime();

      if (isNaN(carimboA)) return 1;
      if (isNaN(carimboB)) return -1;
      
      return carimboB - carimboA;
    });
  }, [dadosDaEdicao, termoBuscaHistorico, filtroTipoHistorico, filtroDataInicio, filtroDataFim]);

  const abrirNovoRegistro = () => {
    setIdEmEdicao(null); setDataEmEdicao(null); setDescricao(''); setValorTotal(''); setValorPago(''); setObservacao('');
    setTelaAtual('NOVO');
  };

  const prepararEdicao = (item) => {
    let dataCorrigida = obterColuna(item, 'Data');
    if (dataCorrigida && String(dataCorrigida).includes('T')) {
      const [ano, mes, dia] = String(dataCorrigida).split('T')[0].split('-');
      dataCorrigida = `${dia}/${mes}/${ano}`;
    }

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
  
  const sincronizarFila = async () => {
    if (isOffline || filaOffline.length === 0) return;
    setMensagemCarregando('A sincronizar dados offline...'); 
    setCarregando(true);
    
    try {
      const { error } = await supabase.from('transacoes').insert(filaOffline);
      if (error) throw error;
      
      setFilaOffline([]); 
      await localforage.removeItem('fila_acampamento');
      toast.success('Todos os registos offline foram sincronizados!');
      carregarDados();
    } catch (e) {
      console.error("Erro na sincronização:", e);
      toast.error('Não foi possível sincronizar alguns registos.');
    } finally {
      setCarregando(false);
    }
  };

  const enviarPagamentoLote = async (e) => {
    e.preventDefault();
    if (!valorLote || isNaN(valorLote) || Number(valorLote) <= 0) { 
      toast.error('Insira um valor válido'); 
      return; 
    }

    const totalDevedor = selecionadosLote.reduce((acc, curr) => acc + curr['Saldo Devedor'], 0);
    const valorRecebido = parseFloat(valorLote);
    
    const agora = new Date();
    const dataLocal = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    const horaLocal = agora.toTimeString().split(' ')[0];

    const novasTransacoes = [];

    for (let acampante of selecionadosLote) {
      if (acampante['Saldo Devedor'] <= 0) continue; 
      
      const proporcao = acampante['Saldo Devedor'] / totalDevedor;
      const valorAAbater = valorRecebido * proporcao;

      novasTransacoes.push({
        tipo: 'ENTRADA',
        descricao: acampante.Descrição,
        categoria: 'Pagamento Adicional',
        valor_total: null,
        valor_pago: parseFloat(valorAAbater.toFixed(2)),
        forma_pagamento: formaPagamentoLote,
        operador: operadorCaixa || 'Não identificado',
        observacao: 'Pagamento em lote familiar.',
        data_transacao: dataLocal,
        hora_transacao: horaLocal,
        edicao: edicaoAtiva
      });
    }

    if (!navigator.onLine) {
      const novaFila = [...filaOffline, ...novasTransacoes];
      setFilaOffline(novaFila);
      await localforage.setItem('fila_acampamento', novaFila);
      
      toast.success('Pagamento em lote salvo na fila offline!');
      setModalLoteAberto(false); 
      setModoLote(false); 
      setSelecionadosLote([]); 
      setValorLote('');
      return; 
    }

    setMensagemCarregando('A processar pagamento em lote...'); 
    setCarregando(true);

    try {
      const { error } = await supabase.from('transacoes').insert(novasTransacoes);
      if (error) throw error;

      toast.success('Pagamento em lote processado com sucesso!');
      setModalLoteAberto(false); 
      setModoLote(false); 
      setSelecionadosLote([]); 
      setValorLote('');
      carregarDados();

    } catch (error) {
      console.error("Erro ao processar lote:", error);
      toast.error('Erro ao guardar o lote no Supabase.');
    } finally {
      setCarregando(false);
    }
  };

  const fazerUploadAnexo = async (arquivo) => {
    if (!arquivo) return null;
    const extensao = arquivo.name.split('.').pop();
    const nomeUnico = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extensao}`;
    
    const { error } = await supabase.storage.from('comprovantes').upload(nomeUnico, arquivo);
    if (error) throw new Error("Falha ao enviar arquivo pro bucket.");

    const { data } = supabase.storage.from('comprovantes').getPublicUrl(nomeUnico);
    return data.publicUrl;
  };

  const guardarRegistro = async (e) => {
    e.preventDefault();
    setMensagemCarregando(idEmEdicao ? 'Atualizando registro...' : 'Salvando lançamento...');
    setCarregando(true);

    const categoriaFinal = categoriaSelecionada === 'OUTRA' ? novaCategoria : categoriaSelecionada;
    const valorPagoNum = parseFloat(String(valorPago).replace(',', '.'));
    const valorTotalNum = valorTotal ? parseFloat(String(valorTotal).replace(',', '.')) : null;

    const agora = new Date();
    const dataLocal = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    const horaLocal = agora.toTimeString().split(' ')[0];

    const payloadLancamento = {
      tipo: tipo,
      descricao: descricao,
      categoria: categoriaFinal,
      valor_total: valorTotalNum,
      valor_pago: valorPagoNum,
      forma_pagamento: formaPagamento,
      operador: operadorCaixa || 'Não identificado', 
      observacao: observacao,
      data_transacao: dataLocal,
      hora_transacao: horaLocal,
      edicao: edicaoAtiva
    };

    if (!navigator.onLine) {
      if (arquivoAnexo) { toast.error("O modo offline não suporta envio de fotos."); setCarregando(false); return; }
      if (idEmEdicao) { toast.error("Você precisa estar online para editar registros antigos."); setCarregando(false); return; }

      const novaFila = [...filaOffline, payloadLancamento];
      setFilaOffline(novaFila);
      await localforage.setItem('fila_acampamento', novaFila);

      setDescricao(''); setValorTotal(''); setValorPago(''); setObservacao(''); setNovaCategoria('');
      setTelaAtual('LISTA');
      setCarregando(false);
      toast.success("Salvo offline! Clique em 'Sincronizar' quando a rede voltar.");
      return;
    }

    try {
      let urlAnexoGerada = null;
      if (arquivoAnexo) {
        setMensagemCarregando('Anexando comprovante...');
        urlAnexoGerada = await fazerUploadAnexo(arquivoAnexo);
      }

      if (idEmEdicao) {
        const payloadEdicao = { ...payloadLancamento, foi_editado: true, updated_at: new Date().toISOString() };
        delete payloadEdicao.data_transacao;
        delete payloadEdicao.hora_transacao;
        if (urlAnexoGerada) payloadEdicao.anexo_url = urlAnexoGerada;

        const { error } = await supabase.from('transacoes').update(payloadEdicao).eq('id', idEmEdicao);
        if (error) throw error;
        toast.success("Registro atualizado com sucesso!");
      } else {
        if (urlAnexoGerada) payloadLancamento.anexo_url = urlAnexoGerada;
        const { error } = await supabase.from('transacoes').insert([payloadLancamento]);
        if (error) throw error;
        toast.success("Lançamento salvo com sucesso!");
      }

      setDescricao(''); setValorTotal(''); setValorPago(''); setObservacao(''); setNovaCategoria(''); setArquivoAnexo(null); setIdEmEdicao(null);
      setTelaAtual('LISTA');
      carregarDados();

    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar lançamento.");
    } finally {
      setCarregando(false);
    }
  };
  
  const enviarNovoPagamento = async (e) => {
    e.preventDefault();
    if (!acampanteSelecionado || !novoPagamento) return;

    const valorNum = parseFloat(String(novoPagamento).replace(',', '.'));
    
    const agora = new Date();
    const dataLocal = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    const horaLocal = agora.toTimeString().split(' ')[0];

    const payloadPagamento = {
      tipo: 'ENTRADA',
      descricao: acampanteSelecionado.Descrição,
      categoria: 'Pagamento Adicional',
      valor_total: null,
      valor_pago: valorNum,
      forma_pagamento: formaPagamentoAdicional,
      operador: operadorCaixa || 'Não identificado',
      observacao: 'Quitação parcial/total de inscrição.',
      data_transacao: dataLocal,
      hora_transacao: horaLocal,
      edicao: edicaoAtiva
    };

    if (!navigator.onLine) {
      if (arquivoAnexoPagamento) {
        toast.error("O envio de comprovantes não é suportado no modo offline.");
        return;
      }
      const novaFila = [...filaOffline, payloadPagamento];
      setFilaOffline(novaFila);
      await localforage.setItem('fila_acampamento', novaFila);
      
      toast.success('Pagamento rápido salvo na fila offline!');
      setAcampanteSelecionado(null); 
      setNovoPagamento(''); 
      setArquivoAnexoPagamento(null);
      return; 
    }

    setMensagemCarregando('Registrando pagamento...'); 
    setCarregando(true);

    try {
      let urlAnexoGerada = null;
      if (arquivoAnexoPagamento) {
        setMensagemCarregando('Anexando comprovante...');
        urlAnexoGerada = await fazerUploadAnexo(arquivoAnexoPagamento);
        payloadPagamento.anexo_url = urlAnexoGerada;
      }

      const { error } = await supabase.from('transacoes').insert([payloadPagamento]);
      if (error) throw error;

      setAcampanteSelecionado(null); 
      setNovoPagamento(''); 
      setArquivoAnexoPagamento(null); 
      carregarDados(); 
      toast.success('Pagamento recebido!');

    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toast.error('Erro ao salvar no Supabase.');
    } finally {
      setCarregando(false);
    }
  };

  const excluirRegistro = (id) => {
    if (!id) { 
      toast.error("Este registro não possui ID."); 
      return; 
    }
    if (String(id).startsWith('offline-')) {
      toast.error("Sincronize os dados primeiro para poder excluir este registro.");
      return;
    }
    if (!navigator.onLine) { 
      toast.error("Você precisa estar online para excluir."); 
      return; 
    }
    setIdParaExcluir(id); 
  };

  const confirmarExclusao = async () => {
    if (!idParaExcluir) return;
    
    setMensagemCarregando('A excluir registo...');
    setCarregando(true);
    
    try {
      const { error } = await supabase.from('transacoes').delete().eq('id', idParaExcluir);
      if (error) throw error;

      toast.success("Registo excluído com sucesso!");
      setIdParaExcluir(null); 
      carregarDados(); 

    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir no banco de dados.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: darkMode ? '#0f172a' : '#f8fafc', transition: '0.3s' }}>
      
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

      {carregando && mensagemCarregando !== 'Atualizando dados...' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex flex-col justify-center items-center">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl flex flex-col items-center gap-4 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <RefreshCw size={36} className="text-teal-500 animate-spin" />
            <p className="text-slate-700 dark:text-slate-200 font-bold text-lg">{mensagemCarregando || 'A processar...'}</p>
          </div>
        </div>
      )}

      {!acampanteSelecionado && (
        <BottomNav telaAtual={telaAtual} setTelaAtual={(tela) => tela === 'NOVO' ? abrirNovoRegistro() : setTelaAtual(tela)} />
      )}

      <div className="container-aplicacao" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        <Toaster 
          position="top-center" 
          reverseOrder={false} 
          toastOptions={{
            style: {
              background: darkMode ? '#1e293b' : '#ffffff',
              color: darkMode ? '#f8fafc' : '#0f172a',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            },
            success: { iconTheme: { primary: '#10b981', secondary: darkMode ? '#1e293b' : 'white' } },
            error: { iconTheme: { primary: '#ef4444', secondary: darkMode ? '#1e293b' : 'white' } },
          }} 
        />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', width: '100%', marginBottom: '40px' }}>
            
            {/* 1. CAIXA DO OPERADOR */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              
              {/* Botão Principal com o texto discreto da Edição */}
              <div onClick={() => setDropdownOperadorAberto(!dropdownOperadorAberto)} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: darkMode ? '#1e293b' : '#ffffff', padding: '6px 12px', borderRadius: '14px', cursor: 'pointer', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <User size={18} color={operadorCaixa ? '#0d9488' : '#ef4444'} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ color: operadorCaixa ? (darkMode ? '#f8fafc' : '#0f172a') : '#ef4444', fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap', lineHeight: '1.2' }}>
                    {operadorCaixa ? operadorCaixa : 'Caixa Indefinido'}
                  </span>
                  <span style={{ fontSize: '10px', color: darkMode ? '#64748b' : '#94a3b8', fontWeight: '700', lineHeight: '1' }}>
                    Edição {edicaoAtiva}
                  </span>
                </div>
                <ChevronDown size={14} color="#94a3b8" style={{ transform: dropdownOperadorAberto ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s', marginLeft: '2px' }} />
              </div>

              {/* Dropdown do Operador */}
              {dropdownOperadorAberto && (
                <>
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 40 }} onClick={() => setDropdownOperadorAberto(false)} />
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '220px', backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, zIndex: 50, padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', animation: 'slideUp 0.15s ease-out' }}>
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
                    
                    <div onClick={() => { setDropdownOperadorAberto(false); setModalOperadoresAberto(true); }} style={{ padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: darkMode ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Settings size={16} /> Gerenciar Equipe
                    </div>

                    <div style={{ height: '1px', background: darkMode ? '#334155' : '#f1f5f9', margin: '4px 0' }}></div>
                    
                    {/* NOVO: SELETOR DE EDIÇÃO */}
                    <div style={{ padding: '8px 8px 4px 8px' }}>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: darkMode ? '#64748b' : '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                        Edição Ativa
                      </label>
                      <select 
                        value={edicaoAtiva}
                        onChange={(e) => {
                          if (e.target.value === 'NOVA') {
                            const nova = window.prompt('Qual o ano da nova edição? (ex: 2029)');
                            if (nova && nova.trim() !== '') {
                              const limpa = nova.trim();
                              if (!listaEdicoes.includes(limpa)) {
                                const atualizada = [...listaEdicoes, limpa].sort();
                                setListaEdicoes(atualizada);
                                localStorage.setItem('lista_edicoes', JSON.stringify(atualizada));
                              }
                              setEdicaoAtiva(limpa);
                              localStorage.setItem('edicao_ativa', limpa);
                            }
                          } else {
                            setEdicaoAtiva(e.target.value);
                            localStorage.setItem('edicao_ativa', e.target.value);
                          }
                          setDropdownOperadorAberto(false);
                        }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', backgroundColor: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#f8fafc' : '#0f172a', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, outline: 'none', cursor: 'pointer' }}
                      >
                        {listaEdicoes.map(ed => (
                          <option key={ed} value={ed}>{ed}</option>
                        ))}
                        <option value="NOVA">+ Adicionar nova...</option>
                      </select>
                    </div>

                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
              
              <button onClick={() => setDarkMode(!darkMode)} title="Alternar Tema" style={{ background: darkMode ? '#1e293b' : '#ffffff', border: '1px solid', borderColor: darkMode ? '#334155' : '#e2e8f0', borderRadius: '14px', padding: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: darkMode ? '#cbd5e1' : '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: '0.2s' }}>
                {darkMode ? <Sun size={18} /> : <Moon size={18} />} 
                <span className="hidden sm:inline">{darkMode ? 'Claro' : 'Escuro'}</span>
              </button>
              
              <button onClick={() => setModoPrivacidade(!modoPrivacidade)} title="Modo Privacidade" style={{ background: darkMode ? '#1e293b' : '#ffffff', border: '1px solid', borderColor: darkMode ? '#334155' : '#e2e8f0', borderRadius: '14px', padding: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: darkMode ? '#cbd5e1' : '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: '0.2s' }}>
                {modoPrivacidade ? <EyeOff size={18} /> : <Eye size={18} />} 
                <span className="hidden sm:inline">{modoPrivacidade ? 'Mostrar' : 'Ocultar'}</span>
              </button>

              <button onClick={baixarBalancete} title="Baixar Balancete PDF" style={{ background: darkMode ? '#1e3a8a' : '#eff6ff', border: 'none', borderRadius: '14px', padding: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: darkMode ? '#60a5fa' : '#2563eb', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: '0.2s' }}>
                <Download size={18} /> 
                <span className="hidden sm:inline">Balancete</span>
              </button>
              
              <button onClick={carregarDados} title="Atualizar Dados" style={{ background: darkMode ? '#134e4a' : '#f0fdfa', border: 'none', borderRadius: '14px', padding: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: darkMode ? '#2dd4bf' : '#0d9488', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: '0.2s' }}>
                <RefreshCw size={18} /> 
                <span className="hidden sm:inline">Atualizar</span>
              </button>

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
            <DashboardOverview 
              carregando={carregando && mensagemCarregando === 'Atualizando dados...'} 
              saldoCaixa={saldoCaixa} totalReceitas={totalReceitas} totalDespesas={totalDespesas} receitasPix={receitasPix} receitasDinheiro={receitasDinheiro} modoPrivacidade={modoPrivacidade} 
            />
            <AcampanteList 
              carregando={carregando && mensagemCarregando === 'Atualizando dados...'} 
              termoBusca={termoBusca} setTermoBusca={setTermoBusca} acampantesFiltrados={acampantesFiltrados} setAcampanteSelecionado={setAcampanteSelecionado} mostrarApenasDevedores={mostrarApenasDevedores} setMostrarApenasDevedores={setMostrarApenasDevedores} modoLote={modoLote} setModoLote={setModoLote} selecionadosLote={selecionadosLote} setSelecionadosLote={setSelecionadosLote} setModalLoteAberto={setModalLoteAberto} filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria} 
            />
            <PaymentModal 
              acampanteSelecionado={acampanteSelecionado} 
              setAcampanteSelecionado={setAcampanteSelecionado} 
              enviarNovoPagamento={enviarNovoPagamento} 
              novoPagamento={novoPagamento} 
              setNovoPagamento={setNovoPagamento} 
              formaPagamentoAdicional={formaPagamentoAdicional} 
              setFormaPagamentoAdicional={setFormaPagamentoAdicional}
              arquivoAnexoPagamento={arquivoAnexoPagamento}
              setArquivoAnexoPagamento={setArquivoAnexoPagamento}
            />
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
          <HistoricoList 
            carregando={carregando && mensagemCarregando === 'Atualizando dados...'}
            termoBuscaHistorico={termoBuscaHistorico} 
            setTermoBuscaHistorico={setTermoBuscaHistorico} 
            filtroTipoHistorico={filtroTipoHistorico} 
            setFiltroTipoHistorico={setFiltroTipoHistorico} 
            filtroDataInicio={filtroDataInicio} 
            setFiltroDataInicio={setFiltroDataInicio} 
            filtroDataFim={filtroDataFim} 
            setFiltroDataFim={setFiltroDataFim} 
            historicoFiltrado={historicoFiltrado} 
            prepararEdicao={prepararEdicao} 
            excluirRegistro={excluirRegistro} 
          />
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
          setObservacao={setObservacao} 
          arquivoAnexo={arquivoAnexo}
          setArquivoAnexo={setArquivoAnexo}
          />
        )}

        {/* MODAL DE EXCLUSÃO CUSTOMIZADO */}
        {idParaExcluir && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white" style={{ width: '90%', maxWidth: '350px', borderRadius: '24px', padding: '24px', animation: 'slideUp 0.2s ease-out', textAlign: 'center', backgroundColor: darkMode ? '#1e293b' : '#ffffff', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
              <div style={{ backgroundColor: '#fee2e2', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Trash2 size={28} color="#ef4444" />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: darkMode ? '#f8fafc' : '#0f172a' }}>Excluir Registro?</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: darkMode ? '#94a3b8' : '#64748b' }}>Esta ação não pode ser desfeita. O valor será removido do balanço geral.</p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setIdParaExcluir(null)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? '#cbd5e1' : '#475569', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: '0.2s' }}>
                  Cancelar
                </button>
                <button onClick={confirmarExclusao} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#ffffff', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}