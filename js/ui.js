                    function showToast(msg, type = 'success') { const t = document.getElementById('toast'); t.textContent = msg; t.className = 'toast ' + type + ' show'; setTimeout(() => t.className = 'toast', 3500); }
                    function showLoading(msg = 'A processar...') { document.getElementById('loadingMsg').textContent = msg; document.getElementById('loadingOverlay').classList.add('show'); }
                    function hideLoading() { document.getElementById('loadingOverlay').classList.remove('show'); }
                    function toggleSidebar() { /* definida abaixo com suporte mobile/desktop */ }
                    function closeSidebar() { /* definida abaixo com suporte mobile/desktop */ }

                    // INIT
                    async function main() {
                      showLoading('A inicializar...');
                      // ⚡ OTIMIZADO: Paralelo quando possível
                      await Promise.all([
                        testSB().catch(() => {}),
                        initLocalDB().catch(() => {})
                      ]);
                      hideLoading();
                      // ✅ FORÇAR LOGIN: Sempre mostrar a página de login
                      document.getElementById('loginScreen').style.display = 'flex';
                      document.getElementById('appShell').style.display = 'none';
                    }

                    // ══════════════════════════════════
                    // FOTOGRAFIA DE PERFIL
                    // ══════════════════════════════════
                    function getAvatarKey(userId) { return `avatar_${userId}`; }

                    function loadAvatar(userId) {
                      return DB.get(getAvatarKey(userId)) || null;
                    }

                    function saveAvatarData(userId, dataUrl) {
                      DB.set(getAvatarKey(userId), dataUrl);
                    }

                    function removeAvatarData(userId) {
                      localStorage.removeItem(getAvatarKey(userId));
                    }

                    function applyAvatar(userId, nome) {
                      const photo = loadAvatar(userId);
                      const initials = (nome || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

                      // Sidebar avatar
                      const sa = document.getElementById('sidebarAvatar');
                      if (sa) {
                        if (photo) {
                          sa.innerHTML = `<img src="${photo}" alt="${initials}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
                        } else {
                          sa.innerHTML = initials;
                        }
                      }

                      // Profile page avatar (header)
                      const perfAvatar = document.getElementById('perf-avatar');
                      const perfInitials = document.getElementById('perf-avatar-initials');
                      const perfImg = document.getElementById('perf-avatar-img');
                      if (perfAvatar) {
                        if (photo) {
                          if (perfInitials) perfInitials.style.display = 'none';
                          if (perfImg) { perfImg.src = photo; perfImg.style.display = 'block'; }
                        } else {
                          if (perfInitials) { perfInitials.textContent = initials; perfInitials.style.display = ''; }
                          if (perfImg) perfImg.style.display = 'none';
                        }
                      }

                      // Profile tab preview
                      const ptabInitials = document.getElementById('ptab-avatar-initials');
                      const ptabImg = document.getElementById('ptab-avatar-img');
                      const removeBtn = document.getElementById('removeAvatarBtn');
                      if (ptabInitials && ptabImg) {
                        if (photo) {
                          ptabInitials.style.display = 'none';
                          ptabImg.src = photo; ptabImg.style.display = 'block';
                          if (removeBtn) removeBtn.style.display = '';
                        } else {
                          ptabInitials.textContent = initials; ptabInitials.style.display = '';
                          ptabImg.style.display = 'none';
                          if (removeBtn) removeBtn.style.display = 'none';
                        }
                      }
                    }

                    function handleAvatarUpload(event) {
                      const file = event.target.files[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) { showToast('Imagem demasiado grande. Máx. 2 MB', 'error'); return; }
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        // Resize to max 200x200
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const max = 200;
                          let w = img.width, h = img.height;
                          if (w > max || h > max) {
                            if (w > h) { h = Math.round(h * max / w); w = max; }
                            else { w = Math.round(w * max / h); h = max; }
                          }
                          canvas.width = w; canvas.height = h;
                          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
                          saveAvatarData(currentUser.id, dataUrl);
                          applyAvatar(currentUser.id, currentUser.nome);
                          // Update presence heartbeat immediately
                          broadcastPresence(true);
                          showToast('Foto de perfil actualizada ✓', 'success');
                        };
                        img.src = e.target.result;
                      };
                      reader.readAsDataURL(file);
                      // Reset input so same file can be re-selected
                      event.target.value = '';
                    }

                    function removeAvatar() {
                      if (!confirm('Remover a foto de perfil?')) return;
                      removeAvatarData(currentUser.id);
                      applyAvatar(currentUser.id, currentUser.nome);
                      broadcastPresence(true);
                      showToast('Foto de perfil removida', 'info');
                    }

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

                    // ── MODAL DE CONFIRMAÇÃO DE FICHA GUARDADA ──
                    function showSaveConfirm({ bairro, mobilizador, data, totalPessoas, totalLocais, sim, coordNome, ronda, merged }) {
                      const existingModal = document.getElementById('saveConfirmModal');
                      if (existingModal) existingModal.remove();
                      const dataFmt = data ? new Date(data + 'T00:00:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
                      const titulo  = merged ? 'Dados Somados!' : 'Ficha Guardada!';
                      const icone   = merged ? '🔄' : '✅';
                      const corIcon = merged ? 'rgba(14,165,233,.12)' : 'rgba(46,134,193,.12)';
                      const corBord = merged ? 'rgba(14,165,233,.3)'  : 'rgba(46,134,193,.3)';
                      const subtit  = merged
                        ? `<div style="font-size:11px;background:rgba(14,165,233,.1);color:#0369a1;border-radius:6px;padding:5px 10px;margin-bottom:8px">ℹ️ Já existia ficha de <b>${mobilizador}</b> em ${dataFmt}. Os dados foram <b>somados</b>.</div>`
                        : '';
                      const modal = document.createElement('div');
                      modal.id = 'saveConfirmModal';
                      modal.style.cssText = 'position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);animation:fadeIn .2s ease';
                      modal.innerHTML = `
                        <div style="background:#fff;border-radius:16px;padding:32px;max-width:420px;width:90%;box-shadow:0 20px 40px rgba(0,0,0,.2);text-align:center;position:relative">
                          <div style="width:56px;height:56px;border-radius:50%;background:${corIcon};border:2px solid ${corBord};display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 16px">${icone}</div>
                          <div style="font-size:20px;font-weight:800;color:var(--primary);margin-bottom:4px;letter-spacing:-.3px">${titulo}</div>
                          <div style="font-size:12px;color:var(--text3);margin-bottom:12px">${dataFmt}${ronda}</div>
                          ${subtit}
                          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
                            <div style="background:rgba(46,134,193,.07);border:1px solid rgba(46,134,193,.2);border-radius:10px;padding:14px">
                              <div style="font-size:26px;font-weight:800;color:var(--surf-dark);font-family:'JetBrains Mono',monospace">${totalPessoas.toLocaleString()}</div>
                              <div style="font-size:11px;color:var(--text3);margin-top:2px">${merged ? 'Total acumulado pessoas' : 'Pessoas alcançadas'}</div>
                            </div>
                            <div style="background:rgba(26,82,118,.07);border:1px solid rgba(26,82,118,.2);border-radius:10px;padding:14px">
                              <div style="font-size:26px;font-weight:800;color:var(--primary);font-family:'JetBrains Mono',monospace">${totalLocais}</div>
                              <div style="font-size:11px;color:var(--text3);margin-top:2px">${merged ? 'Total acumulado locais' : 'Locais visitados'}</div>
                            </div>
                          </div>
                          <div style="font-size:12px;color:var(--text2);margin-bottom:20px;background:var(--bg3);border-radius:8px;padding:10px 14px;text-align:left">
                            <div><b>Mobilizador:</b> ${mobilizador}</div>
                            <div><b>Bairro:</b> ${bairro}</div>
                            <div><b>Coordenação:</b> ${coordNome}</div>
                            ${sim ? `<div><b>Responderam Sim:</b> ${sim}</div>` : ''}
                          </div>
                          <div style="display:flex;gap:10px;justify-content:center">
                            <button class="btn btn-outline" onclick="document.getElementById('saveConfirmModal').remove();showPage('listFichas')">📋 Ver Fichas</button>
                            <button class="btn btn-accent" onclick="document.getElementById('saveConfirmModal').remove()">+ Nova Ficha</button>
                          </div>
                        </div>`;
                      document.body.appendChild(modal);
                    }


