# Rumo Certo 🏕️

![AI Assisted](https://img.shields.io/badge/AI_Assisted-Development-0d9488?style=for-the-badge&logo=google-gemini&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)

Sistema completo e responsivo (Mobile-First) desenvolvido para a gestão financeira de acampamentos e eventos. Criado com foco em resiliência offline, auditoria de dados e agilidade na operação de caixa.

## Funcionalidades Principais

* **Dashboard Financeiro Inteligente:** Acompanhamento em tempo real de receitas, despesas, saldo devedor e divisão por forma de pagamento (PIX, Dinheiro, Cartão).
* **Suporte Offline-First:** O sistema não para se a internet cair. Lançamentos feitos sem rede vão para uma fila de sincronização segura (IndexedDB) e são enviados ao banco assim que a conexão retorna.
* **Caixa Expresso:** Interface otimizada (*Bottom Sheet*) para buscar devedores e registrar pagamentos adicionais em poucos cliques.
* **Pagamento Familiar (Lote):** Capacidade de selecionar múltiplos devedores da mesma família e abater o valor proporcionalmente com um único recebimento.
* **Geração de Balancete:** Exportação de relatório completo em PDF, contendo estatísticas de público, metas da edição e fechamento geral de caixa.
* **Gestão Multi-Edições:** Isolamento de dados por ano/edição (ex: 2026, 2027), permitindo consultar históricos passados sem misturar com o caixa atual.
* **UI/UX Avançada:** Suporte nativo a Tema Escuro (Dark Mode) e Modo Privacidade (para ocultar valores sensíveis da tela em locais públicos).

## Automações e Soluções de Engenharia

* **Auditoria Imutável (Database Triggers):** A segurança não depende apenas do frontend. Gatilhos nativos no PostgreSQL interceptam qualquer `INSERT`, `UPDATE` ou `DELETE`, salvando o estado exato dos dados em uma tabela de logs. O sistema permite baixar essa auditoria tratada e formatada em `.csv`.
* **Sincronização Real-time:** Utilização de *WebSockets* (Supabase Channels) para escutar mudanças no banco. Se um operador registrar um pagamento num telemóvel, a tela dos outros operadores atualiza na mesma hora.
* **Compressão Client-Side:** Comprovantes e fotos são automaticamente redimensionados e comprimidos no próprio navegador antes do upload para a nuvem, reduzindo o consumo de banda e economizando até 90% do *Storage* gratuito.

## Tecnologias Utilizadas

* **Frontend:** React, Vite, Tailwind CSS
* **Banco de Dados & Storage:** Supabase (PostgreSQL)
* **Gestão de Estado Offline:** LocalForage
* **Ícones:** Lucide React
* **Processamento de Imagens:** browser-image-compression
* **Hospedagem (CI/CD):** Vercel

## Desenvolvimento Assistido por IA

A arquitetura e o código deste sistema foram construídos utilizando práticas de *AI-Assisted Development* (Desenvolvimento Assistido por IA). Ferramentas de Inteligência Artificial atuaram como *pair-programming* para:
* Refatoração e otimização de lógica no frontend (React).
* Estruturação de *Database Triggers* e políticas de segurança avançadas no PostgreSQL (Supabase).
* Formatação inteligente de dados para exportação (tratamento de JSON para CSV).

