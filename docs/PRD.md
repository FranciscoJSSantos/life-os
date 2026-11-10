# LifeOS — PRD (Product Requirements Document)

**Versão:** 1.0  
**Status:** Aprovado  
**Tipo:** Aplicação Pessoal / Local-first / PWA  
**Referência Funcional:** HabitNow  
**Idioma:** Português (pt-BR)

---

## 1. Visão Geral do Produto

O **LifeOS** é um sistema pessoal de gerenciamento de hábitos, rotinas diárias, tarefas e metas, desenvolvido como clone adaptável e expansível do aplicativo mobile **HabitNow**. 

Ele é projetado com foco em:
1. **Local-first & Privacidade:** Dados armazenados exclusivamente na máquina local (banco SQLite), sem necessidade de autenticação obrigatória ou dependência de nuvem.
2. **PWA (Progressive Web App):** Acesso desktop e mobile (via rede local), instalável com suporte offline e service workers.
3. **Usabilidade HabitNow:** Interface com tema escuro padrão, cards intuitivos, marcação diária com 1 clique e feedback visual dinâmico.
4. **Precisão de Métricas:** Distinção estrita entre dias não programados e dias de falha, garantindo que o cálculo de consistência e sequências (*streaks*) seja 100% justo.

---

## 2. Módulos do Sistema

### 2.1 Dashboard & Hoje (Visão Diária)
- Saudação dinâmica com data formatada.
- Barra de progresso diário consolidado (hábitos + tarefas).
- Lista de hábitos programados para o dia atual com conclusão rápida em 1 toque.
- Lista de tarefas pendentes do dia e próximas atividades programadas.
- Resumo visual da semana e sequência de dias consistentes.
- Botão de ação rápida (`+`) global para criação ágil de hábitos, tarefas, metas e rotinas.

### 2.2 Gerenciamento de Hábitos
- **Tipos de Hábitos:**
  - *Booleano (Sim/Não):* Ex.: Ler, Meditar.
  - *Quantitativo:* Ex.: Beber 2500 ml de água (com suporte a múltiplos incrementos no mesmo dia).
  - *Duração/Tempo:* Ex.: Estudar 60 minutos (com cronômetro/registro de blocos).
  - *Frequência Semanal/Mensal:* Ex.: Ir à academia 4 vezes por semana.
- **Configuração de Recorrência:**
  - Todos os dias.
  - Dias específicos da semana (ex.: seg, qua, sex).
  - Intervalos personalizados (ex.: a cada 3 dias).
  - Dias específicos do mês.
- **Histórico & Imutabilidade Passada:**
  - Registros anteriores não são alterados retroativamente caso o hábito mude de frequência.
  - Hábitos arquivados mantêm o histórico intacto.
  - Permite correção retroativa de registros passados.

### 2.3 Tarefas e Subtarefas
- Atividades pontuais ou recorrentes independentes de hábitos.
- Níveis de prioridade: Baixa, Média, Alta, Urgente.
- Data de vencimento, horário agendado e subtarefas ordenáveis.
- Status: Pendente, Em Andamento, Concluída, Cancelada, Atrasada.

### 2.4 Rotinas por Período
- Agrupamento sequencial de hábitos e tarefas por bloco do dia:
  - Rotina Matinal.
  - Rotina de Trabalho / Foco.
  - Rotina Noturna.
- Duração estimada e horários de início sugeridos.

### 2.5 Calendário Unificado
- Visão Diária, Semanal e Mensal.
- Exibição de hábitos programados, tarefas com prazo e histórico de conclusões.

### 2.6 Metas e Objetivos
- Objetivos de curto, médio e longo prazo (ex.: ler 15 livros no ano).
- Vínculo direto a hábitos (ex.: cada sessão de leitura contribui para a meta).
- Indicador percentual de evolução e marcos intermediários.

### 2.7 Estatísticas e Análises
- Taxa de conclusão diária, semanal e mensal.
- Calendário de Calor (*Heatmap* estilo GitHub) para cada hábito.
- Contagem justa de sequências (*streaks*).
- Análise de hábitos mais e menos consistentes.

### 2.8 Configurações, Backup e Restauração
- Alternância de temas (Dark mode padrão / Light mode).
- Exportação completa dos dados em JSON e CSV.
- Importação/Restauração a partir de arquivo de backup.
