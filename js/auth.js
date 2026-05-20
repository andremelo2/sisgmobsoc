            async function doLogin() {
              const email = document.getElementById('loginEmail').value.trim().toLowerCase();
              const pass = document.getElementById('loginPass').value.trim();
              if (!email || !pass) {
                document.getElementById('loginErr').style.display = 'block';
                return;
              }
              showLoading('A verificar credenciais...');

            try {
              await loadUsers();
            } catch (e) {
              console.error('loadUsers:', e);
              // Se falhar ao carregar do Supabase, criar usuário admin padrão
              if (_users.length === 0) {
                _users.push({
                  id: 1,
                  nome: 'Administrador',
                  email: 'admin@sismob.ao',
                  senha: 'admin123',
                  tipo: 'admin',
                  coordId: null
                });
                showToast('Usando credenciais padrão (modo offline)', 'info');
              }
            }

            hideLoading();
            const u = _users.find(x => (x.email || '').trim().toLowerCase() === email && (x.senha || '').trim() === pass);
            if (!u) {
              document.getElementById('loginErr').style.display = 'block';
              document.getElementById('loginErr').textContent = 'Email ou senha incorretos. Modo offline: use admin@sismob.ao / admin123';
              return;
            }
            if (u.tipo === 'supervisor' && u.activo === false) {
              document.getElementById('loginErr').style.display = 'block';
              document.getElementById('loginErr').textContent = 'A sua conta foi inactivada. Contacte o administrador.';
              return;
            }
            document.getElementById('loginErr').style.display = 'none';
            currentUser = u;
            DB.set('session', String(u.id));
            await initApp();
          }
                    function doLogout() {
                      stopPresence();
                      currentUser = null; 
                      DB.set('session', null); // Limpar sessão salva
                      localStorage.removeItem('session'); // Garantir remoção
                      const topbar = document.getElementById('fichasTopbar');
                      if (topbar) topbar.classList.remove('show');
                      document.body.classList.remove('topbar-visible');
                      document.getElementById('appShell').style.display = 'none';
                      document.getElementById('loginScreen').style.display = 'flex';
                      // Limpar campos de login
                      document.getElementById('loginEmail').value = '';
                      document.getElementById('loginPass').value = '';
                      document.getElementById('loginErr').style.display = 'none';
                    }
                    async function restoreSession() {
                      const sid = DB.get('session'); if (!sid) return;
                      await loadUsers();
                    currentUser = _users.find(u => String(u.id) === String(sid));
                    if (currentUser) await initApp();
                  }
                    async function initApp() {
                      document.getElementById('loginScreen').style.display = 'none';
                      document.getElementById('appShell').style.display = 'block';
                      await loadCords();
                      await loadUsers();
                    const cord = _cords.find(c => c.id === currentUser.coordId);
                    document.getElementById('sidebarName').textContent = currentUser.nome;
                    const av = document.getElementById('sidebarAvatar');
                    if(av) av.textContent = (currentUser.nome||'?')[0].toUpperCase();
                    document.getElementById('sidebarRole').textContent = currentUser.tipo === 'admin' ? 'ADMINISTRADOR' : 'SUPERVISOR';
                    // Show coord name for supervisor, and coordinator name fixed below
                    if (currentUser.tipo === 'supervisor' && cord) {
                      document.getElementById('sidebarCord').textContent = cord.nome;
                      const coordenadorEl = document.getElementById('sidebarCoordenador');
                      if (coordenadorEl && cord.coordenador) {
                        coordenadorEl.style.display = 'block';
                        coordenadorEl.textContent = '👤 Coord.: ' + cord.coordenador;
                        coordenadorEl.title = 'Coordenador responsável: ' + cord.coordenador;
                      } else if (coordenadorEl) {
                        coordenadorEl.style.display = 'none';
                      }
                    } else {
                      document.getElementById('sidebarCord').textContent = currentUser.tipo === 'admin' ? 'Acesso Global' : '—';
                      const coordenadorEl = document.getElementById('sidebarCoordenador');
                      if (coordenadorEl) coordenadorEl.style.display = 'none';
                    }
                    document.getElementById('adminNav').style.display = currentUser.tipo === 'admin' ? 'block' : 'none';
                    buildFichaTable(); setTodayDate(); updateCoordField();
                    await loadFichas();
                    await loadMobilizadores();
                    // Apply saved avatar
                    applyAvatar(currentUser.id, currentUser.nome);
                    // Presença: todos registam, só admin vê o painel
                    startPresence();
                    updateTopbar();
                    setTimeout(adjustForTopbar, 50);
                    loadNotificationsStore();
                    setTimeout(checkAndFireNotifications, 3000);
                    showPage('dashboard');
                  }

                    // Simplified LOCAIS - only ONE "Casa a Casa"
                    const LOCAIS = [
                      { key: 'casa', label: 'Casa a casa', group: 'casa' },
                      { key: 'igreja', label: 'Igreja', group: 'other' },
                      { key: 'pracas', label: 'Praças / Mercados', group: 'other' },
                      { key: 'paragem', label: 'Paragem de táxi', group: 'other' },
                      { key: 'creche', label: 'Creche', group: 'other' },
                      { key: 'escola', label: 'Escola', group: 'other' },
                      { key: 'agua', label: 'Ponto de água', group: 'other' },
                      { key: 'outros', label: 'Outros', group: 'other' },
                    ];

