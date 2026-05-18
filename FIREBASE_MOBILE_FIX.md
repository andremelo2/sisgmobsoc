# 📱 Resolver Problema: Firebase Funciona no PC mas Não no Telemóvel

## ❌ O Problema

- ✅ No PC: Carrega dados do Firebase normalmente
- ❌ No Telemóvel: "A ligar..." mas nunca conecta ou dá timeout

---

## 🔧 Solução — Whitelist de Domínios no Firebase

### Passo 1 — Encontrar seu Domínio Público

Se está a testar **localmente** (PC = `http://localhost:3000`, Telemóvel = `http://192.168.x.x:8000`):
- **PC**: `localhost`
- **Telemóvel**: seu IP local (ex: `192.168.1.100`)

Se está em **produção** (ex: `https://sismob.netlify.app`):
- Ambos devem usar: `sismob.netlify.app`

---

### Passo 2 — Adicionar Restrições de API Key no Firebase

1. Vá a **Firebase Console** → seu projecto `simob02`
2. Menu lateral → **⚙️ Configurações do projecto** → **Chaves API**
3. Clique na chave API (`AIzaSyCmZZ5H5UeeFsZJbbo...`)
4. Selecione **Restrições de HTTP referrer**
5. Adicione **ambos** os domínios:
   ```
   localhost
   192.168.1.*
   https://sismob.netlify.app
   ```
   (Atualize o IP conforme necessário)

6. Clique em **Guardar**

---

### Passo 3 — Adicionar Origem CORS (se aplicável)

Se usar um servidor custom:

1. **Firebase Console** → **Firestore** → **Regras**
2. Edite as regras para adicionar CORS header (opcional, mas recomendado):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ℹ️ As regras acima já permitem CORS implicitamente. O problema real é o API Key.

---

## 🌐 Alternativa: Servir via HTTPS (Recomendado)

O problema pode também ser que o telemóvel está num WIFI diferente do PC. Para testar:

### Localmente (sem internet)
```bash
# 1. No PC, ache seu IP:
ipconfig getifaddr en0  # macOS
hostname -I             # Linux
ipconfig                # Windows → procure "IPv4"

# 2. Supondo que seu IP é 192.168.1.100, tente:
# PC:        http://localhost:5500
# Telemóvel: http://192.168.1.100:5500

# 3. Verifique se consegue aceder:
# - PC: abre firefox, coloca "localhost:5500"
# - Telemóvel: abre browser, coloca "192.168.1.100:5500"
```

### Via Netlify (com internet)
```bash
# 1. Faça deploy no Netlify
# 2. Todos (PC e telemóvel) acedem via HTTPS:
#    https://sismob.netlify.app
# 3. Adicione este domínio no Firebase (ver passo 2)
```

---

## 🐛 Debug — Verificar Erros no Telemóvel

1. No telemóvel (Chrome/Firefox):
   - Abra a página
   - Pressione `F12` (ou `Ctrl+Shift+I`)
   - Vá a **Console**
   - Procure mensagens de erro em vermelho

2. Erros comuns:
   - `"Origin is not allowed"` → Falta whitelist
   - `"PERMISSION_DENIED"` → Regras Firestore bloqueando
   - `"ERR_NAME_NOT_RESOLVED"` → Telemóvel não consegue resolver DNS

---

## 📋 Checklist

- [ ] Adicionou seu IP local ou domínio no Firebase Console
- [ ] Testou via `http://192.168.x.x:porta` (telemóvel)
- [ ] Verificou Console do browser para erros
- [ ] As regras do Firestore permitem `allow read, write: if true;`
- [ ] Ambos os dispositivos estão na mesma rede WiFi (se testar localmente)

---

## ⚡ Solução Rápida (Teste Imediato)

Se tudo falhar, tente isto **temporariamente** para diagnosticar:

1. **Firebase Console** → **Firestore** → **Regras**
2. Substitua por:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write;  // ⚠️ SEM restrições — apenas para DEBUG
    }
  }
}
```
3. Clique **Publicar**
4. Teste no telemóvel — se funcionar, o problema é as regras
5. **Depois de confirmar que funciona**, volte às regras seguras acima

---

## 🔒 Para Produção

Quando estiver pronto para produção:

1. Ative **Firebase Authentication**
2. Configure regras por utilizador:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /coordenacoes/{doc} {
      allow read, write: if request.auth != null;
    }
    match /utilizadores/{doc} {
      allow read, write: if request.auth.uid == doc;
    }
  }
}
```
3. Remova o API Key do código público (use variáveis de ambiente)
4. Faça deploy no Netlify/Vercel com HTTPS

