                    // ══════════════════════════════════════════════════════

                    // ── Persistência no Firestore / localStorage ──
                    let _mobilizadores = []; // [{id, nome, supervisorId, supervisorNome, activo}]

                    async function loadMobilizadores() {
                      try {
                        const snap = await db.collection('mobilizadores').orderBy('nome').get();
                        _mobilizadores = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                        DB.set('mobilizadores', _mobilizadores);
                      } catch(e) {
                        console.warn('loadMobilizadores offline:', e);
                        _mobilizadores = DB.get('mobilizadores') || [];
                      }
                    }

                    async function persistMobilizador(nome, overrideSupervisorId, overrideSupervisorNome, overrideCoordId) {
                      const supId = overrideSupervisorId || currentUser.id;
                      const supNome = overrideSupervisorNome || currentUser.nome;
                      const payload = {
                        nome: nome.trim(),
                        supervisorId: supId,
                        supervisorNome: supNome,
                        coordId: overrideCoordId || null,
                        activo: true,
                        created_at: firebase.firestore.FieldValue.serverTimestamp()
                      };
                      try {
                        const ref = await db.collection('mobilizadores').add(payload);
                        await loadMobilizadores();
                        return ref.id;
                      } catch(e) {
                        console.warn('persistMobilizador offline:', e);
                        const id = 'local_' + Date.now();
                        _mobilizadores.push({ id, ...payload, created_at: new Date().toISOString() });
                        DB.set('mobilizadores', _mobilizadores);
                        return id;
                      }
                    }

                    async function toggleMobilizadorActivo(id, novoEstado) {
                      try {
                        await db.collection('mobilizadores').doc(String(id)).update({ activo: novoEstado });
                      } catch(e) {
                        console.warn('toggleMobilizadorActivo offline:', e);
                      }
                      const m = _mobilizadores.find(x => x.id === id);
                      if (m) m.activo = novoEstado;
                      DB.set('mobilizadores', _mobilizadores);
                    }

                    async function deleteMobilizadorRemote(id) {
                      const mobilizador = _mobilizadores.find(m => m.id === id);
                      const mobName = mobilizador ? mobilizador.nome : null;
                      
                      try {
                        if (mobName) {
                          const fichasDoMob = _fichas.filter(f => f.mobilizador === mobName);
                          for (let f of fichasDoMob) {
                            try {
                              await db.collection('fichas_mobilizacao').doc(String(f.id)).delete();
                            } catch(e) {
                              console.warn('Erro ao apagar ficha:', e);
                            }
                          }
                        }
                        await db.collection('mobilizadores').doc(String(id)).delete();
                      } catch(e) {
                        console.warn('deleteMobilizadorRemote offline:', e);
                      }
                      _mobilizadores = _mobilizadores.filter(x => x.id !== id);
                      DB.set('mobilizadores', _mobilizadores);
                      if (mobName) {
                        _fichas = _fichas.filter(f => f.mobilizador !== mobName);
                        DB.set('fichas', _fichas);
                      }
                    }

                    // ── Helpers ──
                    function getMobilizadoresDeSupervisor() {
                      if (!currentUser) return [];
                      if (currentUser.tipo === 'admin') return _mobilizadores;
                      return _mobilizadores.filter(m => String(m.supervisorId) === String(currentUser.id));
                    }

                    function getMobilizadoresActivosDeSupervisor() {
                      return getMobilizadoresDeSupervisor().filter(m => m.activo !== false);
                    }

                    // ── Adicionar mobilizador ──
                    async function addMobilizador() {
                      const input = document.getElementById('mob-novo-nome');
                      const aviso = document.getElementById('mob-novo-aviso');
                      const nome = (input?.value || '').trim();
                      if (!nome) { showToast('Escreva o nome do mobilizador', 'error'); return; }

                      let overrideSupId = null, overrideSupNome = null, overrideCoordId = null;

                      if (currentUser.tipo === 'admin') {
                        const supSel = document.getElementById('mob-novo-sup');
                        const coordSel = document.getElementById('mob-novo-coord');
                        const supVal = supSel?.value;
                        const coordVal = coordSel?.value;
                        if (!coordVal) { showToast('Seleccione a coordenação do mobilizador', 'error'); return; }
                        if (!supVal) { showToast('Seleccione o supervisor do mobilizador', 'error'); return; }
                        const supObj = _users.find(u => u.id === supVal);
                        overrideSupId = supVal;
                        overrideSupNome = supObj ? supObj.nome : '';
                        overrideCoordId = coordVal;
                      }

                      // Verificar duplicado no mesmo supervisor
                      const jaExiste = getMobilizadoresDeSupervisor().find(
                        m => m.nome.trim().toLowerCase() === nome.toLowerCase()
                      );
                      if (jaExiste) {
                        if (aviso) {
                          aviso.style.display = 'block';
                          aviso.textContent = `⚠️ "${nome}" já está cadastrado.`;
                        }
                        showToast('Mobilizador já cadastrado', 'error');
                        return;
                      }
                      if (aviso) aviso.style.display = 'none';

                      showLoading('A cadastrar mobilizador...');
                      await persistMobilizador(nome, overrideSupId, overrideSupNome, overrideCoordId);
                      hideLoading();
                      input.value = '';
                      if (currentUser.tipo === 'admin') {
                        const supSel = document.getElementById('mob-novo-sup');
                        const coordSel = document.getElementById('mob-novo-coord');
                        if (supSel) supSel.value = '';
                        if (coordSel) coordSel.value = '';
                        populateMobSupSelect();
                      }
                      renderMobilizadoresList();
                      renderMobilizadoresAdmin();
                      showToast(`"${nome}" cadastrado com sucesso ✓`, 'success');
                    }

                    function onMobNovoInput(val) {
                      const aviso = document.getElementById('mob-novo-aviso');
                      if (!aviso) return;
                      if (!val.trim()) { aviso.style.display = 'none'; return; }
                      const jaExiste = getMobilizadoresDeSupervisor().find(
                        m => m.nome.trim().toLowerCase() === val.trim().toLowerCase()
                      );
                      if (jaExiste) {
                        aviso.style.display = 'block';
                        aviso.textContent = `⚠️ "${val.trim()}" já está cadastrado.`;
                      } else {
                        aviso.style.display = 'none';
                      }
                    }

                    // ── Filtro da lista de mobilizadores ──
                    let _mobFiltro = 'todos';
                    let _mobAdmFiltro = 'todos';

                    function filterMobilizadores(f) {
                      _mobFiltro = f;
                      ['mobFiltTodos','mobFiltActivos','mobFiltInactivos'].forEach(id => {
                        const el = document.getElementById(id);
                        if(el) el.classList.remove('active');
                      });
                      const map = {todos:'mobFiltTodos', activos:'mobFiltActivos', inactivos:'mobFiltInactivos'};
                      const el = document.getElementById(map[f]);
                      if(el) el.classList.add('active');
                      renderMobilizadoresList();
                    }

                    function filterMobilizadoresAdmin(f) {
                      _mobAdmFiltro = f;
                      ['mobAdmFiltTodos','mobAdmFiltActivos','mobAdmFiltInactivos'].forEach(id => {
                        const el = document.getElementById(id);
                        if(el) el.classList.remove('active');
                      });
                      const map = {todos:'mobAdmFiltTodos', activos:'mobAdmFiltActivos', inactivos:'mobAdmFiltInactivos'};
                      const el = document.getElementById(map[f]);
                      if(el) el.classList.add('active');
                      renderMobilizadoresAdmin();
                    }

                    // ── Renderizar lista supervisor ──
                    function renderMobilizadoresList() {
                      const cont = document.getElementById('mobListContainer');
                      if (!cont) return;
                      const search = (document.getElementById('mobSearchInput')?.value || '').toLowerCase();
                      let lista = getMobilizadoresDeSupervisor();
                      if (_mobFiltro === 'activos') lista = lista.filter(m => m.activo !== false);
                      if (_mobFiltro === 'inactivos') lista = lista.filter(m => m.activo === false);
                      if (search) lista = lista.filter(m => m.nome.toLowerCase().includes(search));

                      if (!lista.length) {
                        cont.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text3);font-size:13px">
                          ${search ? 'Nenhum resultado para a pesquisa.' : 'Nenhum mobilizador cadastrado ainda.<br>Adicione o primeiro usando o formulário acima.'}</div>`;
                        return;
                      }

                      const ontem2 = getOntemStr();
                      const fichasOntem2 = _fichas.filter(f => f.data === ontem2);
                      const mobsComFichaOntem2 = new Set(fichasOntem2.map(f => (f.mobilizador||'').toLowerCase().trim()));
                      const rows = lista.map((m,i) => {
                        const initials = m.nome.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
                        const isActivo = m.activo !== false;
                        const semFichaOntem = isActivo && !mobsComFichaOntem2.has(m.nome.toLowerCase().trim());
                        return `<div class="mob-list-item${semFichaOntem?' mob-list-item-alert':''}">
                          <div class="mob-list-avatar${isActivo?'':' inactivo'}">${initials}</div>
                          <div style="flex:1;min-width:0">
                            <div style="font-size:14px;font-weight:600;color:${isActivo?'var(--text)':'var(--text3)'}">${m.nome}
                              ${semFichaOntem?'<span class="mob-alert-badge" style="margin-left:6px">⚠️ sem ficha ontem</span>':''}</div>
                            <div style="margin-top:3px">
                              ${isActivo
                                ? '<span class="mob-badge-activo">✅ Activo</span>'
                                : '<span class="mob-badge-inactivo">🚫 Inactivo</span>'}
                            </div>
                          </div>
                          <div style="display:flex;align-items:center;gap:8px">
                            <button class="btn btn-outline btn-sm" onclick="openMobProfile('${m.nome.replace(/'/g,"\'")}')" title="Ver perfil" style="padding:5px 10px">👤 Perfil</button>
                            <button class="btn btn-blue btn-sm" onclick="openEditMob('${m.id}','${m.nome.replace(/'/g,"\\'")}')" title="Editar nome" style="padding:5px 10px">✏️ Editar</button>
                            <button class="mob-toggle ${isActivo?'on':'off'}" title="${isActivo?'Clique para inactivar':'Clique para activar'}"
                              onclick="toggleMobItem('${m.id}', ${!isActivo})"></button>
                            <button class="btn btn-danger btn-sm" onclick="confirmDeleteMob('${m.id}','${m.nome.replace(/'/g,"\'")}')" title="Remover">🗑</button>
                          </div>
                        </div>`;
                      }).join('');

                      cont.innerHTML = rows;
                    }

                    // ── Renderizar lista admin ──
                    function renderMobilizadoresAdmin() {
                      const cont = document.getElementById('mobAdminListContainer');
                      if (!cont) return;
                      const search = (document.getElementById('mobAdmSearchInput')?.value || '').toLowerCase();
                      const supFilt = document.getElementById('mobAdmFiltSup')?.value || '';
                      let lista = [..._mobilizadores];
                      if (_mobAdmFiltro === 'activos') lista = lista.filter(m => m.activo !== false);
                      if (_mobAdmFiltro === 'inactivos') lista = lista.filter(m => m.activo === false);
                      if (search) lista = lista.filter(m => m.nome.toLowerCase().includes(search));
                      if (supFilt) lista = lista.filter(m => String(m.supervisorId) === supFilt);

                      if (!lista.length) {
                        cont.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text3);font-size:13px">Nenhum mobilizador encontrado.</div>`;
                        return;
                      }

                      const rows = lista.map(m => {
                        const initials = m.nome.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
                        const isActivo = m.activo !== false;
                        return `<div class="mob-list-item">
                          <div class="mob-list-avatar${isActivo?'':' inactivo'}">${initials}</div>
                          <div style="flex:1;min-width:0">
                            <div style="font-size:14px;font-weight:600;color:${isActivo?'var(--text)':'var(--text3)'}">${m.nome}</div>
                            <div style="font-size:11px;color:var(--text3);margin-top:2px">Supervisor: ${m.supervisorNome||'—'}</div>
                            <div style="margin-top:4px">
                              ${isActivo
                                ? '<span class="mob-badge-activo">✅ Activo</span>'
                                : '<span class="mob-badge-inactivo">🚫 Inactivo</span>'}
                            </div>
                          </div>
                          <div style="display:flex;align-items:center;gap:8px">
                            <button class="btn btn-blue btn-sm" onclick="openEditMob('${m.id}','${m.nome.replace(/'/g,"\\'")}')" title="Editar nome" style="padding:5px 10px">✏️ Editar</button>
                            <button class="mob-toggle ${isActivo?'on':'off'}" title="${isActivo?'Inactivar':'Activar'}"
                              onclick="toggleMobItemAdmin('${m.id}', ${!isActivo})"></button>
                            <button class="btn btn-danger btn-sm" onclick="confirmDeleteMobAdmin('${m.id}','${m.nome.replace(/'/g,"\\'")}')" title="Apagar do sistema" style="padding:5px 10px">🗑 Apagar</button>
                          </div>
                        </div>`;
                      }).join('');

                      cont.innerHTML = rows;
                    }

                    // ── Popular select de supervisores no filtro admin ──
                    function populateMobAdmSupFilter() {
                      const sel = document.getElementById('mobAdmFiltSup'); if (!sel) return;
                      const sups = _users.filter(u => u.tipo === 'supervisor');
                      sel.innerHTML = '<option value="">Todos os supervisores</option>';
                      sups.forEach(s => sel.innerHTML += `<option value="${s.id}">${s.nome}</option>`);
                    }

                    // ── Toggle activo/inactivo ──
                    async function toggleMobItem(id, novoEstado) {
                      await toggleMobilizadorActivo(id, novoEstado);
                      renderMobilizadoresList();
                      updateMobAcDropdown(document.getElementById('f-mobilizador')?.value || '');
                      showToast(novoEstado ? 'Mobilizador activado ✓' : 'Mobilizador inactivado ✓',
                        novoEstado ? 'success' : 'info');
                    }

                    async function toggleMobItemAdmin(id, novoEstado) {
                      await toggleMobilizadorActivo(id, novoEstado);
                      renderMobilizadoresList();
                      renderMobilizadoresAdmin();
                      updateMobAcDropdown(document.getElementById('f-mobilizador')?.value || '');
                      showToast(novoEstado ? 'Mobilizador activado ✓' : 'Mobilizador inactivado ✓',
                        novoEstado ? 'success' : 'info');
                    }

                    // ── Confirmar remoção ──
                    function confirmDeleteMob(id, nome) {
                      if (!confirm(`Remover "${nome}" da lista de mobilizadores?\n\nAs fichas já lançadas com este nome serão preservadas.`)) return;
                      deleteMobilizadorRemote(id).then(() => {
                        renderMobilizadoresList();
                        showToast(`"${nome}" removido ✓`, 'info');
                      });
                    }

                    // ── Confirmar remoção pelo Admin (apaga da base de dados) ──
                    function confirmDeleteMobAdmin(id, nome) {
                      if (!confirm(`⚠️ ATENÇÃO — Apagar permanentemente!\n\nVai remover "${nome}" da base de dados.\nTodas as fichas associadas a este mobilizador também serão apagadas.\n\nEsta acção NÃO pode ser desfeita.\n\nConfirma?`)) return;
                      showLoading('A apagar mobilizador e fichas associadas...');
                      deleteMobilizadorRemote(id).then(() => {
                        hideLoading();
                        renderMobilizadoresAdmin();
                        renderMobilizadoresList();
                        showToast(`"${nome}" apagado permanentemente ✓`, 'info');
                      }).catch(e => {
                        hideLoading();
                        showToast('Erro ao apagar: ' + e.message, 'error');
                      });
                    }

                    // ── BACKUP / EXPORTAÇÃO DE DADOS ──
                    function downloadJSON(data, filename) {
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = filename; a.click();
                      URL.revokeObjectURL(url);
                    }

                    function backupMobilizadores() {
                      const data = {
                        exportado_em: new Date().toISOString(),
                        total: _mobilizadores.length,
                        mobilizadores: _mobilizadores
                      };
                      downloadJSON(data, `SisMob_Backup_Mobilizadores_${new Date().toISOString().split('T')[0]}.json`);
                      showToast(`Backup de ${_mobilizadores.length} mobilizadores exportado ✓`, 'success');
                    }

                    function backupSupervisores() {
                      const sups = _users.filter(u => u.tipo === 'supervisor').map(u => ({
                        id: u.id, nome: u.nome, email: u.email,
                        coordId: u.coordId, ronda: u.ronda, activo: u.activo
                      }));
                      const data = {
                        exportado_em: new Date().toISOString(),
                        total: sups.length,
                        supervisores: sups
                      };
                      downloadJSON(data, `SisMob_Backup_Supervisores_${new Date().toISOString().split('T')[0]}.json`);
                      showToast(`Backup de ${sups.length} supervisores exportado ✓`, 'success');
                    }

                    function backupFichas() {
                      const data = {
                        exportado_em: new Date().toISOString(),
                        total: _fichas.length,
                        fichas: _fichas
                      };
                      downloadJSON(data, `SisMob_Backup_Fichas_${new Date().toISOString().split('T')[0]}.json`);
                      showToast(`Backup de ${_fichas.length} fichas exportado ✓`, 'success');
                    }

                    function backupCompleto() {
                      const sups = _users.filter(u => u.tipo === 'supervisor').map(u => ({
                        id: u.id, nome: u.nome, email: u.email,
                        coordId: u.coordId, ronda: u.ronda, activo: u.activo
                      }));
                      const data = {
                        exportado_em: new Date().toISOString(),
                        sistema: 'SisMob',
                        coordenacoes: { total: _cords.length, dados: _cords },
                        supervisores: { total: sups.length, dados: sups },
                        mobilizadores: { total: _mobilizadores.length, dados: _mobilizadores },
                        fichas: { total: _fichas.length, dados: _fichas }
                      };
                      downloadJSON(data, `SisMob_Backup_COMPLETO_${new Date().toISOString().split('T')[0]}.json`);
                      showToast('Backup completo exportado ✓', 'success');
                    }

                    function backupExcel() {
                      showToast('A gerar Excel de backup...', 'info');
                      const wb = XLSX.utils.book_new();

                      // Aba Mobilizadores
                      const mobData = _mobilizadores.map(m => ({
                        'Nome': m.nome, 'Supervisor': m.supervisorNome || '—',
                        'Estado': m.activo !== false ? 'Activo' : 'Inactivo'
                      }));
                      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mobData), 'Mobilizadores');

                      // Aba Supervisores
                      const supData = _users.filter(u => u.tipo === 'supervisor').map(u => {
                        const cord = _cords.find(c => c.id === u.coordId);
                        return {
                          'Nome': u.nome, 'Email': u.email,
                          'Coordenação': cord ? cord.nome : '—',
                          'Ronda': u.ronda ? u.ronda + 'ª' : '—',
                          'Estado': u.activo !== false ? 'Activo' : 'Inactivo'
                        };
                      });
                      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(supData), 'Supervisores');

                      // Aba Fichas
                      const fichaData = _fichas.map(f => ({
                        'Data': f.data || '—', 'Mobilizador': f.mobilizador || '—',
                        'Coordenação': f.coordNome || '—', 'Bairro': f.bairro || '—',
                        'Total Locais': f.totalLocais || 0, 'Total Pessoas': f.totalPessoas || 0,
                        'Aceitaram': f.sim || 0, 'Recusaram': f.nao || 0
                      }));
                      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fichaData), 'Fichas');

                      XLSX.writeFile(wb, `SisMob_Backup_${new Date().toISOString().split('T')[0]}.xlsx`);
                      showToast('Excel de backup exportado ✓', 'success');
                    }

                    // ── Editar nome do mobilizador ──
                    function openEditMob(id, nomeActual) {
                      let overlay = document.getElementById('editMobOverlay');
                      if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.id = 'editMobOverlay';
                        overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)';
                        overlay.innerHTML = `
                          <div style="background:#fff;border-radius:16px;padding:32px;max-width:420px;width:94%;box-shadow:0 20px 40px rgba(0,0,0,.2);position:relative">
                            <button onclick="closeEditMob()" style="position:absolute;top:14px;right:16px;background:none;border:none;font-size:22px;cursor:pointer;color:#999">×</button>
                            <div style="font-size:18px;font-weight:800;color:var(--primary);margin-bottom:20px">✏️ Editar Mobilizador</div>
                            <input type="hidden" id="editMobId">
                            <div style="margin-bottom:20px">
                              <label style="font-size:11px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:6px">Nome Completo</label>
                              <input type="text" id="editMobNome" style="width:100%;background:#f9f9f9;border:1px solid var(--border-solid);border-radius:8px;padding:11px 14px;font-family:Inter,sans-serif;font-size:14px;color:var(--text)"
                                onkeydown="if(event.key==='Enter')saveEditMob()">
                            </div>
                            <div style="display:flex;gap:10px;justify-content:flex-end">
                              <button class="btn btn-outline" onclick="closeEditMob()">✕ Cancelar</button>
                              <button class="btn btn-accent" onclick="saveEditMob()">💾 Guardar</button>
                            </div>
                          </div>`;
                        document.body.appendChild(overlay);
                      }
                      document.getElementById('editMobId').value = id;
                      document.getElementById('editMobNome').value = nomeActual;
                      overlay.style.display = 'flex';
                      setTimeout(() => document.getElementById('editMobNome').focus(), 100);
                    }
                    function closeEditMob() {
                      const o = document.getElementById('editMobOverlay'); if (o) o.style.display = 'none';
                    }
                    async function saveEditMob() {
                      const id = document.getElementById('editMobId').value;
                      const novoNome = document.getElementById('editMobNome').value.trim();
                      if (!novoNome) { showToast('O nome não pode estar vazio', 'error'); return; }
                      const mob = _mobilizadores.find(m => String(m.id) === String(id));
                      if (!mob) { showToast('Mobilizador não encontrado', 'error'); return; }
                      const nomeAntigo = mob.nome;
                      showLoading('A guardar...');
                      try {
                        await db.collection('mobilizadores').doc(String(id)).update({ nome: novoNome });
                        mob.nome = novoNome;
                        DB.set('mobilizadores', _mobilizadores);
                      } catch(e) {
                        mob.nome = novoNome;
                        DB.set('mobilizadores', _mobilizadores);
                      }
                      hideLoading();
                      closeEditMob();
                      renderMobilizadoresList();
                      renderMobilizadoresAdmin();
                      showToast(`Mobilizador renomeado para "${novoNome}" ✓`, 'success');
                    }

                    // ── Renderizar página de mobilizadores ──
                    function renderMobilizadoresPage() {
                      if (currentUser.tipo === 'admin') {
                        const panel = document.getElementById('mobAdminPanel');
                        if (panel) panel.style.display = 'block';
                        // Admin also sees the add form with coord/sup selectors
                        const card = document.querySelector('#page-mobilizadores > .card:first-child');
                        if (card) card.style.display = 'block';
                        // Show admin-specific fields
                        const adminFields = document.getElementById('mob-admin-fields');
                        if (adminFields) adminFields.style.display = 'block';
                        document.getElementById('mobPageTitle').textContent = 'Gestão de Mobilizadores';
                        document.getElementById('mobPageSubtitle').textContent = 'Cadastrar e gerir mobilizadores de todos os supervisores';
                        // Populate coord dropdown
                        const coordSel = document.getElementById('mob-novo-coord');
                        if (coordSel) {
                          coordSel.innerHTML = '<option value="">— Seleccionar Coordenação —</option>';
                          _cords.forEach(c => coordSel.innerHTML += `<option value="${c.id}">${c.nome}${c.coordenador ? ' (' + c.coordenador + ')' : ''}</option>`);
                        }
                        populateMobAdmSupFilter();
                        renderMobilizadoresAdmin();
                      } else {
                        const panel = document.getElementById('mobAdminPanel');
                        if (panel) panel.style.display = 'none';
                        const card = document.querySelector('#page-mobilizadores > .card:first-child');
                        if (card) card.style.display = 'block';
                        const adminFields = document.getElementById('mob-admin-fields');
                        if (adminFields) adminFields.style.display = 'none';
                        renderMobilizadoresList();
                      }
                      // Always render ranking and alert
                      renderMobRanking();
                      renderMobAlertOntemInPage();
                    }

                    function renderMobAlertOntemInPage() {
                      const cont = document.getElementById('mobAlertaOntem'); if (!cont) return;
                      const semFicha = getMobsSemFichaOntem();
                      if (!semFicha.length) { cont.style.display = 'none'; return; }
                      cont.style.display = 'block';
                      cont.innerHTML = `<div style="background:rgba(212,168,23,.1);border:1.5px solid rgba(212,168,23,.4);border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                        <span style="font-size:20px">⚠️</span>
                        <div style="flex:1">
                          <div style="font-size:13px;font-weight:700;color:var(--amber)">Mobilizadores sem ficha ontem (${getOntemStr()})</div>
                          <div style="font-size:12px;color:var(--text2);margin-top:3px">${semFicha.slice(0,5).map(m=>m.nome).join(', ')}${semFicha.length>5?` e mais ${semFicha.length-5}`:''}.</div>
                        </div>
                        <button class="btn btn-outline" style="font-size:12px;padding:6px 14px;border-color:var(--amber);color:var(--amber)" onclick="openMobAlertModal()">Ver todos →</button>
                      </div>`;
                    }

                    // Populate supervisor select based on selected coordenação
                    function populateMobSupSelect() {
                      const coordSel = document.getElementById('mob-novo-coord');
                      const supSel = document.getElementById('mob-novo-sup');
                      if (!coordSel || !supSel) return;
                      const coordId = coordSel.value;
                      supSel.innerHTML = '<option value="">— Seleccionar Supervisor —</option>';
                      if (!coordId) return;
                      const sups = _users.filter(u => u.tipo === 'supervisor' && String(u.coordId) === String(coordId) && u.activo !== false);
                      sups.forEach(s => supSel.innerHTML += `<option value="${s.id}">${s.nome}</option>`);
                      if (!sups.length) supSel.innerHTML += '<option disabled>Sem supervisores nesta coordenação</option>';
                    }

                    // ── AUTOCOMPLETE CUSTOMIZADO NO CAMPO MOBILIZADOR DA FICHA ──
                    let _mobAcIdx = -1;

                    function getMobAcItems(val) {
                      const q = (val || '').trim().toLowerCase();
                      const lista = getMobilizadoresActivosDeSupervisor();
                      if (!q) return lista.slice(0, 8);
                      return lista.filter(m => m.nome.toLowerCase().includes(q)).slice(0, 8);
                    }

                    function updateMobAcDropdown(val) {
                      const dd = document.getElementById('mobAcDropdown'); if (!dd) return;
                      const items = getMobAcItems(val);
                      _mobAcIdx = -1;
                      if (!items.length) {
                        const q = (val || '').trim();
                        dd.innerHTML = q
                          ? `<div class="mob-ac-empty">Nenhum mobilizador encontrado para "<b>${q}</b>".<br><span style="color:var(--primary);cursor:pointer" onclick="showPage('mobilizadores')">Ir ao cadastro ↗</span></div>`
                          : `<div class="mob-ac-empty">Sem mobilizadores activos cadastrados.<br><span style="color:var(--primary);cursor:pointer" onclick="showPage('mobilizadores')">Cadastrar agora ↗</span></div>`;
                        dd.classList.add('show');
                        return;
                      }
                      const q = (val || '').trim().toLowerCase();
                      dd.innerHTML = items.map((m, i) => {
                        const initials = m.nome.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
                        const highlighted = q
                          ? m.nome.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')', 'gi'), '<b>$1</b>')
                          : m.nome;
                        return `<div class="mob-ac-item" data-nome="${m.nome}" data-idx="${i}"
                          onmousedown="selectMobAc('${m.nome.replace(/'/g,"\\'")}')" >
                          <div class="mob-ac-avatar">${initials}</div>
                          <span class="mob-ac-name">${highlighted}</span>
                        </div>`;
                      }).join('');
                      dd.classList.add('show');
                    }

                    function showMobAcDropdown() {
                      const val = document.getElementById('f-mobilizador')?.value || '';
                      updateMobAcDropdown(val);
                    }

                    function hideMobAcDropdown() {
                      const dd = document.getElementById('mobAcDropdown'); if (dd) dd.classList.remove('show');
                      _mobAcIdx = -1;
                    }

                    function selectMobAc(nome) {
                      const inp = document.getElementById('f-mobilizador');
                      if (inp) { inp.value = nome; onMobilizadorInput(nome); }
                      hideMobAcDropdown();
                    }

                    function mobAcKeydown(e) {
                      const dd = document.getElementById('mobAcDropdown');
                      if (!dd || !dd.classList.contains('show')) return;
                      const items = dd.querySelectorAll('.mob-ac-item');
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        _mobAcIdx = Math.min(_mobAcIdx + 1, items.length - 1);
                        items.forEach((el,i) => el.classList.toggle('selected', i === _mobAcIdx));
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        _mobAcIdx = Math.max(_mobAcIdx - 1, -1);
                        items.forEach((el,i) => el.classList.toggle('selected', i === _mobAcIdx));
                      } else if (e.key === 'Enter') {
                        if (_mobAcIdx >= 0 && items[_mobAcIdx]) {
                          e.preventDefault();
                          selectMobAc(items[_mobAcIdx].dataset.nome);
                        }
                      } else if (e.key === 'Escape') {
                        hideMobAcDropdown();
                      }
                    }

                    // ── Autocomplete do campo Mobilizador na Ficha ──
                    function populateMobilizadoresList() {
                      // mantido para compatibilidade, agora usa dropdown customizado
                    }

                    function onMobilizadorInput(val) {
                      updateMobAcDropdown(val);
                      const aviso = document.getElementById('mobDuplicaAviso'); if (!aviso) return;
                      const dt = document.getElementById('f-data')?.value;
                      if (!val.trim() || !dt) { aviso.style.display='none'; return; }
                      const nome = val.trim().toLowerCase();
                      const jaExiste = getVisibleFichas().find(f =>
                        (f.mobilizador||'').trim().toLowerCase() === nome && f.data === dt
                      );
                      if (jaExiste) {
                        aviso.style.display = 'block';
                        aviso.innerHTML = `⚠️ <b>${val.trim()}</b> já tem ficha em ${dt}. Ao guardar, os dados serão <b>somados</b> à ficha existente.`;
                      } else {
                        aviso.style.display = 'none';
                      }
                    }

                    // ── Gestão de datas de rondas ──
                    const RONDAS_KEY = 'sismob_rondas_datas';

                    function getRondasDatas() {
                      try { return JSON.parse(localStorage.getItem(RONDAS_KEY)) || {}; } catch { return {}; }
                    }

                    function saveRondaDatas() {
                      const dados = {};
                      ['1','2','3'].forEach(r => {
                        const ini = document.getElementById(`ronda-ini-${r}`)?.value || null;
                        const fim = document.getElementById(`ronda-fim-${r}`)?.value || null;
                        dados[r] = { inicio: ini, fim: fim };
                      });
                      localStorage.setItem(RONDAS_KEY, JSON.stringify(dados));
                      updateRondasEstados(dados);
                      showToast('Datas das rondas guardadas', 'success');
                    }

                    function updateRondasEstados(dados) {
                      const hoje = new Date().toISOString().split('T')[0];
                      ['1','2','3'].forEach(r => {
                        const el = document.getElementById(`ronda-estado-${r}`); if (!el) return;
                        const d = dados[r] || {};
                        if (!d.inicio && !d.fim) { el.textContent = ''; return; }
                        if (d.inicio && !d.fim && hoje >= d.inicio)
                          el.innerHTML = '<span style="background:rgba(34,197,94,.15);color:#15803d;padding:2px 8px;border-radius:8px">🟢 Em curso</span>';
                        else if (d.inicio && d.fim && hoje > d.fim)
                          el.innerHTML = '<span style="background:rgba(212,168,23,.12);color:#92400e;padding:2px 8px;border-radius:8px">🏁 Encerrada</span>';
                        else if (d.inicio && hoje < d.inicio)
                          el.innerHTML = '<span style="background:rgba(14,165,233,.1);color:#0369a1;padding:2px 8px;border-radius:8px">⏳ Futura</span>';
                        else
                          el.textContent = '';
                      });
                    }

                    function loadRondasDatasUI() {
                      const dados = getRondasDatas();
                      ['1','2','3'].forEach(r => {
                        const d = dados[r] || {};
                        const ini = document.getElementById(`ronda-ini-${r}`); if (ini && d.inicio) ini.value = d.inicio;
                        const fim = document.getElementById(`ronda-fim-${r}`); if (fim && d.fim)   fim.value = d.fim;
                      });
                      updateRondasEstados(dados);
                    }

                    function renderHistoricoRondas() {
                      const cont = document.getElementById('rondasHistoricoContainer'); if (!cont) return;

                      // Mostrar/ocultar painel de datas conforme perfil
                      const datasPanel = document.getElementById('rondasDatasPanel');
                      if (datasPanel) {
                        if (currentUser.tipo === 'admin') {
                          datasPanel.style.display = 'block';
                          loadRondasDatasUI();
                        } else {
                          datasPanel.style.display = 'none';
                        }
                      }

                      const rondaDatas = getRondasDatas();
                      const hoje = new Date().toISOString().split('T')[0];

                      const rondaFilt = document.getElementById('hist-ronda')?.value || '';
                      const estadoFilt = document.getElementById('hist-estado')?.value || '';
                      const rondas = rondaFilt ? [rondaFilt] : ['1','2','3'];
                      const rondaNome = r => r === '1' ? '1ª Ronda' : r === '2' ? '2ª Ronda' : '3ª Ronda';
                      const rondaColor = r => r === '1' ? '#0369a1' : r === '2' ? '#15803d' : '#92400e';
                      const rondaBg = r => r === '1' ? 'rgba(14,165,233,.08)' : r === '2' ? 'rgba(34,197,94,.08)' : 'rgba(212,168,23,.08)';
                      let html = '';
                      rondas.forEach(r => {
                        let sups = _users.filter(u => u.tipo === 'supervisor' && String(u.ronda) === String(r));
                        if (estadoFilt === 'activo') sups = sups.filter(u => u.activo !== false);
                        if (estadoFilt === 'inactivo') sups = sups.filter(u => u.activo === false);
                        const fichasRonda = _fichas.filter(f => sups.some(s => s.id === f.userId));
                        const totalPessoas = fichasRonda.reduce((s,f) => s+(f.totalPessoas||0),0);
                        const lancaram = sups.filter(u => _fichas.some(f => f.userId === u.id)).length;

                        // Datas da ronda
                        const rd = rondaDatas[r] || {};
                        const fmtDt = d => d ? new Date(d+'T00:00:00').toLocaleDateString('pt-PT',{day:'2-digit',month:'short',year:'numeric'}) : '—';
                        let estadoRondaBadge = '';
                        if (rd.inicio && !rd.fim && hoje >= rd.inicio)
                          estadoRondaBadge = `<span style="background:rgba(34,197,94,.15);color:#15803d;padding:2px 8px;border-radius:8px;font-size:11px;font-weight:700">🟢 Em curso</span>`;
                        else if (rd.inicio && rd.fim && hoje > rd.fim)
                          estadoRondaBadge = `<span style="background:rgba(212,168,23,.12);color:#92400e;padding:2px 8px;border-radius:8px;font-size:11px;font-weight:700">🏁 Encerrada</span>`;
                        else if (rd.inicio && hoje < rd.inicio)
                          estadoRondaBadge = `<span style="background:rgba(14,165,233,.1);color:#0369a1;padding:2px 8px;border-radius:8px;font-size:11px;font-weight:700">⏳ Futura</span>`;

                        const datasHtml = (rd.inicio || rd.fim)
                          ? `<div style="font-size:11px;color:var(--text3);margin-top:4px">📅 ${fmtDt(rd.inicio)} → ${fmtDt(rd.fim)} &nbsp; ${estadoRondaBadge}</div>` : '';

                        html += `<div class="card" style="border-color:${rondaColor(r)};background:${rondaBg(r)};margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px">
            <div>
              <div class="card-title" style="margin:0;color:${rondaColor(r)};font-size:17px"><span class="dot" style="background:${rondaColor(r)}"></span>${rondaNome(r)}</div>
              ${datasHtml}
            </div>
            <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px">
              <span>👥 <b>${sups.length}</b> supervisores</span>
              <span>✅ <b>${sups.filter(u=>u.activo!==false).length}</b> activos</span>
              <span>🚫 <b>${sups.filter(u=>u.activo===false).length}</b> inactivos</span>
              <span>📋 <b>${fichasRonda.length}</b> fichas</span>
              <span>👤 <b>${totalPessoas.toLocaleString()}</b> pessoas</span>
              <span>🔔 <b>${lancaram}</b> lançaram</span>
            </div>
          </div>`;
                        if (!sups.length) {
                          html += `<p style="color:var(--text3);font-size:13px;text-align:center;padding:16px">Nenhum supervisor nesta ronda${estadoFilt ? ' com este estado' : ''}.</p>`;
                        } else {
                          html += `<div class="table-wrap"><table><thead><tr><th>#</th><th>Nome</th><th>Email</th><th>Coordenação</th><th>Estado</th><th>Fichas</th><th>Pessoas</th><th>Último Lançamento</th></tr></thead><tbody>`;
                          sups.forEach((u, i) => {
                            const cord = _cords.find(c => String(c.id) === String(u.coordId));
                            const fichasSup = _fichas.filter(f => f.userId === u.id);
                            const tp = fichasSup.reduce((s,f) => s+(f.totalPessoas||0),0);
                            const ultimo = fichasSup.length ? fichasSup.sort((a,b)=>(b.data||'').localeCompare(a.data||''))[0].data : null;
                            const isActivo = u.activo !== false;
                            html += `<tr style="${!isActivo ? 'opacity:.6' : ''}">
              <td>${i+1}</td>
              <td style="font-weight:600">${u.nome}</td>
              <td style="font-size:12px;color:var(--text3)">${u.email}</td>
              <td>${cord ? `<span class="badge badge-sup">${cord.nome}</span>` : '—'}</td>
              <td>${isActivo ? '<span style="color:var(--surf-dark);font-size:12px;font-weight:600">✅ Activo</span>' : '<span style="color:var(--coral);font-size:12px;font-weight:600">🚫 Inactivo</span>'}</td>
              <td style="font-family:\'JetBrains Mono\',monospace;font-weight:700">${fichasSup.length}</td>
              <td style="font-family:\'JetBrains Mono\',monospace">${tp.toLocaleString()}</td>
              <td style="font-size:12px">${ultimo || '<span style="color:var(--coral)">—</span>'}</td>
            </tr>`;
                          });
                          html += '</tbody></table></div>';
                        }
                        html += '</div>';
                      });
                      if (!html) cont.innerHTML = '<div class="card" style="text-align:center;padding:32px;color:var(--text3)">Nenhum dado encontrado.</div>';
                      else cont.innerHTML = html;
                    }

                    // COORDENAÇÕES
                    function renderCords() {
                      const tbody = document.getElementById('cordTableBody'); tbody.innerHTML = '';
                      if (!_cords.length) {
                        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text3)">Nenhuma coordenação criada</td></tr>';
                        return;
                      }
                    _cords.forEach((c, i) => {
                      const sups = _users.filter(u => u.coordId === c.id && u.tipo === 'supervisor');
                      const supNames = sups.length ? sups.map(s => s.nome).join(', ') : '<span style="color:var(--text3)">—</span>';
                      const coordenadorDisplay = c.coordenador
                        ? `<span style="font-weight:600;color:var(--primary)">${c.coordenador}</span>`
                        : '<span style="color:var(--text3)">—</span>';
                      tbody.innerHTML += `<tr>
      <td>${i + 1}</td>
      <td style="font-weight:600">${c.nome}</td>
      <td>${coordenadorDisplay}</td>
      <td style="font-size:11px;color:var(--text2)">${supNames}</td>
      <td style="display:flex;gap:6px">
        <button class="btn btn-blue btn-sm" onclick="openEditCord('${c.id}')">✏️ Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteCord('${c.id}')">🗑 Apagar</button>
      </td>
    </tr>`;
                  });
                  }
                    async function addCord() {
                      const nome = document.getElementById('cord-nome').value.trim();
                      const coordenador = (document.getElementById('cord-coordenador')?.value || '').trim();
                      if (!nome) { showToast('Insira o nome da coordenação', 'error'); return; }
                      if (_cords.find(c => c.nome.toLowerCase() === nome.toLowerCase())) { showToast('Já existe uma coordenação com este nome', 'error'); return; }
                      showLoading('A adicionar...');
                      await persistCord(nome, coordenador);
                    document.getElementById('cord-nome').value = '';
                    const cordCInput = document.getElementById('cord-coordenador');
                    if (cordCInput) cordCInput.value = '';
                    hideLoading();
                    renderCords();
                    showToast('Coordenação adicionada!', 'success');
                  }
                    async function deleteCord(id) {
                      const sups = _users.filter(u => String(u.coordId) === String(id) && u.tipo === 'supervisor');
                      if (sups.length > 0) {
                        if (!confirm(`Esta coordenação tem ${sups.length} supervisor(es) associado(s).\nApagar irá desassociá-los. Continuar?`)) return;
                      } else {
                        if (!confirm('Apagar coordenação?')) return;
                      }
                      showLoading('A apagar...');
                      await deleteCordRemote(id);
                      _users.forEach(u => { if (String(u.coordId) === String(id)) u.coordId = null; });
                      DB.set('users', _users);
                      hideLoading();
                      renderCords();
                      showToast('Coordenação apagada', 'success');
                    }

                    // ── Editar Coordenação ──
                    let _editCordId = null;
                    function openEditCord(id) {
                      const c = _cords.find(x => String(x.id) === String(id));
                      if (!c) return;
                      _editCordId = id;
                      // Criar modal inline se não existir
                      let overlay = document.getElementById('editCordOverlay');
                      if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.id = 'editCordOverlay';
                        overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)';
                        overlay.innerHTML = `
                          <div style="background:#fff;border-radius:16px;padding:32px;max-width:480px;width:94%;box-shadow:0 20px 40px rgba(0,0,0,.2);position:relative">
                            <button onclick="closeEditCord()" style="position:absolute;top:14px;right:16px;background:none;border:none;font-size:22px;cursor:pointer;color:#999">×</button>
                            <div style="font-size:18px;font-weight:800;color:var(--primary);margin-bottom:20px">✏️ Editar Coordenação</div>
                            <div class="form-field" style="margin-bottom:14px">
                              <label style="font-size:11px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:6px">Nome da Coordenação</label>
                              <input type="text" id="editCordNome" style="width:100%;background:#f9f9f9;border:1px solid var(--border-solid);border-radius:8px;padding:11px 14px;font-family:Inter,sans-serif;font-size:14px;color:var(--text)">
                            </div>
                            <div class="form-field" style="margin-bottom:20px">
                              <label style="font-size:11px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:6px">Nome do Coordenador</label>
                              <input type="text" id="editCordCoordenador" style="width:100%;background:#f9f9f9;border:1px solid var(--border-solid);border-radius:8px;padding:11px 14px;font-family:Inter,sans-serif;font-size:14px;color:var(--text)">
                            </div>
                            <div style="display:flex;gap:10px;justify-content:flex-end">
                              <button class="btn btn-outline" onclick="closeEditCord()">✕ Cancelar</button>
                              <button class="btn btn-accent" onclick="saveEditCord()">💾 Guardar</button>
                            </div>
                          </div>`;
                        document.body.appendChild(overlay);
                      }
                      document.getElementById('editCordNome').value = c.nome || '';
                      document.getElementById('editCordCoordenador').value = c.coordenador || '';
                      overlay.style.display = 'flex';
                    }
                    function closeEditCord() {
                      const o = document.getElementById('editCordOverlay'); if (o) o.style.display = 'none';
                    }
                    async function saveEditCord() {
                      const nome = document.getElementById('editCordNome').value.trim();
                      const coordenador = document.getElementById('editCordCoordenador').value.trim();
                      if (!nome) { showToast('O nome não pode estar vazio', 'error'); return; }
                      showLoading('A guardar...');
                      try {
                        await db.collection('coordenacoes').doc(String(_editCordId)).update({ nome, coordenador: coordenador || '' });
                        const c = _cords.find(x => String(x.id) === String(_editCordId));
                        if (c) { c.nome = nome; c.coordenador = coordenador; }
                        // actualizar fichas em memória
                        _fichas.forEach(f => { if (String(f.coordId) === String(_editCordId)) { f.coordNome = nome; } });
                        DB.set('coordenacoes', _cords);
                      } catch(e) {
                        const c = _cords.find(x => String(x.id) === String(_editCordId));
                        if (c) { c.nome = nome; c.coordenador = coordenador; }
                        DB.set('coordenacoes', _cords);
                      }
                      hideLoading();
                      closeEditCord();
                      renderCords();
                      showToast('Coordenação actualizada ✓', 'success');
                    }

                    // EXPORT EXCEL FICHAS
                    function exportExcel() {
                      const fichas = getVisibleFichas().slice().sort((a, b) => (b.data || '').localeCompare(a.data || ''));
                      const tp = fichas.reduce((s, f) => s + (f.totalPessoas || 0), 0);
                      const tl = fichas.reduce((s, f) => s + (f.totalLocais || 0), 0);
                      const ts = fichas.reduce((s, f) => s + (f.sim || 0), 0);
                      const tn = fichas.reduce((s, f) => s + (f.nao || 0), 0);
                      const pct = ts + tn > 0 ? Math.round(ts / (ts + tn) * 100) : 0;
                      const now = new Date().toLocaleDateString('pt-PT');

                    const TH = { font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '1A237E' } }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'medium', color: { rgb: '000000' } } } };
                    const THL = { ...TH, alignment: { horizontal: 'left' } };
                    const TD = { font: { sz: 10 }, alignment: { horizontal: 'left' }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } };
                    const TN = { font: { sz: 10 }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } };
                    const TSIM = { font: { bold: true, sz: 10, color: { rgb: '1B5E20' } }, fill: { fgColor: { rgb: 'E8F5E9' } }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } };
                    const TNAO = { font: { bold: true, sz: 10, color: { rgb: 'B71C1C' } }, fill: { fgColor: { rgb: 'FFEBEE' } }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } };
                    const TTOT = { font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '1A237E' } }, alignment: { horizontal: 'center' }, border: { top: { style: 'medium' } } };
                    const TTOTL = { ...TTOT, alignment: { horizontal: 'left' } };
                    const KPI = { font: { bold: true, sz: 13, color: { rgb: '1a237e' } }, fill: { fgColor: { rgb: 'E8F0FE' } }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'thin', color: { rgb: '9FA8DA' } } } };

                    function C(v, s) { return { v, t: typeof v === 'number' ? 'n' : 's', s: s || {} }; }
                    function CN(v, s) { return { v: v || 0, t: 'n', s: s || TN }; }

                    const ws = {};
                    let r = 0;
                    function sr(cells) { cells.forEach((c, col) => { if (c !== null) { const a = XLSX.utils.encode_cell({ c: col, r }); ws[a] = c; } }); }
                    function mg(c1, c2) { if (!ws['!merges']) ws['!merges'] = []; ws['!merges'].push({ s: { r, c: c1 }, e: { r, c: c2 } }); }

                    sr([C('SisMob — Lista de Fichas de Mobilização', { font: { bold: true, sz: 14, color: { rgb: '1a237e' } } }), null, null, null, null, null, null, null, null, null, null, null]); mg(0, 11); r++;
                    sr([C(`Gerado: ${now}  |  Por: ${currentUser.nome}`, { font: { sz: 10, color: { rgb: '555555' } } }), null, null, null, null, null, null, null, null, null, null, null]); mg(0, 11); r++;
                    r++;

                    sr([C('PESSOAS', KPI), C('LOCAIS', KPI), C('SIM', KPI), C('NÃO', KPI), C('ACEITAÇÃO', KPI), null, null, null, null, null, null, null]); mg(4, 11); r++;
                    sr([CN(tp, KPI), CN(tl, KPI), CN(ts, { ...KPI, font: { bold: true, sz: 13, color: { rgb: '1B5E20' } }, fill: { fgColor: { rgb: 'E8F5E9' } } }), CN(tn, { ...KPI, font: { bold: true, sz: 13, color: { rgb: 'B71C1C' } }, fill: { fgColor: { rgb: 'FFEBEE' } } }), C(`${pct}%`, { ...KPI, font: { bold: true, sz: 13, color: { rgb: 'E65100' } } }), null, null, null, null, null, null, null]); mg(4, 11); r++;
                    r++;

                    sr([C('#', TH), C('DATA', TH), C('MOBILIZADOR', THL), C('COORDENAÇÃO', THL), C('MUNICÍPIO', THL), C('BAIRRO', THL), C('LOCAIS', TH), C('PESSOAS', TH), C('SIM', TH), C('NÃO', TH), C('% ACEIT.', TH), C('MOTIVO', THL)]); r++;

                    fichas.forEach((f, i) => {
                      const fSim = f.sim || 0, fNao = f.nao || 0;
                      const fPct = fSim + fNao > 0 ? Math.round(fSim / (fSim + fNao) * 100) : 0;
                      sr([CN(i + 1, TN), C(f.data || '', TD), C(f.mobilizador || '', TD), C(f.coordNome || '', TD), C(f.municipio || '', TD), C(f.bairro || '', TD), CN(f.totalLocais || 0, TN), CN(f.totalPessoas || 0, { ...TN, font: { bold: true, sz: 10, color: { rgb: '01579B' } } }), CN(fSim, TSIM), CN(fNao, TNAO), C(`${fPct}%`, TN), C(f.motivo || '', TD)]); r++;
                    });

                    sr([C('', TTOTL), C('TOTAIS', TTOTL), C('', TTOTL), C('', TTOTL), C('', TTOTL), C('', TTOTL), CN(tl, TTOT), CN(tp, TTOT), CN(ts, TTOT), CN(tn, TTOT), C(`${pct}%`, TTOT), C('', TTOTL)]); r++;

                    ws['!cols'] = [{ wch: 4 }, { wch: 12 }, { wch: 22 }, { wch: 20 }, { wch: 14 }, { wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 22 }];
                    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r, c: 11 } });
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Fichas');
                    XLSX.writeFile(wb, `SisMob_Fichas_${new Date().toISOString().split('T')[0]}.xlsx`);
                    showToast('Excel exportado com formatação! ✓', 'success');
                  }

                    // PERFIL & SENHAS
                    let _pendingUpdates = [];
                    let _supEditId = null;

