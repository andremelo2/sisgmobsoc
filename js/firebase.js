    // ══════════════════════════════════════════════════
    // FIREBASE CONFIG
    // ── Substitua pelos valores do seu projecto Firebase ──
    // Aceda a: https://console.firebase.google.com
    // → Projecto → Configurações → Aplicações web → Configuração SDK
    // ══════════════════════════════════════════════════
    const firebaseConfig = {
      apiKey:            "AIzaSyCmZZ5H5UeeFsZJbbo9o4W3O0S-B142kJw",
      authDomain:        "simob02.firebaseapp.com",
      projectId:         "simob02",
      storageBucket:     "simob02.firebasestorage.app",
      messagingSenderId: "590922605903",
      appId:             "1:590922605903:web:aa1b89d2bc9ee08261913a"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Persistência offline integrada do Firebase — resolve o problema de "pausa"
    // ao ficar muito tempo sem entrar. Os dados ficam em cache local e
    // sincronizam automaticamente quando voltar online.
    db.enablePersistence({ synchronizeTabs: true })
      .catch(err => {
        if (err.code === 'failed-precondition') {
          console.warn('Persistência offline: múltiplos tabs abertos — desativada.');
        } else if (err.code === 'unimplemented') {
          console.warn('Persistência offline não suportada neste browser.');
        }
      });

    let SB_ONLINE = false; // mantido para compatibilidade com o resto do código

    // ── Testar ligação ao Firebase ──
    async function testSB() {
      setDbStatus('connecting');
      try {
        // ⚡ OTIMIZADO: timeout de 3s para não bloquear
        const testPromise = db.collection('coordenacoes').limit(1).get();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        await Promise.race([testPromise, timeoutPromise]);
        SB_ONLINE = true;
        setDbStatus('online');
        console.log('✓ Firebase conectado com sucesso');
      } catch (e) {
        SB_ONLINE = false;
        setDbStatus('offline');
        console.warn('⚠ Firebase offline — dados locais activos:', e.message);
        // Não mostrar toast aqui para não bloquear UI
        // showToast('Modo offline — dados locais activos', 'info');
      }
    }

    function setDbStatus(s) {
      const dot = document.getElementById('dbDot'), lbl = document.getElementById('dbLabel');
      dot.className = 'db-dot';
      if (s === 'online')      { dot.classList.add('online');  lbl.textContent = 'Firebase Online'; }
      else if (s === 'offline'){ dot.classList.add('offline'); lbl.textContent = 'Modo Local'; }
      else if (s === 'error')  { dot.classList.add('error');   lbl.textContent = 'Erro BD'; }
      else                     { lbl.textContent = 'A ligar...'; }
    }

                    // ══════════════════════════════════════════════════
                    // CAMADA DE DADOS — FIREBASE FIRESTORE
                    // Colecções: coordenacoes | utilizadores | fichas_mobilizacao | presenca
                    // localStorage é usado apenas como cache e sessão de login.
                    // O Firebase tem persistência offline nativa — os dados
                    // ficam disponíveis mesmo sem internet e sincronizam
                    // automaticamente quando a ligação for restaurada.
                    // ══════════════════════════════════════════════════

                    const DB = {
                      get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null') } catch { return null } },
                      set(k, v) { localStorage.setItem(k, JSON.stringify(v)) }
                    };

                    // Converte um documento Firestore em objecto JS simples
                    function fsDoc(snap) {
                      return { id: snap.id, ...snap.data() };
                    }

                    async function initLocalDB() {
                      // ⚡ OTIMIZADO: Seed inicial com timeout curto
                      if (!SB_ONLINE) return; // Se offline, pula
                      try {
                        const timeoutPromise = new Promise((_, reject) => 
                          setTimeout(() => reject(new Error('Timeout')), 2000)
                        );
                        
                        const cordsSnap = await Promise.race([
                          db.collection('coordenacoes').limit(1).get(),
                          timeoutPromise
                        ]);
                        
                        if (cordsSnap.empty) {
                          const batch = db.batch();
                          ['Coordenação Norte', 'Coordenação Sul', 'Coordenação Centro'].forEach(nome => {
                            batch.set(db.collection('coordenacoes').doc(), { nome, created_at: firebase.firestore.FieldValue.serverTimestamp() });
                          });
                          await batch.commit();
                        }
                        
                        const usersSnap = await Promise.race([
                          db.collection('utilizadores').where('email', '==', 'admin@sismob.ao').limit(1).get(),
                          timeoutPromise
                        ]);
                        
                        if (usersSnap.empty) {
                          await db.collection('utilizadores').add({ nome: 'Administrador', email: 'admin@sismob.ao', senha: 'admin123', tipo: 'admin', coord_id: null, created_at: firebase.firestore.FieldValue.serverTimestamp() });
                          await db.collection('utilizadores').add({ nome: 'João Supervisor', email: 'joao@sismob.ao', senha: 'joao123', tipo: 'supervisor', coord_id: null, created_at: firebase.firestore.FieldValue.serverTimestamp() });
                          await db.collection('utilizadores').add({ nome: 'Maria Silva', email: 'maria@sismob.ao', senha: 'maria123', tipo: 'supervisor', coord_id: null, created_at: firebase.firestore.FieldValue.serverTimestamp() });
                        }
                      } catch(e) {
                        // offline — seed feita quando voltar online
                        console.warn('initLocalDB offline:', e.message);
                        // garantir dados locais mínimos
                        if (!DB.get('coordenacoes')) DB.set('coordenacoes', [
                          { id: '1', nome: 'Coordenação Norte' }, { id: '2', nome: 'Coordenação Sul' }, { id: '3', nome: 'Coordenação Centro' }
                        ]);
                        if (!DB.get('users')) DB.set('users', [
                          { id: '1', nome: 'Administrador', email: 'admin@sismob.ao', senha: 'admin123', tipo: 'admin', coordId: null }
                        ]);
                        if (!DB.get('fichas')) DB.set('fichas', []);
                      }
                    }

                    let _fichas = [], _cords = [], _users = [];

                    async function loadCords() {
                      try {
                        const snap = await db.collection('coordenacoes').orderBy('nome').get();
                        _cords = snap.docs.map(d => ({ id: d.id, nome: d.data().nome, coordenador: d.data().coordenador || '' }));
                        DB.set('coordenacoes', _cords);
                        return _cords;
                      } catch (e) {
                        console.warn('loadCords offline:', e.message);
                        _cords = DB.get('coordenacoes') || [];
                        return _cords;
                      }
                    }

                    async function loadUsers() {
                      try {
                        const snap = await db.collection('utilizadores').orderBy('nome').get();
                        _users = snap.docs.map(d => {
                          const x = d.data();
                          return { id: d.id, nome: x.nome, email: (x.email || '').trim().toLowerCase(), senha: (x.senha || '').trim(), tipo: x.tipo, coordId: x.coord_id || null, ronda: x.ronda || null, contacto: x.contacto || null, activo: x.activo !== false };
                        });
                        DB.set('users', _users);
                        return _users;
                      } catch (e) {
                        console.warn('loadUsers offline:', e.message);
                        _users = (DB.get('users') || []).map(x => ({ ...x, email: (x.email || '').trim().toLowerCase(), senha: (x.senha || '').trim(), ronda: x.ronda || null, contacto: x.contacto || null, activo: x.activo !== false }));
                        return _users;
                      }
                    }

                    async function loadFichas() {
                      try {
                        const snap = await db.collection('fichas_mobilizacao').orderBy('data', 'desc').get();
                        _fichas = snap.docs.map(d => {
                          const x = d.data();
                          return { id: d.id, provincia: x.provincia, municipio: x.municipio, comuna: x.comuna, bairro: x.bairro, data: x.data, mobilizador: x.mobilizador, telefone: x.telefone, coordId: x.coord_id, coordNome: x.coord_nome, userId: x.user_id, tableData: x.table_data, totalLocais: x.total_locais, totalPessoas: x.total_pessoas, sim: x.sim, nao: x.nao, motivo: x.motivo };
                        });
                        DB.set('fichas', _fichas);
                        return _fichas;
                      } catch (e) {
                        console.warn('loadFichas offline:', e.message);
                        _fichas = DB.get('fichas') || [];
                        return _fichas;
                      }
                    }

                    async function persistFicha(f) {
                      try {
                        const payload = { provincia: f.provincia, municipio: f.municipio, comuna: f.comuna, bairro: f.bairro, data: f.data, mobilizador: f.mobilizador, telefone: f.telefone || null, coord_id: f.coordId || null, coord_nome: f.coordNome || null, user_id: f.userId || null, table_data: f.tableData || {}, total_locais: f.totalLocais || 0, total_pessoas: f.totalPessoas || 0, sim: f.sim || 0, nao: f.nao || 0, motivo: f.motivo || null, created_at: firebase.firestore.FieldValue.serverTimestamp() };
                        const ref = await db.collection('fichas_mobilizacao').add(payload);
                        f.id = ref.id;
                        await loadFichas();
                        return true;
                      } catch (e) {
                        console.error('persistFicha:', e);
                        // Guarda localmente se offline (o Firebase sincronizará depois)
                        const arr = DB.get('fichas') || [];
                        f.id = f.id || 'local_' + Date.now();
                        arr.unshift(f);
                        DB.set('fichas', arr);
                        _fichas = arr;
                        return true;
                      }
                    }

                    async function deleteFichaRemote(id) {
                      try {
                        await db.collection('fichas_mobilizacao').doc(String(id)).delete();
                        await loadFichas();
                      } catch (e) {
                        console.error('deleteFichaRemote:', e);
                        _fichas = (_fichas || []).filter(f => f.id !== id);
                        DB.set('fichas', _fichas);
                      }
                    }

                    async function updateFichaRemote(id, fichaAtualizada) {
                      try {
                        const payload = {
                          provincia: fichaAtualizada.provincia, municipio: fichaAtualizada.municipio,
                          comuna: fichaAtualizada.comuna, bairro: fichaAtualizada.bairro,
                          data: fichaAtualizada.data, mobilizador: fichaAtualizada.mobilizador,
                          coord_id: fichaAtualizada.coordId || null, coord_nome: fichaAtualizada.coordNome || null,
                          user_id: fichaAtualizada.userId || null, ronda: fichaAtualizada.ronda || null,
                          table_data: fichaAtualizada.tableData || {},
                          total_locais: fichaAtualizada.totalLocais || 0,
                          total_pessoas: fichaAtualizada.totalPessoas || 0,
                          sim: fichaAtualizada.sim || 0, nao: fichaAtualizada.nao || 0,
                          motivo: fichaAtualizada.motivo || null
                        };
                        await db.collection('fichas_mobilizacao').doc(String(id)).update(payload);
                        return true;
                      } catch (e) {
                        console.error('updateFichaRemote Firebase, usando local:', e);
                        // fallback local
                        try {
                          const arr = DB.get('fichas') || [];
                          const idx = arr.findIndex(f => f.id === id);
                          if (idx >= 0) { arr[idx] = fichaAtualizada; DB.set('fichas', arr); _fichas = arr; }
                          return true;
                        } catch (e2) { console.error('updateFichaRemote local:', e2); return false; }
                      }
                    }

                    async function persistCord(nome, coordenador) {
                      try {
                        const ref = await db.collection('coordenacoes').add({ nome, coordenador: coordenador || '', created_at: firebase.firestore.FieldValue.serverTimestamp() });
                        await loadCords();
                        return ref.id;
                      } catch (e) {
                        console.error('persistCord:', e);
                        const id = 'local_' + Date.now();
                        const arr = DB.get('coordenacoes') || [];
                        arr.push({ id, nome, coordenador: coordenador || '' });
                        DB.set('coordenacoes', arr);
                        _cords = arr;
                        return id;
                      }
                    }

                    async function deleteCordRemote(id) {
                      try {
                        await db.collection('coordenacoes').doc(String(id)).delete();
                        await loadCords();
                      } catch (e) {
                        console.error('deleteCordRemote:', e);
                        _cords = _cords.filter(c => c.id !== id);
                        DB.set('coordenacoes', _cords);
                      }
                    }

                    async function persistUser(u) {
                      // Verificar email duplicado
                      try {
                        const snap = await db.collection('utilizadores').where('email', '==', u.email).limit(1).get();
                        if (!snap.empty) throw new Error('Email já existe');
                      } catch (e) {
                        if (e.message === 'Email já existe') throw e;
                        // offline — verificar localmente
                        if ((_users || []).find(x => x.email === u.email)) throw new Error('Email já existe');
                      }
                      try {
                        const payload = { nome: u.nome, email: u.email, senha: u.senha, tipo: u.tipo, coord_id: u.coordId || null, ronda: u.ronda || null, contacto: u.contacto || null, activo: u.activo !== false, created_at: firebase.firestore.FieldValue.serverTimestamp() };
                        const ref = await db.collection('utilizadores').add(payload);
                        await loadUsers();
                        return ref.id;
                      } catch (e) {
                        console.error('persistUser:', e);
                        const id = 'local_' + Date.now();
                        const arr = DB.get('users') || [];
                        arr.push({ ...u, id });
                        DB.set('users', arr);
                        _users = arr;
                        return id;
                      }
                    }

                    async function deleteUserRemote(id) {
                      try {
                        await db.collection('utilizadores').doc(String(id)).delete();
                        await loadUsers();
                      } catch (e) {
                        console.error('deleteUserRemote:', e);
                        _users = _users.filter(u => u.id !== id);
                        DB.set('users', _users);
                      }
                    }

                    async function updateUserField(userId, fields) {
                      try {
                        // Mapear campos JS para nomes Firestore
                        const fsFields = {};
                        if (fields.nome  !== undefined) fsFields.nome  = fields.nome;
                        if (fields.senha !== undefined) fsFields.senha = fields.senha;
                        if (fields.coord_id !== undefined) fsFields.coord_id = fields.coord_id;
                        if (fields.ronda !== undefined) fsFields.ronda = fields.ronda;
                        if (fields.activo !== undefined) fsFields.activo = fields.activo;
                        await db.collection('utilizadores').doc(String(userId)).update(fsFields);
                        const u = _users.find(x => x.id === userId);
                        if (u) {
                          Object.assign(u, fields);
                          // Sincronizar coordId local quando coord_id é actualizado
                          if (fields.coord_id !== undefined) u.coordId = fields.coord_id;
                        }
                        DB.set('users', _users);
                        return true;
                      } catch (e) {
                        console.error('updateUserField:', e);
                        // Actualiza localmente se offline
                        const u = _users.find(x => x.id === userId);
                        if (u) {
                          Object.assign(u, fields);
                          if (fields.coord_id !== undefined) u.coordId = fields.coord_id;
                        }
                        DB.set('users', _users);
                        return true;
                      }
                    }

                    // AUTH
                    let currentUser = null;

