# 🔐 SISMOB — Correções de Autenticação & Login

## ✅ O que foi corrigido?

### Problema Original:
- Ao entrar no link pela primeira vez → Carregava a página de login ✅
- **Mas depois de fazer login uma vez** → Ao clicar no link novamente, **entrava direto na página inicial sem pedir as credenciais** ❌

### Causa:
A função `restoreSession()` estava recuperando automaticamente a sessão salva no `localStorage`, fazendo com que o usuário não precisasse inserir novamente o username e senha.

---

## 🔧 Alterações Feitas:

### 1️⃣ **Desativar Restauração Automática de Sessão**
📍 **Localização:** Função `main()` (linha ~6659)

```javascript
// ❌ ANTES (autoentrava):
async function main() {
  showLoading('A verificar ligação à base de dados...');
  await testSB();
  await initLocalDB();
  hideLoading();
  await restoreSession();  // ← Isto restaurava automaticamente!
}

// ✅ DEPOIS (força login):
async function main() {
  showLoading('A verificar ligação à base de dados...');
  await testSB();
  await initLocalDB();
  hideLoading();
  // ❌ COMENTADO: Não restaurar sessão automaticamente
  // await restoreSession();
  // ✅ FORÇAR LOGIN: Sempre mostrar a página de login
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('appShell').style.display = 'none';
}
```

### 2️⃣ **Melhorar Função de Logout**
📍 **Localização:** Função `doLogout()` (linha ~3538)

```javascript
// ❌ ANTES:
function doLogout() {
  stopPresence();
  currentUser = null; DB.set('session', null);
  const topbar = document.getElementById('fichasTopbar');
  if (topbar) topbar.classList.remove('show');
  document.getElementById('appShell').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
}

// ✅ DEPOIS (mais robusto):
function doLogout() {
  stopPresence();
  currentUser = null; 
  DB.set('session', null); // Limpar sessão salva
  localStorage.removeItem('session'); // Garantir remoção
  const topbar = document.getElementById('fichasTopbar');
  if (topbar) topbar.classList.remove('show');
  document.getElementById('appShell').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  // Limpar campos de login
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginErr').style.display = 'none';
}
```

---

## 🎯 Resultado Final:

### Comportamento NOVO ✅:

**1️⃣ Primeira vez que acessa:**
```
clica no link → carrega página → aparece login → precisa inserir username/senha → acessa a app
```

**2️⃣ Depois de fazer login e navegar:**
```
clica no link novamente → carrega página → aparece login → precisa inserir credentials novamente
```

**3️⃣ Depois de fazer logout:**
```
clica em logout → volta para login → precisa inserir username/senha
clica no link → aparece login → precisa inserir credentials
```

---

## 📋 Como usar o arquivo corrigido:

1. **Backup:** Guarde uma cópia do arquivo original
2. **Substituir:** Use o arquivo `index_firebase_CORRIGIDO.html` no lugar do anterior
3. **Testar:** 
   - Abra o link na browser
   - Faça login
   - Recarregue a página (F5)
   - **ESPERADO:** Volta ao login (tem que inserir credenciais novamente)

---

## 🔍 Resumo das mudanças:

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Primeiro acesso** | Login obrigatório ✅ | Login obrigatório ✅ |
| **Reload depois de login** | Reentra automaticamente ❌ | Volta ao login ✅ |
| **Logout** | Limpa parcialmente | Limpa completamente ✅ |
| **Campos de login** | Mantém valores | Limpa tudo ✅ |

---

## ⚠️ Notas Importantes:

- **Sem efeito nos dados:** As alterações só afetam a autenticação, os dados salvos continuam intactos
- **localStorage limpo:** O arquivo não remove fotos de perfil ou temas escuros salvos (apenas a sessão)
- **Compatibilidade:** Funciona em todos os navegadores modernos

---

## ❓ Dúvidas?

Se precisar voltar ao comportamento anterior, basta descomentar a linha `await restoreSession();` na função `main()`.

**Arquivo corrigido:** `index_firebase_CORRIGIDO.html`

**Data de correção:** $(date)
**Versão:** SisMob 2.0+
