
  (() => {
    'use strict';
    const { history, semesters, targets, model, storage } = Roadmap;
    const completed = model.completed(history);
    const completedCredits = completed.total;
    const graduationCredits = Object.values(targets).reduce((a,b) => a+b, 0);
    const tagNames = { ai: 'AI', sys: 'SYS', sw: 'SW' };
    const bucketClasses = { '△': 'gened', '▲': 'major', '★': 'elec', '跨域': 'cross' };
    const state = storage.load(semesters);
    function save() {
      document.querySelector('#save-status').textContent = storage.save(state) ? '' : '無法儲存至瀏覽器，請匯出規劃備份。';
    }
    function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]); }
    function bar(value, total, color = 'var(--blue)') { return `<div class="bar"><i style="width:${Math.min(value / total * 100, 100)}%;background:${color}"></i></div>`; }
    function bucket(b) { return `<span class="bucket ${bucketClasses[b] || 'gened'}">${b}</span>`; }
    function loadInfo(cr) { return cr === 0 ? ['尚未規劃', 'info'] : cr <= 12 ? ['輕鬆', 'green'] : cr <= 17 ? ['正常', 'info'] : cr <= 20 ? ['偏重', 'warn'] : ['過重', 'danger']; }
    function courseId(s, c) { return `${s.sem}::${c.n}`; }
    function electiveCredits(s) { return model.electiveCredits(s, state); }
    function projection() { return model.project(history, semesters, state, targets); }
    function renderStaticTop() {
      const stats = [[`${completedCredits} / ${graduationCredits}`, '已取得學分 / 規劃目標'], [history.length, '已記錄學期'], [completed.withdrawn, '撤選課程（不計學分）'], [completed.zeroCredit, '已通過零學分課程']];
      document.querySelector('#stats').innerHTML = stats.map(([v,l]) => `<div class="stat"><strong>${v}</strong><span class="small">${l}</span></div>`).join('');
      document.querySelector('#done-grid').innerHTML = history.map(s => `<div class="done"><div class="small">${s.yr} · ${s.sem} · ${model.completed([s]).total}cr</div><strong>${s.average == null ? '—' : s.average.toFixed(1)}</strong><div class="small">${s.average == null ? '學期平均未提供' : '成績單學期平均'}</div></div>`).join('');
    }
    const labels = { gened: '共同必修 △', major: '專業必修 ▲', elec: '專業選修 ★', free: '跨域+自由' };
    function renderHistory() {
      document.querySelector('#history').innerHTML = `<p class="history-intro">五個已記錄學期 · 四份成績單加上 115-0 暑期校外實習紀錄。課名、階段、學分與成績依來源記錄；W 撤選不計入取得學分，零學分課程仍保留。</p>` + history.map(s => { const average = s.average == null ? '未提供' : s.average.toFixed(1); const meta = c => [c.number, c.code, c.stage == null ? '' : `階段 ${c.stage}`, c.emi ? 'EMI' : ''].filter(Boolean).join(' · '); const source = s.kind === 'user-confirmed' ? '來源：使用者補充（已取得學分）' : `來源：${s.source} · 列印 ${s.printed}（民國） · 成績單修習 ${s.reportedCredits}cr / 實得 ${s.reportedEarned}cr · 操行 ${s.conduct}`; return `<details class="card history-card" open><summary><strong>${s.sem} <span class="small">${s.yr}</span></strong><span>${model.completed([s]).total} cr 已取得 · 平均 ${average}</span></summary><div class="table-wrap"><table><caption class="hide">${s.sem} 修課紀錄</caption><thead><tr><th scope="col">課程</th><th scope="col">修別</th><th scope="col">學分</th><th scope="col">成績</th><th scope="col">取得</th></tr></thead><tbody>${s.courses.map(c => `<tr class="${c.score === 'W' ? 'retake' : ''}"><td>${escapeHtml(c.name)}<span class="course-meta">${meta(c)}</span></td><td>${c.type}</td><td>${c.credits}</td><td>${c.status || (c.score === 'W' ? 'W 撤選' : c.score)}</td><td>${model.earned(c)}</td></tr>`).join('')}</tbody></table></div><div class="history-note">${source}<br>必＝必修、選＝選修、通＝通識；EMI＝全英語授課。${s.sem === '114-2' ? ' 成績單修習 19cr 已排除兩門撤選的 6cr。' : ''}${s.kind === 'user-confirmed' ? ' 此筆資料沒有附成績單，平均欄位保留為未提供。' : ''}</div></details>`; }).join('');
    }
    function renderPlanner() {
      let html = semesters.map(s => semesterCard(s)).join('');
      const p = projection(), planned = p.planned, needed = graduationCredits - completedCredits;
      const star = p.buckets.elec, cross = p.buckets.free, total = p.total, starOverflow = p.overflow;
      const totalEnough = total >= graduationCredits, categoriesEnough = p.categoriesEnough, track = totalEnough && categoriesEnough;
      const status = totalEnough ? (categoriesEnough ? '✓ 已達規劃學分目標' : '總學分足夠，分類未達標') : `還差 ${graduationCredits - total} cr`;
      html += `<div class="notice">⚠ <strong>115-2 補修注意：</strong>電子學(二) 3cr + 機率 3cr 要在同一學期補修，加上其餘 4cr 必修，115-2 必修共 10cr。選修盡量控制，避免過重。</div><section class="summary"><div class="summary-head"><strong>畢業計劃總覽 <span class="small">(115-1 以後)</span></strong><span class="${track ? 'ok-text' : 'warn-text'}"><b>${planned} / ${needed}</b> ${status}</span></div>${bar(planned, needed, track ? 'var(--green)' : 'var(--amber)')}<div class="summary-grid">${mini('★ 選修', star, 21)}${mini('跨域+自由', cross, 20)}${mini('畢業總學分', total, graduationCredits)}</div><div class="small" style="margin-top:9px">既有規劃假設（待核對）：必修博雅 15cr 計入共同必修；完成後額外博雅最多 4cr 可計入跨域+自由。★ 超過 21cr 的部分會自動轉入跨域+自由${starOverflow ? `（目前 ${starOverflow}cr）` : ''}。</div></section>`;
      document.querySelector('#planner').innerHTML = html;
      document.querySelectorAll('[data-course]').forEach(input => input.addEventListener('change', event => { state.checked[event.target.dataset.course] = event.target.checked; save(); renderPlanner(); renderCredits(); }));
      document.querySelectorAll('[data-cross]').forEach(input => input.addEventListener('change', event => { state.cross[event.target.dataset.cross] = Math.min(20, Math.max(0, Math.trunc(Number(event.target.value) || 0))); save(); renderPlanner(); renderCredits(); }));
    }
    function mini(label, value, total) { const ok = value >= total; return `<div class="mini ${ok ? 'ok' : ''}"><div class="small">${label}</div><strong class="${ok ? 'ok-text' : ''}">${value} / ${total}${ok ? ' ✓' : ''}</strong></div>`; }
    function semesterCard(s) {
      const rc = s.req.reduce((sum, c) => sum + c.cr, 0), ec = electiveCredits(s), cc = Number(state.cross[s.sem]) || 0, total = rc + ec + cc, [level, tone] = loadInfo(total);
      const req = s.req.length ? s.req.map(c => `<div class="course ${c.retake ? 'retake' : ''}"><span class="bucket ${c.retake ? 'badge danger' : bucketClasses[c.b]}">${c.retake ? '補修' : c.b} ${c.cr}cr</span><span>${escapeHtml(c.n)}</span></div>`).join('') : '<div class="small"><i>本學期無必修課</i></div>';
      const choices = s.elec.map(c => { const id = courseId(s, c), on = Boolean(state.checked[id]); return `<label class="choice ${on ? 'on' : ''}"><input type="checkbox" data-course="${escapeHtml(id)}" ${on ? 'checked' : ''}><span><span class="tag ${c.t}">${tagNames[c.t]}</span>${c.pri ? '<span class="warn-text">★</span> ' : ''}${escapeHtml(c.n)} <span class="small">${c.cr}cr</span></span></label>`; }).join('');
      const cross = `<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--line)"><p class="section-label">跨域+自由（本系／他系／校院級）</p><label class="small">本學期預計 <input class="cross-input" type="number" min="0" max="20" step="1" inputmode="numeric" value="${cc}" data-cross="${s.sem}" aria-label="${s.sem} 預計跨域及自由選修學分"> cr</label><div class="small" style="margin-top:5px">不含已勾選的 ★ 課程（超過 21cr 會自動轉入）。若其中包含額外博雅，須先修滿必修 15cr，且額外博雅合計最多 4cr。</div></div>`;
      return `<article class="card ${s.retakeWarning ? 'warning' : ''}"><div class="card-head"><div class="card-title"><div><span class="semester">${s.sem}</span> <span class="small">${s.yr}</span> ${s.retakeWarning ? '<span class="badge danger">⚠ 補修</span>' : ''} ${s.grad ? '<span class="badge warn">畢業學期</span>' : ''}</div><div class="small">${s.note}</div></div><div class="credits"><strong>${total}</strong><span class="small">cr</span><span class="badge ${tone}">${level}</span></div></div><div class="course-columns"><div><p class="section-label">必修 ${rc ? `${rc} cr` : '（無）'}</p>${req}</div><div><p class="section-label">★ 選修 ${ec ? `+${ec} cr 已選` : '（未選）'}</p>${choices}${cross}</div></div><div class="footer ${tone}"><span>${rc}cr 必修${ec ? ` + ${ec}cr ★` : ''}${cc ? ` + ${cc}cr 跨域` : ''} = ${total}cr 合計</span><span>${total ? '已儲存 ✓' : '尚未規劃'}</span></div></article>`;
    }
    function renderCredits() {
      const p = projection();
      const rows = Object.keys(targets).map(id => `<tr><td>${labels[id]}</td><td>${completed.buckets[id]}</td><td>${p.buckets[id]}</td><td>${targets[id]}</td><td>${Math.max(0, targets[id] - p.buckets[id])}</td></tr>`).join('');
      const boya = history.flatMap(s => s.courses).filter(c => c.type === '通').reduce((n,c) => n + model.earned(c), 0);
      document.querySelector('#credits').innerHTML = `<div class="source-note">分類及畢業門檻沿用既有 roadmap，非成績單認證。成績單只列「必／選／通」，不列畢業學分歸屬或博雅向度。選修超過 21cr 轉入跨域+自由、額外博雅上限 4cr 等規則仍需依課程標準核對。達到數字不代表已符合全部畢業條件。</div><div class="credit-top"><strong>已取得 ${completedCredits}cr</strong><span class="small">含規劃 ${p.total} / ${graduationCredits}cr</span></div>${bar(completedCredits, graduationCredits)}<div class="table-wrap"><table><thead><tr><th>規劃分類</th><th>已取得</th><th>含規劃</th><th>目標</th><th>規劃後缺口</th></tr></thead><tbody>${rows}</tbody></table></div><section class="boya" style="margin-top:18px"><strong>博雅／通識：已取得 ${boya}cr</strong><p class="small">已包含在共同必修，勿重複加總。既有目標 15cr；各向度歸屬待課程標準確認。</p>${history.flatMap(s => s.courses).filter(c => c.type === '通').map(c => `<div class="course">${escapeHtml(c.name)} · ${model.earned(c)}cr</div>`).join('')}</section><p class="small">已取得由逐筆課程計算；含規劃包含未來必修、勾選選修與手動跨域學分，尚未實際取得。</p>`;
    }
    function showDialog(kind) {
      const dialog = document.querySelector('#data-dialog'), field = document.querySelector('#data-field'), title = document.querySelector('#dialog-title'), description = document.querySelector('#dialog-description'), confirm = document.querySelector('#dialog-confirm');
      if (kind === 'export') { title.textContent = '匯出你的規劃'; description.textContent = '複製以下內容，然後在另一台裝置選擇「匯入規劃」。'; field.value = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), checked: state.checked, cross: state.cross }, null, 2); field.readOnly = true; confirm.textContent = '複製'; confirm.onclick = async () => { try { await navigator.clipboard.writeText(field.value); confirm.textContent = '已複製'; } catch { field.select(); document.execCommand('copy'); confirm.textContent = '已複製'; } }; }
      else { title.textContent = '匯入你的規劃'; description.textContent = '貼上先前匯出的內容。匯入會覆蓋這個瀏覽器目前的選課資料。'; field.value = ''; field.readOnly = false; confirm.textContent = '匯入'; confirm.onclick = () => { try { const data = JSON.parse(field.value); const clean = storage.validate(data, semesters); state.checked = clean.checked; state.cross = clean.cross; save(); renderPlanner(); renderCredits(); dialog.close(); } catch { description.textContent = '格式無法讀取，請確認貼上的是由本頁匯出的完整內容。'; } }; }
      dialog.showModal(); if (kind === 'export') field.select();
    }
    document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => { const tab = button.dataset.tab; document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === button)); document.querySelector('#history').classList.toggle('hide', tab !== 'history'); document.querySelector('#planner').classList.toggle('hide', tab !== 'planner'); document.querySelector('#credits').classList.toggle('hide', tab !== 'credits'); }));
    document.querySelector('#export-button').addEventListener('click', () => showDialog('export'));
    document.querySelector('#import-button').addEventListener('click', () => showDialog('import'));
    document.querySelector('#reset-button').addEventListener('click', () => { if (confirm('要清除這個瀏覽器中所有已勾選的課程與跨域學分嗎？')) { state.checked = {}; state.cross = {}; save(); renderPlanner(); renderCredits(); } });
    document.querySelector('#dialog-cancel').addEventListener('click', () => document.querySelector('#data-dialog').close());
    renderStaticTop(); renderHistory(); renderPlanner(); renderCredits();
  })();
  