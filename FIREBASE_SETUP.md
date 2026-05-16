# SisMob — Guia de Configuração Firebase

## Porquê Firebase em vez de Supabase?

O Supabase tem um limite de inactividade: projetos no plano gratuito são **pausados automaticamente após 7 dias sem actividade**. O Firebase (Firestore) **não pausa nunca** — os dados ficam sempre disponíveis.

Além disso, o Firebase tem **cache offline nativa**: se perder internet, a aplicação continua a funcionar com os dados guardados localmente e sincroniza tudo automaticamente quando voltar online.

---

## Passo 1 — Criar o Projecto Firebase

1. Aceda a [https://console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **Adicionar projecto**
3. Dê o nome `sismob` (ou o que preferir)
4. Desactive o Google Analytics (opcional)
5. Clique em **Criar projecto**

---

## Passo 2 — Activar o Firestore

1. No menu lateral, clique em **Firestore Database**
2. Clique em **Criar base de dados**
3. Escolha **Modo de produção** (vamos configurar as regras abaixo)
4. Escolha a localização mais próxima (ex: `europe-west1` para Angola)
5. Clique em **Criar**

---

## Passo 3 — Regras de Segurança do Firestore

Vá a **Firestore → Regras** e cole as seguintes regras:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // SisMob gere a sua própria autenticação — acesso livre
    // IMPORTANTE: em produção, migrar para Firebase Auth
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Clique em **Publicar**.

> ⚠️ Estas regras permitem acesso total. Para produção, considere activar o Firebase Authentication e restringir por utilizador autenticado.

---

## Passo 4 — Criar o Índice Composto (para Presença)

A funcionalidade de presença online usa uma query com `where` + `orderBy`. O Firestore exige um índice composto para isso.

1. Vá a **Firestore → Índices → Compostos**
2. Clique em **Adicionar índice**
3. Preencha:
   - **Colecção**: `presenca`
   - **Campo 1**: `last_seen` — Crescente
   - **Estado da query**: `Collection`
4. Clique em **Guardar**

> Alternativamente, quando abrir a aplicação pela primeira vez e clicar no painel de presença, o Firestore mostrará um link no console do browser para criar o índice automaticamente.

---

## Passo 5 — Obter as Credenciais da App

1. No menu lateral, clique no ícone **⚙️ Configurações do projecto**
2. Desça até **As suas apps** → clique em **</>** (Web)
3. Registe a app com o nome `SisMob Web`
4. Copie o objecto `firebaseConfig` que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "sismob-xxxx.firebaseapp.com",
  projectId: "sismob-xxxx",
  storageBucket: "sismob-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## Passo 6 — Configurar o index_firebase.html

Abra o ficheiro `index_firebase.html` num editor de texto e localize a secção (cerca da linha 2275):

```javascript
const firebaseConfig = {
  apiKey:            "COLE_AQUI_apiKey",
  authDomain:        "COLE_AQUI_authDomain",
  projectId:         "COLE_AQUI_projectId",
  storageBucket:     "COLE_AQUI_storageBucket",
  messagingSenderId: "COLE_AQUI_messagingSenderId",
  appId:             "COLE_AQUI_appId"
};
```

Substitua cada `"COLE_AQUI_..."` pelos valores reais obtidos no Passo 5. Guarde o ficheiro.

---

## Passo 7 — Dados Iniciais (Seed Automático)

Na primeira vez que abrir a aplicação com ligação ao Firebase, ela cria automaticamente:

- As 3 coordenações padrão (Norte, Sul, Centro)
- O utilizador administrador (`admin@sismob.ao` / `admin123`)
- Os supervisores de exemplo

> **Altere a senha do admin** após o primeiro login!

---

## Estrutura das Colecções no Firestore

| Colecção | Equivalente SQL |
|---|---|
| `coordenacoes` | tabela `coordenacoes` |
| `utilizadores` | tabela `utilizadores` |
| `fichas_mobilizacao` | tabela `fichas_mobilizacao` |
| `presenca` | tabela `presenca` |

---

## Modo Offline

O Firebase tem **persistência offline activada** nesta versão. Isso significa:

- Se perder internet, a app continua a funcionar
- Os dados novos ficam guardados localmente
- Quando a ligação voltar, tudo sincroniza automaticamente
- **Não há problema em ficar dias sem entrar** — os dados não se perdem

---

## Credenciais Padrão

| Utilizador | Email | Senha |
|---|---|---|
| Administrador | admin@sismob.ao | admin123 |
| João Supervisor | joao@sismob.ao | joao123 |
| Maria Silva | maria@sismob.ao | maria123 |

**Altere estas senhas após o primeiro login!**
