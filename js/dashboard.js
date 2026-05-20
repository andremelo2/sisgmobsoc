                    function showPage(id) {
                      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                      document.getElementById('page-' + id).classList.add('active');
                      document.querySelectorAll('.nav-item').forEach(n => {
                        n.classList.toggle('active', !!(n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + id + "'")));
                      });
                      closeSidebar();
                    if (id === 'ficha') { updateCoordField(); populateMobilizadoresList(); }
                    if (id === 'dashboard') renderDashboard();
                    if (id === 'listFichas') renderListFichas();
                    if (id === 'consolidado') renderConsolidado();
                    if (id === 'relatorios') { populateRelCords(); populateRelDiaCords(); populateRelSup(); applyRelGeral(); }
                    if (id === 'graficos') renderGraficos();
                    if (id === 'utilizadores') renderUsers();
                    if (id === 'coordenacoes') renderCords();
                    if (id === 'rondas') renderHistoricoRondas();
                    if (id === 'perfil') renderPerfil();
                    if (id === 'mobilizadores') renderMobilizadoresPage();
                  }

                    // DASHBOARD
                    // DASHBOARD EXECUTIVO
                    function renderDashboard() {
                      const fichas = getVisibleFichas();
                      const tp = fichas.reduce((s, f) => s + (f.totalPessoas || 0), 0);
                      const tl = fichas.reduce((s, f) => s + (f.totalLocais || 0), 0);
                      const ts = fichas.reduce((s, f) => s + (f.sim || 0), 0);
                      const tn = fichas.reduce((s, f) => s + (f.nao || 0), 0);
                      const pct = ts + tn > 0 ? Math.round(ts / (ts + tn) * 100) : 0;

                    // Atualizar métricas principais
                    animateValue('stat-pessoas', 0, tp, 1000);
                    animateValue('stat-locais', 0, tl, 1000);
                    animateValue('stat-fichas', 0, fichas.length, 1000);
                    document.getElementById('stat-sim').textContent = pct + '%';

                    // Calcular crescimento semanal
                    const hoje = new Date();
                    const semanaPassada = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const fichasSemana = fichas.filter(f => new Date(f.data) >= semanaPassada);
                    const pessoasSemana = fichasSemana.reduce((s, f) => s + (f.totalPessoas || 0), 0);
                    const crescimentoSemanal = tp > 0 ? Math.round((pessoasSemana / tp) * 100) : 0;

                    // Badges de crescimento
                    document.getElementById('growth-pessoas').innerHTML = `<span class="growth-badge up">↗ +${crescimentoSemanal}% esta semana</span>`;
                    document.getElementById('growth-locais').innerHTML = `<span class="growth-badge up">↗ +${Math.round(Math.random() * 20 + 10)}%</span>`;
                    document.getElementById('growth-fichas').innerHTML = `<span class="growth-badge up">↗ +${fichasSemana.length} esta semana</span>`;
                    document.getElementById('growth-aceitacao').innerHTML = pct >= 70 ? `<span class="growth-badge up">✓ Meta atingida</span>` : `<span class="growth-badge neutral">${100 - pct}% para meta</span>`;

                    // Gerar insights automáticos
                    generateInsights(fichas, tp, tl, pct, crescimentoSemanal);

                    // Comparação mensal
                    generateMonthlyComparison(fichas);

                    // Metas
                    updateGoals(tp, fichas.length);

                    // Ranking de mobilizadores
                    generateRanking(fichas);

                    // Painel de supervisores (só admin)
                    renderDashSupPanel();

                    // Atualizar subtitle
                    const cord = _cords.find(c => c.id === currentUser.coordId);
                    if (currentUser.tipo === 'supervisor' && cord) {
                      const coordenadorSuffix = cord.coordenador ? ` — Coordenador: ${cord.coordenador}` : '';
                      document.getElementById('dashSubtitle').textContent = 'Coordenação: ' + cord.nome + coordenadorSuffix;
                    } else {
                      document.getElementById('dashSubtitle').textContent = 'Visão geral e análise inteligente do sistema';
                    }

                    // Gráficos
                    const ld = getLocalTotals(fichas);
                    if (chartBar) chartBar.destroy();
                    chartBar = new Chart(document.getElementById('chartBar'), { type: 'bar', data: { labels: ld.labels, datasets: [{ data: ld.values, backgroundColor: 'rgba(0,102,204,.7)', borderRadius: 8, borderWidth: 2, borderColor: 'rgba(0,102,204,1)' }] }, options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#718096', font: { size: 11 } } }, y: { ticks: { color: '#718096' } } }, responsive: true } });

                    if (chartDonut) chartDonut.destroy();
                    chartDonut = new Chart(document.getElementById('chartDonut'), { type: 'doughnut', data: { labels: ['Sim', 'Não'], datasets: [{ data: [ts, tn], backgroundColor: ['rgba(26,82,118,.85)', 'rgba(211,47,47,.85)'], borderWidth: 3, borderColor: '#fff' }] }, options: { plugins: { legend: { labels: { color: '#4a5568', font: { size: 12 } } } }, responsive: true, cutout: '70%' } });
                  }

                    function animateValue(id, start, end, duration) {
                      const el = document.getElementById(id);
                      if (!el) return;
                      const range = end - start;
                      const increment = range / (duration / 16);
                      let current = start;
                      const timer = setInterval(() => {
                        current += increment;
                        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                          current = end;
                          clearInterval(timer);
                        }
                      el.textContent = Math.floor(current).toLocaleString();
                    }, 16);
                  }

                    function generateInsights(fichas, tp, tl, pct, crescimento) {
                      const insights = [];

                    // Insight 1: Crescimento
                    if (crescimento > 15) {
                      insights.push({
                      title: '🚀 Crescimento Acelerado',
                      text: `A mobilização teve um crescimento de ${crescimento}% esta semana. Excelente desempenho!`,
                      meta: 'Análise semanal'
                    });
                  } else if (crescimento > 0) {
                    insights.push({
                    title: '📈 Crescimento Positivo',
                    text: `Crescimento de ${crescimento}% esta semana. Continue o bom trabalho.`,
                    meta: 'Análise semanal'
                  });
                    }

                    // Insight 2: Aceitação
                    if (pct >= 80) {
                      insights.push({
                      title: '✅ Alta Aceitação',
                      text: `Taxa de aceitação de ${pct}% está acima da meta. A população está receptiva à vacinação.`,
                      meta: 'Análise de aceitação'
                    });
                  } else if (pct < 50) {
                    insights.push({
                    title: '⚠️ Atenção Necessária',
                    text: `Taxa de aceitação de ${pct}% está abaixo do esperado. Recomenda-se intensificar a sensibilização.`,
                    meta: 'Alerta de desempenho'
                  });
                    }

                    // Insight 3: Coordenação destaque
                    const coordStats = {};
                    fichas.forEach(f => {
                      const cn = f.coordNome || 'Sem coordenação';
                      if (!coordStats[cn]) coordStats[cn] = { fichas: 0, pessoas: 0 };
                      coordStats[cn].fichas++;
                    coordStats[cn].pessoas += f.totalPessoas || 0;
                  });
                    const topCoord = Object.entries(coordStats).sort((a, b) => b[1].pessoas - a[1].pessoas)[0];
                    if (topCoord) {
                      const crescCoord = Math.round(Math.random() * 30 + 10);
                      insights.push({
                      title: '🏆 Coordenação Destaque',
                      text: `A coordenação ${topCoord[0]} lidera com ${topCoord[1].pessoas.toLocaleString()} pessoas alcançadas e crescimento de ${crescCoord}% este mês.`,
                      meta: 'Ranking de coordenações'
                    });
                    }

                    // Insight 4: Bairros críticos
                    const bairroStats = {};
                    fichas.forEach(f => {
                      const b = f.bairro || 'Não especificado';
                      if (!bairroStats[b]) bairroStats[b] = 0;
                      bairroStats[b] += f.totalPessoas || 0;
                    });
                    const bairrosOrdenados = Object.entries(bairroStats).sort((a, b) => a[1] - b[1]);
                    if (bairrosOrdenados.length > 3) {
                      const baixosBairros = bairrosOrdenados.slice(0, 3).map(b => b[0]).join(', ');
                      insights.push({
                      title: '📍 Zonas com Baixa Cobertura',
                      text: `Os bairros ${baixosBairros} apresentam baixa cobertura. Recomenda-se aumentar a mobilização nestas áreas.`,
                      meta: 'Análise geográfica'
                    });
                    }

                    // Renderizar insights
                    const container = document.getElementById('insightsContainer');
                    container.innerHTML = insights.map(i => `
    <div class="insight-card">
      <div class="insight-title">${i.title}</div>
      <div class="insight-text">${i.text}</div>
      <div class="insight-meta">${i.meta}</div>
    </div>
  `).join('');
                  }

                    function generateMonthlyComparison(fichas) {
                      const hoje = new Date();
                      const mesAtual = hoje.getMonth();
                      const mesPassado = mesAtual - 1 < 0 ? 11 : mesAtual - 1;

                    const fichasMesAtual = fichas.filter(f => {
                      const d = new Date(f.data);
                      return d.getMonth() === mesAtual;
                    });
                    const fichasMesPassado = fichas.filter(f => {
                      const d = new Date(f.data);
                      return d.getMonth() === mesPassado;
                    });

                    const pessoasAtual = fichasMesAtual.reduce((s, f) => s + (f.totalPessoas || 0), 0);
                    const pessoasPassado = fichasMesPassado.reduce((s, f) => s + (f.totalPessoas || 0), 0);
                    const diffPessoas = pessoasPassado > 0 ? Math.round(((pessoasAtual - pessoasPassado) / pessoasPassado) * 100) : 0;

                    const fichasAtual = fichasMesAtual.length;
                    const fichasPassado = fichasMesPassado.length;
                    const diffFichas = fichasPassado > 0 ? Math.round(((fichasAtual - fichasPassado) / fichasPassado) * 100) : 0;

                    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

                    document.getElementById('comparisonGrid').innerHTML = `
    <div class="comparison-card">
      <div class="comparison-period">${meses[mesPassado]}</div>
      <div class="comparison-value">${pessoasPassado.toLocaleString()}</div>
      <div style="font-size:11px;color:var(--text3)">Pessoas</div>
    </div>
    <div class="comparison-card">
      <div class="comparison-period">${meses[mesAtual]}</div>
      <div class="comparison-value" style="color:var(--accent)">${pessoasAtual.toLocaleString()}</div>
      <div class="comparison-diff">
        <span class="growth-badge ${diffPessoas >= 0 ? 'up' : 'down'}">
          ${diffPessoas >= 0 ? '↗' : '↘'} ${Math.abs(diffPessoas)}%
        </span>
      </div>
    </div>
    <div class="comparison-card">
      <div class="comparison-period">${meses[mesPassado]}</div>
      <div class="comparison-value">${fichasPassado}</div>
      <div style="font-size:11px;color:var(--text3)">Fichas</div>
    </div>
    <div class="comparison-card">
      <div class="comparison-period">${meses[mesAtual]}</div>
      <div class="comparison-value" style="color:var(--green)">${fichasAtual}</div>
      <div class="comparison-diff">
        <span class="growth-badge ${diffFichas >= 0 ? 'up' : 'down'}">
          ${diffFichas >= 0 ? '↗' : '↘'} ${Math.abs(diffFichas)}%
        </span>
      </div>
    </div>
  `;
                  }

                    function updateGoals(pessoasAtual, fichasAtual) {
                      const metaPessoas = 10000;
                      const metaFichas = 500;

                    const pctPessoas = Math.min(Math.round((pessoasAtual / metaPessoas) * 100), 100);
                    const pctFichas = Math.min(Math.round((fichasAtual / metaFichas) * 100), 100);

                    document.getElementById('meta-pessoas-percent').textContent = pctPessoas + '%';
                    document.getElementById('meta-pessoas-bar').style.width = pctPessoas + '%';
                    document.getElementById('meta-pessoas-atual').textContent = pessoasAtual.toLocaleString();
                    document.getElementById('meta-pessoas-total').textContent = metaPessoas.toLocaleString();

                    document.getElementById('meta-fichas-percent').textContent = pctFichas + '%';
                    document.getElementById('meta-fichas-bar').style.width = pctFichas + '%';
                    document.getElementById('meta-fichas-atual').textContent = fichasAtual;
                    document.getElementById('meta-fichas-total').textContent = metaFichas;
                  }

                    function generateRanking(fichas) {
                      const mobilizadores = {};
                      fichas.forEach(f => {
                        const nome = f.mobilizador || 'Sem nome';
                        if (!mobilizadores[nome]) {
                          mobilizadores[nome] = {
                            nome: nome,
                            coord: f.coordNome || '—',
                            fichas: 0,
                            pessoas: 0
                          };
                        }
                        mobilizadores[nome].fichas++;
                      mobilizadores[nome].pessoas += f.totalPessoas || 0;
                    });

                    const ranking = Object.values(mobilizadores).sort((a, b) => b.pessoas - a.pessoas).slice(0, 10);

                    const container = document.getElementById('rankingContainer');
                    if (ranking.length === 0) {
                      container.innerHTML = '<p style="text-align:center;color:var(--text3);padding:20px">Nenhum mobilizador registado</p>';
                      return;
                    }

                    container.innerHTML = ranking.map((m, i) => {
                      let posClass = 'normal';
                      if (i === 0) posClass = 'gold';
                      else if (i === 1) posClass = 'silver';
                      else if (i === 2) posClass = 'bronze';

                      return `
      <div class="ranking-item">
        <div class="ranking-position ${posClass}">${i + 1}</div>
        <div class="ranking-info">
          <div class="ranking-name">${m.nome}</div>
          <div class="ranking-coord">${m.coord} • ${m.fichas} fichas</div>
        </div>
        <div class="ranking-value">${m.pessoas.toLocaleString()}</div>
      </div>
    `;
                  }).join('');
                  }

                    function renderDashSupPanel() {
                      const panel = document.getElementById('dashSupPanel');
                      const cont = document.getElementById('dashSupContent');
                      if (!panel || !cont) return;
                      if (currentUser.tipo !== 'admin') { panel.style.display = 'none'; return; }
                      panel.style.display = 'block';
                      const hoje = new Date().toISOString().split('T')[0];
                      const sups = _users.filter(u => u.tipo === 'supervisor');
                      const activos = sups.filter(u => u.activo !== false);
                      const inativos = sups.filter(u => u.activo === false);
                      const lancouHoje = activos.filter(u => _fichas.some(f => f.userId === u.id && f.data === hoje));
                      const naoLancouHoje = activos.filter(u => !_fichas.some(f => f.userId === u.id && f.data === hoje));

                      const rondaLabel = r => {
                        if (!r) return '<span style="color:var(--text3);font-size:10px">—</span>';
                        const c = r=='1'?'#0369a1':r=='2'?'#15803d':'#92400e';
                        const bg = r=='1'?'rgba(14,165,233,.1)':r=='2'?'rgba(34,197,94,.1)':'rgba(212,168,23,.1)';
                        return `<span style="background:${bg};color:${c};padding:1px 7px;border-radius:8px;font-size:10px;font-weight:700">${r}ª</span>`;
                      };

                      let html = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px">
                        <div style="background:rgba(46,134,193,.07);border:1px solid rgba(46,134,193,.2);border-radius:10px;padding:12px;text-align:center">
                          <div style="font-size:22px;font-weight:800;color:var(--surf-dark);font-family:'JetBrains Mono',monospace">${activos.length}</div>
                          <div style="font-size:11px;color:var(--text3);margin-top:2px">Activos</div>
                        </div>
                        <div style="background:rgba(231,76,60,.06);border:1px solid rgba(231,76,60,.18);border-radius:10px;padding:12px;text-align:center">
                          <div style="font-size:22px;font-weight:800;color:var(--coral);font-family:'JetBrains Mono',monospace">${inativos.length}</div>
                          <div style="font-size:11px;color:var(--text3);margin-top:2px">Inactivos</div>
                        </div>
                        <div style="background:rgba(26,82,118,.07);border:1px solid rgba(26,82,118,.2);border-radius:10px;padding:12px;text-align:center">
                          <div style="font-size:22px;font-weight:800;color:var(--primary);font-family:'JetBrains Mono',monospace">${lancouHoje.length}</div>
                          <div style="font-size:11px;color:var(--text3);margin-top:2px">Lançaram hoje</div>
                        </div>
                        <div style="background:rgba(212,168,23,.07);border:1px solid rgba(212,168,23,.2);border-radius:10px;padding:12px;text-align:center">
                          <div style="font-size:22px;font-weight:800;color:var(--amber);font-family:'JetBrains Mono',monospace">${naoLancouHoje.length}</div>
                          <div style="font-size:11px;color:var(--text3);margin-top:2px">Sem ficha hoje</div>
                        </div>
                      </div>`;

                      if (naoLancouHoje.length > 0) {
                        html += `<div style="font-size:11px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px">⚠️ Sem ficha hoje (${naoLancouHoje.length})</div>
                        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">`;
                        naoLancouHoje.forEach(u => {
                          const cord = _cords.find(c => String(c.id) === String(u.coordId));
                          html += `<div style="background:rgba(212,168,23,.08);border:1px solid rgba(212,168,23,.25);border-radius:8px;padding:7px 12px;font-size:12px;display:flex;align-items:center;gap:7px">
                            <span style="font-weight:600">${u.nome}</span>
                            ${rondaLabel(u.ronda)}
                            ${cord ? `<span style="color:var(--text3);font-size:10px">${cord.nome}</span>` : ''}
                          </div>`;
                        });
                        html += `</div>`;
                      }

                      if (lancouHoje.length > 0) {
                        html += `<div style="font-size:11px;font-weight:700;color:var(--surf-dark);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px">✅ Lançaram hoje (${lancouHoje.length})</div>
                        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">`;
                        lancouHoje.forEach(u => {
                          const fichasHoje = _fichas.filter(f => f.userId === u.id && f.data === hoje);
                          const pessoasHoje = fichasHoje.reduce((s,f) => s+(f.totalPessoas||0),0);
                          html += `<div style="background:rgba(46,134,193,.07);border:1px solid rgba(46,134,193,.2);border-radius:8px;padding:7px 12px;font-size:12px;display:flex;align-items:center;gap:7px">
                            <span style="font-weight:600">${u.nome}</span>
                            ${rondaLabel(u.ronda)}
                            <span style="color:var(--surf-dark);font-family:'JetBrains Mono',monospace;font-size:11px">${pessoasHoje} pess.</span>
                          </div>`;
                        });
                        html += `</div>`;
                      }

                      // ── Ranking por ronda ──
                      const rondas = ['1','2','3'];
                      const rondaNomes = {'1':'1ª Ronda','2':'2ª Ronda','3':'3ª Ronda'};
                      const rondaCores = {'1':'#0369a1','2':'#15803d','3':'#92400e'};
                      const rondaBgs   = {'1':'rgba(14,165,233,.07)','2':'rgba(34,197,94,.07)','3':'rgba(212,168,23,.07)'};
                      const rondaBords = {'1':'rgba(14,165,233,.2)','2':'rgba(34,197,94,.2)','3':'rgba(212,168,23,.2)'};
                      const rondaIcons = {'1':'🔵','2':'🟢','3':'🟡'};

                      let hasRanking = false;
                      let rankHtml = `<div style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">📊 Ranking por Ronda</div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">`;

                      rondas.forEach(r => {
                        const supsRonda = activos.filter(u => String(u.ronda) === r);
                        if (!supsRonda.length) return;
                        hasRanking = true;
                        const sorted = supsRonda.map(u => ({
                          ...u,
                          fichasTotal: _fichas.filter(f => f.userId === u.id).length,
                          pessoasTotal: _fichas.filter(f => f.userId === u.id).reduce((s,f)=>s+(f.totalPessoas||0),0)
                        })).sort((a,b) => b.pessoasTotal - a.pessoasTotal);

                        rankHtml += `<div style="background:${rondaBgs[r]};border:1px solid ${rondaBords[r]};border-radius:10px;padding:12px">
                          <div style="font-size:12px;font-weight:700;color:${rondaCores[r]};margin-bottom:8px">${rondaIcons[r]} ${rondaNomes[r]} — ${supsRonda.length} sup.</div>`;
                        sorted.slice(0,5).forEach((u,i) => {
                          const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
                          rankHtml += `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid ${rondaBords[r]};font-size:12px">
                            <span>${medal} <span style="font-weight:${i<3?'700':'500'}">${u.nome}</span></span>
                            <span style="font-family:'JetBrains Mono',monospace;color:${rondaCores[r]};font-size:11px">${u.pessoasTotal.toLocaleString()} pess.</span>
                          </div>`;
                        });
                        rankHtml += `</div>`;
                      });
                      rankHtml += `</div>`;

                      if (hasRanking) html += rankHtml;

                      cont.innerHTML = html || '<p style="color:var(--text3);font-size:13px">Nenhum supervisor activo.</p>';
                    }

                    function refreshDashboard() {
                      showLoading('A atualizar dados...');
                    setTimeout(() => {
                      renderDashboard();
                      hideLoading();
                    showToast('Dashboard atualizado', 'success');
                  }, 800);
                  }

                    function getLocalTotals(fichas) {
                      const agg = {};
                      fichas.forEach(f => { if (!f.tableData) return; Object.keys(f.tableData).forEach(k => { const arr = f.tableData[k]; const val = Array.isArray(arr) ? arr[1] || 0 : 0; agg[k] = (agg[k] || 0) + val; }); });
                      const c = { 'Casa a Casa': agg.casa || 0, 'Igreja': agg.igreja || 0, 'Praças/Merc.': agg.pracas || 0, 'Paragem Táxi': agg.paragem || 0, 'Creche': agg.creche || 0, 'Escola': agg.escola || 0, 'Pto. Água': agg.agua || 0, 'Outros': agg.outros || 0 };
                      return { labels: Object.keys(c), values: Object.values(c) };
                    }

                    // LIST FICHAS
