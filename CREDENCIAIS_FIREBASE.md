# 🔑 Credenciais e Configuração Firebase - SisMob

## 📋 Informações do Seu Firebase

Complete este formulário com as informações do seu projeto Firebase:

### Credenciais do Firebase Config

```javascript
const firebaseConfig = {
  apiKey: "___________________________________",
  authDomain: "___________________________________",
  databaseURL: "___________________________________",
  projectId: "___________________________________",
  storageBucket: "___________________________________",
  messagingSenderId: "___________________________________",
  appId: "___________________________________"
};
```

**Onde encontrar:** Firebase Console → Configurações do Projeto → Seu App → Config

---

## 👤 Credenciais de Acesso

### Administrador
- **Email:** `admin@sismob.ao`
- **Senha:** `___________________`
- **Tipo:** Admin (acesso total)
- **Coordenação:** Global (sem restrições)

### Supervisor 1
- **Email:** `supervisor@sismob.ao`
- **Senha:** `___________________`
- **Tipo:** Supervisor
- **Ronda:** 1, 2 ou 3
- **Coordenação:** (escolher)

### Supervisor 2
- **Email:** `supervisor2@sismob.ao`
- **Senha:** `___________________`
- **Tipo:** Supervisor
- **Ronda:** 1, 2 ou 3
- **Coordenação:** (escolher)

---

## 🏗️ Estrutura de Coordenações

Complete com as coordenações do seu sistema:

| ID | Nome | Coordenador | Contacto |
|----|------|-------------|----------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

---

## 🔗 Links Importantes

- **Firebase Console:** https://console.firebase.google.com
- **Seu Projeto:** https://console.firebase.google.com/project/[PROJECT_ID]
- **Realtime Database:** https://console.firebase.google.com/project/[PROJECT_ID]/database/
- **Authentication:** https://console.firebase.google.com/project/[PROJECT_ID]/authentication/

---

## ✅ Checklist de Configuração

- [ ] Criei conta Google
- [ ] Criei projeto Firebase
- [ ] Ativei Authentication (Email/Senha)
- [ ] Criei usuários no Firebase
- [ ] Criei Realtime Database
- [ ] Importei as regras de segurança
- [ ] Adicionei dados iniciais (coordenações, usuários)
- [ ] Copiei as credenciais do Firebase Config
- [ ] Atualizei o arquivo HTML com as credenciais
- [ ] Testei login com admin@sismob.ao
- [ ] Testei acesso aos dados
- [ ] Verifiquei se a topbar aparece após login

---

## 🧪 Teste Rápido

Para verificar se tudo está funcionando:

1. Abra `index_firebase.html` no navegador
2. Faça login com: `admin@sismob.ao` / `admin123` (ou sua senha)
3. Deverá ver:
   - ✅ Dashboard carregado
   - ✅ Topbar amarela visível
   - ✅ Nome do utilizador no sidebar
   - ✅ Dados da coordenação

Se ver mensagens de erro na console (F12), verifique:
- As credenciais estão corretas?
- O Firebase Config está no arquivo HTML?
- As regras de segurança permitem acesso?

---

## 🚨 Segurança - Senhas Fortes

Use senhas seguras! Exemplo de boa senha:
```
Sismob@2024!Dados#Saude
- Tem letras maiúsculas e minúsculas
- Tem números
- Tem símbolos especiais
- Tem pelo menos 12 caracteres
```

**NÃO use:**
- `admin123` em produção
- Datas de nascimento
- Nomes simples
- Sequências numéricas

---

## 📱 Acesso Móvel

O SisMob funciona em:
- ✅ Computador (Desktop)
- ✅ Tablet
- ✅ Telemóvel (Responsivo)

Para acessar de outro dispositivo:
1. Hospede o arquivo HTML num servidor web
2. Acesse via URL (ex: https://sismob.exemplo.ao)
3. Faça login com as mesmas credenciais

---

## 📊 Guia de Uso Primeiro Acesso

### Como Admin:
1. Login → Acede a tudo
2. Vai para "Utilizadores" → Cria supervisores
3. Vai para "Coordenações" → Cria estrutura
4. Monitora dados em tempo real

### Como Supervisor:
1. Login → Acede apenas sua coordenação
2. Vai para "Ficha" → Registra dados
3. Vê seus gráficos em "Gráficos"
4. Segue as rondas designadas

---

## 🆘 Suporte

Se tiver dúvidas:

1. **Verificar Console (F12)** - Procure mensagens de erro
2. **Ler Documentação Firebase** - Siga o guia completo
3. **Verificar Credenciais** - Copie exatamente do Firebase
4. **Testar com Dados Simples** - Comece do zero se necessário

---

**Data de Criação:** _______________  
**Criado por:** _______________  
**Última Atualização:** _______________  
**Versão do SisMob:** 2.1.0
