# 🔥 Guia Completo de Configuração do Firebase - SisMob

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Criação do Projeto Firebase](#criação-do-projeto-firebase)
3. [Configurar Authentication](#configurar-authentication)
4. [Configurar Realtime Database](#configurar-realtime-database)
5. [Adicionar Credenciais ao SisMob](#adicionar-credenciais-ao-sismob)
6. [Testar a Conexão](#testar-a-conexão)

---

## ✅ Pré-requisitos

Você precisa de:
- ✅ Conta Google (Gmail)
- ✅ Navegador moderno (Chrome, Firefox, Safari)
- ✅ Arquivo HTML do SisMob (index_firebase.html)

---

## 🚀 Criação do Projeto Firebase

### Passo 1: Acessar Firebase Console

1. Acesse [https://console.firebase.google.com](https://console.firebase.google.com)
2. Faça login com sua conta Google
3. Clique em **"Criar um projeto"**

### Passo 2: Configurar o Projeto

1. **Nome do Projeto:** Digite `SisMob` (ou o nome que preferir)
2. **ID do Projeto:** Será preenchido automaticamente
3. **Aceitar termos:** ✅ Marque as caixas de concordância
4. Clique em **"Criar projeto"**

*Aguarde alguns minutos enquanto o projeto é criado...*

### Passo 3: Acessar o Projeto

1. Quando terminar, clique em **"Continuar"**
2. Você verá o painel do Firebase
3. Anote o **ID do seu projeto** (aparece em vários lugares)

---

## 🔐 Configurar Authentication (Autenticação)

### Passo 1: Ativar Authentication

1. No menu à esquerda, clique em **"Build"** → **"Authentication"**
2. Clique em **"Começar"**
3. Vá para a aba **"Sign-in method"**
4. Ative **"Email/Senha"**:
   - Clique em **"Email/Senha"**
   - Ative o toggle
   - Clique em **"Salvar"**

### Passo 2: Criar Usuários de Teste

1. Vá para a aba **"Usuários"**
2. Clique em **"Adicionar usuário"**

**Crie pelo menos 2 usuários:**

#### Usuário 1 - Administrador:
- **Email:** `admin@sismob.ao`
- **Senha:** `admin123` (ou outra forte)
- Clique em **"Adicionar usuário"**

#### Usuário 2 - Supervisor:
- **Email:** `supervisor@sismob.ao`
- **Senha:** `supervisor123`
- Clique em **"Adicionar usuário"**

---

## 💾 Configurar Realtime Database

### Passo 1: Criar o Database

1. No menu à esquerda, clique em **"Build"** → **"Realtime Database"**
2. Clique em **"Criar banco de dados"**
3. Selecione a **localização** mais próxima (ex: `Europe (europe-west1)`)
4. **Regras de segurança:** Escolha **"Começar no modo de teste"**
5. Clique em **"Ativar"**

### Passo 2: Configurar as Regras de Segurança

1. Clique na aba **"Regras"** no editor do database
2. Substitua o conteúdo pelas regras abaixo:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "users": {
      ".indexOn": ["email", "tipo"]
    },
    "fichas": {
      ".indexOn": ["data", "userId", "mobilizador"]
    },
    "coordenacoes": {
      ".indexOn": ["nome"]
    },
    "mobilizadores": {
      ".indexOn": ["nome", "coordId"]
    },
    "rondas": {
      ".indexOn": ["userId", "data"]
    }
  }
}
```

3. Clique em **"Publicar"**

### Passo 3: Adicionar Dados Iniciais

1. No editor visual do database, clique no ícone **"+"** 
2. Crie a estrutura abaixo:

```
{
  "coordenacoes": {
    "1": {
      "nome": "Coordenação 1",
      "coordenador": "Nome do Coordenador"
    }
  },
  "users": {
    "1": {
      "id": 1,
      "nome": "Administrador",
      "email": "admin@sismob.ao",
      "tipo": "admin",
      "ronda": null,
      "coordId": null,
      "activo": true
    },
    "2": {
      "id": 2,
      "nome": "Supervisor Teste",
      "email": "supervisor@sismob.ao",
      "tipo": "supervisor",
      "ronda": 1,
      "coordId": 1,
      "activo": true
    }
  }
}
```

---

## 🔑 Obter Credenciais do Firebase

### Passo 1: Acessar Configurações do Projeto

1. No Firebase Console, clique no ícone de **engrenagem** (⚙️) no topo
2. Selecione **"Configurações do projeto"**

### Passo 2: Copiar Config do Web

1. Vá para a aba **"Seu app"**
2. Clique em **"Web"** (ícone `</>`
3. Se não tiver um app registado, clique em **"Registar app"**
4. Dê um nome (ex: `SisMob Web`)
5. Marque **"Também configurar Firebase Hosting"** (opcional)
6. Clique em **"Registar app"**

### Passo 3: Copiar o Config

Você verá um bloco de código parecido com:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "sismob-xxxxx.firebaseapp.com",
  databaseURL: "https://sismob-xxxxx.firebaseio.com",
  projectId: "sismob-xxxxx",
  storageBucket: "sismob-xxxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:xxxxxxxxxxxxxxxxxx"
};
```

**Copie todas essas informações!** 📋

---

## 🔧 Adicionar Credenciais ao SisMob

### Passo 1: Abrir o Arquivo HTML

1. Abra o arquivo `index_firebase.html` num editor de texto
   - Use: Visual Studio Code, Notepad++, ou qualquer editor

### Passo 2: Encontrar a Seção Firebase

Procure pela seção que começa com:

```javascript
// ════════════════════════════════════════════════════════════════════════════
// FIREBASE CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════
```

### Passo 3: Substituir as Credenciais

Localize estas linhas:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Substitua pelos dados que copiou do Firebase Console:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "sismob-xxxxx.firebaseapp.com",
  databaseURL: "https://sismob-xxxxx.firebaseio.com",
  projectId: "sismob-xxxxx",
  storageBucket: "sismob-xxxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:xxxxxxxxxxxxxxxxxx"
};
```

### Passo 4: Salvar o Arquivo

1. Pressione **Ctrl+S** (ou Cmd+S no Mac)
2. Confirme a codificação como **UTF-8**
3. Salve com o mesmo nome: `index_firebase.html`

---

## 🧪 Testar a Conexão

### Passo 1: Abrir no Navegador

1. Abra o arquivo `index_firebase.html` no navegador
   - Duplo clique no arquivo, ou
   - Arraste o arquivo para o navegador

### Passo 2: Testar Login

**Credenciais padrão:**
- **Email:** `admin@sismob.ao`
- **Senha:** `admin123`

### Passo 3: Verificar Conexão

Se tudo correr bem:
- ✅ Logo aparece o formulário de login
- ✅ Consegue fazer login com as credenciais
- ✅ Aparece o dashboard principal
- ✅ A topbar amarela fica visível
- ✅ Os dados aparecem no banco de dados

---

## 🐛 Resolução de Problemas

### ❌ Erro: "Firebase not configured"

**Solução:**
- Verifique se as credenciais estão corretas
- Confirme que não há espaços extras nas credenciais
- Recarregue a página (F5)

### ❌ Erro: "Failed to load users"

**Solução:**
- Verifique as regras de segurança do database
- Confirme que criou os usuários no Authentication
- Verifique se o database tem dados estruturados corretamente

### ❌ Erro: "PERMISSION_DENIED"

**Solução:**
- Vá a Firebase Console → Realtime Database → Regras
- Certifique-se que as regras permitem leitura/escrita autenticada
- Publique as regras novamente

### ❌ A página não carrega

**Solução:**
- Abra as Ferramentas de Desenvolvedor (F12)
- Vá para "Console"
- Procure por mensagens de erro vermelho
- Copie a mensagem e procure a solução

---

## 📊 Estrutura de Dados Esperada

### Usuários (users)
```
users/
├── 1/
│   ├── id: 1
│   ├── nome: "Administrador"
│   ├── email: "admin@sismob.ao"
│   ├── tipo: "admin"
│   ├── ronda: null
│   ├── coordId: null
│   └── activo: true
└── 2/
    ├── id: 2
    ├── nome: "Supervisor"
    ├── email: "supervisor@sismob.ao"
    ├── tipo: "supervisor"
    ├── ronda: 1
    ├── coordId: 1
    └── activo: true
```

### Coordenações (coordenacoes)
```
coordenacoes/
├── 1/
│   ├── nome: "Coordenação 1"
│   └── coordenador: "Nome do Coordenador"
└── 2/
    ├── nome: "Coordenação 2"
    └── coordenador: "Outro Coordenador"
```

### Fichas (fichas)
```
fichas/
└── [id_ficha]/
    ├── data: "2024-05-18"
    ├── userId: 2
    ├── mobilizador: "Nome"
    ├── bairro: "Luanda"
    ├── totalPessoas: 150
    ├── totalLocais: 5
    └── ...outros_campos
```

---

## 🔒 Segurança - Checklist

- [ ] Alterou a senha padrão (`admin123`) para outra mais forte
- [ ] Desativou o "modo de teste" em produção
- [ ] Configurou regras de segurança adequadas
- [ ] Habilitou HTTPS (necessário para autenticação)
- [ ] Revise as regras periodicamente
- [ ] Faça backup dos dados regularmente

---

## 🚀 Próximos Passos

Após configurar o Firebase:

1. **Adicione mais usuários** (supervisores, coordenadores)
2. **Configure coordenações** (bairros, distritos)
3. **Importe dados** se tiver registos anteriores
4. **Treine os utilizadores** como usar o sistema
5. **Configure backups** automáticos dos dados

---

## 📞 Suporte

Se tiver problemas:

1. Verifique a [Documentação oficial do Firebase](https://firebase.google.com/docs)
2. Consulte o [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
3. Abra um ticket no [Firebase Support](https://firebase.google.com/support)

---

## 📝 Notas Importantes

### Modo Offline
Se o Firebase não estiver configurado corretamente, o SisMob funciona em **modo offline** com dados locais:
- Email: `admin@sismob.ao`
- Senha: `admin123`

### Custo
Firebase oferece um plano gratuito que inclui:
- ✅ Até 100 conexões simultâneas
- ✅ 1 GB de armazenamento
- ✅ 100 downloads/segundo
- ✅ Ideal para testes e pequenos projetos

### Dados em Tempo Real
Com Realtime Database, todos os utilizadores veem dados atualizados automaticamente!

---

**Última atualização:** Maio 2024  
**Versão:** SisMob 2.1.0
