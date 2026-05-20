                    // ══════════════════════════════════

                    main();
                    document.getElementById('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

                    // Detectar modo offline/online
                    window.addEventListener('online', () => {
                      document.getElementById('offlineBanner').classList.remove('show');
                    showToast('Conexão restaurada', 'success');
                    testSB();
                  });

                    window.addEventListener('offline', () => {
                      document.getElementById('offlineBanner').classList.add('show');
                    showToast('Modo offline ativado', 'info');
                  });

                    if (!navigator.onLine) {
                      document.getElementById('offlineBanner').classList.add('show');
                    }

                    // Scroll: esconder topbar ao rolar para baixo, mostrar ao rolar para cima ou no topo
                    let lastScrollTop = 0;
                    const fab = document.getElementById('fabButton');
                    const mainScrollEl = document.querySelector('.main');

                    function handleMainScroll() {
                      const st = mainScrollEl ? mainScrollEl.scrollTop : (window.pageYOffset || document.documentElement.scrollTop);
                      const topbar = document.getElementById('fichasTopbar');

                      // Esconder/mostrar topbar
                      if (topbar && topbar.classList.contains('show')) {
                        if (st <= 5) {
                          // No topo: sempre mostrar
                          topbar.classList.remove('topbar-hidden');
                        } else if (st > lastScrollTop + 8) {
                          // Rolando para baixo: esconder
                          topbar.classList.add('topbar-hidden');
                        } else if (st < lastScrollTop - 5) {
                          // Rolando para cima: mostrar
                          topbar.classList.remove('topbar-hidden');
                        }
                      }

                      // FAB mobile
                      if (window.innerWidth <= 768 && fab) {
                        if (st > lastScrollTop && st > 100) {
                          fab.style.transform = 'translateY(100px)';
                        } else {
                          fab.style.transform = 'translateY(0)';
                        }
                      }
                      lastScrollTop = st <= 0 ? 0 : st;
                    }

                    // Attach to .main scroll (desktop) and window scroll (mobile)
                    if (mainScrollEl) {
                      mainScrollEl.addEventListener('scroll', handleMainScroll, { passive: true });
                    }
                    window.addEventListener('scroll', handleMainScroll, { passive: true });

                    // Tema escuro/claro
                    let isDarkMode = localStorage.getItem('darkMode') === 'true';
                    function updateThemeBtn() {
                      const icon = document.getElementById('themeIcon');
                      const label = document.getElementById('themeLabel');
                      if (icon) icon.textContent = isDarkMode ? '☀️' : '🌙';
                      if (label) label.textContent = isDarkMode ? 'Modo Claro' : 'Modo Escuro';
                    }
                    function toggleTheme() {
                      isDarkMode = !isDarkMode;
                      document.body.classList.toggle('dark-mode', isDarkMode);
                      updateThemeBtn();
                      localStorage.setItem('darkMode', isDarkMode);
                      showToast(isDarkMode ? 'Modo escuro activado' : 'Modo claro activado', 'info');
                    }
                    if (isDarkMode) {
                      document.body.classList.add('dark-mode');
                      updateThemeBtn();
                    }
                    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

                    // Toggle Sidebar
                    function isMobile() {
                      return window.innerWidth <= 768;
                    }
                    function toggleSidebar() {
                      const sidebar = document.querySelector('.sidebar');
                      const spacer = document.getElementById('sidebarSpacer');
                      const topbar = document.getElementById('fichasTopbar');
                      const overlay = document.getElementById('sidebarOverlay');
                      if (!sidebar) return;
                      if (isMobile()) {
                        // Mobile: usa classe .open + overlay
                        const isOpen = sidebar.classList.toggle('open');
                        if (overlay) overlay.classList.toggle('open', isOpen);
                      } else {
                        // Desktop: usa classe .sidebar-hidden + guarda estado
                        sidebar.classList.toggle('sidebar-hidden');
                        const isHidden = sidebar.classList.contains('sidebar-hidden');
                        if (spacer) spacer.classList.toggle('hidden', isHidden);
                        if (topbar) topbar.classList.toggle('sidebar-collapsed', isHidden);
                        localStorage.setItem('sidebarHidden', isHidden);
                        const btn = document.getElementById('sidebarToggleBtn');
                        if (btn) btn.textContent = isHidden ? '☰' : '✕';
                      }
                    }
                    function closeSidebar() {
                      const sidebar = document.querySelector('.sidebar');
                      const overlay = document.getElementById('sidebarOverlay');
                      if (sidebar) sidebar.classList.remove('open');
                      if (overlay) overlay.classList.remove('open');
                    }
                    // Fechar sidebar mobile ao clicar num item de navegação
                    document.addEventListener('click', function(e) {
                      if (isMobile() && e.target.closest('.nav-item')) {
                        closeSidebar();
                      }
                    });
                    // Restaurar estado do sidebar ao carregar (só desktop)
                    window.addEventListener('load', () => {
                      if (isMobile()) return;
                      const sidebarHidden = localStorage.getItem('sidebarHidden') === 'true';
                      const sidebar = document.querySelector('.sidebar');
                      const spacer = document.getElementById('sidebarSpacer');
                      const topbar = document.getElementById('fichasTopbar');
                      if (sidebar && sidebarHidden) {
                        sidebar.classList.add('sidebar-hidden');
                        if (spacer) spacer.classList.add('hidden');
                        if (topbar) topbar.classList.add('sidebar-collapsed');
                        const btn = document.getElementById('sidebarToggleBtn');
                        if (btn) btn.textContent = '☰';
                      }
                    });

                    // Busca global
                    function openSearch() {
                      document.getElementById('searchGlobal').classList.add('show');
                      document.getElementById('searchInput').focus();
                    }
                    function closeSearch() {
                      document.getElementById('searchGlobal').classList.remove('show');
                      document.getElementById('searchInput').value = '';
                    }
                    // ══════════════════════════════════════════════
                    // SISTEMA DE NOTIFICAÇÕES MELHORADO
                    // ══════════════════════════════════════════════
                    let _notifications = [];
                    let _notifTab = 'all';
                    const NOTIF_KEY = 'sismob_notifications';

                    function loadNotificationsStore() {
                      try { _notifications = JSON.parse(localStorage.getItem(NOTIF_KEY)) || []; } catch { _notifications = []; }
                    }
                    function saveNotificationsStore() {
                      try { localStorage.setItem(NOTIF_KEY, JSON.stringify(_notifications.slice(0, 100))); } catch {}
                    }
                    function addNotification(text, type, category) {
                      // type: 'success'|'warning'|'error'|'info', category: 'alert'|'info'
                      loadNotificationsStore();
                      _notifications.unshift({ id: Date.now(), text, type: type || 'info', category: category || 'info', read: false, time: new Date().toISOString() });
                      saveNotificationsStore();
                      updateNotifBadge();
                      renderNotificationList();
                    }
                    function updateNotifBadge() {
                      loadNotificationsStore();
                      const unread = _notifications.filter(n => !n.read).length;
                      const badge = document.getElementById('notifBadge');
                      if (badge) { badge.textContent = unread > 9 ? '9+' : unread; badge.style.display = unread > 0 ? 'flex' : 'none'; }
                    }
                    function switchNotifTab(tab) {
                      _notifTab = tab;
                      document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
                      const el = document.getElementById('ntab-' + tab); if (el) el.classList.add('active');
                      renderNotificationList();
                    }
                    function renderNotificationList() {
                      const list = document.getElementById('notificationList'); if (!list) return;
                      loadNotificationsStore();
                      let items = _notifications;
                      if (_notifTab === 'alert') items = items.filter(n => n.category === 'alert');
                      else if (_notifTab === 'info') items = items.filter(n => n.category !== 'alert');
                      if (!items.length) {
                        list.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text3);font-size:13px">Sem notificações</div>';
                        return;
                      }
                      const icons = { success: '✅', warning: '⚠️', error: '🚨', info: 'ℹ️' };
                      list.innerHTML = items.map(n => {
                        const ago = getTimeAgo(n.time);
                        return `<div class="notif-item ${n.read ? '' : 'unread'} type-${n.type}" onclick="markNotifRead(${n.id})">
                          <div class="ni-text"><span class="ni-icon">${icons[n.type]||'ℹ️'}</span>${n.text}</div>
                          <div class="ni-time">${ago}</div>
                        </div>`;
                      }).join('');
                    }
                    function markNotifRead(id) {
                      loadNotificationsStore();
                      const n = _notifications.find(x => x.id === id);
                      if (n) n.read = true;
                      saveNotificationsStore();
                      updateNotifBadge();
                      renderNotificationList();
                    }
                    function markAllNotificationsRead() {
                      loadNotificationsStore();
                      _notifications.forEach(n => n.read = true);
                      saveNotificationsStore();
                      updateNotifBadge();
                      renderNotificationList();
                    }
                    function clearAllNotifications() {
                      _notifications = [];
                      saveNotificationsStore();
                      updateNotifBadge();
                      renderNotificationList();
                    }
                    function getTimeAgo(isoStr) {
                      const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
                      if (diff < 60) return 'agora mesmo';
                      if (diff < 3600) return `há ${Math.floor(diff/60)}m`;
                      if (diff < 86400) return `há ${Math.floor(diff/3600)}h`;
                      return `há ${Math.floor(diff/86400)}d`;
                    }
                    function toggleNotifications() {
                      const nc = document.getElementById('notificationCenter');
                      if (nc.classList.contains('show')) {
                        nc.classList.remove('show');
                      } else {
                        renderNotificationList();
                        nc.classList.add('show');
                      }
                    }
                    function closeNotifications() {
                      document.getElementById('notificationCenter').classList.remove('show');
                    }

                    // ══════════════════════════════════════════════
                    // BARRA FIXA DE FICHAS + RONDA
                    // ══════════════════════════════════════════════
                    function updateTopbar() {
                      if (!currentUser) return;
                      const topbar = document.getElementById('fichasTopbar');
                      if (!topbar) return;
                      topbar.classList.add('show');
                      // Show bell (inside topbar)
                      const bell = document.getElementById('notifBellBtn');
                      if (bell) bell.style.display = 'flex';

                      // Contagem de fichas
                      const fichas = getVisibleFichas();
                      const numEl = document.getElementById('topbarFichasNum');
                      if (numEl) numEl.textContent = fichas.length.toLocaleString();

                      // Ronda activa (supervisor)
                      const rondaInfo = document.getElementById('topbarRondaInfo');
                      const rondaBadge = document.getElementById('topbarRondaBadge');
                      if (currentUser.tipo === 'supervisor' && currentUser.ronda) {
                        const rondaIcons = {'1':'🔵 1ª Ronda','2':'🟢 2ª Ronda','3':'🟡 3ª Ronda'};
                        if (rondaInfo && rondaBadge) {
                          rondaBadge.textContent = rondaIcons[String(currentUser.ronda)] || currentUser.ronda + 'ª Ronda';
                          rondaInfo.style.display = 'flex';
                        }
                      } else if (currentUser.tipo === 'admin') {
                        // Show active rondas count
                        const rondaSet = new Set(_users.filter(u => u.ronda).map(u => String(u.ronda)));
                        if (rondaInfo && rondaBadge && rondaSet.size > 0) {
                          rondaBadge.textContent = [...rondaSet].sort().map(r => r + 'ª').join(', ') + ' Ronda';
                          rondaInfo.style.display = 'flex';
                        }
                      }

                      // Alertas: mobilizadores sem ficha ontem (só supervisor e admin vêem)
                      checkMobAlertOntem();
                      updateNotifBadge();
                    }

                    // Adjust top padding of app when topbar visible
                    function adjustForTopbar() {
                      const main = document.querySelector('.main');
                      const topbar = document.getElementById('fichasTopbar');
                      const notifCenter = document.getElementById('notificationCenter');
                      if (!main || !topbar) return;
                      if (topbar.classList.contains('show')) {
                        main.style.paddingTop = '48px';
                        if (notifCenter) notifCenter.style.top = '52px';
                      } else {
                        main.style.paddingTop = '0';
                      }
                    }

                    // ══════════════════════════════════════════════
                    // ALERTAS: MOBILIZADORES SEM FICHA ONTEM
                    // ══════════════════════════════════════════════
                    function getOntemStr() {
                      const d = new Date(); d.setDate(d.getDate() - 1);
                      return d.toISOString().split('T')[0];
                    }

                    function getMobsSemFichaOntem() {
                      const ontem = getOntemStr();
                      let mobs = _mobilizadores || [];
                      // Filter to supervisor's mobs if supervisor
                      if (currentUser.tipo === 'supervisor') {
                        mobs = mobs.filter(m => m.supervisorId === currentUser.id || !m.supervisorId);
                      }
                      const activosMobs = mobs.filter(m => m.activo !== false);
                      const fichasOntem = _fichas.filter(f => f.data === ontem);
                      const mobsComFicha = new Set(fichasOntem.map(f => (f.mobilizador||'').toLowerCase().trim()));
                      return activosMobs.filter(m => !mobsComFicha.has((m.nome||'').toLowerCase().trim()));
                    }

                    function checkMobAlertOntem() {
                      const semFicha = getMobsSemFichaOntem();
                      const btn = document.getElementById('topbarAlertBtn');
                      const countEl = document.getElementById('topbarAlertCount');
                      if (!btn || !countEl) return;
                      if (semFicha.length > 0) {
                        countEl.textContent = semFicha.length;
                        btn.style.display = 'flex';
                      } else {
                        btn.style.display = 'none';
                      }
                    }

                    function openMobAlertModal() {
                      const semFicha = getMobsSemFichaOntem();
                      const ontem = getOntemStr();
                      const list = document.getElementById('mobAlertList');
                      if (!list) return;
                      if (!semFicha.length) {
                        list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--surf-dark);font-size:14px">✅ Todos os mobilizadores registaram ficha ontem!</div>';
                      } else {
                        list.innerHTML = `<div style="font-size:12px;color:var(--text3);margin-bottom:12px">Data de referência: <b>${ontem}</b> · ${semFicha.length} sem ficha</div>`
                          + semFicha.map(m => {
                            const cord = _cords.find(c => c.id === m.coordId);
                            return `<div class="mob-ranking-item" style="cursor:default">
                              <div class="mob-profile-avatar" style="width:36px;height:36px;font-size:14px">${(m.nome||'?')[0].toUpperCase()}</div>
                              <div style="flex:1">
                                <div style="font-weight:600;font-size:13px">${m.nome}</div>
                                ${cord ? `<div style="font-size:11px;color:var(--text3)">${cord.nome}</div>` : ''}
                              </div>
                              <div class="mob-alert-badge">⚠️ Sem ficha</div>
                            </div>`;
                          }).join('');
                      }
                      document.getElementById('mobAlertOverlay').classList.add('show');
                    }
                    function closeMobAlertModal() {
                      document.getElementById('mobAlertOverlay').classList.remove('show');
                    }

                    // ══════════════════════════════════════════════
                    // PERFIL DO MOBILIZADOR
                    // ══════════════════════════════════════════════
                    function openMobProfile(mobNome) {
                      const fichasMob = _fichas.filter(f => (f.mobilizador||'').toLowerCase().trim() === (mobNome||'').toLowerCase().trim());
                      const totalPessoas = fichasMob.reduce((s,f) => s+(f.totalPessoas||0), 0);
                      const totalLocais = fichasMob.reduce((s,f) => s+(f.totalLocais||0), 0);
                      const totalSim = fichasMob.reduce((s,f) => s+(f.sim||0), 0);
                      const totalNao = fichasMob.reduce((s,f) => s+(f.nao||0), 0);
                      const pct = totalSim+totalNao > 0 ? Math.round(totalSim/(totalSim+totalNao)*100) : 0;
                      const diasUnicos = new Set(fichasMob.map(f => f.data)).size;
                      const cord = fichasMob.length > 0 ? _cords.find(c => c.id === fichasMob[0].coordId) : null;

                      // Check se sem ficha ontem
                      const ontem = getOntemStr();
                      const temFichaOntem = fichasMob.some(f => f.data === ontem);

                      const initials = (mobNome||'M').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
                      document.getElementById('mpAvatar').textContent = initials;
                      document.getElementById('mpName').textContent = mobNome;
                      document.getElementById('mpMeta').innerHTML = `${cord ? cord.nome : '—'} ${temFichaOntem ? '' : '<span class="mob-alert-badge" style="margin-left:8px">⚠️ Sem ficha ontem</span>'}`;

                      document.getElementById('mpStats').innerHTML = `
                        <div class="mob-stat-box"><div class="msv">${fichasMob.length}</div><div class="msl">Fichas</div></div>
                        <div class="mob-stat-box"><div class="msv" style="color:var(--surf-dark)">${totalPessoas.toLocaleString()}</div><div class="msl">Pessoas</div></div>
                        <div class="mob-stat-box"><div class="msv" style="color:var(--primary)">${totalLocais}</div><div class="msl">Locais</div></div>
                        <div class="mob-stat-box"><div class="msv" style="color:var(--amber)">${diasUnicos}</div><div class="msl">Dias trab.</div></div>
                        <div class="mob-stat-box"><div class="msv" style="color:${pct>=70?'var(--surf-dark)':'var(--coral)'}">${pct}%</div><div class="msl">Aceitação</div></div>
                      `;

                      const sorted = [...fichasMob].sort((a,b) => (b.data||'').localeCompare(a.data||''));
                      if (!sorted.length) {
                        document.getElementById('mpHistTable').innerHTML = '<div style="padding:16px;text-align:center;color:var(--text3);font-size:13px">Nenhuma ficha registada</div>';
                      } else {
                        document.getElementById('mpHistTable').innerHTML = `<div class="table-wrap"><table class="mob-hist-table">
                          <thead><tr><th>Data</th><th>Bairro</th><th>Coordenação</th><th>Ronda</th><th>Pessoas</th><th>Locais</th><th>Sim</th></tr></thead>
                          <tbody>${sorted.slice(0,30).map(f => {
                            const c2 = _cords.find(c => c.id === f.coordId);
                            const rondaLabel = f.ronda ? `<span style="font-size:10px;font-weight:700">${f.ronda}ª</span>` : '—';
                            return `<tr><td>${f.data||'—'}</td><td>${f.bairro||'—'}</td><td>${c2?c2.nome:'—'}</td><td>${rondaLabel}</td><td style="font-family:'JetBrains Mono',monospace;font-weight:700">${(f.totalPessoas||0).toLocaleString()}</td><td>${f.totalLocais||0}</td><td>${f.sim||0}</td></tr>`;
                          }).join('')}</tbody>
                        </table></div>`;
                      }
                      document.getElementById('mobProfileOverlay').classList.add('show');
                    }
                    function closeMobProfile() {
                      document.getElementById('mobProfileOverlay').classList.remove('show');
                    }

                    // ══════════════════════════════════════════════
                    // RANKING DE MOBILIZADORES POR COORDENAÇÃO
                    // ══════════════════════════════════════════════
                    function renderMobRanking() {
                      const card = document.getElementById('mobRankingCard');
                      const container = document.getElementById('mobRankingContainer');
                      if (!card || !container) return;

                      // Group fichas by mobilizador
                      const byMob = {};
                      _fichas.forEach(f => {
                        const nome = (f.mobilizador||'').trim(); if (!nome) return;
                        if (!byMob[nome]) byMob[nome] = { nome, coordId: f.coordId, fichas: 0, pessoas: 0, locais: 0 };
                        byMob[nome].fichas++;
                        byMob[nome].pessoas += f.totalPessoas || 0;
                        byMob[nome].locais += f.totalLocais || 0;
                      });

                      // Group by coordenação
                      const byCord = {};
                      Object.values(byMob).forEach(m => {
                        const cordId = m.coordId || 'sem';
                        if (!byCord[cordId]) byCord[cordId] = [];
                        byCord[cordId].push(m);
                      });

                      // Filter to visible cords
                      let cordIds = Object.keys(byCord);
                      if (currentUser.tipo === 'supervisor') {
                        cordIds = cordIds.filter(id => String(id) === String(currentUser.coordId) || id === 'sem');
                      }

                      if (!cordIds.length) { card.style.display = 'none'; return; }
                      card.style.display = 'block';

                      const ontem = getOntemStr();
                      const fichasOntem = _fichas.filter(f => f.data === ontem);
                      const mobsComFichaOntem = new Set(fichasOntem.map(f => (f.mobilizador||'').toLowerCase().trim()));

                      container.innerHTML = cordIds.map(cid => {
                        const cord = _cords.find(c => String(c.id) === String(cid)) || { nome: 'Sem Coordenação' };
                        const mobs = byCord[cid].sort((a,b) => b.pessoas - a.pessoas);
                        const posClasses = ['gold','silver','bronze'];
                        return `<div class="mob-ranking-section">
                          <div class="mob-ranking-cord-title">🏠 ${cord.nome} <span style="font-size:11px;color:var(--text3);font-weight:500">(${mobs.length} mobilizadores)</span></div>
                          ${mobs.slice(0,10).map((m, i) => {
                            const semFichaOntem = !mobsComFichaOntem.has(m.nome.toLowerCase().trim());
                            return `<div class="mob-ranking-item" onclick="openMobProfile('${m.nome.replace(/'/g,"\'")}')">
                              <div class="mob-rank-pos ${posClasses[i]||''}">${i<3?['🥇','🥈','🥉'][i]:i+1}</div>
                              <div style="flex:1">
                                <div class="mob-rank-name">${m.nome} ${semFichaOntem ? '<span class="mob-alert-badge">⚠️ sem ficha ontem</span>' : ''}</div>
                                <div class="mob-rank-sub">${m.fichas} fichas · ${m.locais} locais</div>
                              </div>
                              <div>
                                <div class="mob-rank-val">${m.pessoas.toLocaleString()}</div>
                                <div style="font-size:10px;color:var(--text3);text-align:right">pessoas</div>
                              </div>
                            </div>`;
                          }).join('')}
                        </div>`;
                      }).join('');
                    }

                    // ══════════════════════════════════════════════
                    // NOTIFICAÇÕES AUTOMÁTICAS
                    // ══════════════════════════════════════════════
                    function checkAndFireNotifications() {
                      if (!currentUser) return;
                      loadNotificationsStore();
                      const hoje = new Date().toISOString().split('T')[0];
                      const storageKey = 'sismob_notif_checked_' + hoje;

                      // Alerta meta diária (só admin)
                      if (currentUser.tipo === 'admin') {
                        const totalMobs = (_mobilizadores || []).filter(m => m.activo !== false).length;
                        if (totalMobs > 0) {
                          const fichasHoje = _fichas.filter(f => f.data === hoje).length;
                          const metaDiaria = totalMobs; // meta = 1 ficha por mobilizador
                          const metaKey = 'notif_meta_' + hoje;
                          if (!localStorage.getItem(metaKey)) {
                            if (fichasHoje < metaDiaria * 0.5) {
                              addNotification(`Meta diária em risco: ${fichasHoje} fichas de ${metaDiaria} esperadas hoje (${Math.round(fichasHoje/metaDiaria*100)}%)`, 'warning', 'alert');
                              localStorage.setItem(metaKey, '1');
                            }
                          }
                        }

                        // Alerta supervisores sem ficha hoje
                        const supsActivos = _users.filter(u => u.tipo === 'supervisor' && u.activo !== false);
                        const supsComFicha = new Set(_fichas.filter(f => f.data === hoje).map(f => f.userId));
                        const supsSemFicha = supsActivos.filter(u => !supsComFicha.has(u.id));
                        const supAlertKey = 'notif_supsemficha_' + hoje;
                        if (!localStorage.getItem(supAlertKey) && supsSemFicha.length > 0 && new Date().getHours() >= 14) {
                          addNotification(`${supsSemFicha.length} supervisor(es) ainda não submeteram fichas hoje`, 'warning', 'alert');
                          localStorage.setItem(supAlertKey, '1');
                        }
                      }

                      // Alerta mobilizadores sem ficha ontem
                      const semFichaOntem = getMobsSemFichaOntem();
                      const ontemAlertKey = 'notif_mobontem_' + getOntemStr();
                      if (!localStorage.getItem(ontemAlertKey) && semFichaOntem.length > 0) {
                        addNotification(`${semFichaOntem.length} mobilizador(es) não registaram ficha ontem (${getOntemStr()})`, 'warning', 'alert');
                        localStorage.setItem(ontemAlertKey, '1');
                      }
                    }

                    // Notificar quando supervisor guarda ficha (chamado de saveFicha)
                    function notifyFichaGuardada(mobilizador, bairro, pessoas) {
                      if (currentUser && currentUser.tipo === 'supervisor') {
                        addNotification(`Ficha guardada: ${mobilizador} · ${bairro} · ${pessoas} pessoas`, 'success', 'info');
