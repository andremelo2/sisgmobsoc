# ⚡ Guia Rápido - Firebase em 5 Passos

## 🎯 Objetivo
Conectar o SisMob ao Firebase para armazenar dados em nuvem

---

## 📝 Passo 1: Criar Projeto Firebase (5 minutos)

```
1. Aceda a https://console.firebase.google.com
   ↓
2. Login com conta Google
   ↓
3. "Criar um projeto" → Nome: SisMob
   ↓
4. Aceite os termos e clique "Criar projeto"
   ↓
✅ Projeto criado!
```

---

## 🔐 Passo 2: Ativar Autenticação (3 minutos)

```
1. Menu Esquerdo → Build → Authentication
   ↓
2. "Começar"
   ↓
3. Clique em "Email/Senha"
   ↓
4. Ative o toggle e "Salvar"
   ↓
5. Aba "Usuários" → "Adicionar usuário"
   ↓
6. Crie 2 usuários:
   - admin@sismob.ao / admin123
   - supervisor@sismob.ao / supervisor123
   ↓
✅ Autenticação pronta!
```

---

## 💾 Passo 3: Criar Database (2 minutos)

```
1. Menu Esquerdo → Build → Realtime Database
   ↓
2. "Criar banco de dados"
   ↓
3. Localização: Europe (mais próxima)
   ↓
4. Modo: "Começar no modo de teste"
   ↓
5. "Ativar"
   ↓
✅ Database criado!
```

---

## 🔑 Passo 4: Copiar Credenciais (2 minutos)

```
1. Clique ⚙️ (Engrenagem) no topo
   ↓
2. "Configurações do projeto"
   ↓
3. Aba "Seu app"
   ↓
4. Clique no ícone Web (</>)
   ↓
5. "Registar app" (se não houver)
   ↓
6. Copie o bloco firebaseConfig:
   
   const firebaseConfig = {
     apiKey: "AIzaSyD...",
     authDomain: "sismob-xxxxx.firebaseapp.com",
     databaseURL: "https://sismob-xxxxx.firebaseio.com",
     projectId: "sismob-xxxxx",
     storageBucket: "sismob-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   
   ↓
✅ Credenciais copiadas!
```

---

## 📝 Passo 5: Adicionar ao HTML (2 minutos)

```
1. Abra o arquivo index_firebase.html num editor
   ↓
2. Procure por:
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     ...
   };
   
3. Substitua pelas credenciais que copiou
   ↓
4. Salve o arquivo (Ctrl+S)
   ↓
5. Abra no navegador
   ↓
6. Login: admin@sismob.ao / admin123
   ↓
✅ Sistema funcionando!
```

---

## ⏱️ Tempo Total: ~15 minutos

---

## 🚀 Como Usar

### Primeira Vez
```
1. Aceda a index_firebase.html
2. Login com admin@sismob.ao
3. Explora o dashboard
4. Tenta criar uma ficha
5. Vê os dados no Firebase Console
```

### Adicionar Supervisores
```
1. Login como admin
2. Menu → Utilizadores
3. Cria novos supervisores
4. Assign coordenação e ronda
5. Dá as credenciais ao supervisor
```

### Backup de Dados
```
1. Firebase Console → Realtime Database
2. Clique ⋮ (três pontos)
3. "Exportar JSON"
4. Guarde o arquivo
```

---

## 🆘 Se Não Funcionar

### Erro: "Firebase not configured"
```
→ Verifique se copiou as credenciais corretamente
→ Recarregue a página (F5)
→ Verifique espaçamento no código
```

### Erro: "Failed to load users"
```
→ Vá a Firebase Console
→ Verifique se criou os usuários em Authentication
→ Verifique as Regras do Database
```

### Erro: "PERMISSION_DENIED"
```
→ Firebase Console → Realtime Database → Regras
→ Substitua por:

{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}

→ Clique "Publicar"
```

---

## 📋 Checklist Final

- [ ] Criei projeto no Firebase
- [ ] Ativei autenticação por email
- [ ] Criei database em tempo real
- [ ] Copiei as credenciais
- [ ] Colei as credenciais no HTML
- [ ] Testei login
- [ ] Vi o dashboard carregar
- [ ] Consegui criar dados

✅ Tudo pronto! O SisMob está funcionando com Firebase!

---

## 💡 Dicas

1. **Teste em Incógnito** - Evita cache do navegador
2. **Use F12** - Ver erros na console
3. **Copie Exatamente** - Não adicione espaços extras
4. **Guarde Senhas** - Não perca as credenciais
5. **Backup Semanal** - Exporte dados regularmente

---

## 📞 Links Úteis

- Firebase: https://firebase.google.com
- Documentação: https://firebase.google.com/docs
- Stack Overflow: https://stackoverflow.com/questions/tagged/firebase
- Console Firebase: https://console.firebase.google.com

---

**Pronto para começar? 🚀**

Siga os 5 passos acima e em ~15 minutos terá o SisMob funcionando com Firebase!
