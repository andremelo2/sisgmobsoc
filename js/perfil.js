                    function switchPerfilTab(el, id) {
                      document.querySelectorAll('#perfilTabs .tab').forEach(t => t.classList.remove('active'));
                      el.classList.add('active');
                    ['ptab-dados', 'ptab-senha', 'ptab-supervisores', 'ptab-sql'].forEach(s => {
                      const el2 = document.getElementById(s); if (el2) el2.style.display = s === id ? 'block' : 'none';
                    });
                  }

                    function renderPerfil() {
                      const u = currentUser;
                      document.getElementById('perf-display-nome').textContent = u.nome || '—';
                      document.getElementById('perf-display-email').textContent = u.email || '—';
                      const tipoBadge = document.getElementById('perf-display-tipo');
                      tipoBadge.textContent = u.tipo === 'admin' ? 'Administrador' : 'Supervisor';
                      tipoBadge.className = 'badge ' + (u.tipo === 'admin' ? 'badge-admin' : 'badge-sup');
                      const cord = _cords.find(c => String(c.id) === String(u.coordId));
                      const cordEl = document.getElementById('perf-display-cord');
                      cordEl.textContent = cord ? cord.nome : (u.tipo === 'admin' ? 'Acesso Global' : '—');
                      cordEl.style.display = cord || u.tipo === 'admin' ? 'inline-block' : 'none';
                      // Apply avatar (photo or initials)
                      applyAvatar(u.id, u.nome);

                    const dot = document.getElementById('perf-sb-dot');
                    const lbl = document.getElementById('perf-sb-label');
                    dot.className = 'db-dot ' + (SB_ONLINE ? 'online' : 'offline');
                    lbl.textContent = SB_ONLINE ? 'Firebase Online' : 'Modo Offline — alterações locais';

                    document.getElementById('perfilSubtitle').textContent =
                      u.tipo === 'admin' ? 'Administrador — gerir perfil e credenciais de todos os utilizadores' : 'Gerir dados pessoais e senha de acesso';

                    document.getElementById('perf-nome').value = u.nome || '';
                    document.getElementById('perf-email').value = u.email || '';
                    document.getElementById('perf-tipo').value = u.tipo === 'admin' ? 'Administrador' : 'Supervisor';
                    ['perf-senha-atual', 'perf-senha-nova', 'perf-senha-conf'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

                    const adminTabBtn = document.getElementById('ptab-admin-btn');
                    const sqlTabBtn = document.getElementById('ptab-sql-btn');
                    if (adminTabBtn) adminTabBtn.style.display = u.tipo === 'admin' ? 'block' : 'none';
                    if (sqlTabBtn) sqlTabBtn.style.display = u.tipo === 'admin' ? 'block' : 'none';

                    const firstTab = document.querySelector('#perfilTabs .tab');
                    if (firstTab) switchPerfilTab(firstTab, 'ptab-dados');

                    if (u.tipo === 'admin') {
                      renderSupTable();
                      closeSupEdit();
                      updateSqlCount();
                    }
                  }

                    function renderSupTable() {
                      const tbody = document.getElementById('supTableBody');
                      if (!tbody) return;
                      const sups = _users.filter(x => x.tipo === 'supervisor');
                      tbody.innerHTML = '';
                      if (!sups.length) {
                        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text3)">Nenhum supervisor registado</td></tr>';
                        return;
                      }
                    sups.forEach((s, i) => {
                      const cord = _cords.find(c => c.id === s.coordId);
                      const isActivo = s.activo !== false;
                      const rondaLabel = s.ronda === '1' || s.ronda === 1 ? '🔵 1ª' : s.ronda === '2' || s.ronda === 2 ? '🟢 2ª' : s.ronda === '3' || s.ronda === 3 ? '🟡 3ª' : '—';
                      tbody.innerHTML += `<tr style="${!isActivo ? 'opacity:.6;background:rgba(231,76,60,.03)' : ''}">
      <td style="font-family:'JetBrains Mono',monospace;color:var(--text3)">${i + 1}</td>
      <td style="font-weight:600">${s.nome}</td>
      <td style="color:var(--text3);font-size:12px">${s.email}</td>
      <td><span class="badge badge-sup">${cord ? cord.nome : '—'}</span></td>
      <td style="font-size:12px">${rondaLabel}</td>
      <td>${isActivo ? '<span style="color:var(--surf-dark);font-size:12px;font-weight:600">✅ Activo</span>' : '<span style="color:var(--coral);font-size:12px;font-weight:600">🚫 Inactivo</span>'}</td>
      <td style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" onclick="openSupEdit(${JSON.stringify(s.id).replace(/"/g,"'")})">✎ Editar</button>
        <button class="btn ${isActivo ? 'btn-danger' : 'btn-green'} btn-sm" onclick="openInativarModal(${JSON.stringify(s.id).replace(/"/g,"'")})">${isActivo ? '🚫 Inactivar' : '✅ Activar'}</button>
      </td>
    </tr>`;
                  });
                  }

                    function openSupEdit(id) {
                      const s = _users.find(x => x.id === id);
                      if (!s) return;
                      _supEditId = id;
                      document.getElementById('sup-edit-id').value = id;
                      document.getElementById('supEditNomeLabel').textContent = s.nome;
                      document.getElementById('sup-edit-nome').value = s.nome;
                      const cordSel = document.getElementById('sup-edit-cord');
                      cordSel.innerHTML = '<option value="">— Sem coordenação —</option>';
                      _cords.forEach(c => {
                        const opt = document.createElement('option');
                        opt.value = c.id; opt.textContent = c.nome;
                        if (c.id === s.coordId) opt.selected = true;
                        cordSel.appendChild(opt);
                      });
                      const rondaSel = document.getElementById('sup-edit-ronda');
                      if (rondaSel) rondaSel.value = s.ronda ? String(s.ronda) : '';
                    document.getElementById('sup-edit-senha').value = '';
                    document.getElementById('sup-edit-conf').value = '';
                    document.getElementById('supEditPanel').style.display = 'block';
                    document.getElementById('supEditPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }

                    function closeSupEdit() {
                      _supEditId = null;
                      const p = document.getElementById('supEditPanel');
                      if (p) p.style.display = 'none';
                    }

                    async function saveSupEdit() {
                      const id = _supEditId;
                      if (!id) { showToast('Nenhum supervisor seleccionado', 'error'); return; }
                      const nome = document.getElementById('sup-edit-nome').value.trim();
                      const senha = document.getElementById('sup-edit-senha').value;
                      const conf = document.getElementById('sup-edit-conf').value;
                      const coordIdRaw = document.getElementById('sup-edit-cord').value;
                      const coordId = coordIdRaw ? coordIdRaw : null;
                      const rondaRaw = document.getElementById('sup-edit-ronda')?.value || null;
                      const ronda = rondaRaw || null;
                      if (!nome) { showToast('O nome não pode estar vazio', 'error'); return; }
                      if (senha && senha.length < 4) { showToast('A senha deve ter pelo menos 4 caracteres', 'error'); return; }
                      if (senha && senha !== conf) { showToast('As senhas não coincidem', 'error'); return; }
                      const sup = _users.find(x => x.id === id);
                      if (!sup) return;
                      const fields = {};
                      if (nome !== sup.nome) fields.nome = nome;
                      if (senha) fields.senha = senha;
                      if (String(coordId) !== String(sup.coordId)) fields.coord_id = coordId;
                      if (String(ronda) !== String(sup.ronda)) fields.ronda = ronda;
                      if (!Object.keys(fields).length) { showToast('Nenhuma alteração para guardar', 'info'); return; }
                      showLoading('A guardar alterações...');
                    const ok = await updateUserField(id, fields);
                    if (ok && String(coordId) !== String(sup.coordId)) sup.coordId = coordId;
                    if (ok && String(ronda) !== String(sup.ronda)) sup.ronda = ronda;
                    hideLoading();
                    if (ok) {
                      if (fields.nome) {
                        _pendingUpdates.push({ type: 'nome_supervisor', userId: id, email: sup.email, nome: fields.nome });
                      }
                    if (fields.senha) {
                      _pendingUpdates.push({ type: 'senha_supervisor', userId: id, email: sup.email, nome: sup.nome, senha: fields.senha });
                    }
                    updateSqlCount();
                    renderSupTable();
                    closeSupEdit();
                      showToast(`Alterações de "${nome}" guardadas ✓`, 'success');
                    } else showToast('Erro ao guardar alterações.', 'error');
                  }

                    function updateSqlCount() {
                      const el = document.getElementById('sqlPendingCount');
                      if (!el) return;
                      const n = _pendingUpdates.length;
                      el.textContent = n > 0 ? `${n} alteração(ões) pendente(s) para exportar.` : 'Sem alterações pendentes.';
                      el.style.color = n > 0 ? 'var(--accent3)' : 'var(--text3)';
                    }

                    function toggleVer(inputId, btn) {
                      const el = document.getElementById(inputId);
                      if (!el) return;
                      el.type = el.type === 'password' ? 'text' : 'password';
                      btn.textContent = el.type === 'password' ? '👁' : '🙈';
                    }

                    function checkSenhaStrength(val, wrapId) {
                      const bar = document.getElementById(wrapId + '-bar');
                      const lbl = document.getElementById(wrapId + '-label');
                      if (!bar || !lbl) return;
                      let score = 0;
                      if (val.length >= 6) score++;
                      if (val.length >= 10) score++;
                      if (/[A-Z]/.test(val)) score++;
                      if (/[0-9]/.test(val)) score++;
                      if (/[^A-Za-z0-9]/.test(val)) score++;
                      const levels = [
                        { w: '0%', c: 'transparent', t: '' },
                        { w: '25%', c: 'var(--danger)', t: 'Fraca' },
                        { w: '50%', c: 'var(--accent3)', t: 'Razoável' },
                        { w: '75%', c: 'var(--accent2)', t: 'Boa' },
                        { w: '100%', c: 'var(--green)', t: 'Forte' },
                      ];
                    const l = levels[Math.min(score, 4)];
                    bar.style.width = l.w; bar.style.background = l.c;
                    lbl.textContent = l.t; lbl.style.color = l.c;
                  }

                    async function savePerfilNome() {
                      const nome = document.getElementById('perf-nome').value.trim();
                      if (!nome) { showToast('O nome não pode estar vazio', 'error'); return; }
                      showLoading('A guardar...');
                    const ok = await updateUserField(currentUser.id, { nome });
                    hideLoading();
                    if (ok) {
                      currentUser.nome = nome;
                      document.getElementById('sidebarName').textContent = nome;
                      document.getElementById('perf-display-nome').textContent = nome;
                      // Refresh avatar (keeps photo if uploaded, updates initials otherwise)
                      applyAvatar(currentUser.id, nome);
                      _pendingUpdates.push({ type: 'nome', userId: currentUser.id, email: currentUser.email, nome });
                      updateSqlCount();
                      showToast('Nome actualizado ✓', 'success');
                    } else showToast('Erro ao guardar.', 'error');
                  }

                    async function savePerfilSenha() {
                      const atual = document.getElementById('perf-senha-atual').value.trim();
                      const nova = document.getElementById('perf-senha-nova').value.trim();
                      const conf = document.getElementById('perf-senha-conf').value.trim();
                      if (!atual || !nova || !conf) { showToast('Preencha todos os campos de senha', 'error'); return; }
                      if (atual !== (currentUser.senha || '').trim()) { showToast('Senha actual incorrecta', 'error'); return; }
                      if (nova.length < 4) { showToast('A nova senha deve ter pelo menos 4 caracteres', 'error'); return; }
                      if (nova !== conf) { showToast('As novas senhas não coincidem', 'error'); return; }
                      showLoading('A alterar senha...');
                    const ok = await updateUserField(currentUser.id, { senha: nova });
                    hideLoading();
                    if (ok) {
                      currentUser.senha = nova;
                      _pendingUpdates.push({ type: 'senha', userId: currentUser.id, email: currentUser.email, senha: nova });
                      updateSqlCount();
                      ['perf-senha-atual', 'perf-senha-nova', 'perf-senha-conf'].forEach(id => document.getElementById(id).value = '');
                      showToast('Senha alterada ✓', 'success');
                    } else showToast('Erro ao alterar senha.', 'error');
                  }

                    function gerarSQL() {
                      const now = new Date().toLocaleString('pt-PT');
                      const nowISO = new Date().toISOString();
                      let sql = '';
                      sql += `-- ═══════════════════════════════════════════════════════════\n`;
                      sql += `-- SisMob — Actualização de Utilizadores\n`;
                      sql += `-- Gerado em : ${now}\n`;
                      sql += `-- Por       : ${currentUser.nome} (${currentUser.email})\n`;
                      sql += `-- Firebase  : ${SB_ONLINE ? 'ONLINE — alterações já aplicadas directamente' : 'OFFLINE — alterações pendentes de sincronização'}\n`;
                      sql += `-- ─────────────────────────────────────────────────────────\n`;
                      sql += `-- Instruções:\n`;
                      sql += `--   1. Aceda a https://console.firebase.google.com\n`;
                      sql += `--   2. Seleccione o projecto SisMob\n`;
                      sql += `--   3. Este ficheiro serve como auditoria das alterações\n`;
                      sql += `--   4. O Firebase sincroniza automaticamente quando online\n`;
                      sql += `-- ═══════════════════════════════════════════════════════════\n\n`;

                    if (!_pendingUpdates.length) {
                      sql += `-- ℹ️  Nenhuma alteração pendente nesta sessão.\n`;
                      if (SB_ONLINE) {
                        sql += `-- Todas as alterações foram aplicadas directamente no Firebase.\n\n`;
                      } else {
                      sql += `-- Não foram feitas alterações ou já foram exportadas anteriormente.\n\n`;
                    }
                  } else {
                    sql += `-- Total de alterações: ${_pendingUpdates.length}\n\n`;
                    _pendingUpdates.forEach((p, i) => {
                      const tipos = {
                        nome: 'Actualizar nome do Administrador',
                        senha: 'Alterar senha do Administrador',
                        nome_supervisor: 'Actualizar nome do Supervisor',
                        senha_supervisor: 'Repor senha do Supervisor'
                      };
                    sql += `-- ── Alteração ${i + 1}: ${tipos[p.type] || p.type} ──────────────\n`;
                    sql += `-- Utilizador: ${p.nome || '?'} | Email: ${p.email}\n`;
                    if (p.nome && p.type.includes('nome')) {
                      sql += `UPDATE utilizadores\n  SET nome = '${(p.nome || '').replace(/'/g, "''")}'`;
                      sql += `,\n      updated_at = '${nowISO}'`;
                      sql += `\n  WHERE id = ${p.userId}; -- ${p.email}\n\n`;
                    }
                    if (p.senha) {
                      sql += `UPDATE utilizadores\n  SET senha = '${(p.senha || '').replace(/'/g, "''")}'\n  WHERE id = ${p.userId}; -- ${p.email}\n\n`;
                    }
                  });
                  }

                    sql += `-- ── Estado actual dos utilizadores (verificação) ───────────\n`;
                    sql += `SELECT\n`;
                    sql += `  id,\n`;
                    sql += `  nome,\n`;
                    sql += `  email,\n`;
                    sql += `  tipo,\n`;
                    sql += `  coord_id,\n`;
                    sql += `  LEFT(senha,2) || REPEAT('*', GREATEST(LENGTH(senha)-2,0)) AS senha_preview\n`;
                    sql += `FROM utilizadores\n`;
                    sql += `ORDER BY tipo DESC, nome ASC;\n`;

                    document.getElementById('sqlPreview').textContent = sql;
                    document.getElementById('sqlPreviewWrap').style.display = 'block';
                    const lines = sql.split('\n').length;
                    document.getElementById('sqlLineCount').textContent = `${lines} linhas`;
                    showToast('SQL gerado com sucesso ✓', 'success');
                  }

                    function copiarSQL() {
                      const sql = document.getElementById('sqlPreview').textContent;
                      if (!sql.trim()) { showToast('Gere o SQL primeiro', 'error'); return; }
                      navigator.clipboard.writeText(sql)
                      .then(() => showToast('SQL copiado para a área de transferência ✓', 'success'))
                      .catch(() => {
                        const ta = document.createElement('textarea'); ta.value = sql; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                        showToast('SQL copiado ✓', 'success');
                      });
                  }

                    function downloadSQL() {
                      const existing = document.getElementById('sqlPreview').textContent;
                      if (!existing.trim()) gerarSQL();
                      const sql = document.getElementById('sqlPreview').textContent;
                      const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                      a.href = url; a.download = `SisMob_update_users_${ts}.sql`;
                      document.body.appendChild(a); a.click();
                      document.body.removeChild(a); URL.revokeObjectURL(url);
                      showToast('Ficheiro .sql descarregado ✓', 'success');
                    }

                    function limparPendentes() {
                      if (!_pendingUpdates.length) { showToast('Nada para limpar', 'info'); return; }
                      if (!confirm(`Limpar ${_pendingUpdates.length} alteração(ões) pendente(s)?`)) return;
                      _pendingUpdates = [];
                      updateSqlCount();
                    document.getElementById('sqlPreviewWrap').style.display = 'none';
                    document.getElementById('sqlPreview').textContent = '';
                    showToast('Pendentes limpos', 'success');
                  }

                    // UI HELPERS
