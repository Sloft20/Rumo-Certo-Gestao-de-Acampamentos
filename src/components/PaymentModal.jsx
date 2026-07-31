import React from 'react';
import { formatarMoeda } from '../utils/formatters';
import { Paperclip, X } from 'lucide-react';
import CurrencyInput from './CurrencyInput'; // <-- Importação do novo componente

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

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      <form onSubmit={enviarNovoPagamento} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* CABEÇALHO DO MODAL */}
        <div className="p-6 pb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {acampanteSelecionado.Descrição}
          </h3>
          <p className="text-amber-600 dark:text-amber-500 font-bold mb-6">
            Falta: {formatarMoeda(acampanteSelecionado['Saldo Devedor'])}
          </p>

          <div className="space-y-4">
            
            {/* O NOVO CAMPO DE DINHEIRO COM MÁSCARA */}
            <CurrencyInput 
              label="Valor Recebido"
              value={novoPagamento}
              onChange={e => setNovoPagamento(e.target.value)}
              placeholder="Ex: R$ 50,00"
              required={true}
            />
            
            {/* CAMPO: MÉTODO DE PAGAMENTO */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Método de Pagamento
              </label>
              <select 
                value={formaPagamentoAdicional} 
                onChange={e => setFormaPagamentoAdicional(e.target.value)} 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="PIX">Pix</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="CARTÃO">Cartão</option>
              </select>
            </div>

            {/* CAMPO: ANEXO DO COMPROVATIVO */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Comprovativo (Opcional)
              </label>

              {!arquivoAnexoPagamento ? (
                <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 transition-colors">
                  <Paperclip size={20} className="text-slate-400" />
                  <span className="text-sm font-medium">Anexar foto ou PDF</span>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setArquivoAnexoPagamento(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-lg">
                      <Paperclip size={16} />
                    </div>
                    <span className="text-sm font-medium truncate max-w-[180px]">
                      {arquivoAnexoPagamento.name}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setArquivoAnexoPagamento(null)}
                    className="p-2 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RODAPÉ COM BOTÕES */}
        <div className="flex gap-3 p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="button" 
            onClick={() => { setAcampanteSelecionado(null); if(setArquivoAnexoPagamento) setArquivoAnexoPagamento(null); }} 
            className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all"
          >
            Confirmar
          </button>
        </div>
      </form>
    </div>
  );
}