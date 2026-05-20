                    // ══════════════════════════════════
                    // PRESENÇA ONLINE
                    // ══════════════════════════════════
                    // Uses localStorage key "presence" for offline mode,
                    // and Supabase table "presenca" (if it exists) for online mode.
                    // Structure: { userId, nome, tipo, coordId, lastSeen (ISO), isTyping, avatar }

                    let _presenceInterval = null;
                    const PRESENCE_TTL = 90; // seconds before considered offline

                    function presenceKey() { return 'presence'; }

                    function getPresenceStore() {
                      return DB.get(presenceKey()) || {};
                    }

                    function setPresenceStore(store) {
                      DB.set(presenceKey(), store);
                    }

                    function broadcastPresence(isTyping = false) {
                      if (!currentUser) return;
                      const store = getPresenceStore();
                      store[currentUser.id] = {
                        userId: currentUser.id,
                        nome: currentUser.nome,
                        tipo: currentUser.tipo,
                        coordId: currentUser.coordId,
                        lastSeen: new Date().toISOString(),
                        isTyping,
                        avatar: loadAvatar(currentUser.id) || null,
                        tab: document.title
                      };
                      setPresenceStore(store);

                      // Registar presença no Firebase (best-effort, sem await)
                      try {
                        db.collection('presenca').doc(String(currentUser.id)).set({
                          user_id: currentUser.id,
                          nome: currentUser.nome,
                          tipo: currentUser.tipo,
                          coord_id: currentUser.coordId || null,
                          last_seen: store[currentUser.id].lastSeen,
                          is_typing: isTyping,
                          avatar: store[currentUser.id].avatar || null
                        }).catch(() => {});
                      } catch(e) {}
                    }

                    // Apenas o ADMIN faz fetch e vê o painel.
                    // Supervisores só fazem broadcast (registam a sua presença) mas nunca lêem nem exibem.
                    async function fetchPresence() {
                      if (!currentUser || currentUser.tipo !== 'admin') return; // supervisores nunca executam isto
                      // Ler presenças recentes do Firebase
                      try {
                        const cutoff = new Date(Date.now() - PRESENCE_TTL * 1000).toISOString();
                        const snap = await db.collection('presenca').where('last_seen', '>=', cutoff).orderBy('last_seen', 'desc').get();
                        if (!snap.empty) {
                          const store = {};
                          snap.docs.forEach(d => {
                            const x = d.data();
                            store[x.user_id] = { userId: x.user_id, nome: x.nome, tipo: x.tipo, coordId: x.coord_id, lastSeen: x.last_seen, isTyping: x.is_typing, avatar: x.avatar || null };
                          });
                          setPresenceStore(store);
                          renderPresencePanel(store);
                          return;
                        }
                      } catch(e) { /* offline ou índice em falta, continua */ }
                      // Fallback: presença local (mesmo browser)
                      const store = getPresenceStore();
                      renderPresencePanel(store);
                    }

                    function renderPresencePanel(store) {
                      // Segurança extra: nunca renderizar para não-admin
                      if (!currentUser || currentUser.tipo !== 'admin') return;

                      const panel = document.getElementById('presencePanel');
                      const list = document.getElementById('presenceList');
                      const countEl = document.getElementById('presenceCount');
                      if (!panel || !list) return;

                      const now = Date.now();
                      const CUTOFF = PRESENCE_TTL * 1000;
                      const active = Object.values(store).filter(p => {
                        return (now - new Date(p.lastSeen).getTime()) < CUTOFF;
                      }).sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));

                      // Só o admin vê o painel — nunca altera display para supervisores
                      panel.style.display = 'block';
                      countEl.textContent = `${active.length} online`;

                      if (!active.length) {
                        list.innerHTML = '<span class="presence-empty">Nenhum utilizador online de momento</span>';
                        return;
                      }

                      list.innerHTML = active.map(p => {
                        const initials = (p.nome || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
                        const isMe = p.userId == currentUser.id;
                        const ago = Math.floor((now - new Date(p.lastSeen).getTime()) / 1000);
                        const agoText = ago < 10 ? 'agora mesmo' : ago < 60 ? `há ${ago}s` : `há ${Math.floor(ago/60)}m`;
                        const avatarHtml = p.avatar
                          ? `<div class="presence-avatar"><img src="${p.avatar}" alt="${initials}" style="width:28px;height:28px;object-fit:cover;border-radius:50%"></div>`
                          : `<div class="presence-avatar">${initials}</div>`;
                        const typingBadge = p.isTyping ? `<span class="presence-badge typing">✏️ a digitar</span>` : `<span class="presence-badge">online</span>`;
                        const tipoBadge = p.tipo === 'admin'
                          ? `<span style="font-size:9px;color:var(--primary);font-weight:700">Admin</span>`
                          : `<span style="font-size:9px;color:var(--surf-dark);font-weight:700">Supervisor</span>`;
                        return `<div class="presence-user ${p.isTyping ? 'active-typing' : ''}">
                          <span class="presence-dot ${p.isTyping ? 'typing' : ''}"></span>
                          ${avatarHtml}
                          <div>
                            <div style="display:flex;align-items:center;gap:5px">${p.nome}${isMe ? ' <span style="font-size:9px;color:var(--text3)">(eu)</span>' : ''}</div>
                            <div class="presence-meta">${tipoBadge} · ${agoText}</div>
                            ${typingBadge}
                          </div>
                        </div>`;
                      }).join('');
                    }

                    function startPresence() {
                      const isAdmin = currentUser && currentUser.tipo === 'admin';

                      // Todos registam a sua presença (broadcast)
                      broadcastPresence(false);

                      // Só o admin vai buscar e mostrar o painel
                      if (isAdmin) fetchPresence();

                      if (_presenceInterval) clearInterval(_presenceInterval);
                      _presenceInterval = setInterval(() => {
                        broadcastPresence(false);          // todos registam
                        if (isAdmin) fetchPresence();      // só admin lê
                      }, 30000); // a cada 30s

                      // Detectar digitação em campos de formulário
                      let typingTimeout = null;
                      document.addEventListener('input', (e) => {
                        if (!currentUser) return;
                        broadcastPresence(true);
                        clearTimeout(typingTimeout);
                        typingTimeout = setTimeout(() => broadcastPresence(false), 4000);
                      }, { passive: true });
                    }

                    function stopPresence() {
                      if (_presenceInterval) { clearInterval(_presenceInterval); _presenceInterval = null; }
                      if (!currentUser) return;
                      const store = getPresenceStore();
                      delete store[currentUser.id];
                      setPresenceStore(store);
                    }

