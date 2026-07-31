import React from 'react';
import { ArrowLeft, RefreshCw, AlertCircle, Paperclip, X } from 'lucide-react';
import CustomSelect from './CustomSelect'; 
import CurrencyInput from './CurrencyInput'; // Importação do nosso novo componente!

export default function TransactionForm({
  setTelaAtual, guardarRegistro, tipo, setTipo,
  categoriaSelecionada, setCategoriaSelecionada, listaCategoriasAtuais,
  novaCategoria, setNovaCategoria, descricao, setDescricao,
  isInscricao, valorTotal, setValorTotal, valorPago, setValorPago,
  saldoDevedor, formaPagamento, setFormaPagamento, carregando,
  observacao, setObservacao, arquivoAnexo, setArquivoAnexo
}) {
  const opcoesCategoria = [...listaCategoriasAtuais.map(cat => ({ value: cat, label: cat })), { value: 'OUTRA', label: '+ Nova categoria...' }];
  const opcoesPagamento = [{ value: 'PIX', label: 'Pix' }, { value: 'DINHEIRO', label: 'Dinheiro Físico' }];
  const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all placeholder-slate-400";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="pb-[90px] animate-in fade-in duration-300">
      <button onClick={() => setTelaAtual('LISTA')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold mb-6 transition-colors">
        <ArrowLeft size={20} /> Voltar para o Painel
      </button>
      
      <form onSubmit={guardarRegistro} className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl">
          <button type="button" onClick={() => setTipo('ENTRADA')} className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${tipo === 'ENTRADA' ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>ENTRADA</button>
          <button type="button" onClick={() => setTipo('SAIDA')} className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${tipo === 'SAIDA' ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>SAÍDA</button>
        </div>

        <CustomSelect label="Categoria do Lançamento" value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)} options={opcoesCategoria} />

        {categoriaSelecionada === 'OUTRA' && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-200">
            <label className={labelClass}>Nome da Nova Categoria</label>
            <input type="text" value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} required className={`${inputClass} border-blue-400 dark:border-blue-500/50 focus:ring-blue-500/30`} placeholder="Ex: Doação Especial" />
          </div>
        )}

        <div>
          <label className={labelClass}>{tipo === 'ENTRADA' ? "Nome do Acampante / Doador" : "Fornecedor / Descrição"}</label>
          <input type="text" placeholder="Ex: João da Silva" value={descricao} onChange={e => setDescricao(e.target.value)} required className={inputClass} />
        </div>

        {/* OS CAMPOS DE VALOR AGORA USAM A MÁSCARA AUTOMÁTICA */}
        {isInscricao ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CurrencyInput 
              label="Total Combinado" 
              value={valorTotal} 
              onChange={e => setValorTotal(e.target.value)} 
              required={true} 
              placeholder="Ex: R$ 180,00" 
            />
            <CurrencyInput 
              label="Recebido Agora" 
              value={valorPago} 
              onChange={e => setValorPago(e.target.value)} 
              required={true} 
              placeholder="Ex: R$ 50,00" 
            />
          </div>
        ) : (
          <CurrencyInput 
            label="Valor da Operação" 
            value={valorPago} 
            onChange={e => setValorPago(e.target.value)} 
            required={true} 
            placeholder="Ex: R$ 150,00" 
          />
        )}

        {isInscricao && valorTotal && valorPago && saldoDevedor > 0 && (
           <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold animate-in fade-in duration-300 border border-amber-200 dark:border-amber-500/20">
             <AlertCircle size={20} className="shrink-0" /> Restará uma dívida de R$ {saldoDevedor.toFixed(2).replace('.', ',')}
           </div>
        )}

        <CustomSelect label="Método de Pagamento" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} options={opcoesPagamento} />

        <div>
          <label className={labelClass}>Observações (Opcional)</label>
          <textarea value={observacao} onChange={e => setObservacao(e.target.value)} className={`${inputClass} resize-y min-h-[100px]`} placeholder="Algum detalhe importante? Ex: Faltou entregar a autorização." />
        </div>
        
        <div>
          <label className={labelClass}>Comprovante / Recibo (Opcional)</label>
          {!arquivoAnexo ? (
            <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 transition-colors">
              <Paperclip size={20} className="text-slate-400" />
              <span className="text-sm font-medium">Anexar foto ou PDF</span>
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) { setArquivoAnexo(e.target.files[0]); } }} />
            </label>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-lg"><Paperclip size={16} /></div>
                <span className="text-sm font-medium truncate max-w-[200px]">{arquivoAnexo.name}</span>
              </div>
              <button type="button" onClick={() => setArquivoAnexo(null)} className="p-2 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 rounded-lg transition-colors"><X size={16} /></button>
            </div>
          )}
        </div>
        
        <button disabled={carregando} type="submit" className={`w-full p-4 mt-2 text-base font-bold text-white rounded-xl flex justify-center items-center gap-2 shadow-lg transition-all ${tipo === 'ENTRADA' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'} ${carregando ? 'opacity-70 cursor-not-allowed' : ''}`}>
          {carregando ? <RefreshCw className="animate-spin" /> : (tipo === 'ENTRADA' ? 'CONCLUIR ENTRADA' : 'CONCLUIR SAÍDA')}
        </button>
      </form>
    </div>
  );
}