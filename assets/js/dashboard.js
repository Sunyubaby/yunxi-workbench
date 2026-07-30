/* ===== 云兮工作台 · 首页仪表盘 ===== */
window.Dashboard = (function () {

  /* ---- 确保今日循环打卡记录存在 ---- */
  function ensureToday() {
    const today = U.todayISO();
    let nut = DB.getCol('nutrition').filter(r => r.date === today);
    if (!nut.length) {
      DB.add('nutrition', { date: today, type: '维D', dose: '400IU', done: false, note: '' });
      DB.add('nutrition', { date: today, type: '钙剂', dose: '半包', done: false, note: '' });
    }
    if (!DB.getCol('healthCheckin').some(r => r.date === today)) {
      DB.add('healthCheckin', { date: today, nutrient: '复合维生素+钙片', calcium: false, note: '' });
    }
    if (!DB.getCol('englishCheckin').some(r => r.date === today)) {
      DB.add('englishCheckin', { date: today, listening: false, speaking: false, vocab: false, review: false, note: '', material: '' });
    }
  }

  function toggleCheck(col, id, field) {
    const arr = UI.resolveArr(col);
    const it = arr.find(r => r.id === id);
    if (it) { it[field] = !it[field]; UI.commitArr(col, arr); App.refresh(); }
  }

  /* ---- 聚合所有提醒 ---- */
  function collectReminders() {
    const list = [];
    DB.getCol('vaccines').forEach(v => { if (v.nextDate) list.push({ cat: '疫苗', icon: '🛡️', title: v.name, date: v.nextDate, sub: '下次接种' }); });
    DB.getCol('checkups').forEach(c => { if (c.nextDate) list.push({ cat: '体检', icon: '📏', title: (c.month ? c.month + '月儿保' : '儿保体检'), date: c.nextDate, sub: '下次体检' }); });
    DB.getCol('insurance').forEach(i => { if (i.payDate) list.push({ cat: '保险续保', icon: '📄', title: i.person + '·' + i.name, date: i.payDate, sub: '缴费日' }); });
    DB.getCol('bills').forEach(b => { const d = U.billNextDate(b.payDay); if (d) list.push({ cat: '账单', icon: '🏦', title: b.name + '还款', date: d, sub: '每月' + b.payDay + '号' }); });
    (DB.get().douyin.plans || []).forEach(p => { if (p.date) list.push({ cat: '视频发布', icon: '🎬', title: p.idea, date: p.date, sub: '计划·' + (p.status || '') }); });
    DB.getCol('todos').forEach(t => { if (t.due && !t.done) list.push({ cat: '待办', icon: '📌', title: t.title, date: t.due, sub: '截止' }); });
    DB.getCol('inventory').forEach(inv => {
      const d = U.estimateDeplete(inv.stock, inv.dailyUse);
      const stock = Number(inv.stock) || 0, warn = Number(inv.warnLine) || 0;
      if (stock <= warn && d) list.push({ cat: '物资采购', icon: '🛒', title: inv.name, date: d, sub: '库存低于预警线' });
    });
    list.sort((a, b) => U.daysUntil(a.date) - U.daysUntil(b.date));
    return list;
  }

  function monthFinance() {
    const y = new Date().getFullYear(), m = new Date().getMonth();
    const rows = DB.getCol('ledger').filter(l => { const d = new Date(l.date); return d.getFullYear() === y && d.getMonth() === m; });
    let inc = 0, out = 0, child = 0;
    rows.forEach(r => {
      const a = Number(r.amount) || 0;
      if (r.type === '收入') inc += a;
      else { out += a; if (r.category === '育儿支出') child += a; }
    });
    return { inc, out, balance: inc - out, child, childPct: U.pct(child, out), savingGoal: DB.get().settings.savingGoal, savingCur: DB.get().settings.savingCurrent };
  }

  const STAGE = {
    1: { name: '第1月 · 听力输入积累', items: ['每日听力 30min+', '积累 300+ 听力词汇', '熟悉常见句型语调'] },
    2: { name: '第2月 · 短句输出', items: ['每日跟读 15 组句型', '能说 50+ 实用短句', '简单自我介绍'] },
    3: { name: '第3月 · 自由交流', items: ['每日 15min 自由对话', '能聊日常话题', '和外国人流畅沟通'] }
  };

  function englishProgress() {
    const s = DB.get().settings;
    const months = s.englishMonths || 3, total = months * 30;
    const elapsed = s.englishStart ? (-U.daysUntil(s.englishStart)) : 0;
    const overall = U.pct(elapsed, total);
    const stage = elapsed <= 30 ? 1 : elapsed <= 60 ? 2 : 3;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    const recent = DB.getCol('englishCheckin').filter(e => new Date(e.date) >= cutoff);
    const keys = ['listening', 'speaking', 'vocab', 'review'];
    let doneDays = 0; recent.forEach(e => { if (keys.some(k => e[k])) doneDays++; });
    return { overall, stage, weekPct: U.pct(doneDays, 7), daysLeft: Math.max(0, total - elapsed) };
  }

  function babyGrowth() {
    const skills = DB.getCol('skills');
    const cats = ['大运动', '精细动作', '语言', '社交'];
    const counts = {}; cats.forEach(c => counts[c] = skills.filter(s => s.category === c).length);
    const latest = skills.slice().sort((a, b) => new Date(b.achievedDate) - new Date(a.achievedDate))[0];
    return { total: skills.length, counts, latest };
  }

  /* ---- 渲染 ---- */
  function render(root) {
    ensureToday();
    const fin = monthFinance();
    const rem = collectReminders();
    const ep = englishProgress();
    const bg = babyGrowth();
    const ideas = window.Inspiration ? Inspiration.today() : [];
    const soonCount = rem.filter(r => U.daysUntil(r.date) <= 7).length;

    const overview = `
      <div class="grid grid-4" style="margin-bottom:16px">
        <div class="stat"><div class="stat-label">💰 本月结余</div><div class="stat-value">${U.money(fin.balance)}</div><div class="stat-foot">收入 ${U.money(fin.inc)} · 支出 ${U.money(fin.out)}</div></div>
        <div class="stat"><div class="stat-label">⏰ 临近提醒</div><div class="stat-value">${soonCount}<span style="font-size:14px;color:var(--ink-faint)"> 项</span></div><div class="stat-foot">未来30天共 ${rem.length} 项</div></div>
        <div class="stat"><div class="stat-label">🌟 宝宝技能</div><div class="stat-value">${bg.total}<span style="font-size:14px;color:var(--ink-faint)"> 项</span></div><div class="stat-foot">${bg.latest ? '最近：' + U.escapeHtml(bg.latest.name) : '暂无'}</div></div>
        <div class="stat"><div class="stat-label">🗣️ 英语进度</div><div class="stat-value">${ep.overall}%</div><div class="stat-foot">第 ${ep.stage} 阶段 · 剩 ${ep.daysLeft} 天</div></div>
      </div>`;

    // 今日打卡
    const today = U.todayISO();
    const nut = DB.getCol('nutrition').filter(r => r.date === today);
    const health = DB.getCol('healthCheckin').filter(r => r.date === today)[0];
    const eng = DB.getCol('englishCheckin').filter(r => r.date === today)[0];
    const nutHTML = nut.map(n => `
      <div class="today-task">
        <input type="checkbox" class="tk" data-act="toggle" data-col="nutrition" data-id="${n.id}" data-field="done" ${n.done ? 'checked' : ''}/>
        <span class="tt-text">${U.escapeHtml(n.type)} <span class="muted">${U.escapeHtml(n.dose || '')}</span></span>
        ${n.done ? '<span class="chip mint">已打卡</span>' : '<span class="chip gray">待打卡</span>'}
      </div>`).join('');
    const healthHTML = health ? `
      <div class="today-task">
        <input type="checkbox" class="tk" data-act="toggle" data-col="healthCheckin" data-id="${health.id}" data-field="calcium" ${health.calcium ? 'checked' : ''}/>
        <span class="tt-text">${U.escapeHtml(health.nutrient || '每日营养素')}</span>
        ${health.calcium ? '<span class="chip mint">钙剂✓</span>' : '<span class="chip gray">钙剂—</span>'}
      </div>` : '<div class="muted">—</div>';
    const engKeys = [['listening', '听力练习'], ['speaking', '口语跟读'], ['vocab', '生词积累'], ['review', '当日复盘']];
    const engHTML = eng ? `<div class="kpi-row">` + engKeys.map(([k, lbl]) => `
      <label class="chip ${eng[k] ? 'mint' : 'gray'}" style="cursor:pointer">
        <input type="checkbox" data-act="toggle" data-col="englishCheckin" data-id="${eng.id}" data-field="${k}" ${eng[k] ? 'checked' : ''} style="width:14px;height:14px;vertical-align:-2px"/> ${lbl}
      </label>`).join('') + `</div>` : '<div class="muted">—</div>';

    const todayCard = `
      <div class="card">
        <div class="card-head"><div class="card-title"><span class="ico">✅</span>今日待办打卡</div><span class="card-sub">${today}</span></div>
        <div class="today-panel">
          <div class="today-group"><h4>🍼 宝宝营养补充</h4>${nutHTML}</div>
          <div class="today-group"><h4>🥗 个人健康打卡</h4>${healthHTML}</div>
          <div class="today-group"><h4>🗣️ 英语学习（3个月流利沟通）</h4>${engHTML}</div>
        </div>
      </div>`;

    // 近期倒计时
    const remTop = rem.slice(0, 6).map(r => `
      <div class="reminder-item">
        <div class="ri-ico">${r.icon}</div>
        <div class="ri-main"><div class="ri-title">${U.escapeHtml(r.title)}</div><div class="ri-sub">${r.cat} · ${U.escapeHtml(r.sub || '')}</div></div>
        ${U.countdownBadge(r.date)}
      </div>`).join('') || '<div class="empty">暂无临近事项</div>';
    const remCard = `
      <div class="card">
        <div class="card-head"><div class="card-title"><span class="ico">⏰</span>近期倒计时事项</div><span class="card-sub" data-act="goto" data-route="#/supplies/reminders" style="cursor:pointer;color:var(--primary)">查看全部 →</span></div>
        <div class="record-list">${remTop}</div>
      </div>`;

    // 宝宝成长
    const catHTML = ['大运动', '精细动作', '语言', '社交'].map(c => `
      <div class="mini-stat"><span class="ms-label">${c}</span><span class="ms-value">${bg.counts[c]}</span></div>`).join('');
    const growthCard = `
      <div class="card">
        <div class="card-head"><div class="card-title"><span class="ico">🌟</span>宝宝成长进度</div><span class="card-sub" data-act="goto" data-route="#/parenting/skills" style="cursor:pointer;color:var(--primary)">去记录 →</span></div>
        <div class="kpi-row" style="margin-bottom:12px">${catHTML}</div>
        ${bg.latest ? `<div class="section-desc">最近达成：<b>${U.escapeHtml(bg.latest.name)}</b> · ${U.fmtDate(bg.latest.achievedDate)} · <span class="chip">${U.escapeHtml(bg.latest.category)}</span></div>` : '<div class="muted">还没有技能记录，快去记录宝宝的第一次吧～</div>'}
      </div>`;

    // 英语进度
    const sg = STAGE[ep.stage];
    const stageHTML = sg.items.map(i => `<div class="record-meta">• ${U.escapeHtml(i)}</div>`).join('');
    const engCard = `
      <div class="card">
        <div class="card-head"><div class="card-title"><span class="ico">🗣️</span>3个月英语学习进度</div><span class="card-sub">目标：和外国人流畅沟通</span></div>
        ${U.progressBar(ep.overall, '总目标进度')}
        <div class="card-sub" style="margin:14px 0 6px;font-weight:700;color:var(--ink)">当前阶段：${U.escapeHtml(sg.name)}</div>
        ${stageHTML}
        <div class="progress-label" style="margin-top:12px"><span>近7天打卡</span><span>${ep.weekPct}%</span></div>
        ${U.progressBar(ep.weekPct)}
      </div>`;

    // 抖音灵感
    const ideaHTML = ideas.map((it, i) => `
      <div class="idea-card">
        <span class="idea-tag chip ${it.fromHot ? 'pink' : 'gold'}">${it.fromHot ? '🔥 高潜力' : '✨ 灵感' + (i + 1)}</span>
        <div class="idea-title">${U.escapeHtml(it.title)}</div>
        <div class="idea-desc">${U.escapeHtml(it.desc)}</div>
        <div class="idea-foot"><span class="chip sky">${U.escapeHtml(it.tags || '#云兮日常')}</span></div>
        <div class="idea-actions"><button class="btn-soft btn-sm" data-act="adopt" data-title="${U.escapeHtml(it.title)}">＋ 采纳为拍摄计划</button></div>
      </div>`).join('');
    const ideaCard = `
      <div class="card">
        <div class="card-head"><div class="card-title"><span class="ico">🎬</span>今日抖音拍摄灵感</div><span class="card-sub" data-act="goto" data-route="#/personal/douyin" style="cursor:pointer;color:var(--primary)">抖音运营 →</span></div>
        <div class="grid grid-3">${ideaHTML}</div>
      </div>`;

    // 财务汇总
    const finCard = `
      <div class="card">
        <div class="card-head"><div class="card-title"><span class="ico">💰</span>本月财务简要汇总</div><span class="card-sub" data-act="goto" data-route="#/finance/stats" style="cursor:pointer;color:var(--primary)">详细统计 →</span></div>
        <div class="kpi-row" style="margin-bottom:12px">
          <div class="mini-stat"><span class="ms-label">收入</span><span class="ms-value" style="color:var(--ok)">${U.money(fin.inc)}</span></div>
          <div class="mini-stat"><span class="ms-label">支出</span><span class="ms-value" style="color:var(--danger)">${U.money(fin.out)}</span></div>
          <div class="mini-stat"><span class="ms-label">育儿占比</span><span class="ms-value">${fin.childPct}%</span></div>
        </div>
        <div class="progress-label"><span>储蓄目标进度（${U.money(fin.savingCur)} / ${U.money(fin.savingGoal)}）</span><span>${U.pct(fin.savingCur, fin.savingGoal)}%</span></div>
        ${U.progressBar(U.pct(fin.savingCur, fin.savingGoal))}
      </div>`;

    root.innerHTML = overview +
      `<div class="grid grid-2">${todayCard}${remCard}</div>` +
      `<div class="grid grid-2" style="margin-top:16px">${growthCard}${engCard}</div>` +
      `<div class="grid grid-2" style="margin-top:16px">${ideaCard}${finCard}</div>`;

    bind(root);
  }

  function bind(root) {
    root.querySelectorAll('[data-act]').forEach(el => {
      el.onclick = () => {
        const act = el.dataset.act;
        if (act === 'toggle') toggleCheck(el.dataset.col, el.dataset.id, el.dataset.field);
        else if (act === 'adopt') {
          const title = el.dataset.title;
          DB.get().douyin.plans.unshift({ id: U.uid('dp'), date: U.todayISO(), idea: title, status: '待拍摄' });
          DB.save(); U.toast('已加入发布计划', 'ok'); App.refresh();
        } else if (act === 'goto') App.navigate(el.dataset.route);
      };
    });
  }

  return { render, collectReminders };
})();
