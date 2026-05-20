                    // CONSOLIDADO
                    // ── Consolidado: gestão de abas ──
                    function switchConsolidadoTab(el, id) {
                      document.querySelectorAll('#consolidadoTabs .tab').forEach(t => t.classList.remove('active'));
                      el.classList.add('active');
                      ['cons-geo','cons-rh'].forEach(s => {
                        const el2 = document.getElementById(s);
                        if (el2) el2.style.display = s === id ? 'block' : 'none';
                      });
                      if (id === 'cons-rh') renderRH();
                    }

                    // ── Popular filtro de coordenações no Consolidado ──
                    function populateConsFiltCord() {
                      const sel = document.getElementById('consFiltCord');
                      if (!sel) return;
                      const cur = sel.value;
                      sel.innerHTML = '<option value="">Todas</option>';
                      _cords.forEach(c => {
                        const o = document.createElement('option');
                        o.value = c.id; o.textContent = c.nome;
                        sel.appendChild(o);
                      });
                      sel.value = cur;
                    }

                    function clearConsFilters() {
                      ['consFiltCord','consFiltRonda','consFiltDtI','consFiltDtF'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.value = '';
                      });
                      renderConsolidado();
                    }

                    function renderConsolidado() {
                      populateConsFiltCord();

                      // mostrar aba RH só para admin
                      const rhTab = document.getElementById('cons-rh-tab');
                      if (rhTab) rhTab.style.display = currentUser && currentUser.tipo === 'admin' ? 'block' : 'none';

                      let fichas = getVisibleFichas();

                      // aplicar filtros
                      const filtCord  = document.getElementById('consFiltCord')?.value  || '';
                      const filtRonda = document.getElementById('consFiltRonda')?.value || '';
                      const filtDtI   = document.getElementById('consFiltDtI')?.value   || '';
                      const filtDtF   = document.getElementById('consFiltDtF')?.value   || '';

                      if (filtCord)  fichas = fichas.filter(f => f.coordId === filtCord || f.coordNome === (_cords.find(c=>c.id===filtCord)||{}).nome);
                      if (filtRonda) fichas = fichas.filter(f => String(f.ronda) === filtRonda);
                      if (filtDtI)   fichas = fichas.filter(f => f.data >= filtDtI);
                      if (filtDtF)   fichas = fichas.filter(f => f.data <= filtDtF);

                      // agrupar por bairro
                      const map = {};
                      fichas.forEach(f => {
                        const k = `${f.provincia}|${f.municipio}|${f.comuna||'—'}|${f.bairro||'—'}`;
                        if (!map[k]) map[k] = {
                          provincia: f.provincia, municipio: f.municipio,
                          comuna: f.comuna||'—', bairro: f.bairro||'—',
                          coordNome: f.coordNome||'—',
                          fichas:0, locais:0, pessoas:0, sim:0, nao:0
                        };
                        map[k].fichas++;
                        map[k].locais  += f.totalLocais  || 0;
                        map[k].pessoas += f.totalPessoas || 0;
                        map[k].sim     += f.sim || 0;
                        map[k].nao     += f.nao || 0;
                      });

                      const rows = Object.values(map).sort((a,b) => b.pessoas - a.pessoas);

                      // KPIs
                      const totBairros = rows.length;
                      const totFichas  = rows.reduce((s,r)=>s+r.fichas,0);
                      const totLocais  = rows.reduce((s,r)=>s+r.locais,0);
                      const totPessoas = rows.reduce((s,r)=>s+r.pessoas,0);
                      const kpisEl = document.getElementById('consKpis');
                      if (kpisEl) kpisEl.innerHTML = `
                        <div class="stat-card blue"><div class="stat-icon">🏘️</div><div class="stat-value">${totBairros}</div><div class="stat-label">Bairros Cobertos</div></div>
                        <div class="stat-card amber"><div class="stat-icon">📋</div><div class="stat-value">${totFichas}</div><div class="stat-label">Fichas Registadas</div></div>
                        <div class="stat-card green"><div class="stat-icon">📍</div><div class="stat-value">${totLocais.toLocaleString()}</div><div class="stat-label">Locais Visitados</div></div>
                        <div class="stat-card purple"><div class="stat-icon">👥</div><div class="stat-value">${totPessoas.toLocaleString()}</div><div class="stat-label">Pessoas Alcançadas</div></div>`;

                      // Tabela
                      const tbody = document.getElementById('consolidadoBody');
                      const tfoot = document.getElementById('consolidadoFoot');
                      tbody.innerHTML = '';
                      if (!rows.length) {
                        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--text3)">Sem dados para os filtros seleccionados</td></tr>';
                        if (tfoot) tfoot.innerHTML = '';
                        return;
                      }
                      rows.forEach(r => {
                        const taxa = (r.sim + r.nao) > 0 ? Math.round(r.sim / (r.sim + r.nao) * 100) : 0;
                        const corTaxa = taxa >= 70 ? 'var(--surf)' : taxa >= 40 ? 'var(--amber)' : 'var(--coral)';
                        tbody.innerHTML += `<tr>
                          <td>${r.provincia}</td><td>${r.municipio}</td><td>${r.comuna}</td>
                          <td><strong>${r.bairro}</strong></td>
                          <td style="font-size:12px;color:var(--text2)">${r.coordNome}</td>
                          <td style="font-family:'JetBrains Mono',monospace;text-align:center">${r.fichas}</td>
                          <td style="font-family:'JetBrains Mono',monospace;text-align:center">${r.locais.toLocaleString()}</td>
                          <td style="font-family:'JetBrains Mono',monospace;text-align:center;color:var(--primary);font-weight:700">${r.pessoas.toLocaleString()}</td>
                          <td style="font-family:'JetBrains Mono',monospace;text-align:center;color:var(--surf)">${r.sim.toLocaleString()}</td>
                          <td style="font-family:'JetBrains Mono',monospace;text-align:center;color:var(--coral)">${r.nao.toLocaleString()}</td>
                          <td style="text-align:center"><span style="font-weight:700;color:${corTaxa}">${taxa}%</span></td>
                        </tr>`;
                      });

                      // Rodapé com totais
                      const totSim = rows.reduce((s,r)=>s+r.sim,0);
                      const totNao = rows.reduce((s,r)=>s+r.nao,0);
                      const taxaGeral = (totSim+totNao)>0 ? Math.round(totSim/(totSim+totNao)*100) : 0;
                      if (tfoot) tfoot.innerHTML = `<tr style="background:var(--bg3);font-weight:700;font-size:13px">
                        <td colspan="5" style="padding:12px 16px;color:var(--text2)">TOTAIS GERAIS</td>
                        <td style="text-align:center;font-family:'JetBrains Mono',monospace">${totFichas}</td>
                        <td style="text-align:center;font-family:'JetBrains Mono',monospace">${totLocais.toLocaleString()}</td>
                        <td style="text-align:center;font-family:'JetBrains Mono',monospace;color:var(--primary)">${totPessoas.toLocaleString()}</td>
                        <td style="text-align:center;font-family:'JetBrains Mono',monospace;color:var(--surf)">${totSim.toLocaleString()}</td>
                        <td style="text-align:center;font-family:'JetBrains Mono',monospace;color:var(--coral)">${totNao.toLocaleString()}</td>
                        <td style="text-align:center;color:${taxaGeral>=70?'var(--surf)':taxaGeral>=40?'var(--amber)':'var(--coral)'}">${taxaGeral}%</td>
                      </tr>`;
                    }

                    // ── Exportar Consolidado ──
                    function exportConsolidadoExcel() {
                      const rows = [];
                      document.querySelectorAll('#consolidadoBody tr').forEach(tr => {
                        const cells = tr.querySelectorAll('td');
                        if (cells.length < 7) return;
                        rows.push({
                          'Província': cells[0].textContent, 'Município': cells[1].textContent,
                          'Comuna': cells[2].textContent, 'Bairro': cells[3].textContent,
                          'Coordenação': cells[4].textContent, 'Fichas': cells[5].textContent,
                          'Locais Visitados': cells[6].textContent, 'Pessoas Alcançadas': cells[7].textContent,
                          'Aceitaram (SIM)': cells[8].textContent, 'Recusaram (NÃO)': cells[9].textContent,
                          'Taxa Aceitação': cells[10].textContent
                        });
                      });
                      if (!rows.length) { showToast('Sem dados para exportar', 'error'); return; }
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Consolidado');
                      XLSX.writeFile(wb, `SisMob_Consolidado_${new Date().toISOString().split('T')[0]}.xlsx`);
                      showToast('Excel exportado ✓', 'success');
                    }

                    function exportConsolidadoPDF() {
                      window.print();
                    }

                    // ── Recursos Humanos (só admin) ──
                    function renderRH() {
                      if (!currentUser || currentUser.tipo !== 'admin') return;

                      // popular filtro de coordenações no RH
                      const rhCordSel = document.getElementById('rhMobFiltCord');
                      if (rhCordSel) {
                        const cur = rhCordSel.value;
                        rhCordSel.innerHTML = '<option value="">Todas as Coordenações</option>';
                        _cords.forEach(c => {
                          const o = document.createElement('option');
                          o.value = c.id; o.textContent = c.nome;
                          rhCordSel.appendChild(o);
                        });
                        rhCordSel.value = cur;
                      }

                      const supervisores = _users.filter(u => u.tipo === 'supervisor');
                      const mobilizadores = _mobilizadores;
                      const totalPessoal = supervisores.length + mobilizadores.length;
                      const totalActivos = supervisores.filter(u => u.activo !== false).length +
                                          mobilizadores.filter(m => m.activo !== false).length;

                      // KPIs RH
                      const rhKpisEl = document.getElementById('rhKpis');
                      if (rhKpisEl) rhKpisEl.innerHTML = `
                        <div class="stat-card blue">
                          <div class="stat-icon">🧑‍🤝‍🧑</div>
                          <div class="stat-value">${totalPessoal}</div>
                          <div class="stat-label">Total Geral de Pessoal</div>
                        </div>
                        <div class="stat-card green">
                          <div class="stat-icon">✅</div>
                          <div class="stat-value">${totalActivos}</div>
                          <div class="stat-label">Pessoal Activo</div>
                        </div>
                        <div class="stat-card amber">
                          <div class="stat-icon">👤</div>
                          <div class="stat-value">${supervisores.length}</div>
                          <div class="stat-label">Total de Supervisores</div>
                        </div>
                        <div class="stat-card purple">
                          <div class="stat-icon">🙋</div>
                          <div class="stat-value">${mobilizadores.length}</div>
                          <div class="stat-label">Total de Mobilizadores</div>
                        </div>`;

                      // Tabela Supervisores
                      const supBody = document.getElementById('rhSupBody');
                      if (supBody) {
                        supBody.innerHTML = '';
                        if (!supervisores.length) {
                          supBody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text3)">Sem supervisores</td></tr>';
                        } else {
                          supervisores.sort((a,b)=>(a.nome||'').localeCompare(b.nome||'')).forEach((s,i) => {
                            const cord = _cords.find(c => c.id === s.coordId);
                            const mobsDoSup = _mobilizadores.filter(m => String(m.supervisorId) === String(s.id));
                            const fichasDoSup = _fichas.filter(f => String(f.userId) === String(s.id));
                            const activo = s.activo !== false;
                            supBody.innerHTML += `<tr>
                              <td style="color:var(--text3);font-size:12px">${i+1}</td>
                              <td><strong>${s.nome||'—'}</strong></td>
                              <td style="font-size:12px;color:var(--text2)">${s.email||'—'}</td>
                              <td>${cord ? cord.nome : '—'}</td>
                              <td style="font-size:12px">${cord && cord.coordenador ? cord.coordenador : '—'}</td>
                              <td style="text-align:center">${s.ronda ? s.ronda + 'ª' : '—'}</td>
                              <td style="text-align:center;font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--primary)">${mobsDoSup.length}</td>
                              <td style="text-align:center;font-family:'JetBrains Mono',monospace">${fichasDoSup.length}</td>
                              <td style="text-align:center"><span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:${activo?'rgba(46,134,193,.12)':'rgba(192,57,43,.1)'};color:${activo?'var(--surf)':'var(--coral)'}">${activo?'✅ Activo':'🚫 Inactivo'}</span></td>
                            </tr>`;
                          });
                        }
                      }

                      // Tabela Mobilizadores
                      const mobBody = document.getElementById('rhMobBody');
                      if (mobBody) {
                        const search = (document.getElementById('rhMobSearch')?.value||'').toLowerCase();
                        const filtCord = document.getElementById('rhMobFiltCord')?.value || '';
                        let lista = [...mobilizadores];
                        if (search) lista = lista.filter(m => (m.nome||'').toLowerCase().includes(search));
                        if (filtCord) lista = lista.filter(m => {
                          const sup = _users.find(u => String(u.id) === String(m.supervisorId));
                          return sup && String(sup.coordId) === filtCord;
                        });
                        lista.sort((a,b)=>(a.nome||'').localeCompare(b.nome||''));

                        mobBody.innerHTML = '';
                        if (!lista.length) {
                          mobBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text3)">Sem mobilizadores</td></tr>';
                        } else {
                          lista.forEach((m,i) => {
                            const sup = _users.find(u => String(u.id) === String(m.supervisorId));
                            const cord = sup ? _cords.find(c => c.id === sup.coordId) : null;
                            const fichasDoMob = _fichas.filter(f => (f.mobilizador||'').toLowerCase().trim() === (m.nome||'').toLowerCase().trim());
                            const activo = m.activo !== false;
                            mobBody.innerHTML += `<tr>
                              <td style="color:var(--text3);font-size:12px">${i+1}</td>
                              <td><strong>${m.nome||'—'}</strong></td>
                              <td style="font-size:12px;color:var(--text2)">${sup ? sup.nome : '—'}</td>
                              <td style="font-size:12px">${cord ? cord.nome : '—'}</td>
                              <td style="text-align:center;font-family:'JetBrains Mono',monospace">${fichasDoMob.length}</td>
                              <td style="text-align:center"><span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:${activo?'rgba(46,134,193,.12)':'rgba(192,57,43,.1)'};color:${activo?'var(--surf)':'var(--coral)'}">${activo?'✅ Activo':'🚫 Inactivo'}</span></td>
                            </tr>`;
                          });
                        }
                      }
                    }

                    // RELATÓRIOS
                    function switchRelTab(el, id) {
                      document.querySelectorAll('#page-relatorios .tab').forEach(t => t.classList.remove('active'));
                      el.classList.add('active');
                      ['rel-locais','rel-supervisor','rel-coordenacao','rel-dia','rel-export'].forEach(s => {
                        const el2 = document.getElementById(s); if (el2) el2.style.display = s === id ? 'block' : 'none';
                      });
                      if (id === 'rel-locais')      { populateRelCords(); applyRelGeral(); }
                      if (id === 'rel-supervisor')   { populateRelSup(); applyRelSupervisor(); }
                      if (id === 'rel-coordenacao') { applyRelCord(); }
                      if (id === 'rel-dia')          { populateRelCords(); populateRelDiaCords(); }
                      if (id === 'rel-export')       { populateExpCords(); previewRelatorio(); }
                    }

                    function agregaLocais(fichas) {
                      const totals = {};
                      LOCAIS.forEach(l => { totals[l.key] = { locais: 0, pessoas: 0 }; });
                      fichas.forEach(f => {
                        if (!f.tableData) return;
                        LOCAIS.forEach(l => {
                          const v = f.tableData[l.key];
                          if (Array.isArray(v)) {
                            totals[l.key].locais += (v[0] || 0);
                            totals[l.key].pessoas += (v[1] || 0);
                          }
                        });
                      });
                      return totals;
                    }

                    function renderLocaisTable(tbodyId, totals) {
                      const tbody = document.getElementById(tbodyId);
                      if (!tbody) return;
                      let casaLocais = 0, casaPessoas = 0, otherLocais = 0, otherPessoas = 0, grandLocais = 0, grandPessoas = 0;
                      let html = '';

                    html += `<tr><td colspan="3" class="loc-cell" style="background:var(--bg2);font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border:1px solid var(--border)">Casa a Casa</td></tr>`;
                    const casaTot = totals['casa'] || { locais: 0, pessoas: 0 };
                    casaLocais += casaTot.locais; casaPessoas += casaTot.pessoas;
                    html += `<tr>
    <td class="loc-cell">Casa a casa</td>
    <td class="total-cell">${casaTot.locais || 0}</td>
    <td class="total-cell" style="color:var(--accent2)">${casaTot.pessoas || 0}</td>
   </tr>`;
                    html += `<tr class="ficha-sub-row">
    <td class="loc-cell" style="font-size:10px;color:var(--accent2)">↳ SUB-TOTAL Casa a Casa</td>
    <td class="subtotal-cell">${casaLocais}</td>
    <td class="subtotal-cell">${casaPessoas}</td>
   </tr>`;

                    html += `<tr><td colspan="3" class="loc-cell" style="background:var(--bg2);font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border:1px solid var(--border)">Outros Locais de Mobilização</td></tr>`;
                    ['igreja', 'pracas', 'paragem', 'creche', 'escola', 'agua', 'outros'].forEach(k => {
                      const loc = LOCAIS.find(l => l.key === k);
                      const t = totals[k] || { locais: 0, pessoas: 0 };
                      otherLocais += t.locais; otherPessoas += t.pessoas;
                      html += `<tr>
      <td class="loc-cell">${loc.label}</td>
      <td class="total-cell">${t.locais || 0}</td>
      <td class="total-cell" style="color:var(--accent2)">${t.pessoas || 0}</td>
     </tr>`;
                  });
                    html += `<tr class="ficha-sub-row">
    <td class="loc-cell" style="font-size:10px;color:var(--accent2)">↳ SUB-TOTAL Outros Locais</td>
    <td class="subtotal-cell">${otherLocais}</td>
    <td class="subtotal-cell">${otherPessoas}</td>
   </tr>`;

                    grandLocais = casaLocais + otherLocais;
                    grandPessoas = casaPessoas + otherPessoas;
                    html += `<tr class="ficha-total-row">
    <td>TOTAL GERAL</td>
    <td style="font-size:14px;background:rgba(0,212,170,.18)">${grandLocais}</td>
    <td style="font-size:14px;background:rgba(14,165,233,.18);color:var(--accent2)">${grandPessoas}</td>
   </tr>`;

                    tbody.innerHTML = html;
                  }

                    function applyRelGeral() {
                      let fichas = getVisibleFichas();
                      const cord = document.getElementById('relFiltCord')?.value;
                      const ronda = document.getElementById('relFiltRonda')?.value;
                      const dtI = document.getElementById('relFiltDtI')?.value;
                      const dtF = document.getElementById('relFiltDtF')?.value;
                      const bairro = document.getElementById('relFiltBairro')?.value.trim().toLowerCase();
                      if (cord) fichas = fichas.filter(f => String(f.coordId) === cord);
                      if (ronda) fichas = fichas.filter(f => String(f.ronda) === ronda);
                      if (dtI) fichas = fichas.filter(f => f.data >= dtI);
                      if (dtF) fichas = fichas.filter(f => f.data <= dtF);
                      if (bairro) fichas = fichas.filter(f => (f.bairro || '').toLowerCase().includes(bairro));

                    const tp = fichas.reduce((s, f) => s + (f.totalPessoas || 0), 0);
                    const tl = fichas.reduce((s, f) => s + (f.totalLocais || 0), 0);
                    const ts = fichas.reduce((s, f) => s + (f.sim || 0), 0);
                    const tn = fichas.reduce((s, f) => s + (f.nao || 0), 0);
                    const pct = ts + tn > 0 ? Math.round(ts / (ts + tn) * 100) : 0;

                    document.getElementById('relGeralStats').innerHTML = `
    <div class="stat-card amber"><div class="stat-icon">📋</div><div class="stat-value">${fichas.length}</div><div class="stat-label">Fichas</div></div>
    <div class="stat-card green"><div class="stat-icon">👥</div><div class="stat-value">${tp.toLocaleString()}</div><div class="stat-label">Pessoas Alcançadas</div></div>
    <div class="stat-card blue"><div class="stat-icon">📍</div><div class="stat-value">${tl}</div><div class="stat-label">Locais Visitados</div></div>
    <div class="stat-card purple"><div class="stat-icon">✅</div><div class="stat-value">${pct}%</div><div class="stat-label">Taxa de Aceitação</div></div>`;

                    renderLocaisTable('relLocaisBody', agregaLocais(fichas));

                    const tbody = document.getElementById('relGeralBody'); tbody.innerHTML = '';
                    fichas.sort((a, b) => (b.data || '').localeCompare(a.data || '')).forEach(f => {
                      tbody.innerHTML += `<tr>
      <td>${f.data || '—'}</td>
      <td style="font-weight:600">${f.mobilizador || '—'}</td>
      <td><span class="badge badge-sup">${f.coordNome || '—'}</span></td>
      <td>${f.bairro || '—'}</td>
      <td style="font-family:'JetBrains Mono',monospace">${f.totalLocais || 0}</td>
      <td style="font-family:'JetBrains Mono',monospace;color:var(--accent)">${(f.totalPessoas || 0).toLocaleString()}</td>
      <td style="color:var(--green)">${f.sim || 0}</td>
      <td style="color:var(--danger)">${f.nao || 0}</td>
      <td><button class="btn btn-blue btn-sm" onclick="verFicha(${f.id})">👁</button></td>
    </tr>`;
                  });
                    if (!fichas.length) tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text3)">Sem resultados com os filtros aplicados</td></tr>';
                  }

                    function applyRelCord() {
                      const dtI = document.getElementById('relCordDtI')?.value;
                      const dtF = document.getElementById('relCordDtF')?.value;
                      let fichas = getVisibleFichas();
                      if (dtI) fichas = fichas.filter(f => f.data >= dtI);
                      if (dtF) fichas = fichas.filter(f => f.data <= dtF);

                    const container = document.getElementById('relCordContent');
                    if (!container) return;

                    if (!_cords.length) { container.innerHTML = '<div class="card" style="color:var(--text3);text-align:center;padding:32px">Nenhuma coordenação registada</div>'; return; }

                    let html = '';
                    const cordsComFichas = _cords.filter(c => fichas.some(f => f.coordId === c.id));
                    if (!cordsComFichas.length) { container.innerHTML = '<div class="card" style="color:var(--text3);text-align:center;padding:32px">Sem fichas no período seleccionado</div>'; return; }

                    cordsComFichas.forEach(c => {
                      const cf = fichas.filter(f => f.coordId === c.id);
                      const tp = cf.reduce((s, f) => s + (f.totalPessoas || 0), 0);
                      const tl = cf.reduce((s, f) => s + (f.totalLocais || 0), 0);
                      const ts = cf.reduce((s, f) => s + (f.sim || 0), 0);
                      const tn = cf.reduce((s, f) => s + (f.nao || 0), 0);
                      const pct = ts + tn > 0 ? Math.round(ts / (ts + tn) * 100) : 0;
                      const totals = agregaLocais(cf);

                    html += `<div class="card" style="border-color:rgba(0,212,170,.25)">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px">
        <div class="card-title" style="margin:0"><span class="dot"></span>${c.nome}</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px">
          <span style="color:var(--text2)">📋 <b style="color:var(--text)">${cf.length}</b> fichas</span>
          <span style="color:var(--text2)">👥 <b style="color:var(--accent)">${tp.toLocaleString()}</b> pessoas</span>
          <span style="color:var(--text2)">📍 <b style="color:var(--text)">${tl}</b> locais</span>
          <span style="color:var(--text2)">✅ <b style="color:var(--green)">${pct}%</b> aceitação</span>
        </div>
      </div>
      <div class="table-wrap">
        <table class="ficha-table" id="cordTable_${c.id}">
          <thead><tr>
            <th class="loc">Local de Mobilização</th>
            <th style="background:rgba(0,212,170,.12);color:var(--accent);min-width:100px">TOTAIS DE LOCAIS</th>
            <th style="background:rgba(14,165,233,.12);color:var(--accent2);min-width:100px">TOTAIS DE PESSOAS</th>
          </tr></thead>
          <tbody id="cordLocais_${c.id}"></tbody>
        </table>
      </div>
    </div>`;
                  });
                    container.innerHTML = html;
                    cordsComFichas.forEach(c => {
                      const cf = fichas.filter(f => f.coordId === c.id);
                      renderLocaisTable(`cordLocais_${c.id}`, agregaLocais(cf));
                    });
                  }

                    function applyRelDia() {
                      const dt = document.getElementById('relFiltData').value;
                      if (!dt) { showToast('Seleccione uma data', 'error'); return; }
                      const cord = document.getElementById('relDiaCord')?.value;
                      let fichas = getVisibleFichas().filter(f => f.data === dt);
                      if (cord) fichas = fichas.filter(f => String(f.coordId) === cord);

                    const tp = fichas.reduce((s, f) => s + (f.totalPessoas || 0), 0);
                    const tl = fichas.reduce((s, f) => s + (f.totalLocais || 0), 0);
                    const ts = fichas.reduce((s, f) => s + (f.sim || 0), 0);
                    const tn = fichas.reduce((s, f) => s + (f.nao || 0), 0);
                    document.getElementById('relDiaStats').innerHTML = `
    <div class="stat-card amber"><div class="stat-value">${fichas.length}</div><div class="stat-label">Fichas neste dia</div></div>
    <div class="stat-card green"><div class="stat-value">${tp.toLocaleString()}</div><div class="stat-label">Pessoas alcançadas</div></div>
    <div class="stat-card blue"><div class="stat-value">${tl}</div><div class="stat-label">Locais visitados</div></div>
    <div class="stat-card purple"><div class="stat-value">${ts + tn > 0 ? Math.round(ts / (ts + tn) * 100) : 0}%</div><div class="stat-label">Taxa de aceitação</div></div>`;

                    renderLocaisTable('relDiaLocaisBody', agregaLocais(fichas));

                    const tbody = document.getElementById('relDiaBody'); tbody.innerHTML = '';
                    fichas.forEach(f => {
                      tbody.innerHTML += `<tr>
    <td style="font-weight:600">${f.mobilizador || '—'}</td>
    <td><span class="badge badge-sup">${f.coordNome || '—'}</span></td>
    <td>${f.bairro || '—'}</td>
    <td>${f.totalLocais || 0}</td>
    <td style="color:var(--accent)">${(f.totalPessoas || 0).toLocaleString()}</td>
    <td style="color:var(--green)">${f.sim || 0}</td>
    <td style="color:var(--danger)">${f.nao || 0}</td>
    <td><button class="btn btn-blue btn-sm" onclick="verFicha(${f.id})">👁</button></td>
  </tr>`;
                  });
                    if (!fichas.length) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text3)">Sem fichas para esta data</td></tr>';
                  }

                    function populateRelCords() {
                      const sel = document.getElementById('relFiltCord');
                      if (!sel) return;
                      sel.innerHTML = '<option value="">Todas</option>';
                      _cords.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.nome}</option>`);
                    }
                    function populateRelDiaCords() {
                      const sel = document.getElementById('relDiaCord');
                      if (!sel) return;
                      sel.innerHTML = '<option value="">Todas</option>';
                      _cords.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.nome}</option>`);
                    }
                    function populateExpCords() {
                      const sel = document.getElementById('expCord'); if (!sel) return;
                      sel.innerHTML = '<option value="">Todas</option>';
                      _cords.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.nome}</option>`);
                      previewRelatorio();
                    }
                    function toggleExpDate() {
                      document.getElementById('expDataField').style.display =
                        document.getElementById('expTipo').value === 'diario' ? 'flex' : 'none';
                    }

                    function getRelData() {
                      const tipo = document.getElementById('expTipo').value;
                      const cord = document.getElementById('expCord').value;
                      const dt = document.getElementById('expData').value;
                      const dtI = document.getElementById('expDtI').value;
                      const dtF = document.getElementById('expDtF').value;
                      let fichas = getVisibleFichas();
                      if (cord) fichas = fichas.filter(f => String(f.coordId) === cord);
                      if (dtI) fichas = fichas.filter(f => f.data >= dtI);
                      if (dtF) fichas = fichas.filter(f => f.data <= dtF);
                      if (tipo === 'diario' && dt) fichas = fichas.filter(f => f.data === dt);
                      fichas.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
                      return { tipo, fichas, dt, cord };
                    }

                    function buildLocaisTableHTML(totals) {
                      let casaLocais = 0, casaPessoas = 0, otherLocais = 0, otherPessoas = 0;
                      let rows = '';
                      rows += `<tr><td colspan="3" style="background:#e8f0fe;font-size:10px;font-weight:700;padding:5px 8px;border:1px solid #ccc;text-transform:uppercase;letter-spacing:.5px">Casa a Casa</td></tr>`;
                      const casaTot = totals['casa'] || { locais: 0, pessoas: 0 };
                      casaLocais += casaTot.locais; casaPessoas += casaTot.pessoas;
                      rows += `<tr><td style="padding:4px 8px;border:1px solid #ddd">Casa a casa</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:center">${casaTot.locais}</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:center">${casaTot.pessoas}</td></tr>`;
                      rows += `<tr style="background:#e8f5e9;font-weight:700"><td style="padding:4px 8px;border:1px solid #ccc">↳ SUB-TOTAL Casa a Casa</td><td style="padding:4px 8px;border:1px solid #ccc;text-align:center">${casaLocais}</td><td style="padding:4px 8px;border:1px solid #ccc;text-align:center">${casaPessoas}</td></tr>`;
                      rows += `<tr><td colspan="3" style="background:#e8f0fe;font-size:10px;font-weight:700;padding:5px 8px;border:1px solid #ccc;text-transform:uppercase;letter-spacing:.5px">Outros Locais de Mobilização</td></tr>`;
                      ['igreja', 'pracas', 'paragem', 'creche', 'escola', 'agua', 'outros'].forEach(k => {
                        const loc = LOCAIS.find(l => l.key === k);
                        const t = totals[k] || { locais: 0, pessoas: 0 };
                        otherLocais += t.locais; otherPessoas += t.pessoas;
                        rows += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${loc.label}</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:center">${t.locais}</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:center">${t.pessoas}</td></tr>`;
                      });
                    rows += `<tr style="background:#e8f5e9;font-weight:700"><td style="padding:4px 8px;border:1px solid #ccc">↳ SUB-TOTAL Outros Locais</td><td style="padding:4px 8px;border:1px solid #ccc;text-align:center">${otherLocais}</td><td style="padding:4px 8px;border:1px solid #ccc;text-align:center">${otherPessoas}</td></tr>`;
                    const gL = casaLocais + otherLocais, gP = casaPessoas + otherPessoas;
                    rows += `<tr style="background:#c8e6c9;font-weight:700;font-size:13px"><td style="padding:6px 8px;border:1px solid #999">TOTAL GERAL</td><td style="padding:6px 8px;border:1px solid #999;text-align:center"><b>${gL}</b></td><td style="padding:6px 8px;border:1px solid #999;text-align:center"><b>${gP}</b></td></tr>`;
                    return `<table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead><tr>
      <th style="padding:6px 8px;border:1px solid #999;background:#1a237e;color:#fff;text-align:left">Local de Mobilização</th>
      <th style="padding:6px 8px;border:1px solid #999;background:#00695c;color:#fff;text-align:center;min-width:100px">TOTAIS DE LOCAIS</th>
      <th style="padding:6px 8px;border:1px solid #999;background:#01579b;color:#fff;text-align:center;min-width:100px">TOTAIS DE PESSOAS</th>
    </tr></thead>
    <tbody>${rows}</tbody>
   </table>`;
                  }

                    function buildRelHTML(titulo, fichas, tipo, cord) {
                      const tp = fichas.reduce((s, f) => s + (f.totalPessoas || 0), 0);
                      const tl = fichas.reduce((s, f) => s + (f.totalLocais || 0), 0);
                      const ts = fichas.reduce((s, f) => s + (f.sim || 0), 0);
                      const tn = fichas.reduce((s, f) => s + (f.nao || 0), 0);
                      const pct = ts + tn > 0 ? Math.round(ts / (ts + tn) * 100) : 0;
                      const now = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
                      const cordNome = cord ? (_cords.find(c => String(c.id) === cord) || {}).nome || '' : '';
                      const header = `<div style="display:flex;justify-content:space-between;margin-bottom:12px;border-bottom:2px solid #1a237e;padding-bottom:8px">
    <div><b style="font-size:20px;color:#1a237e">SisMob</b><br><small style="color:#555">Sistema de Mobilização de Saúde</small>${cordNome ? `<br><small style="color:#1a237e;font-weight:700">${cordNome}</small>` : ''}</div>
    <div style="text-align:right;font-size:11px;color:#555">Gerado: ${now}<br>Por: ${currentUser.nome}<br>Fichas: ${fichas.length} | Pessoas: ${tp.toLocaleString()}</div>
  </div>
  <h2 style="margin:0 0 12px;font-size:15px;color:#1a237e">${titulo}</h2>
  <div style="margin-bottom:12px;font-size:12px">
    <span style="margin-right:20px">📋 Fichas: <b>${fichas.length}</b></span>
    <span style="margin-right:20px">👥 Pessoas: <b>${tp.toLocaleString()}</b></span>
    <span style="margin-right:20px">📍 Locais: <b>${tl}</b></span>
    <span style="margin-right:20px">✅ Aceitação: <b>${pct}%</b></span>
    <span style="margin-right:20px">Sim: <b>${ts}</b></span>
    <span>Não: <b>${tn}</b></span>
  </div>`;

                    if (tipo === 'coordenacao') {
                      let blocks = '';
                      const cordsUsadas = _cords.filter(c => fichas.some(f => f.coordId === c.id));
                      cordsUsadas.forEach(c => {
                        const cf = fichas.filter(f => f.coordId === c.id);
                        const ctp = cf.reduce((s, f) => s + (f.totalPessoas || 0), 0);
                        const cts = cf.reduce((s, f) => s + (f.sim || 0), 0);
                        const ctn = cf.reduce((s, f) => s + (f.nao || 0), 0);
                        const cpct = cts + ctn > 0 ? Math.round(cts / (cts + ctn) * 100) : 0;
                        blocks += `<h3 style="margin:16px 0 6px;font-size:13px;color:#1a237e;border-bottom:1px solid #ccc;padding-bottom:4px">${c.nome} — ${cf.length} fichas | ${ctp.toLocaleString()} pessoas | ${cpct}% aceitação</h3>`;
                        blocks += buildLocaisTableHTML(agregaLocais(cf));
                      });
                    return header + blocks;
                  }

                    return header + buildLocaisTableHTML(agregaLocais(fichas));
                  }

                    function previewRelatorio() {
                      const { tipo, fichas, dt, cord } = getRelData();
                      const tit = tipo === 'diario' ? `Relatório Diário — ${dt || '(sem data)'}` : tipo === 'coordenacao' ? 'Relatório por Coordenação' : 'Relatório Geral de Mobilização';
                      const tp = fichas.reduce((s, f) => s + (f.totalPessoas || 0), 0);
                      const tl = fichas.reduce((s, f) => s + (f.totalLocais || 0), 0);
                      const ts = fichas.reduce((s, f) => s + (f.sim || 0), 0);
                      const tn = fichas.reduce((s, f) => s + (f.nao || 0), 0);
                      const pct = ts + tn > 0 ? Math.round(ts / (ts + tn) * 100) : 0;
                      const kpis = document.getElementById('expKpis');
                      if (kpis) kpis.innerHTML = `
    <div class="sbox accent"><div class="sv">${fichas.length}</div><div class="sl">Fichas</div></div>
    <div class="sbox green"><div class="sv">${tp.toLocaleString()}</div><div class="sl">Pessoas</div></div>
    <div class="sbox blue"><div class="sv">${tl}</div><div class="sl">Locais</div></div>
    <div class="sbox amber"><div class="sv">${pct}%</div><div class="sl">Aceitação</div></div>`;
                    const html = buildRelHTML(tit, fichas, tipo, cord);
                    document.getElementById('expPreviewContent').innerHTML = `<div style="background:#fff;color:#000;padding:24px;border-radius:8px;font-family:Arial,sans-serif;font-size:12px">${html}</div>`;
                    document.getElementById('expPreview').style.display = 'block';
                  }

                    function exportRelatorio(format) {
                      const { tipo, fichas, dt, cord } = getRelData();
                      const tit = tipo === 'diario' ? `Relatório Diário — ${dt || '—'}` : tipo === 'coordenacao' ? 'Relatório por Coordenação' : 'Relatório Geral de Mobilização';
                      if (format === 'excel') {
                        buildExcelRel(tit, fichas, tipo);
                      } else {
                      const html = buildRelHTML(tit, fichas, tipo, cord);
                      document.getElementById('printArea').innerHTML = html;
                      setTimeout(() => window.print(), 200);
                    }
                  }

                    function buildExcelRel(titulo, fichas, tipo) {
                      const wb = XLSX.utils.book_new();
                      const now = new Date().toLocaleDateString('pt-PT');

                    const ST = {
                      titulo: { font: { bold: true, sz: 14, color: { rgb: '1a237e' } }, alignment: { horizontal: 'left' } },
                      sub: { font: { sz: 10, color: { rgb: '555555' } }, alignment: { horizontal: 'left' } },
                      kpi: { font: { bold: true, sz: 11, color: { rgb: '1a237e' } }, fill: { fgColor: { rgb: 'E8F0FE' } }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'thin', color: { rgb: '9FA8DA' } } } },
                      thLocal: { font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '1A237E' } }, alignment: { horizontal: 'left' }, border: { top: { style: 'medium', color: { rgb: '000000' } }, bottom: { style: 'medium', color: { rgb: '000000' } } } },
                      thLocais: { font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '00695C' } }, alignment: { horizontal: 'center' }, border: { top: { style: 'medium', color: { rgb: '000000' } }, bottom: { style: 'medium', color: { rgb: '000000' } } } },
                      thPessoas: { font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '01579B' } }, alignment: { horizontal: 'center' }, border: { top: { style: 'medium', color: { rgb: '000000' } }, bottom: { style: 'medium', color: { rgb: '000000' } } } },
                      secCasa: { font: { bold: true, sz: 10, color: { rgb: '1A237E' } }, fill: { fgColor: { rgb: 'C5CAE9' } }, alignment: { horizontal: 'left' }, border: { top: { style: 'thin', color: { rgb: '9FA8DA' } }, bottom: { style: 'thin', color: { rgb: '9FA8DA' } } } },
                      secOther: { font: { bold: true, sz: 10, color: { rgb: '004D40' } }, fill: { fgColor: { rgb: 'B2DFDB' } }, alignment: { horizontal: 'left' }, border: { top: { style: 'thin', color: { rgb: '80CBC4' } }, bottom: { style: 'thin', color: { rgb: '80CBC4' } } } },
                      dataRow: { font: { sz: 11 }, alignment: { horizontal: 'left' }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } },
                      numRow: { font: { sz: 11 }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } },
                      subTotal: { font: { bold: true, sz: 11, color: { rgb: '01579B' } }, fill: { fgColor: { rgb: 'E3F2FD' } }, alignment: { horizontal: 'center' }, border: { top: { style: 'thin', color: { rgb: '90CAF9' } }, bottom: { style: 'thin', color: { rgb: '90CAF9' } } } },
                      subTotalL: { font: { bold: true, sz: 11, color: { rgb: '01579B' } }, fill: { fgColor: { rgb: 'E3F2FD' } }, alignment: { horizontal: 'left' }, border: { top: { style: 'thin', color: { rgb: '90CAF9' } }, bottom: { style: 'thin', color: { rgb: '90CAF9' } } } },
                      total: { font: { bold: true, sz: 13, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '1A237E' } }, alignment: { horizontal: 'center' }, border: { top: { style: 'medium', color: { rgb: '000000' } }, bottom: { style: 'medium', color: { rgb: '000000' } } } },
                      totalL: { font: { bold: true, sz: 13, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '1A237E' } }, alignment: { horizontal: 'left' }, border: { top: { style: 'medium', color: { rgb: '000000' } }, bottom: { style: 'medium', color: { rgb: '000000' } } } },
                      thFicha: { font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '37474F' } }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'medium', color: { rgb: '000000' } } } },
                      thFichaL: { font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '37474F' } }, alignment: { horizontal: 'left' }, border: { bottom: { style: 'medium', color: { rgb: '000000' } } } },
                      fichaData: { font: { sz: 10 }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } },
                      fichaText: { font: { sz: 10 }, alignment: { horizontal: 'left' }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } },
                      fichaNum: { font: { sz: 10 }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } },
                      fichaSimV: { font: { bold: true, sz: 10, color: { rgb: '1B5E20' } }, fill: { fgColor: { rgb: 'E8F5E9' } }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } },
                      fichaNaoV: { font: { bold: true, sz: 10, color: { rgb: 'B71C1C' } }, fill: { fgColor: { rgb: 'FFEBEE' } }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } },
                      empty: {},
                    };

                    function C(v, s) { return { v, t: typeof v === 'number' ? 'n' : 's', s: s || ST.empty }; }
                    function CN(v, s) { return { v: v || 0, t: 'n', s: s || ST.numRow }; }

                    function buildSheet(sheetFichas, sheetName) {
                      const totals = agregaLocais(sheetFichas);
                      const tp = sheetFichas.reduce((s, f) => s + (f.totalPessoas || 0), 0);
                      const tl = sheetFichas.reduce((s, f) => s + (f.totalLocais || 0), 0);
                      const ts = sheetFichas.reduce((s, f) => s + (f.sim || 0), 0);
                      const tn = sheetFichas.reduce((s, f) => s + (f.nao || 0), 0);
                      const pct = ts + tn > 0 ? Math.round(ts / (ts + tn) * 100) : 0;

                    const ws = {};
                    let r = 0;

                    function setCell(col, row, cell) {
                      const addr = XLSX.utils.encode_cell({ c: col, r: row });
                      ws[addr] = cell;
                    }
                    function setRow(rowIdx, cells) {
                      cells.forEach((cell, col) => { if (cell !== null) setCell(col, rowIdx, cell); });
                    }
                    function mergeCols(rowIdx, fromCol, toCol) {
                      if (!ws['!merges']) ws['!merges'] = [];
                      ws['!merges'].push({ s: { r: rowIdx, c: fromCol }, e: { r: rowIdx, c: toCol } });
                    }

                    setRow(r, [C(titulo, ST.titulo), null, null]); mergeCols(r, 0, 2); r++;
                    setRow(r, [C(`Gerado: ${now}  |  Por: ${currentUser.nome}  |  Fichas: ${sheetFichas.length}`, ST.sub), null, null]); mergeCols(r, 0, 2); r++;
                    r++;

                    setRow(r, [C('PESSOAS ALCANÇADAS', ST.kpi), C('LOCAIS VISITADOS', ST.kpi), C('TAXA ACEITAÇÃO', ST.kpi)]); r++;
                    setRow(r, [CN(tp, { ...ST.kpi, font: { bold: true, sz: 16, color: { rgb: '1a237e' } } }), CN(tl, { ...ST.kpi, font: { bold: true, sz: 16, color: { rgb: '00695c' } } }), C(`${pct}%`, { ...ST.kpi, font: { bold: true, sz: 16, color: { rgb: 'e65100' } } })]); r++;
                    setRow(r, [C(`Sim: ${ts}    Não: ${tn}`, ST.sub), null, null]); mergeCols(r, 0, 2); r++;
                    r++;

                    setRow(r, [C('LOCAL DE MOBILIZAÇÃO', ST.thLocal), C('TOTAIS DE LOCAIS', ST.thLocais), C('TOTAIS DE PESSOAS', ST.thPessoas)]); r++;

                    setRow(r, [C('CASA A CASA', ST.secCasa), C('', ST.secCasa), C('', ST.secCasa)]); mergeCols(r, 0, 2); r++;
                    let casaL = 0, casaP = 0;
                    const casaTot = totals['casa'] || { locais: 0, pessoas: 0 };
                    casaL += casaTot.locais; casaP += casaTot.pessoas;
                    setRow(r, [C('Casa a casa', ST.dataRow), CN(casaTot.locais, ST.numRow), CN(casaTot.pessoas, ST.numRow)]); r++;
                    setRow(r, [C('↳ SUB-TOTAL Casa a Casa', ST.subTotalL), CN(casaL, ST.subTotal), CN(casaP, ST.subTotal)]); r++;

                    setRow(r, [C('OUTROS LOCAIS DE MOBILIZAÇÃO', ST.secOther), C('', ST.secOther), C('', ST.secOther)]); mergeCols(r, 0, 2); r++;
                    let othL = 0, othP = 0;
                    ['igreja', 'pracas', 'paragem', 'creche', 'escola', 'agua', 'outros'].forEach(k => {
                      const loc = LOCAIS.find(l => l.key === k);
                      const t = totals[k] || { locais: 0, pessoas: 0 };
                      othL += t.locais; othP += t.pessoas;
                      setRow(r, [C(loc.label, ST.dataRow), CN(t.locais, ST.numRow), CN(t.pessoas, ST.numRow)]); r++;
                    });
                    setRow(r, [C('↳ SUB-TOTAL Outros Locais', ST.subTotalL), CN(othL, ST.subTotal), CN(othP, ST.subTotal)]); r++;

                    setRow(r, [C('TOTAL GERAL', ST.totalL), CN(casaL + othL, ST.total), CN(casaP + othP, ST.total)]); r++;
                    r++;
                    r++;

                    setRow(r, [
                      C('DATA', ST.thFicha), C('MOBILIZADOR', ST.thFichaL), C('COORDENAÇÃO', ST.thFichaL),
                      C('BAIRRO', ST.thFichaL), C('LOCAIS', ST.thFicha), C('PESSOAS', ST.thFicha),
                      C('SIM', ST.thFicha), C('NÃO', ST.thFicha), C('MOTIVO', ST.thFichaL)
                    ]); r++;

                    sheetFichas.forEach(f => {
                      setRow(r, [
                        C(f.data || '', ST.fichaData),
                        C(f.mobilizador || '', ST.fichaText),
                        C(f.coordNome || '', ST.fichaText),
                        C(f.bairro || '', ST.fichaText),
                        CN(f.totalLocais || 0, ST.fichaNum),
                        CN(f.totalPessoas || 0, ST.fichaNum),
                        CN(f.sim || 0, ST.fichaSimV),
                        CN(f.nao || 0, ST.fichaNaoV),
                        C(f.motivo || '', ST.fichaText)
                      ]); r++;
                    });

                    ws['!cols'] = [{ wch: 32 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 28 }];
                    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r, c: 8 } });
                    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
                  }

                    if (tipo === 'coordenacao') {
                      const cordsUsadas = _cords.filter(c => fichas.some(f => f.coordId === c.id));
                      if (!cordsUsadas.length) { buildSheet(fichas, 'Geral'); }
                      else {
                        buildSheet(fichas, 'TOTAL GERAL');
                        cordsUsadas.forEach(c => {
                          buildSheet(fichas.filter(f => f.coordId === c.id), c.nome.substring(0, 31));
                        });
                      }
                    } else {
                    buildSheet(fichas, 'Relatório');
                  }

                    XLSX.writeFile(wb, `SisMob_${tipo}_${new Date().toISOString().split('T')[0]}.xlsx`);
                    showToast('Excel exportado com formatação! ✓', 'success');
                  }

                    // GRÁFICOS
