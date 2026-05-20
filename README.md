# SisMob — Estrutura de Ficheiros

Este projecto foi separado em ficheiros para facilitar manutenção.

## Estrutura

```
sismob/
├── index.html              ← Página principal (HTML apenas, ~1700 linhas)
├── styles.css              ← Todo o CSS / Design System (~1550 linhas)
├── README.md               ← Este ficheiro
└── js/
    ├── lazyloaders.js      ← Carregamento lazy de XLSX e jsPDF
    ├── firebase.js         ← Config Firebase + todas as funções de acesso à BD
    ├── auth.js             ← Login, logout, restaurar sessão
    ├── ui.js               ← Toast, loading, sidebar, tema, busca global, notificações
    ├── presence.js         ← Presença online dos utilizadores (quem está a ver)
    ├── notifications.js    ← Centro de notificações, topbar, alertas, perfis mob, ranking
    ├── ficha.js            ← Formulário de ficha de mobilização (guardar, calcular, reset)
    ├── listFichas.js       ← Lista de fichas, filtros, detalhe, edição, eliminação
    ├── dashboard.js        ← Dashboard, gráficos, insights, ranking, metas, comparação
    ├── consolidado.js      ← Relatório consolidado, RH, exportações Excel/PDF
    ├── usuarios.js         ← Gestão de utilizadores, desempenho, relatório supervisor
    ├── mobilizadores_mgmt.js ← Gestão de mobilizadores, rondas, coordenações, backup
    ├── perfil.js           ← Perfil do utilizador, edição supervisores, export SQL
    └── exports.js          ← Exportação de gráficos (PDF/Excel) e relatórios (Word)
```

## Como servir localmente

```bash
# Python 3
python3 -m http.server 8080

# Node.js (npx)
npx serve .
```

Depois abra: http://localhost:8080

## Nota importante
Os ficheiros JS devem ser carregados **pela ordem** definida no `index.html`,
pois alguns módulos dependem de funções definidos nos anteriores.
