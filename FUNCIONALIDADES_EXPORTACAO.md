# 📊 Guia de Exportação de Gráficos - SisMob

## ✨ Novas Funcionalidades Adicionadas

### 1. **Exportação de Gráficos em PDF**
Cada gráfico agora possui um botão **📄 PDF** que permite:
- Exportar o gráfico em formato PDF de alta qualidade
- Inclui título, data de exportação e visualização clara dos dados
- Perfeito para relatórios formais e prestação de contas

**Como usar:**
1. Navegue para a página com gráficos (Dashboard ou Gráficos)
2. Procure o botão **📄 PDF** no canto superior direito de cada gráfico
3. Clique no botão
4. O PDF será automaticamente baixado

---

### 2. **Exportação de Gráficos em Excel**
Cada gráfico agora possui um botão **📊 Excel** que permite:
- Exportar os dados do gráfico em formato Excel (.xlsx)
- Estrutura organizada com cabeçalhos e dados tabulados
- Possibilidade de editar, analisar e criar novos gráficos nos dados

**Como usar:**
1. Navegue para a página com gráficos (Dashboard ou Gráficos)
2. Procure o botão **📊 Excel** no canto superior direito de cada gráfico
3. Clique no botão
4. O arquivo Excel será automaticamente baixado

---

## 📍 Gráficos com Exportação Disponível

### Na página **Dashboard:**
- ✅ **Pessoas por Local** - Gráfico de barras
- ✅ **Aceitação da Vacina** - Gráfico de rosca (Sim/Não)

### Na página **Gráficos:**
- ✅ **Pessoas por Local de Mobilização** - Gráfico de barras
- ✅ **Evolução Diária de Pessoas Alcançadas** - Gráfico de linha
- ✅ **Aceitação: Sim vs Não** - Gráfico de rosca

---

## 🎯 Casos de Uso

### Para Prestação de Contas
- Exporte em **PDF** para incluir em relatórios oficiais
- Cada gráfico fica bem formatado e profissional
- Inclui automaticamente a data de exportação

### Para Análise Detalhada
- Exporte em **Excel** para fazer análises mais profundas
- Manipule os dados em ferramentas como Excel ou Calc
- Crie gráficos personalizados com seus critérios

### Para Apresentações
- Use PDFs para incluir em PowerPoint ou apresentações
- Qualidade alta para projeção em telas grandes
- Dados sempre atualizados conforme últimas informações

---

## 🔧 Detalhes Técnicos

### Bibliotecas Utilizadas
- **jsPDF**: Geração de arquivos PDF com imagens dos gráficos
- **XLSX**: Exportação de dados em formato Excel
- **Chart.js**: Leitura dos dados dos gráficos

### Formato dos Arquivos Exportados

#### PDF
- Orientação: Paisagem (melhor para gráficos)
- Resolução: Alta qualidade
- Nome: `Grafico_[nome]_[data].pdf`
- Exemplo: `Grafico_pessoas_por_local_2024-05-18.pdf`

#### Excel
- Formato: .xlsx (compatível com Excel 2007+)
- Estrutura: Cabeçalho do gráfico + Data de exportação + Dados
- Nome: `Grafico_[nome]_[data].xlsx`
- Exemplo: `Grafico_pessoas_por_local_2024-05-18.xlsx`

---

## 💡 Dicas Úteis

1. **Organize Seus Arquivos**
   - Os arquivos são salvos com data automática
   - Fácil de organizar e encontrar depois

2. **Qualidade de Impressão**
   - PDFs podem ser impressos diretamente
   - Ótima para documentação física

3. **Compartilhamento**
   - Compartilhe PDFs por email sem perder formatação
   - Compatível com todos os dispositivos e navegadores

4. **Segurança**
   - Os dados são processados localmente (no navegador)
   - Nenhum arquivo é enviado para servidor externo

---

## ⚡ Atalhos de Teclado

| Atalho | Função |
|--------|--------|
| `Ctrl+B` | Mostrar/Esconder Sidebar |
| `Ctrl+N` | Ir para página de Fichas |
| `Ctrl+D` | Ir para Dashboard |
| `Ctrl+T` | Alternar Tema (Claro/Escuro) |
| `?` | Mostrar Atalhos |
| `Esc` | Fechar modais |

---

## 🆘 Resolução de Problemas

### O botão de exportação não funciona
- Verifique se o navegador tem suporte a JavaScript ativado
- Tente atualizar a página (F5)
- Teste em outro navegador (Chrome, Firefox, Safari)

### O PDF sai em branco
- Aguarde alguns segundos e tente novamente
- O gráfico precisa estar totalmente carregado
- Verifique a conectividade de internet

### Arquivo Excel não abre
- Use Excel 2007 ou mais recente
- Tente abrir com LibreOffice Calc como alternativa
- Verifique espaço em disco disponível

---

## 📝 Changelog

**Versão 2.1.0 - Maio 2024**
- ✅ Adicionado suporte à exportação de gráficos em PDF
- ✅ Adicionado suporte à exportação de gráficos em Excel
- ✅ Botões de exportação em todos os gráficos
- ✅ Barra amarela (topbar) visível e com toggle de sidebar
- ✅ Interface melhorada com atalhos de teclado

---

**Desenvolvido para o SisMob - Sistema de Mobilização de Saúde**
