                    function applyListFichasFilters() {
                      const mob   = document.getElementById('filtListMob')?.value.trim().toLowerCase() || '';
                      const cord  = document.getElementById('filtListCord')?.value || '';
                      const sup   = document.getElementById('filtListSup')?.value || '';
                      const ronda = document.getElementById('filtListRonda')?.value || '';
                      const dtI   = document.getElementById('filtListDtI')?.value || '';
                      const dtF   = document.getElementById('filtListDtF')?.value || '';
                      let fichas = getVisibleFichas().slice().sort((a, b) => (b.data || '').localeCompare(a.data || ''));
                      if (mob)   fichas = fichas.filter(f => (f.mobilizador || '').toLowerCase().includes(mob));
                      if (cord)  fichas = fichas.filter(f => String(f.coordId) === cord);
                      if (sup)   fichas = fichas.filter(f => String(f.userId) === sup);
                      if (ronda) fichas = fichas.filter(f => String(f.ronda) === ronda);
                      if (dtI)   fichas = fichas.filter(f => f.data >= dtI);
                      if (dtF)   fichas = fichas.filter(f => f.data <= dtF);
                      renderListFichasTable(fichas);
                      const cnt = document.getElementById('filtListCount');
                      if (cnt) cnt.textContent = fichas.length + ' ficha(s) encontrada(s)';
                    }

                    function clearListFichasFilters() {
                      ['filtListMob','filtListDtI','filtListDtF'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
                      ['filtListCord','filtListRonda','filtListSup'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
                      const rondaSel = document.getElementById('filtListRonda');
                      if (rondaSel) delete rondaSel.dataset.userSet;
                      applyListFichasFilters();
                    }

                    function populateListFichasCords() {
                      // Coordenação e Supervisor — só admin vê
                      const cordWrap = document.getElementById('filtListCordWrap');
                      const supWrap  = document.getElementById('filtListSupWrap');
                      if (currentUser.tipo !== 'admin') {
                        if (cordWrap) cordWrap.style.display = 'none';
                        if (supWrap)  supWrap.style.display  = 'none';
                      } else {
                        if (supWrap) supWrap.style.display = '';
                        const supSel = document.getElementById('filtListSup');
                        if (supSel) {
                          supSel.innerHTML = '<option value="">Todos</option>';
                          _users.filter(u => u.tipo === 'supervisor').sort((a,b)=>a.nome.localeCompare(b.nome))
                            .forEach(u => supSel.innerHTML += `<option value="${u.id}">${u.nome}</option>`);
                        }
                      }
                      const sel = document.getElementById('filtListCord'); if (!sel) return;
                      sel.innerHTML = '<option value="">Todas</option>';
                      _cords.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.nome}</option>`);

                      // Ronda — supervisores vêem a sua ronda pré-seleccionada se tiverem ronda definida
                      const rondaSel = document.getElementById('filtListRonda');
                      if (rondaSel && currentUser.tipo === 'supervisor' && currentUser.ronda && !rondaSel.dataset.userSet) {
                        rondaSel.value = String(currentUser.ronda);
                        rondaSel.dataset.userSet = '1';
                      }
                    }

                    function renderListFichas() {
                      populateListFichasCords();
                      applyListFichasFilters();
                    }

                    function renderListFichasTable(fichas) {
                      const rondaLabel = r => {
                        if (!r) return '<span style="color:var(--text3);font-size:11px">—</span>';
                        const c = r=='1'?'#0369a1':r=='2'?'#15803d':'#92400e';
                        const bg = r=='1'?'rgba(14,165,233,.12)':r=='2'?'rgba(46,193,94,.12)':'rgba(202,138,4,.12)';
                        return `<span style="background:${bg};color:${c};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">${r}ª Ronda</span>`;
                      };
                      const tbody = document.getElementById('listFichasBody');
                      tbody.innerHTML = '';
                      const isAdmin = currentUser && currentUser.tipo === 'admin';
                      const isSupervisor = currentUser && currentUser.tipo === 'supervisor';
                      fichas.forEach((f, i) => {
                        const podeApagar = isAdmin || (currentUser && f.userId === currentUser.id);
                        const semCoordenacao = !f.coordId || !f.coordNome;
                        const podeReatribuir = isAdmin || (isSupervisor && semCoordenacao);
                        tbody.innerHTML += `<tr>
      <td style="font-family:'JetBrains Mono',monospace;color:var(--text3)">${i + 1}</td>
      <td>${f.data || '—'}</td>
      <td style="font-weight:600">${f.mobilizador || '—'}</td>
      <td><span class="badge badge-sup" style="${semCoordenacao ? 'background:rgba(239,68,68,.12);color:var(--coral)' : ''}">${f.coordNome || '⚠️ Sem Coord.'}</span></td>
      <td>${rondaLabel(f.ronda)}</td>
      <td>${f.bairro || '—'}</td>
      <td style="font-family:'JetBrains Mono',monospace">${f.totalLocais || 0}</td>
      <td style="font-family:'JetBrains Mono',monospace;color:var(--accent)">${(f.totalPessoas || 0).toLocaleString()}</td>
      <td style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-blue btn-sm" onclick="verFicha('${f.id}')">👁 Ver</button>
        ${podeReatribuir ? `<button class="btn btn-outline btn-sm" onclick="abrirReatribuirFicha('${f.id}')" style="border-color:var(--accent);color:var(--accent)">🔄 Reatrib.</button>` : ''}
        ${podeApagar ? `<button class="btn btn-outline btn-sm" onclick="abrirEditFicha('${f.id}')" style="border-color:var(--amber);color:var(--amber)">✏️ Editar</button>` : ''}
        ${podeApagar ? `<button class="btn btn-danger btn-sm" onclick="deleteFicha('${f.id}')" title="Apagar ficha">🗑 Apagar</button>` : ''}
      </td>
    </tr>`;
                      });
                      if (!fichas.length) tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text3)">Nenhuma ficha encontrada</td></tr>';
                    }

                    function verFicha(id) {
                      const f = _fichas.find(x => String(x.id) === String(id));
                      if (!f) return;
                      const isAdmin = currentUser && currentUser.tipo === 'admin';
                      const canDelete = isAdmin || (currentUser && f.userId === currentUser.id);
                      showFichaDetail(f, canDelete, id);
                    }

                    function showFichaDetail(f, canDelete, fichaId) {
                      const locaisHTML = f.tableData ? Object.entries(f.tableData).map(([k, v]) => {
                        const loc = LOCAIS.find(l => l.key === k);
                        const locs = Array.isArray(v) ? v[0] : 0;
                        const pess = Array.isArray(v) ? v[1] : 0;
                        if (!locs && !pess) return '';
                        return `<tr><td style="padding:8px;border:1px solid var(--border)">${loc ? loc.label : k}</td><td style="padding:8px;border:1px solid var(--border);text-align:center;font-weight:600">${locs}</td><td style="padding:8px;border:1px solid var(--border);text-align:center;font-weight:600;color:var(--accent)">${pess}</td></tr>`;
                      }).filter(Boolean).join('') : '';
                      const html = `<div><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px"><div><div style="font-size:11px;font-weight:700;color:var(--text3)">Data</div><div style="font-size:14px;font-weight:600;color:var(--text)">${f.data || '—'}</div></div><div><div style="font-size:11px;font-weight:700;color:var(--text3)">Mobilizador</div><div style="font-size:14px;font-weight:600;color:var(--text)">${f.mobilizador || '—'}</div></div><div><div style="font-size:11px;font-weight:700;color:var(--text3)">Coordenação</div><div style="font-size:14px;font-weight:600;color:var(--text)">${f.coordNome || '—'}</div></div><div><div style="font-size:11px;font-weight:700;color:var(--text3)">Ronda</div><div style="font-size:14px;font-weight:600;color:var(--text)">${f.ronda ? f.ronda + 'ª Ronda' : '—'}</div></div></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px;background:rgba(14,165,233,.06);border:1px solid rgba(14,165,233,.2);border-radius:8px;margin-bottom:16px"><div style="text-align:center"><div style="font-size:10px;color:var(--text3)">Locais</div><div style="font-size:24px;font-weight:800;color:var(--primary)">${f.totalLocais || 0}</div></div><div style="text-align:center"><div style="font-size:10px;color:var(--text3)">Pessoas</div><div style="font-size:24px;font-weight:800;color:var(--surf)">${(f.totalPessoas || 0).toLocaleString()}</div></div><div style="text-align:center"><div style="font-size:10px;color:var(--text3)">Sim</div><div style="font-size:24px;font-weight:800;color:var(--primary)">${f.sim || 0}</div></div><div style="text-align:center"><div style="font-size:10px;color:var(--text3)">Não</div><div style="font-size:24px;font-weight:800;color:var(--coral)">${f.nao || 0}</div></div></div>${locaisHTML ? `<div><div style="font-size:13px;font-weight:700;margin-bottom:10px">Detalhes por Local</div><table style="width:100%;border-collapse:collapse"><thead><tr style="background:var(--bg3)"><th style="padding:10px;text-align:left;font-size:12px;font-weight:700">Local</th><th style="padding:10px;text-align:center;font-size:12px;font-weight:700">Locais</th><th style="padding:10px;text-align:center;font-size:12px;font-weight:700">Pessoas</th></tr></thead><tbody>${locaisHTML}</tbody></table></div>` : ''}${f.motivo ? `<div style="padding:12px;background:rgba(202,138,4,.1);border-left:3px solid var(--amber);margin-top:16px"><div style="font-size:11px;font-weight:700;color:var(--text3)">Motivo da Recusa</div><div style="font-size:13px;color:var(--text)">${f.motivo}</div></div>` : ''}</div>`;
                      document.getElementById('fichaDetailContent').innerHTML = html;
                      const deleteBtn = document.getElementById('fichaDetailDeleteBtn');
                      if (deleteBtn) {
                        deleteBtn.style.display = canDelete ? 'block' : 'none';
                        deleteBtn.dataset.fichaId = fichaId;
                      }
                      const editBtn = document.getElementById('fichaDetailEditBtn');
                      if (editBtn) {
                        editBtn.style.display = canDelete ? 'inline-flex' : 'none';
                        editBtn.dataset.fichaId = fichaId;
                      }
                      document.getElementById('fichaDetailOverlay').classList.add('show');
                    }
                    function closeFichaDetail() {
                      document.getElementById('fichaDetailOverlay').classList.remove('show');
                    }
                    function printFichaDetail() {
                      const content = document.getElementById('fichaDetailContent').innerHTML;
                      document.getElementById('printArea').innerHTML = `<div style="font-family:Arial,sans-serif;padding:20px">${content}</div>`;
                      window.print();
                    }
                    function editFichaFromModal() {
                      const fichaId = document.getElementById('fichaDetailEditBtn').dataset.fichaId;
                      if (fichaId) { closeFichaDetail(); abrirEditFicha(fichaId); }
                    }
                    function deleteFichaFromModal() {
                      const fichaId = document.getElementById('fichaDetailDeleteBtn').dataset.fichaId;
                      if (fichaId) {
                        deleteFicha(fichaId);
                        closeFichaDetail();
                      }
                    }

                    // ── Modal de Edição de Ficha ──
                    function abrirEditFicha(id) {
                      const f = _fichas.find(x => String(x.id) === String(id));
                      if (!f) { showToast('Ficha não encontrada', 'error'); return; }
                      const isAdmin = currentUser && currentUser.tipo === 'admin';
                      const podeEditar = isAdmin || (currentUser && String(f.userId) === String(currentUser.id));
                      if (!podeEditar) { showToast('Sem permissão para editar esta ficha', 'error'); return; }

                      let overlay = document.getElementById('editFichaOverlay');
                      if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.id = 'editFichaOverlay';
                        overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);overflow-y:auto;padding:20px 10px';
                        document.body.appendChild(overlay);
                      }
                      const cordsOptions = _cords.map(c => `<option value="${c.id}" ${String(c.id)===String(f.coordId)?'selected':''}>${c.nome}</option>`).join('');
                      overlay.innerHTML = `
                        <div style="background:#fff;border-radius:16px;padding:28px;max-width:560px;width:100%;box-shadow:0 20px 40px rgba(0,0,0,.2);position:relative;margin:auto">
                          <button onclick="fecharEditFicha()" style="position:absolute;top:14px;right:16px;background:none;border:none;font-size:22px;cursor:pointer;color:#999">×</button>
                          <div style="font-size:18px;font-weight:800;color:var(--primary);margin-bottom:20px">✏️ Editar Ficha</div>
                          <input type="hidden" id="ef-id" value="${f.id}">
                          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
                            <div>
                              <label style="font-size:11px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Data</label>
                              <input type="date" id="ef-data" value="${f.data||''}" style="width:100%;background:#f9f9f9;border:1px solid var(--border-solid);border-radius:8px;padding:10px 12px;font-family:Inter,sans-serif;font-size:13px">
                            </div>
                            <div>
                              <label style="font-size:11px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Bairro</label>
                              <input type="text" id="ef-bairro" value="${f.bairro||''}" style="width:100%;background:#f9f9f9;border:1px solid var(--border-solid);border-radius:8px;padding:10px 12px;font-family:Inter,sans-serif;font-size:13px">
                            </div>
                            <div>
                              <label style="font-size:11px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Mobilizador</label>
                              <input type="text" id="ef-mobilizador" value="${f.mobilizador||''}" style="width:100%;background:#f9f9f9;border:1px solid var(--border-solid);border-radius:8px;padding:10px 12px;font-family:Inter,sans-serif;font-size:13px">
                            </div>
                            <div>
                              <label style="font-size:11px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Coordenação</label>
                              <select id="ef-cord" style="width:100%;background:#f9f9f9;border:1px solid var(--border-solid);border-radius:8px;padding:10px 12px;font-family:Inter,sans-serif;font-size:13px;color:var(--text)">${cordsOptions}</select>
                            </div>
                            <div>
                              <label style="font-size:11px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Responderam Sim</label>
                              <input type="number" id="ef-sim" value="${f.sim||0}" min="0" style="width:100%;background:#f9f9f9;border:1px solid var(--border-solid);border-radius:8px;padding:10px 12px;font-family:Inter,sans-serif;font-size:13px">
                            </div>
                            <div>
                              <label style="font-size:11px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Responderam Não</label>
                              <input type="number" id="ef-nao" value="${f.nao||0}" min="0" style="width:100%;background:#f9f9f9;border:1px solid var(--border-solid);border-radius:8px;padding:10px 12px;font-family:Inter,sans-serif;font-size:13px">
                            </div>
                          </div>
                          <div style="margin-bottom:16px">
                            <label style="font-size:11px;font-weight:700;color:#333;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Motivo de Recusa</label>
                            <input type="text" id="ef-motivo" value="${(f.motivo||'').replace(/"/g,'&quot;')}" placeholder="Opcional" style="width:100%;background:#f9f9f9;border:1px solid var(--border-solid);border-radius:8px;padding:10px 12px;font-family:Inter,sans-serif;font-size:13px">
                          </div>
                          <div style="background:rgba(26,82,118,.06);border:1px solid rgba(26,82,118,.15);border-radius:10px;padding:12px;margin-bottom:16px;font-size:12px;color:var(--text2)">
                            ℹ️ Para alterar os valores de locais e pessoas por tipo, apague esta ficha e crie uma nova.
                          </div>
                          <div style="display:flex;gap:10px;justify-content:flex-end">
                            <button class="btn btn-outline" onclick="fecharEditFicha()">✕ Cancelar</button>
                            <button class="btn btn-accent" onclick="guardarEditFicha()">💾 Guardar Alterações</button>
                          </div>
                        </div>`;
                      overlay.style.display = 'flex';
                    }
                    function fecharEditFicha() {
                      const o = document.getElementById('editFichaOverlay'); if (o) o.style.display = 'none';
                    }
                    async function guardarEditFicha() {
                      const id = document.getElementById('ef-id').value;
                      const f = _fichas.find(x => String(x.id) === String(id));
                      if (!f) { showToast('Ficha não encontrada', 'error'); return; }
                      const data = document.getElementById('ef-data').value;
                      const bairro = document.getElementById('ef-bairro').value.trim();
                      const mobilizador = document.getElementById('ef-mobilizador').value.trim();
                      const cordId = document.getElementById('ef-cord').value;
                      const sim = parseInt(document.getElementById('ef-sim').value) || 0;
                      const nao = parseInt(document.getElementById('ef-nao').value) || 0;
                      const motivo = document.getElementById('ef-motivo').value.trim();
                      if (!data || !bairro || !mobilizador) { showToast('Data, Bairro e Mobilizador são obrigatórios', 'error'); return; }
                      const cord = _cords.find(c => String(c.id) === String(cordId));
                      const fichaAtualizada = { ...f, data, bairro, mobilizador, coordId: cordId, coordNome: cord ? cord.nome : f.coordNome, sim, nao, motivo: motivo || null };
                      showLoading('A guardar alterações...');
                      const ok = await updateFichaRemote(id, fichaAtualizada);
                      if (ok) {
                        const idx = _fichas.findIndex(x => String(x.id) === String(id));
                        if (idx >= 0) _fichas[idx] = fichaAtualizada;
                        DB.set('fichas', _fichas);
                        fecharEditFicha();
                        renderListFichas();
                        showToast('Ficha actualizada com sucesso ✓', 'success');
                      } else { showToast('Erro ao guardar. Verifique a ligação.', 'error'); }
                      hideLoading();
                    }

                    async function deleteFicha(id) {
                      // Verificar permissão: admin pode apagar qualquer ficha, supervisor só as suas
                      if (!currentUser) return;
                      const f = _fichas.find(x => String(x.id) === String(id));
                      if (!f) { showToast('Ficha não encontrada', 'error'); return; }
                      if (currentUser.tipo !== 'admin' && String(f.userId) !== String(currentUser.id)) {
                        showToast('Sem permissão para apagar esta ficha', 'error'); return;
                      }
                      const confirmMsg = `⚠️ Apagar a ficha de "${f.mobilizador || '?'}" do dia ${f.data || '?'}?\n\nEsta acção é IRREVERSÍVEL.`;
                      if (!confirm(confirmMsg)) return;
                      showLoading('A apagar ficha...');
                      try {
                        await db.collection('fichas_mobilizacao').doc(String(id)).delete();
                        // Remover também do array local
                        _fichas = _fichas.filter(x => x.id !== id);
                        DB.set('fichas', _fichas);
                        hideLoading();
                        showToast('Ficha apagada com sucesso', 'success');
                        renderListFichas();
                        updateTopbar();
                      } catch(e) {
                        console.error('deleteFicha:', e);
                        hideLoading();
                        showToast('Erro ao apagar. Verifique a ligação.', 'error');
                      }
                    }

                    // Reatribuir ficha a uma coordenação
                    async function abrirReatribuirFicha(fichaId) {
                      const f = _fichas.find(x => String(x.id) === String(fichaId));
                      if (!f) return;
                      const isAdmin = currentUser && currentUser.tipo === 'admin';
                      const isSupervisor = currentUser && currentUser.tipo === 'supervisor';
                      if (!isAdmin && !isSupervisor) {
                        showToast('Sem permissão para reatribuir', 'error');
                        return;
                      }
                      
                      let html = `
                        <div style="padding:20px">
                          <h3 style="margin:0 0 16px 0;color:var(--text)">🔄 Reatribuir Ficha</h3>
                          <p style="color:var(--text2);margin:0 0 12px 0">
                            <strong>${f.mobilizador}</strong> — ${f.data || '—'} — ${f.bairro || '—'}
                          </p>
                          <label style="font-size:12px;font-weight:600;color:var(--text2);text-transform:uppercase;display:block;margin-bottom:8px">Seleccionar Coordenação Destino</label>
                          <select id="reatrib-cord-sel" style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--text);font-size:13px;cursor:pointer">
                            <option value="">— Escolher coordenação —</option>`;
                      _cords.forEach(c => {
                        html += `<option value="${c.id}">${c.nome}</option>`;
                      });
                      html += `
                          </select>
                          <div style="display:flex;gap:8px;margin-top:20px;justify-content:flex-end">
                            <button class="btn btn-outline" onclick="document.getElementById('reatribOverlay').style.display='none'">Cancelar</button>
                            <button class="btn btn-blue" onclick="confirmarReatribuirFicha('${fichaId}')">✓ Reatribuir</button>
                          </div>
                        </div>`;
                      
                      let overlay = document.getElementById('reatribOverlay');
                      if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.id = 'reatribOverlay';
                        overlay.className = 'mob-profile-overlay';
                        overlay.onclick = function(e) { if(e.target === this) this.style.display = 'none'; };
                        document.body.appendChild(overlay);
                      }
                      overlay.innerHTML = `<div class="mob-profile-modal" style="max-width:400px">${html}</div>`;
                      overlay.style.display = 'flex';
                    }

                    async function confirmarReatribuirFicha(fichaId) {
                      const cordId = document.getElementById('reatrib-cord-sel')?.value;
                      if (!cordId) {
                        showToast('Seleccione uma coordenação', 'error');
                        return;
                      }
                      
                      const f = _fichas.find(x => String(x.id) === String(fichaId));
                      if (!f) return;
                      
                      const cord = _cords.find(c => c.id == cordId);
                      if (!cord) return;
                      
                      showLoading('A reatribuir ficha...');
                      const fichaAtualizada = {
                        ...f,
                        coordId: cord.id,
                        coordNome: cord.nome
                      };
                      
                      try {
                        await updateFichaRemote(fichaId, fichaAtualizada);
                        const idx = _fichas.findIndex(x => String(x.id) === String(fichaId));
                        if (idx >= 0) _fichas[idx] = fichaAtualizada;
                        DB.set('fichas', _fichas);
                        hideLoading();
                        showToast(`Ficha reatribuída para ${cord.nome}`, 'success');
                        document.getElementById('reatribOverlay').style.display = 'none';
                        renderListFichas();
                        updateTopbar();
                      } catch(e) {
                        console.error('confirmarReatribuirFicha:', e);
                        hideLoading();
                        showToast('Erro ao reatribuir. Verifique a ligação.', 'error');
                      }
                    }
                        console.error('deleteFicha:', e);
                        // Mesmo que falhe no Firebase, remove localmente
                        _fichas = _fichas.filter(x => x.id !== id);
                        DB.set('fichas', _fichas);
                        hideLoading();
                        showToast('Ficha removida localmente (erro Firebase: ' + e.message + ')', 'info');
                        renderListFichas();
                        updateTopbar();
                      }
                    }

