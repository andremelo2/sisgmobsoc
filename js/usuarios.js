                    function renderGraficos() {
                      const fichas = getVisibleFichas(); const ld = getLocalTotals(fichas);
                      if (chartBar2) chartBar2.destroy();
                      chartBar2 = new Chart(document.getElementById('chartBar2'), { type: 'bar', data: { labels: ld.labels, datasets: [{ label: 'Pessoas', data: ld.values, backgroundColor: ['rgba(46,134,193,.8)', 'rgba(202,138,4,.75)', 'rgba(245,158,11,.7)', 'rgba(139,92,246,.7)', 'rgba(125,78,36,.75)', 'rgba(239,68,68,.7)', 'rgba(96,165,250,.7)', 'rgba(251,191,36,.7)'], borderRadius: 8 }] }, options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#64748b' } }, y: { ticks: { color: '#64748b' } } }, responsive: true } });
                      const byDate = {}; fichas.forEach(f => { byDate[f.data] = (byDate[f.data] || 0) + (f.totalPessoas || 0) });
                      const dates = Object.keys(byDate).sort();
                      if (chartLine) chartLine.destroy();
                      chartLine = new Chart(document.getElementById('chartLine'), { type: 'line', data: { labels: dates, datasets: [{ label: 'Pessoas', data: dates.map(d => byDate[d]), borderColor: '#2e86c1', backgroundColor: 'rgba(46,134,193,.1)', tension: .4, fill: true, pointRadius: 4, pointBackgroundColor: '#2e86c1' }] }, options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#64748b' } }, y: { ticks: { color: '#64748b' } } }, responsive: true } });
                      const ts = fichas.reduce((s, f) => s + (f.sim || 0), 0), tn = fichas.reduce((s, f) => s + (f.nao || 0), 0);
                      if (chartDonut2) chartDonut2.destroy();
                      chartDonut2 = new Chart(document.getElementById('chartDonut2'), { type: 'doughnut', data: { labels: ['Sim', 'Não'], datasets: [{ data: [ts, tn], backgroundColor: ['rgba(46,134,193,.85)', 'rgba(239,68,68,.8)'], borderWidth: 0 }] }, options: { plugins: { legend: { labels: { color: '#94a3b8' } } }, responsive: true, cutout: '65%' } });
                    }

                    // UTILIZADORES
                    let _rondaFilter = 'all';

                    function filterUsersByRonda(val) {
                      _rondaFilter = val;
                      document.querySelectorAll('[id^="filtRonda"]').forEach(b => b.classList.replace('btn-accent','btn-outline'));
                      const btn = document.getElementById('filtRonda' + (val === 'all' ? 'All' : val === 'activo' ? 'Ativo' : val === 'inactivo' ? 'Inativo' : val));
                      if (btn) btn.classList.replace('btn-outline','btn-accent');
                      renderUsers();
                    }

                    function renderUsers() {
                      const tbody = document.getElementById('userTableBody'); if (!tbody) return;
                      tbody.innerHTML = '';
                      let filtered = _users;
                      if (_rondaFilter === 'activo') filtered = _users.filter(u => u.tipo !== 'admin' && u.activo !== false);
                      else if (_rondaFilter === 'inactivo') filtered = _users.filter(u => u.tipo !== 'admin' && u.activo === false);
                      else if (_rondaFilter !== 'all') filtered = _users.filter(u => String(u.ronda) === String(_rondaFilter) || u.tipo === 'admin');

                      // Stats
                      const sups = _users.filter(u => u.tipo === 'supervisor');
                      const activos = sups.filter(u => u.activo !== false).length;
                      const inativos = sups.filter(u => u.activo === false).length;
                      const lancaram = sups.filter(u => _fichas.some(f => f.userId === u.id)).length;
                      const statTotal = document.getElementById('stat-sup-total'); if (statTotal) statTotal.textContent = sups.length;
                      const statAct = document.getElementById('stat-sup-activos'); if (statAct) statAct.textContent = activos;
                      const statInact = document.getElementById('stat-sup-inativos'); if (statInact) statInact.textContent = inativos;
                      const statLanc = document.getElementById('stat-sup-lançaram'); if (statLanc) statLanc.textContent = lancaram;

                      const rondaLabel = r => r === '1' || r === 1 ? '<span style="background:rgba(14,165,233,.15);color:#0369a1;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">🔵 1ª Ronda</span>'
                        : r === '2' || r === 2 ? '<span style="background:rgba(34,197,94,.15);color:#15803d;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">🟢 2ª Ronda</span>'
                        : r === '3' || r === 3 ? '<span style="background:rgba(212,168,23,.15);color:#92400e;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">🟡 3ª Ronda</span>'
                        : '<span style="color:var(--text3);font-size:11px">—</span>';

                      filtered.forEach((u, i) => {
                        const cord = _cords.find(c => String(c.id) === String(u.coordId));
                        const protegido = u.tipo === 'admin';
                        const fichasCount = _fichas.filter(f => f.userId === u.id).length;
                        const isActivo = u.activo !== false;
                        const estadoBadge = protegido ? '' : isActivo
                          ? '<span style="background:rgba(34,197,94,.15);color:#15803d;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">✅ Activo</span>'
                          : '<span style="background:rgba(231,76,60,.15);color:var(--coral);padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">🚫 Inactivo</span>';
                        const acoes = protegido
                          ? '<span style="color:var(--text3);font-size:12px">Admin protegido</span>'
                          : `<div style="display:flex;gap:6px;flex-wrap:wrap">
                              <button class="btn btn-outline btn-sm" onclick="openInativarModal(${JSON.stringify(u.id).replace(/"/g,"'")})" title="${isActivo ? 'Inactivar' : 'Activar'}">${isActivo ? '🚫 Inactivar' : '✅ Activar'}</button>
                              <button class="btn btn-danger btn-sm" onclick="deleteUser(${JSON.stringify(u.id).replace(/"/g,"'")})">🗑</button>
                             </div>`;
                        tbody.innerHTML += `<tr style="${!isActivo && !protegido ? 'opacity:.6;background:rgba(231,76,60,.03)' : ''}">
      <td style="font-family:'JetBrains Mono',monospace;color:var(--text3)">${i + 1}</td>
      <td style="font-weight:600">${u.nome}</td>
      <td style="color:var(--text3);font-size:12px">${u.email}</td>
      <td style="font-size:12px;color:var(--text2)">${u.contacto ? `📞 ${u.contacto}` : '—'}</td>
      <td><span class="badge ${u.tipo === 'admin' ? 'badge-admin' : 'badge-sup'}">${u.tipo}</span></td>
      <td>${protegido ? '<span style="color:var(--text3)">—</span>' : rondaLabel(u.ronda)}</td>
      <td>${cord ? `<span class="badge badge-sup">${cord.nome}</span>` : '—'}</td>
      <td style="font-family:'JetBrains Mono',monospace;text-align:center">${protegido ? '—' : fichasCount}</td>
      <td>${estadoBadge}</td>
      <td>${acoes}</td>
    </tr>`;
                      });
                      if (!filtered.length) tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text3)">Nenhum utilizador encontrado</td></tr>';

                      const sel = document.getElementById('u-coord'); if (sel) { sel.innerHTML = '<option value="">— Seleccione uma coordenação —</option>'; _cords.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.nome}</option>`); }
                      renderDesempenho();
                    }

                    function toggleCordField() {
                      const isAdmin = document.getElementById('u-tipo').value === 'admin';
                      document.getElementById('u-cordField').style.display = isAdmin ? 'none' : 'flex';
                      document.getElementById('u-rondaField').style.display = isAdmin ? 'none' : 'flex';
                      document.getElementById('u-contactoField').style.display = isAdmin ? 'none' : 'flex';
                      const btn = document.getElementById('addUserBtn');
                      if (btn) btn.textContent = isAdmin ? '➕ Adicionar Administrador' : '➕ Adicionar Supervisor';
                    }

                    async function addUser() {
                      const nome = document.getElementById('u-nome').value.trim();
                      const email = document.getElementById('u-email').value.trim().toLowerCase();
                      const senha = document.getElementById('u-senha').value;
                      const tipo = document.getElementById('u-tipo').value;
                      const contacto = tipo === 'admin' ? null : (document.getElementById('u-contacto')?.value || '').trim() || null;
                      const coordId = tipo === 'admin' ? null : (document.getElementById('u-coord').value || null);
                      const ronda = tipo === 'admin' ? null : document.getElementById('u-ronda').value;
                      if (!nome || !email || !senha) { showToast('Preencha todos os campos', 'error'); return; }
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Email inválido', 'error'); return; }
                      if (senha.length < 4) { showToast('A senha deve ter pelo menos 4 caracteres', 'error'); return; }
                      if (tipo === 'supervisor' && !coordId) { showToast('Seleccione uma coordenação para o supervisor', 'error'); return; }
                      showLoading('A adicionar...');
                    try {
                      await persistUser({ nome, email, senha, tipo, coordId, ronda, contacto, activo: true });
                      ['u-nome', 'u-email', 'u-senha', 'u-contacto'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
                      renderUsers();
                      showToast('Utilizador adicionado!', 'success');
                    } catch (e) { showToast(e.message, 'error'); }
                    hideLoading();
                  }

                    async function deleteUser(id) {
                      const u = _users.find(x => x.id === id);
                      if (!u) return;
                      if (u.tipo === 'admin') { showToast('Não é possível apagar um administrador', 'error'); return; }
                      if (!confirm(`Apagar o utilizador "${u.nome}"?\nEsta acção é irreversível.`)) return;
                      showLoading('A apagar...');
                      await deleteUserRemote(id);
                      hideLoading();
                      renderUsers();
                    showToast('Utilizador apagado', 'success');
                  }

                    function openInativarModal(id) {
                      const u = _users.find(x => x.id === id);
                      if (!u) return;
                      const isActivo = u.activo !== false;
                      const msg = isActivo
                        ? `Inactivar o supervisor "${u.nome}"?\n\nEle não conseguirá entrar no sistema.`
                        : `Reactivar o supervisor "${u.nome}"?\n\nEle voltará a ter acesso ao sistema.`;
                      if (!confirm(msg)) return;
                      toggleUserActivo(id, !isActivo);
                    }

                    async function toggleUserActivo(id, novoEstado) {
                      showLoading(novoEstado ? 'A activar supervisor...' : 'A inactivar supervisor...');
                      const ok = await updateUserField(id, { activo: novoEstado });
                      hideLoading();
                      if (ok) {
                        showToast(novoEstado ? 'Supervisor activado ✓' : 'Supervisor inactivado ✓', 'success');
                        renderUsers();
                        renderSupTable();
                      }
                    }

                    function renderDesempenho() {
                      const cont = document.getElementById('desempenhoContainer'); if (!cont) return;
                      const rondaFilt = document.getElementById('desemp-ronda')?.value || '';
                      let sups = _users.filter(u => u.tipo === 'supervisor');
                      if (rondaFilt) sups = sups.filter(u => String(u.ronda) === rondaFilt);
                      if (!sups.length) { cont.innerHTML = '<p style="color:var(--text3);font-size:13px;padding:16px 0">Sem supervisores para o filtro seleccionado.</p>'; return; }
                      const rondaLabel = r => r === '1' || r === 1 ? '🔵 1ª' : r === '2' || r === 2 ? '🟢 2ª' : r === '3' || r === 3 ? '🟡 3ª' : '—';
                      let html = '<div class="table-wrap"><table><thead><tr><th>#</th><th>Supervisor</th><th>Ronda</th><th>Estado</th><th>Fichas Lançadas</th><th>Pessoas Alcançadas</th><th>Último Lançamento</th><th>Avaliação</th></tr></thead><tbody>';
                      sups.sort((a,b) => {
                        const fa = _fichas.filter(f => f.userId === a.id).length;
                        const fb = _fichas.filter(f => f.userId === b.id).length;
                        return fb - fa;
                      }).forEach((u, i) => {
                        const fichasSup = _fichas.filter(f => f.userId === u.id);
                        const totalPessoas = fichasSup.reduce((s,f) => s+(f.totalPessoas||0), 0);
                        const isActivo = u.activo !== false;
                        const lancou = fichasSup.length > 0;
                        const ultimoLanc = fichasSup.length ? fichasSup.sort((a,b) => (b.data||'').localeCompare(a.data||''))[0].data : null;
                        const avaliacao = fichasSup.length === 0 ? '<span style="color:var(--coral);font-weight:600">⚠️ Não lançou</span>' : fichasSup.length < 3 ? '<span style="color:var(--amber);font-weight:600">🟡 Poucos</span>' : '<span style="color:var(--surf-dark);font-weight:600">✅ Activo</span>';
                        html += `<tr style="${!isActivo ? 'opacity:.55' : ''}">
          <td>${i+1}</td>
          <td style="font-weight:600">${u.nome}</td>
          <td>${rondaLabel(u.ronda)}</td>
          <td>${isActivo ? '<span style="color:var(--surf-dark);font-size:12px">✅ Activo</span>' : '<span style="color:var(--coral);font-size:12px">🚫 Inactivo</span>'}</td>
          <td style="font-family:\'JetBrains Mono\',monospace;font-weight:700;color:${lancou ? 'var(--primary)' : 'var(--coral)'}">${fichasSup.length}</td>
          <td style="font-family:\'JetBrains Mono\',monospace">${totalPessoas.toLocaleString()}</td>
          <td style="font-size:12px;color:var(--text2)">${ultimoLanc || '<span style="color:var(--coral)">—</span>'}</td>
          <td>${avaliacao}</td>
        </tr>`;
                      });
                      html += '</tbody></table></div>';
                      cont.innerHTML = html;
                    }

                    // ══════════════════════════════════════════════════════
                    // RELATÓRIO POR SUPERVISOR / MOBILIZADOR
                    // ══════════════════════════════════════════════════════

                    // Agrupa fichas por mobilizador (nome normalizado), somando dados do período
                    function agrupaFichasPorMobilizador(fichas) {
                      const map = {};
                      fichas.forEach(f => {
                        const key = (f.mobilizador || '').trim().toLowerCase();
                        if (!key) return;
                        if (!map[key]) {
                          map[key] = {
                            nome: f.mobilizador,
                            coordNome: f.coordNome || '—',
                            coordId: f.coordId,
                            ronda: f.ronda,
                            userId: f.userId,
                            fichas: [],
                            totalLocais: 0, totalPessoas: 0, sim: 0, nao: 0,
                            dias: new Set()
                          };
                        }
                        map[key].fichas.push(f);
                        map[key].totalLocais  += f.totalLocais  || 0;
                        map[key].totalPessoas += f.totalPessoas || 0;
                        map[key].sim += f.sim || 0;
                        map[key].nao += f.nao || 0;
                        if (f.data) map[key].dias.add(f.data);
                        // Actualizar ronda pelo userId se disponível
                        if (!map[key].ronda && f.ronda) map[key].ronda = f.ronda;
                      });
                      return Object.values(map).sort((a,b) => b.totalPessoas - a.totalPessoas);
                    }

                    function populateRelSup() {
                      const sel = document.getElementById('relSupFiltSup'); if (!sel) return;
                      // Construir lista única de mobilizadores a partir das fichas
                      const nomes = [...new Set(getVisibleFichas().map(f => (f.mobilizador||'').trim()).filter(Boolean))].sort();
                      sel.innerHTML = '<option value="">Todos</option>';
                      nomes.forEach(n => sel.innerHTML += `<option value="${n}">${n}</option>`);
                      // Se supervisor, pré-seleccionar o próprio nome se já lançou fichas
                      if (currentUser.tipo === 'supervisor') {
                        const propFichas = _fichas.filter(f => f.userId === currentUser.id);
                        if (propFichas.length) {
                          const nomeProp = propFichas[0].mobilizador;
                          if (nomeProp) sel.value = nomeProp;
                        }
                      }
                    }

                    function applyRelSupervisor() {
                      const supFilt  = document.getElementById('relSupFiltSup')?.value  || '';
                      const rondaFilt= document.getElementById('relSupFiltRonda')?.value || '';
                      const dtI      = document.getElementById('relSupFiltDtI')?.value  || '';
                      const dtF      = document.getElementById('relSupFiltDtF')?.value  || '';

                      let fichas = getVisibleFichas();
                      if (rondaFilt) fichas = fichas.filter(f => String(f.ronda) === rondaFilt);
                      if (dtI)       fichas = fichas.filter(f => f.data >= dtI);
                      if (dtF)       fichas = fichas.filter(f => f.data <= dtF);
                      if (supFilt)   fichas = fichas.filter(f => (f.mobilizador||'').trim() === supFilt.trim());

                      // Info do período
                      const info = document.getElementById('relSupFiltInfo');
                      if (info) {
                        const parts = [];
                        if (dtI || dtF) parts.push(`Período: ${dtI||'início'} → ${dtF||'hoje'}`);
                        if (supFilt)    parts.push(`Mobilizador: ${supFilt}`);
                        if (rondaFilt)  parts.push(`Ronda: ${rondaFilt}ª`);
                        info.textContent = parts.length ? parts.join(' · ') : 'A mostrar todos os dados';
                      }

                      const grupos = agrupaFichasPorMobilizador(fichas);

                      // Stats
                      const totalPessoas = grupos.reduce((s,g)=>s+g.totalPessoas,0);
                      const totalLocais  = grupos.reduce((s,g)=>s+g.totalLocais,0);
                      const totalSim     = grupos.reduce((s,g)=>s+g.sim,0);
                      const totalNao     = grupos.reduce((s,g)=>s+g.nao,0);
                      const pctGeral     = totalSim+totalNao>0 ? Math.round(totalSim/(totalSim+totalNao)*100) : 0;
                      document.getElementById('relSupStats').innerHTML = `
                        <div class="stat-card amber"><div class="stat-icon">👤</div><div class="stat-value">${grupos.length}</div><div class="stat-label">Mobilizadores</div></div>
                        <div class="stat-card green"><div class="stat-icon">👥</div><div class="stat-value">${totalPessoas.toLocaleString()}</div><div class="stat-label">Pessoas Alcançadas</div></div>
                        <div class="stat-card blue"><div class="stat-icon">📍</div><div class="stat-value">${totalLocais}</div><div class="stat-label">Locais Visitados</div></div>
                        <div class="stat-card purple"><div class="stat-icon">✅</div><div class="stat-value">${pctGeral}%</div><div class="stat-label">Taxa de Aceitação</div></div>`;

                      const rondaLabel = r => {
                        if (!r) return '<span style="color:var(--text3);font-size:11px">—</span>';
                        const c  = r=='1'?'#0369a1':r=='2'?'#15803d':'#92400e';
                        const bg = r=='1'?'rgba(14,165,233,.12)':r=='2'?'rgba(34,197,94,.12)':'rgba(212,168,23,.12)';
                        return `<span style="background:${bg};color:${c};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">${r}ª Ronda</span>`;
                      };

                      const tbody = document.getElementById('relSupBody');
                      tbody.innerHTML = '';
                      if (!grupos.length) {
                        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--text3)">Nenhum dado para os filtros seleccionados</td></tr>';
                        document.getElementById('relSupDetalhe').style.display = 'none';
                        return;
                      }

                      grupos.forEach((g,i) => {
                        const pct = g.sim+g.nao>0 ? Math.round(g.sim/(g.sim+g.nao)*100) : 0;
                        const pctColor = pct>=70?'var(--surf-dark)':pct>=50?'var(--amber)':'var(--coral)';
                        tbody.innerHTML += `<tr style="cursor:pointer" onclick="mostrarDetalheSupRel('${g.nome.replace(/'/g,"\\'")}', ${JSON.stringify(dtI)}, ${JSON.stringify(dtF)}, ${JSON.stringify(rondaFilt)})" title="Clique para ver detalhe por dia">
                          <td style="font-family:'JetBrains Mono',monospace;color:var(--text3)">${i+1}</td>
                          <td style="font-weight:700">${g.nome} <span style="font-size:10px;color:var(--text3)">▶</span></td>
                          <td><span class="badge badge-sup">${g.coordNome}</span></td>
                          <td>${rondaLabel(g.ronda)}</td>
                          <td style="text-align:center;font-family:'JetBrains Mono',monospace">${g.dias.size}</td>
                          <td style="text-align:center;font-family:'JetBrains Mono',monospace">${g.fichas.length}</td>
                          <td style="text-align:center;font-family:'JetBrains Mono',monospace">${g.totalLocais}</td>
                          <td style="font-family:'JetBrains Mono',monospace;color:var(--accent);font-weight:700">${g.totalPessoas.toLocaleString()}</td>
                          <td style="color:var(--surf-dark)">${g.sim}</td>
                          <td style="color:var(--coral)">${g.nao}</td>
                          <td style="font-weight:700;color:${pctColor}">${pct}%</td>
                        </tr>`;
                      });

                      // Se filtrado para um só mobilizador, mostrar detalhe automaticamente
                      if (supFilt && grupos.length === 1) {
                        mostrarDetalheSupRel(grupos[0].nome, dtI, dtF, rondaFilt);
                      } else {
                        document.getElementById('relSupDetalhe').style.display = 'none';
                      }
                    }

                    function mostrarDetalheSupRel(nome, dtI, dtF, rondaFilt) {
                      let fichas = getVisibleFichas().filter(f => (f.mobilizador||'').trim().toLowerCase() === nome.trim().toLowerCase());
                      if (rondaFilt) fichas = fichas.filter(f => String(f.ronda) === rondaFilt);
                      if (dtI)       fichas = fichas.filter(f => f.data >= dtI);
                      if (dtF)       fichas = fichas.filter(f => f.data <= dtF);

                      // Agrupar por data (sem duplicar o mesmo dia)
                      const porDia = {};
                      fichas.forEach(f => {
                        const k = f.data || '—';
                        if (!porDia[k]) porDia[k] = { data: k, bairros: [], coordNome: f.coordNome||'—', totalLocais:0, totalPessoas:0, sim:0, nao:0, fichaIds:[] };
                        porDia[k].totalLocais  += f.totalLocais  || 0;
                        porDia[k].totalPessoas += f.totalPessoas || 0;
                        porDia[k].sim += f.sim || 0;
                        porDia[k].nao += f.nao || 0;
                        if (f.bairro && !porDia[k].bairros.includes(f.bairro)) porDia[k].bairros.push(f.bairro);
                        porDia[k].fichaIds.push(f.id);
                      });

                      const dias = Object.values(porDia).sort((a,b)=>(b.data||'').localeCompare(a.data||''));
                      document.getElementById('relSupDetalheTitle').textContent = `Detalhe por Dia — ${nome}`;
                      const tbody = document.getElementById('relSupDetalheBody');
                      tbody.innerHTML = '';
                      dias.forEach(d => {
                        tbody.innerHTML += `<tr>
                          <td style="font-family:'JetBrains Mono',monospace">${d.data}</td>
                          <td style="font-size:12px">${d.bairros.join(', ')||'—'}</td>
                          <td><span class="badge badge-sup">${d.coordNome}</span></td>
                          <td style="font-family:'JetBrains Mono',monospace;text-align:center">${d.totalLocais}</td>
                          <td style="font-family:'JetBrains Mono',monospace;color:var(--accent);font-weight:700">${d.totalPessoas.toLocaleString()}</td>
                          <td style="color:var(--surf-dark)">${d.sim}</td>
                          <td style="color:var(--coral)">${d.nao}</td>
                          <td>${d.fichaIds.map(id=>`<button class="btn btn-blue btn-sm" onclick="verFicha(${id})">👁</button>`).join(' ')}</td>
                        </tr>`;
                      });
                      if (!dias.length) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text3)">Sem dados no período</td></tr>';
                      document.getElementById('relSupDetalhe').style.display = 'block';
                      document.getElementById('relSupDetalhe').scrollIntoView({behavior:'smooth', block:'nearest'});
                    }

                    function clearRelSupFiltros() {
                      ['relSupFiltDtI','relSupFiltDtF'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
                      ['relSupFiltSup','relSupFiltRonda'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
                      applyRelSupervisor();
                    }

                    // ══════════════════════════════════════════════════════
                    // MOBILIZADORES — CADASTRO, AUTOCOMPLETE E GESTÃO
