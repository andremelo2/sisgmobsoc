                    function buildFichaTable() {
                      const tbody = document.getElementById('fichaBody');
                      tbody.innerHTML = '';

                    // Casa a casa section
                    const casaRow = document.createElement('tr');
                    casaRow.innerHTML = `<td class="loc-cell">Casa a casa</td>
    <td><input class="num-input" type="number" min="0" placeholder="0" data-loc="casa" data-col="0" oninput="calcFicha()" onfocus="this.select()"></td>
    <td><input class="num-input" type="number" min="0" placeholder="0" data-loc="casa" data-col="1" oninput="calcFicha()" onfocus="this.select()"></td>`;
                    tbody.appendChild(casaRow);

                    // Subtotal row for Casa a casa
                    const subCasa = document.createElement('tr'); subCasa.className = 'ficha-sub-row';
                    subCasa.innerHTML = `<td class="loc-cell" style="font-size:10px;color:var(--accent2)">↳ SUB-TOTAL Casa a Casa</td>
    <td class="subtotal-cell" id="scasa-tot-loc">0</td>
    <td class="subtotal-cell" id="scasa-tot">0</td>`;
                    tbody.appendChild(subCasa);

                    // Separator for Other Locations
                    const sepRow = document.createElement('tr');
                    sepRow.innerHTML = `<td colspan="3" style="background:var(--bg2);padding:6px 12px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border:1px solid var(--border)">Outros Locais de Mobilização</td>`;
                    tbody.appendChild(sepRow);

                    // Other locations
                    const otherLocais = LOCAIS.filter(l => l.group === 'other');
                    otherLocais.forEach(loc => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td class="loc-cell">${loc.label}</td>
      <td><input class="num-input" type="number" min="0" placeholder="0" data-loc="${loc.key}" data-col="0" oninput="calcFicha()" onfocus="this.select()"></td>
      <td><input class="num-input" type="number" min="0" placeholder="0" data-loc="${loc.key}" data-col="1" oninput="calcFicha()" onfocus="this.select()"></td>`;
                    tbody.appendChild(tr);
                  });

                    // Subtotal row for other locations
                    const subOther = document.createElement('tr'); subOther.className = 'ficha-sub-row';
                    subOther.innerHTML = `<td class="loc-cell" style="font-size:10px;color:var(--accent2)">↳ SUB-TOTAL Outros Locais</td>
    <td class="subtotal-cell" id="sother-tot-loc">0</td>
    <td class="subtotal-cell" id="sother-tot">0</td>`;
                    tbody.appendChild(subOther);

                    // Footer
                    document.getElementById('fichaFoot').innerHTML = `<tr class="ficha-total-row">
    <td style="font-size:12px">TOTAL GERAL</td>
    <td id="tgrand-vis" style="font-size:14px;background:rgba(0,212,170,.18)">0</td>
    <td id="tgrand" style="font-size:14px;background:rgba(14,165,233,.18);color:var(--accent2)">0</td>
   </tr>`;
                    calcFicha();
                  }

                    function calcFicha() {
                      let grandLocais = 0, grandPessoas = 0, casaLocais = 0, casaPessoas = 0, otherLocais = 0, otherPessoas = 0;

                    LOCAIS.forEach(loc => {
                      const vLoc = parseInt(document.querySelector(`input[data-loc="${loc.key}"][data-col="0"]`)?.value) || 0;
                      const vPes = parseInt(document.querySelector(`input[data-loc="${loc.key}"][data-col="1"]`)?.value) || 0;
                      grandLocais += vLoc; grandPessoas += vPes;
                      if (loc.group === 'casa') { casaLocais += vLoc; casaPessoas += vPes; }
                      else { otherLocais += vLoc; otherPessoas += vPes; }
                    });

                    const sctL = document.getElementById('scasa-tot-loc'); if (sctL) sctL.textContent = casaLocais;
                    const sct = document.getElementById('scasa-tot'); if (sct) sct.textContent = casaPessoas;
                    const sotL = document.getElementById('sother-tot-loc'); if (sotL) sotL.textContent = otherLocais;
                    const sot = document.getElementById('sother-tot'); if (sot) sot.textContent = otherPessoas;
                    const tgv = document.getElementById('tgrand-vis'); if (tgv) tgv.textContent = grandLocais;
                    const tg = document.getElementById('tgrand'); if (tg) tg.textContent = grandPessoas;

                    const sbP = document.getElementById('sb-pessoas'); if (sbP) sbP.textContent = grandPessoas.toLocaleString();
                    const sbL = document.getElementById('sb-locais'); if (sbL) sbL.textContent = grandLocais;
                    const sbC = document.getElementById('sb-casa'); if (sbC) sbC.textContent = casaPessoas.toLocaleString();
                    const sbO = document.getElementById('sb-outros'); if (sbO) sbO.textContent = otherPessoas.toLocaleString();
                  }

                    function calcSimNao() {
                      const s = parseInt(document.getElementById('f-sim').value) || 0;
                      const n = parseInt(document.getElementById('f-nao').value) || 0;
                      const t = s + n, pct = t > 0 ? Math.round(s / t * 100) : 0;
                      document.getElementById('simNaoDisplay').textContent = `Total de respostas: ${t} | Aceitação: ${pct}%`;
                    }

                    function getFichaData() {
                      const d = {};
                      LOCAIS.forEach(loc => {
                        d[loc.key] = [
                          parseInt(document.querySelector(`input[data-loc="${loc.key}"][data-col="0"]`)?.value) || 0,
                          parseInt(document.querySelector(`input[data-loc="${loc.key}"][data-col="1"]`)?.value) || 0
                        ];
                      });
                      return d;
                    }
                    function getFichaTotals() {
                      let tl = 0, tp = 0;
                      LOCAIS.forEach(loc => {
                        tl += (parseInt(document.querySelector(`input[data-loc="${loc.key}"][data-col="0"]`)?.value) || 0);
                        tp += (parseInt(document.querySelector(`input[data-loc="${loc.key}"][data-col="1"]`)?.value) || 0);
                      });
                    return { totalLocais: tl, totalPessoas: tp };
                  }

                    async function saveFicha() {
                      const mob    = document.getElementById('f-mobilizador').value.trim();
                      const dt     = document.getElementById('f-data').value;
                      const bairro = document.getElementById('f-bairro').value.trim();
                      if (!mob || !dt || !bairro) { showToast('Preencha o Bairro, Nome do Mobilizador e Data', 'error'); return; }

                      let selectedCoordId, selectedCoordNome;
                      if (currentUser.tipo === 'admin') {
                        const sel = document.getElementById('f-coordenacao');
                        selectedCoordId = sel ? parseInt(sel.value) : null;
                        const cord = _cords.find(c => c.id === selectedCoordId);
                        selectedCoordNome = cord ? cord.nome : '';
                        if (!selectedCoordId) { showToast('Seleccione uma coordenação destino', 'error'); return; }
                      } else {
                        selectedCoordId = currentUser.coordId;
                        const cord = _cords.find(c => c.id === currentUser.coordId);
                        selectedCoordNome = cord ? cord.nome : '';
                      }

                      const { totalLocais, totalPessoas } = getFichaTotals();
                      const novaTableData = getFichaData();
                      const novaSim    = parseInt(document.getElementById('f-sim').value)   || 0;
                      const novaNao    = parseInt(document.getElementById('f-nao').value)   || 0;
                      const novoMotivo = document.getElementById('f-motivo').value.trim();

                      const btn       = document.getElementById('btnSave');
                      const mobileBtn = document.getElementById('mobileBtnSave');
                      if (btn)       btn.disabled       = true;
                      if (mobileBtn) mobileBtn.disabled = true;

                      // ── Verificar se já existe ficha deste mobilizador no mesmo dia ──
                      const fichaExistente = getVisibleFichas().find(f =>
                        (f.mobilizador||'').trim().toLowerCase() === mob.toLowerCase() && f.data === dt
                      );

                      showLoading(fichaExistente ? 'A somar dados à ficha existente...' : 'A guardar ficha...');

                      if (fichaExistente) {
                        // Merge: somar tableData locais a locais, pessoas a pessoas
                        const mergedTableData = { ...fichaExistente.tableData };
                        Object.keys(novaTableData).forEach(k => {
                          const nv = novaTableData[k];
                          const vv = mergedTableData[k];
                          if (Array.isArray(nv)) {
                            mergedTableData[k] = [
                              ((Array.isArray(vv) ? vv[0] : 0) || 0) + (nv[0] || 0),
                              ((Array.isArray(vv) ? vv[1] : 0) || 0) + (nv[1] || 0)
                            ];
                          }
                        });
                        let mLocais = 0, mPessoas = 0;
                        Object.values(mergedTableData).forEach(v => { if (Array.isArray(v)) { mLocais += v[0]||0; mPessoas += v[1]||0; } });
                        const fichaAtualizada = {
                          ...fichaExistente,
                          tableData: mergedTableData,
                          totalLocais:  mLocais,
                          totalPessoas: mPessoas,
                          sim:    (fichaExistente.sim || 0) + novaSim,
                          nao:    (fichaExistente.nao || 0) + novaNao,
                          motivo: novoMotivo || fichaExistente.motivo || null,
                          bairro: bairro || fichaExistente.bairro
                        };
                        const ok = await updateFichaRemote(fichaExistente.id, fichaAtualizada);
                        hideLoading();
                        if (btn)       btn.disabled       = false;
                        if (mobileBtn) mobileBtn.disabled = false;
                        if (ok) {
                          const idx = _fichas.findIndex(f => f.id === fichaExistente.id);
                          if (idx >= 0) _fichas[idx] = fichaAtualizada;
                          const fichasDB = DB.get('fichas') || [];
                          const idxDB = fichasDB.findIndex(f => f.id === fichaExistente.id);
                          if (idxDB >= 0) { fichasDB[idxDB] = fichaAtualizada; DB.set('fichas', fichasDB); }
                          const rondaTexto = currentUser.ronda ? ` · Ronda ${currentUser.ronda}ª` : '';
                          showSaveConfirm({ bairro, mobilizador: mob, data: dt, totalPessoas: fichaAtualizada.totalPessoas, totalLocais: fichaAtualizada.totalLocais, sim: fichaAtualizada.sim, coordNome: selectedCoordNome, ronda: rondaTexto, merged: true });
                          resetFicha();
                        } else showToast('Erro ao actualizar ficha. Verifique a ligação.', 'error');
                        return;
                      }

                      // ── Nova ficha ──
                      const ficha = {
                        id: Date.now(), provincia: 'CUANZA-SUL', municipio: 'SUMBE', comuna: 'SEDE',
                        bairro, data: dt, mobilizador: mob, telefone: '',
                        coordId: selectedCoordId, coordNome: selectedCoordNome,
                        userId: currentUser.id, ronda: currentUser.ronda || null,
                        tableData: novaTableData, totalLocais, totalPessoas,
                        sim: novaSim, nao: novaNao, motivo: novoMotivo
                      };
                      const ok = await persistFicha(ficha);
                      hideLoading();
                      if (btn)       btn.disabled       = false;
                      if (mobileBtn) mobileBtn.disabled = false;
                      if (ok) {
                        const rondaTexto = currentUser.ronda ? ` · Ronda ${currentUser.ronda}ª` : '';
                        notifyFichaGuardada(mob, bairro, totalPessoas);
                        showSaveConfirm({ bairro, mobilizador: mob, data: dt, totalPessoas, totalLocais, sim: novaSim, coordNome: selectedCoordNome, ronda: rondaTexto, merged: false });
                        resetFicha();
                      } else showToast('Erro ao guardar. Verifique a ligação.', 'error');
                    }

                    function resetFicha() {
                      ['f-bairro', 'f-mobilizador', 'f-motivo'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
                      document.getElementById('f-sim').value = 0; document.getElementById('f-nao').value = 0;
                      setTodayDate();
                    document.querySelectorAll('.num-input').forEach(i => i.value = '');
                    calcFicha(); calcSimNao();
                  }
                    function setTodayDate() { const el = document.getElementById('f-data'); if (el) el.value = new Date().toISOString().split('T')[0]; }
                    function updateCoordField() {
                      const wrap = document.getElementById('f-coordenacao-wrap');
                      if (!wrap) return;
                      // Mostrar ronda activa no subtitle
                      const sub = document.getElementById('fichaSubtitle');
                      if (sub) {
                        if (currentUser.tipo === 'supervisor' && currentUser.ronda) {
                          const rondaColors = {'1':'#0369a1','2':'#15803d','3':'#92400e'};
                          const rondaBgs   = {'1':'rgba(14,165,233,.1)','2':'rgba(34,197,94,.1)','3':'rgba(212,168,23,.1)'};
                          const rondaIcons = {'1':'🔵','2':'🟢','3':'🟡'};
                          const r = String(currentUser.ronda);
                          const cor = rondaColors[r] || 'var(--text2)';
                          const bg  = rondaBgs[r]   || 'rgba(0,0,0,.06)';
                          const ic  = rondaIcons[r]  || '⚪';
                          sub.innerHTML = `Registo de actividade do mobilizador &nbsp;·&nbsp; <span style="background:${bg};color:${cor};padding:2px 10px;border-radius:20px;font-weight:700;font-size:12px;border:1px solid ${cor}33">${ic} ${r}ª Ronda activa</span>`;
                        } else if (currentUser.tipo === 'supervisor') {
                          sub.innerHTML = `Registo de actividade do mobilizador &nbsp;·&nbsp; <span style="background:rgba(212,168,23,.1);color:var(--amber);padding:2px 10px;border-radius:20px;font-weight:600;font-size:12px;border:1px solid rgba(212,168,23,.3)">⚠️ Sem ronda atribuída</span>`;
                        } else {
                          sub.textContent = 'Registo de actividade do mobilizador';
                        }
                      }
                      if (currentUser.tipo === 'admin') {
                        let opts = _cords.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
                        wrap.innerHTML = `<label style="font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.5px">Coordenação</label>
      <select id="f-coordenacao" style="background:var(--bg2);border:1px solid var(--accent);border-radius:8px;padding:10px 14px;color:var(--text);font-family:'Inter',sans-serif;font-size:13px;transition:.2s">
        ${opts}
      </select>
      <span style="font-size:10px;color:var(--accent);margin-top:2px">✎ Admin — escolha a coordenação destino</span>`;
                    } else {
                      const cord = _cords.find(c => c.id === currentUser.coordId);
                      wrap.innerHTML = `<label style="font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.5px">Coordenação</label>
      <input type="text" value="${cord ? cord.nome : '—'}" readonly style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px 14px;color:var(--text);font-family:'Inter',sans-serif;font-size:13px;cursor:not-allowed">`;
                    }
                  }

                    function getVisibleFichas() { return currentUser.tipo === 'admin' ? _fichas : _fichas.filter(f => f.userId === currentUser.id); }

                    // PAGE ROUTING
                    let chartBar = null, chartDonut = null, chartBar2 = null, chartLine = null, chartDonut2 = null;

