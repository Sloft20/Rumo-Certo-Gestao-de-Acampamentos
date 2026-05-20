// src/utils/formatters.js

export const obterColuna = (linha, nome) => {
  if (!linha) return undefined;
  const chave = Object.keys(linha).find(k => k.trim().toLowerCase() === nome.toLowerCase());
  return chave ? linha[chave] : undefined;
};

export const extrairNumero = (val) => {
  if (val == null || val === '') return 0;
  if (typeof val === 'number') return val;
  const num = parseFloat(String(val).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
  return isNaN(num) ? 0 : num;
};

export const formatarMoeda = (val) => {
  return extrairNumero(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatarData = (dataRaw) => {
  if (!dataRaw) return '--/--/----';
  const data = new Date(dataRaw);
  return isNaN(data.getTime()) ? dataRaw : data.toLocaleDateString('pt-BR');
};