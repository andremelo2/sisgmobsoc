                      }
                      updateTopbar();
                    }
                    function closeShortcuts() {
                      document.getElementById('shortcutsPanel').classList.remove('show');
                    }
                    function openShortcuts() {
                      document.getElementById('shortcutsPanel').classList.add('show');
                    }

                    // Atalhos teclado
                    document.addEventListener('keydown', e => {
                      if (e.ctrlKey && e.key === 'b') { e.preventDefault(); toggleSidebar(); }
                      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); showPage('ficha'); }
                      if (e.ctrlKey && e.key === 'd') { e.preventDefault(); showPage('dashboard'); }
                      if (e.ctrlKey && e.key === 't') { e.preventDefault(); toggleTheme(); }
                      if (e.key === '?' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); openShortcuts(); }
                      if (e.key === 'Escape') { closeSearch(); closeNotifications(); closeShortcuts(); }
                    });

                    // ══════════════════════════════════════════════
                    // EXPORTAÇÃO DE GRÁFICOS (lazy-load sob demanda)
                    // ══════════════════════════════════════════════
                    
                    // Função para exportar gráfico como PDF
                    async function exportChartPDF(chartId, chartName) {
                      showToast('A carregar módulo PDF...', 'info');
                      try {
                        await loadJsPDF();
                        const canvas = document.getElementById(chartId);
                        if (!canvas) { showToast('Gráfico não encontrado', 'error'); return; }
                        
                        const imageData = canvas.toDataURL('image/png');
                        const { jsPDF } = window.jspdf;
                        const doc = new jsPDF({
                          orientation: 'landscape',
                          unit: 'mm',
                          format: 'a4'
                        });
                        
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const pageHeight = doc.internal.pageSize.getHeight();
                        
                        doc.setFontSize(18);
                        doc.text(chartName, pageWidth / 2, 15, { align: 'center' });
                        doc.setFontSize(10);
                        doc.text('Data: ' + new Date().toLocaleDateString('pt-PT'), pageWidth / 2, 22, { align: 'center' });
                        
                        const imgWidth = pageWidth - 20;
                        const imgHeight = (canvas.height * imgWidth) / canvas.width;
                        doc.addImage(imageData, 'PNG', 10, 30, imgWidth, imgHeight);
                        doc.save('Grafico_' + chartName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_' + new Date().toISOString().split('T')[0] + '.pdf');
                        showToast('PDF do gráfico exportado com sucesso!', 'success');
                      } catch(e) {
                        showToast('Erro ao gerar PDF. Verifique a ligação.', 'error');
                      }
                    }
                    
                    // Função para exportar gráfico como Excel
                    async function exportChartExcel(chartId, chartName) {
                      showToast('A carregar módulo Excel...', 'info');
                      try {
                        await loadXLSX();
                        const canvas = document.getElementById(chartId);
                        if (!canvas) { showToast('Gráfico não encontrado', 'error'); return; }
                        
                        let chartInstance;
                        if (chartId === 'chartBar') chartInstance = chartBar;
                        else if (chartId === 'chartDonut') chartInstance = chartDonut;
                        else if (chartId === 'chartBar2') chartInstance = chartBar2;
                        else if (chartId === 'chartLine') chartInstance = chartLine;
                        else if (chartId === 'chartDonut2') chartInstance = chartDonut2;
                        
                        if (!chartInstance) { showToast('Gráfico não encontrado', 'error'); return; }
                        
                        const data = chartInstance.data;
                        const excelData = [];
                        
                        excelData.push({
                          'Gráfico': chartName,
                          'Data Exportação': new Date().toLocaleDateString('pt-PT')
                        });
                        excelData.push({});
                        
                        if (chartId === 'chartLine') {
                          const labels = data.labels || [];
                          const values = data.datasets[0]?.data || [];
                          excelData.push({ 'Data': 'Pessoas' });
                          labels.forEach((label, idx) => {
                            excelData.push({ 'Data': label, 'Pessoas': values[idx] || 0 });
                          });
                        } else if (chartId === 'chartDonut' || chartId === 'chartDonut2') {
                          const labels = data.labels || [];
                          const values = data.datasets[0]?.data || [];
                          excelData.push({ 'Categoria': 'Valor' });
                          labels.forEach((label, idx) => {
                            excelData.push({ 'Categoria': label, 'Valor': values[idx] || 0 });
                          });
                        } else {
                          const labels = data.labels || [];
                          const values = data.datasets[0]?.data || [];
                          excelData.push({ 'Local': 'Pessoas' });
                          labels.forEach((label, idx) => {
                            excelData.push({ 'Local': label, 'Pessoas': values[idx] || 0 });
                          });
                        }
                        
                        const ws = XLSX.utils.json_to_sheet(excelData);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, chartName.substring(0, 30));
                        XLSX.writeFile(wb, 'Grafico_' + chartName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_' + new Date().toISOString().split('T')[0] + '.xlsx');
                        showToast('Excel do gráfico exportado com sucesso!', 'success');
                      } catch(e) {
                        showToast('Erro ao gerar Excel. Verifique a ligação.', 'error');
                      }
                    }


                    // Exportação
                    function exportToPDF() {
                      showToast('Gerando PDF...', 'info');
                      setTimeout(() => {
                        window.print();
                        showToast('PDF gerado', 'success');
                      }, 500);
                    }

                    async function exportToExcel() {
                      showToast('A carregar módulo Excel...', 'info');
                      try {
                        await loadXLSX();
                        const fichas = getVisibleFichas();
                        const data = fichas.map(f => ({
                          'Data': f.data || '',
                          'Mobilizador': f.mobilizador || '',
                          'Bairro': f.bairro || '',
                          'Pessoas': f.totalPessoas || 0
                        }));
                        const ws = XLSX.utils.json_to_sheet(data);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, 'Fichas');
                        XLSX.writeFile(wb, 'SisMob_' + new Date().toISOString().split('T')[0] + '.xlsx');
                        showToast('Excel exportado', 'success');
                      } catch(e) {
                        showToast('Erro ao gerar Excel. Verifique a ligação.', 'error');
                      }
                    }

                    function exportToWord() {
                      const fichas = getVisibleFichas();
                      let html = '<html><head><meta charset="utf-8"></head><body><h1>Relatório SisMob</h1><table border="1"><tr><th>Data</th><th>Mobilizador</th><th>Pessoas</th></tr>';
                      fichas.forEach(f => {
                        html += `<tr><td>${f.data || ''}</td><td>${f.mobilizador || ''}</td><td>${f.totalPessoas || 0}</td></tr>`;
                      });
                      html += '</table></body></html>';
                      const blob = new Blob([html], { type: 'application/msword' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'SisMob_' + new Date().toISOString().split('T')[0] + '.doc';
                      a.click();
                      showToast('Word gerado', 'success');
                    }
