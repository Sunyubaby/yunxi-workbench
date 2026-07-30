/* ===== 云兮工作台 · 四大板块视图 ===== */
window.Inspiration = {
  POOL: [
    { title: '10分钟英语启蒙日常', desc: '和云兮一起唱 SSS 儿歌 + 指认实物，强调零基础可复制。', tags: '#英语启蒙 #庞云兮' },
    { title: '宝宝今日辅食 vlog', desc: '记录一顿营养餐制作过程，真实有温度易涨粉。', tags: '#宝宝辅食 #宝妈' },
    { title: '带娃也能自我提升', desc: '晨间英语听力 + 运动，分享宝妈时间管理法。', tags: '#自我提升 #宝妈日常' },
    { title: '云兮学说话名场面', desc: '剪辑宝宝学词搞笑瞬间，强共鸣强转发。', tags: '#萌娃 #亲子' },
    { title: '新手妈妈避坑干货', desc: '湿疹 / 生长痛护理要点，实用收藏率高。', tags: '#育儿干货 #护理' },
    { title: '亲子游戏 10 分钟', desc: '感官游戏 / 配对游戏，附具体玩法步骤。', tags: '#早教 #亲子游戏' },
    { title: '一个人带娃的一天', desc: '真实时间线记录，引发独带宝妈共鸣。', tags: '#独自带娃 #日常' },
    { title: '英语启蒙好物分享', desc: '精选绘本与工具（软广需标注），种草属性强。', tags: '#好物分享 #英语启蒙' },
    { title: '宝宝成长对比', desc: '按月记录身高体重与技能达成，仪式感拉满。', tags: '#成长记录 #庞云兮' },
    { title: '宝妈英语学习 vlog', desc: '跟读练习 + 当日复盘，互相督促自律人设。', tags: '#英语学习 #自律' },
    { title: '睡前仪式感', desc: '洗澡 + 绘本 + 儿歌，培养宝宝规律作息。', tags: '#育儿经验 #作息' },
    { title: '低成本早教', desc: '家里物品变教具，省钱又有用的早教思路。', tags: '#早教 #省钱' }
  ],
  _pick(n, fn) {
    const arr = [];
    for (let i = 0; i < n; i++) arr.push(this.POOL[fn(i) % this.POOL.length]);
    const hot = DB.get().douyin.hot;
    if (hot && hot.length) arr[0] = { title: hot[0].title, desc: hot[0].reason, tags: '#英语启蒙 #宝妈', fromHot: true };
    return arr;
  },
  today() {
    const d = new Date();
    const seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
    return this._pick(3, i => seed * 7 + i * 5);
  },
  random() {
    const arr = [], used = new Set();
    while (arr.length < 3) {
      const x = this.POOL[Math.floor(Math.random() * this.POOL.length)];
      if (!used.has(x.title)) { used.add(x.title); arr.push(x); }
    }
    const hot = DB.get().douyin.hot;
    if (hot && hot.length && Math.random() < 0.5) arr[0] = { title: hot[0].title, desc: hot[0].reason, tags: '#英语启蒙 #宝妈', fromHot: true };
    return arr;
  }
};

window.Views = (function () {
  const STAGE = {
    1: { name: '第1月 · 听力输入积累', items: ['每日听力 30min+', '积累 300+ 听力词汇', '熟悉常见句型语调'] },
    2: { name: '第2月 · 短句输出', items: ['每日跟读 15 组句型', '能说 50+ 实用短句', '简单自我介绍'] },
    3: { name: '第3月 · 自由交流', items: ['每日 15min 自由对话', '能聊日常话题', '和外国人流畅沟通'] }
  };

  function subtabs(root, prefix, tabs, active) {
    root.innerHTML = `<div class="subtabs">` +
      tabs.map(t => `<button class="subtab ${t.key === active ? 'active' : ''}" data-key="${t.key}">${t.label}</button>`).join('') +
      `</div><div id="tab-content"></div>`;
    root.querySelectorAll('.subtab').forEach(b => b.onclick = () => App.navigate('#/' + prefix + '/' + b.dataset.key));
    return U.$('#tab-content');
  }

  function adoptIdea(title) {
    DB.get().douyin.plans.unshift({ id: U.uid('dp'), date: U.todayISO(), idea: title, status: '待拍摄' });
    DB.save(); U.toast('已加入发布计划', 'ok'); App.refresh();
  }

  /* ============ 板块1 育儿管理 ============ */
  function parenting(root, tab) {
    const tabs = [
      { key: 'diet', label: '饮食记录' }, { key: 'nutrition', label: '营养打卡' },
      { key: 'sleep', label: '作息日志' }, { key: 'vaccines', label: '疫苗档案' },
      { key: 'checkups', label: '儿保体检' }, { key: 'skills', label: '成长技能' },
      { key: 'english', label: '英语启蒙' }, { key: 'knowledge', label: '早教知识库' }
    ];
    const c = subtabs(root, 'parenting', tabs, tab);
    if (tab === 'english') return renderBabyEnglish(c);
    UI.mountCrud(c, tab);
  }

  function renderBabyEnglish(c) {
    c.innerHTML = `
      <div id="be-goals"></div>
      <div id="be-check" style="margin-top:16px"></div>
      <div id="be-mat" style="margin-top:16px"></div>
      <div class="card" style="margin-top:16px">
        <div class="card-head"><div class="card-title"><span class="ico">🔁</span>周期复习提醒</div></div>
        <textarea id="be-review-note" class="form-field" style="width:100%;min-height:70px;border:1px solid var(--line);border-radius:10px;padding:9px">${U.escapeHtml(DB.get().babyEnglish.reviewNote || '')}</textarea>
        <div style="margin-top:10px"><button class="btn-primary btn-sm" data-act="save-review">保存复习提醒</button></div>
      </div>`;
    UI.mountCrud(U.$('#be-goals'), 'babyEnglishGoals');
    UI.mountCrud(U.$('#be-check'), 'babyEnglishCheckins');
    UI.mountCrud(U.$('#be-mat'), 'babyEnglishMaterials');
    U.$('[data-act="save-review"]').onclick = () => {
      DB.get().babyEnglish.reviewNote = U.$('#be-review-note').value; DB.save(); U.toast('已保存', 'ok');
    };
  }

  /* ============ 板块2 个人成长 & 抖音 ============ */
  function personal(root, tab) {
    const tabs = [
      { key: 'english', label: '英语学习专区' }, { key: 'health', label: '健康打卡' },
      { key: 'todos', label: '待办四象限' }, { key: 'douyin', label: '抖音运营' }
    ];
    const c = subtabs(root, 'personal', tabs, tab);
    if (tab === 'english') return renderEnglish(c);
    if (tab === 'health') return UI.mountCrud(c, 'healthCheckin');
    if (tab === 'todos') return renderTodos(c);
    if (tab === 'douyin') return renderDouyin(c);
  }

  function renderEnglish(c) {
    const s = DB.get().settings;
    const elapsed = s.englishStart ? (-U.daysUntil(s.englishStart)) : 0;
    const stage = elapsed <= 30 ? 1 : elapsed <= 60 ? 2 : 3;
    const sg = STAGE[stage];
    const stageCards = Object.keys(STAGE).map(k => {
      const st = STAGE[k];
      const active = Number(k) === stage;
      return `<div class="mini-stat" style="${active ? 'background:#f3ecfc;border:1px solid var(--primary)' : ''}">
        <span class="ms-label">${active ? '▶ 当前' : '阶段' + k}</span>
        <span class="ms-value" style="font-size:14px">${U.escapeHtml(st.name)}</span></div>`;
    }).join('');
    c.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <div class="card-head"><div class="card-title"><span class="ico">🎯</span>3个月流利沟通 · 阶段目标</div><span class="card-sub">总进度 ${U.pct(elapsed, (s.englishMonths || 3) * 30)}%</span></div>
        <div class="kpi-row" style="margin-bottom:10px">${stageCards}</div>
        <div class="card-sub" style="font-weight:700;color:var(--ink)">当前阶段重点：${U.escapeHtml(sg.name)}</div>
        ${sg.items.map(i => `<div class="record-meta">• ${U.escapeHtml(i)}</div>`).join('')}
      </div>
      <div id="eng-check"></div>`;
    UI.mountCrud(U.$('#eng-check'), 'englishCheckin');
  }

  function renderTodos(c) {
    const data = DB.getCol('todos');
    const map = { q1: [], q2: [], q3: [], q4: [] };
    data.forEach(t => { (map[t.quadrant] || map.q4).push(t); });
    const titles = { q1: '🔴 紧急重要', q2: '🟣 重要不紧急', q3: '🟠 紧急不重要', q4: '⚪ 延后事项' };
    const colHTML = q => `
      <div class="quad-col q${q.slice(1)}">
        <h4>${titles[q]} <span class="chip gray">${map[q].length}</span></h4>
        ${map[q].length ? map[q].map(t => todoItem(t)).join('') : '<div class="muted" style="font-size:12px">—</div>'}
      </div>`;
    c.innerHTML = `
      <div style="margin-bottom:14px"><button class="btn-primary btn-sm" data-act="add-todo">＋ 新增待办</button></div>
      <div class="quad">${colHTML('q1')}${colHTML('q2')}${colHTML('q3')}${colHTML('q4')}</div>`;
    c.querySelector('[data-act="add-todo"]').onclick = () => UI.openForm('todos');
    c.querySelectorAll('[data-act="t-toggle"]').forEach(el => el.onclick = () => {
      const it = DB.getCol('todos').find(x => x.id === el.dataset.id);
      if (it) { it.done = !it.done; DB.save(); App.refresh(); }
    });
    c.querySelectorAll('[data-act="t-edit"]').forEach(el => el.onclick = () => UI.openForm('todos', el.dataset.id));
    c.querySelectorAll('[data-act="t-del"]').forEach(el => el.onclick = () => {
      if (confirm('确认删除该待办？')) { UI.deleteRow('todos', el.dataset.id); U.toast('已删除'); App.refresh(); }
    });
  }
  function todoItem(t) {
    const due = t.due ? U.countdownBadge(t.due) : '';
    return `<div class="todo-item ${t.done ? 'done' : ''}">
      <input type="checkbox" class="tk" data-act="t-toggle" data-id="${t.id}" ${t.done ? 'checked' : ''}/>
      <span class="todo-text">${U.escapeHtml(t.title)} ${due}</span>
      <button class="btn-soft btn-sm" data-act="t-edit" data-id="${t.id}">✎</button>
      <button class="btn-danger btn-sm" data-act="t-del" data-id="${t.id}">🗑</button>
    </div>`;
  }

  function renderDouyin(c) {
    const d = DB.get().douyin;
    c.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <div class="card-head"><div class="card-title"><span class="ico">🎯</span>账号赛道定位</div></div>
        <textarea id="dy-position" style="width:100%;min-height:60px;border:1px solid var(--line);border-radius:10px;padding:9px">${U.escapeHtml(d.position || '')}</textarea>
        <div style="margin-top:10px"><button class="btn-primary btn-sm" data-act="save-pos">保存定位</button></div>
      </div>
      <div class="grid grid-2">
        <div id="dy-hot"></div><div id="dy-avoid"></div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-head"><div class="card-title"><span class="ico">✨</span>每日拍摄灵感（自动生成）</div><button class="btn-soft btn-sm" data-act="gen-ideas">🔄 换一批</button></div>
        <div class="grid grid-3" id="dy-ideas"></div>
      </div>
      <div id="dy-scripts" style="margin-top:16px"></div>
      <div id="dy-plans" style="margin-top:16px"></div>
      <div id="dy-reviews" style="margin-top:16px"></div>`;

    UI.mountCrud(U.$('#dy-hot'), 'douyinHot');
    UI.mountCrud(U.$('#dy-avoid'), 'douyinAvoid');
    UI.mountCrud(U.$('#dy-scripts'), 'douyinScripts');
    UI.mountCrud(U.$('#dy-plans'), 'douyinPlans');
    UI.mountCrud(U.$('#dy-reviews'), 'douyinReviews');

    U.$('[data-act="save-pos"]').onclick = () => { DB.get().douyin.position = U.$('#dy-position').value; DB.save(); U.toast('已保存', 'ok'); };

    const renderIdeas = (list) => {
      U.$('#dy-ideas').innerHTML = list.map((it, i) => `
        <div class="idea-card">
          <span class="idea-tag chip ${it.fromHot ? 'pink' : 'gold'}">${it.fromHot ? '🔥 高潜力' : '✨ 灵感' + (i + 1)}</span>
          <div class="idea-title">${U.escapeHtml(it.title)}</div>
          <div class="idea-desc">${U.escapeHtml(it.desc)}</div>
          <div class="idea-foot"><span class="chip sky">${U.escapeHtml(it.tags || '#云兮日常')}</span></div>
          <div class="idea-actions"><button class="btn-soft btn-sm" data-act="adopt" data-title="${U.escapeHtml(it.title)}">＋ 采纳为计划</button></div>
        </div>`).join('');
      U.$('#dy-ideas').querySelectorAll('[data-act="adopt"]').forEach(b => b.onclick = () => adoptIdea(b.dataset.title));
    };
    renderIdeas(Inspiration.today());
    U.$('[data-act="gen-ideas"]').onclick = () => renderIdeas(Inspiration.random());
  }

  /* ============ 板块3 家庭财务 ============ */
  function finance(root, tab) {
    const tabs = [
      { key: 'ledger', label: '收支台账' }, { key: 'stats', label: '自动统计' }, { key: 'insurance', label: '保险档案' }
    ];
    const c = subtabs(root, 'finance', tabs, tab);
    if (tab === 'ledger') return UI.mountCrud(c, 'ledger');
    if (tab === 'insurance') return UI.mountCrud(c, 'insurance');
    if (tab === 'stats') return renderStats(c);
  }

  function renderStats(c) {
    const y = new Date().getFullYear(), m = new Date().getMonth();
    const rows = DB.getCol('ledger').filter(l => { const d = new Date(l.date); return d.getFullYear() === y && d.getMonth() === m; });
    let inc = 0, out = 0, child = 0;
    const cats = ['房贷', '车贷', '日常消费', '育儿支出', '医疗', '出行', '餐饮', '其他'];
    const totals = {}; cats.forEach(x => totals[x] = 0);
    rows.forEach(r => {
      const a = Number(r.amount) || 0;
      if (r.type === '收入') inc += a; else { out += a; totals[r.category] = (totals[r.category] || 0) + a; if (r.category === '育儿支出') child += a; }
    });
    const maxv = Math.max(1, ...cats.map(x => totals[x]));
    const bars = cats.filter(x => totals[x] > 0).map(x => `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:12.5px"><span>${x}</span><span>${U.money(totals[x])} · ${U.pct(totals[x], out)}%</span></div>
        <div class="progress"><span style="width:${totals[x] / maxv * 100}%"></span></div>
      </div>`).join('') || '<div class="muted">本月暂无支出</div>';

    const s = DB.get().settings;
    c.innerHTML = `
      <div class="grid grid-4" style="margin-bottom:16px">
        <div class="stat"><div class="stat-label">📥 本月收入</div><div class="stat-value" style="color:var(--ok)">${U.money(inc)}</div></div>
        <div class="stat"><div class="stat-label">📤 本月支出</div><div class="stat-value" style="color:var(--danger)">${U.money(out)}</div></div>
        <div class="stat"><div class="stat-label">🧮 本月结余</div><div class="stat-value">${U.money(inc - out)}</div></div>
        <div class="stat"><div class="stat-label">👶 育儿占比</div><div class="stat-value">${U.pct(child, out)}%</div><div class="stat-foot">育儿支出 ${U.money(child)}</div></div>
      </div>
      <div class="grid grid-2">
        <div class="card"><div class="card-head"><div class="card-title"><span class="ico">📊</span>本月支出分类</div></div>${bars}</div>
        <div class="card">
          <div class="card-head"><div class="card-title"><span class="ico">🏁</span>储蓄目标进度</div></div>
          <div class="kpi-row" style="margin-bottom:12px">
            <div class="mini-stat"><span class="ms-label">当前储蓄</span><span class="ms-value">${U.money(s.savingCurrent)}</span></div>
            <div class="mini-stat"><span class="ms-label">目标</span><span class="ms-value">${U.money(s.savingGoal)}</span></div>
          </div>
          ${U.progressBar(U.pct(s.savingCurrent, s.savingGoal))}
          <div style="margin-top:16px" class="form-grid">
            <div class="form-field"><label>当前储蓄(元)</label><input id="sv-cur" type="number" value="${s.savingCurrent || 0}"/></div>
            <div class="form-field"><label>储蓄目标(元)</label><input id="sv-goal" type="number" value="${s.savingGoal || 0}"/></div>
          </div>
          <div style="margin-top:12px"><button class="btn-primary btn-sm" data-act="save-saving">保存储蓄进度</button></div>
        </div>
      </div>`;
    U.$('[data-act="save-saving"]').onclick = () => {
      s.savingCurrent = Number(U.$('#sv-cur').value) || 0;
      s.savingGoal = Number(U.$('#sv-goal').value) || 0;
      DB.save(); U.toast('已保存', 'ok'); App.refresh();
    };
  }

  /* ============ 板块4 物资 & 提醒 ============ */
  function supplies(root, tab) {
    const tabs = [
      { key: 'inventory', label: '消耗品库存' }, { key: 'bills', label: '固定账单' }, { key: 'reminders', label: '统一提醒中心' }
    ];
    const c = subtabs(root, 'supplies', tabs, tab);
    if (tab === 'inventory') return UI.mountCrud(c, 'inventory');
    if (tab === 'bills') return UI.mountCrud(c, 'bills');
    if (tab === 'reminders') return renderReminders(c);
  }

  function renderReminders(c) {
    const list = Dashboard.collectReminders();
    const soon = list.filter(r => U.daysUntil(r.date) <= 7);
    const grouped = {};
    list.forEach(r => { (grouped[r.cat] = grouped[r.cat] || []).push(r); });
    const order = ['疫苗', '体检', '保险续保', '账单', '视频发布', '待办', '物资采购'];
    const items = order.filter(k => grouped[k]).map(k => `
      <div style="margin-bottom:14px">
        <div class="card-sub" style="font-weight:700;margin-bottom:8px">${k}（${grouped[k].length}）</div>
        <div class="record-list">${grouped[k].map(r => `
          <div class="reminder-item">
            <div class="ri-ico">${r.icon}</div>
            <div class="ri-main"><div class="ri-title">${U.escapeHtml(r.title)}</div><div class="ri-sub">${U.escapeHtml(r.sub || '')}</div></div>
            ${U.countdownBadge(r.date)}
          </div>`).join('')}</div>
      </div>`).join('');

    // 物资采购预警
    const inv = DB.getCol('inventory').filter(x => (Number(x.stock) || 0) <= (Number(x.warnLine) || 0));
    const warnHTML = inv.length ? inv.map(x => `
      <div class="reminder-item">
        <div class="ri-ico">🛒</div>
        <div class="ri-main"><div class="ri-title">${U.escapeHtml(x.name)}</div><div class="ri-sub">库存 ${x.stock}${x.unit || ''} ≤ 预警线 ${x.warnLine}</div></div>
        <span class="chip pink">需采购</span>
      </div>`).join('') + `<div style="margin-top:12px"><button class="btn-primary btn-sm" data-act="gen-purchase">🛒 一键生成采购待办</button></div>`
      : '<div class="empty">所有物资库存充足 ✅</div>';

    c.innerHTML = `
      <div class="grid grid-2">
        <div>
          <div class="card" style="margin-bottom:16px">
            <div class="card-head"><div class="card-title"><span class="ico">⏰</span>临近提醒（7天内）</div><span class="chip ${soon.length ? 'pink' : 'mint'}">${soon.length} 项</span></div>
            ${soon.length ? `<div class="record-list">${soon.map(r => `
              <div class="reminder-item"><div class="ri-ico">${r.icon}</div>
              <div class="ri-main"><div class="ri-title">${U.escapeHtml(r.title)}</div><div class="ri-sub">${r.cat} · ${U.escapeHtml(r.sub || '')}</div></div>
              ${U.countdownBadge(r.date)}</div>`).join('')}</div>` : '<div class="empty">未来7天暂无到期事项 🎉</div>'}
          </div>
          <div class="card">
            <div class="card-head"><div class="card-title"><span class="ico">🛒</span>物资采购预警</div></div>
            ${warnHTML}
          </div>
        </div>
        <div class="card"><div class="card-head"><div class="card-title"><span class="ico">📋</span>全部重要日程提醒</div><span class="card-sub">共 ${list.length} 项</span></div>${items || '<div class="empty">暂无提醒</div>'}</div>
      </div>`;

    const gp = c.querySelector('[data-act="gen-purchase"]');
    if (gp) gp.onclick = () => {
      let n = 0;
      DB.getCol('inventory').forEach(x => {
        if ((Number(x.stock) || 0) <= (Number(x.warnLine) || 0)) {
          DB.add('todos', { title: '采购：' + x.name, quadrant: 'q3', done: false, due: U.todayISO(), note: '库存预警自动生成' });
          n++;
        }
      });
      U.toast('已生成 ' + n + ' 条采购待办', 'ok'); App.refresh();
    };
  }

  /* ============ 设置 & 备份 ============ */
  function settings(root, tab) {
    const tabs = [
      { key: 'backup', label: '数据备份' }, { key: 'englishstats', label: '英语学习统计' },
      { key: 'shopping', label: '采购购物清单' }, { key: 'about', label: '关于' }
    ];
    const c = subtabs(root, 'settings', tabs, tab);
    if (tab === 'backup') return renderBackup(c);
    if (tab === 'englishstats') return renderEnglishStats(c);
    if (tab === 'shopping') return renderShopping(c);
    if (tab === 'about') return renderAbout(c);
  }

  function renderBackup(c) {
    const s = DB.get().settings;
    const dataSize = (DB.exportJSON().length / 1024).toFixed(1);
    c.innerHTML = `
      <div class="grid grid-2">
        <div class="card">
          <div class="card-head"><div class="card-title"><span class="ico">📤</span>导出备份</div></div>
          <div class="section-desc">把全部数据导出为 JSON 文件，存到手机/电脑/网盘，换设备或清缓存前先备份。</div>
          <button class="btn-primary" data-act="export">⬇ 下载备份文件（当前 ${dataSize} KB）</button>
        </div>
        <div class="card">
          <div class="card-head"><div class="card-title"><span class="ico">📥</span>导入恢复</div></div>
          <div class="section-desc">选择之前导出的备份文件恢复数据。</div>
          <input type="file" id="bk-file" accept="application/json,.json" style="margin-bottom:12px"/>
          <div class="kpi-row">
            <button class="btn-primary" data-act="import-replace">覆盖导入</button>
            <button class="btn-soft" data-act="import-merge">合并导入</button>
          </div>
          <div class="section-desc" style="margin-top:10px">覆盖=用备份完全替换；合并=同记录覆盖、新记录追加（推荐换设备后用）。</div>
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-head"><div class="card-title"><span class="ico">🏁</span>英语学习起始设置</div></div>
        <div class="form-grid">
          <div class="form-field"><label>学习开始日期</label><input id="bk-eng-start" type="date" value="${s.englishStart || ''}"/></div>
          <div class="form-field"><label>目标月数</label><input id="bk-eng-months" type="number" value="${s.englishMonths || 3}"/></div>
        </div>
        <div style="margin-top:12px"><button class="btn-primary btn-sm" data-act="save-eng">保存</button></div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-head"><div class="card-title"><span class="ico">⚠️</span>重置数据</div></div>
        <div class="section-desc">清空所有数据并写入演示数据（不可恢复，请先导出备份）。</div>
        <button class="btn-danger" data-act="reset">↺ 重置为演示数据</button>
      </div>`;
    c.querySelector('[data-act="export"]').onclick = () => { DB.downloadBackup(); U.toast('备份文件已下载', 'ok'); };
    c.querySelector('[data-act="import-replace"]').onclick = () => importFile(c, 'replace');
    c.querySelector('[data-act="import-merge"]').onclick = () => importFile(c, 'merge');
    c.querySelector('[data-act="save-eng"]').onclick = () => {
      s.englishStart = U.$('#bk-eng-start').value; s.englishMonths = Number(U.$('#bk-eng-months').value) || 3;
      DB.save(); U.toast('已保存', 'ok'); App.refresh();
    };
    c.querySelector('[data-act="reset"]').onclick = () => {
      if (confirm('确认清空全部数据并写入演示数据？此操作不可恢复！')) { DB.reset(); U.toast('已重置', 'ok'); App.refresh(); }
    };
  }
  function importFile(c, mode) {
    const f = U.$('#bk-file').files[0];
    if (!f) { U.toast('请先选择备份文件', 'warn'); return; }
    const r = new FileReader();
    r.onload = () => { const res = DB.importJSON(r.result, mode); U.toast(res.msg || '导入成功', res.ok ? 'ok' : 'err'); if (res.ok) App.refresh(); };
    r.readAsText(f);
  }

  function renderEnglishStats(c) {
    const rows = DB.getCol('englishCheckin').slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    const total = rows.length;
    const allDone = rows.filter(r => r.listening && r.speaking && r.vocab && r.review).length;
    // 连续天数（从最近一天往前数，至少完成一项）
    const set = new Set(rows.filter(r => r.listening || r.speaking || r.vocab || r.review).map(r => r.date));
    let streak = 0; const d = new Date();
    while (true) { const iso = U.fmtDate(d); if (set.has(iso)) { streak++; d.setDate(d.getDate() - 1); } else { if (streak === 0 && U.fmtDate(d) === U.todayISO()) { d.setDate(d.getDate() - 1); continue; } break; } }
    // 近30天热力
    const days = []; const cur = new Date();
    for (let i = 29; i >= 0; i--) { const dd = new Date(cur); dd.setDate(dd.getDate() - i); const iso = U.fmtDate(dd); const r = rows.find(x => x.date === iso); const n = r ? ['listening', 'speaking', 'vocab', 'review'].filter(k => r[k]).length : 0; days.push({ iso, n }); }
    const heat = days.map(d => `<div title="${d.iso}: ${d.n}/4" style="width:18px;height:18px;border-radius:4px;background:${d.n === 0 ? '#efeaf8' : d.n <= 2 ? '#d9c8f5' : d.n === 3 ? '#b07ce8' : '#8d5bd0'}"></div>`).join('');
    // 各项完成率
    const keys = [['listening', '听力'], ['speaking', '口语'], ['vocab', '生词'], ['review', '复盘']];
    const rates = keys.map(([k, lbl]) => U.pct(rows.filter(r => r[k]).length, total));
    c.innerHTML = `
      <div class="grid grid-4" style="margin-bottom:16px">
        <div class="stat"><div class="stat-label">📅 累计打卡</div><div class="stat-value">${total}<span style="font-size:14px;color:var(--ink-faint)"> 天</span></div></div>
        <div class="stat"><div class="stat-label">🔥 当前连续</div><div class="stat-value">${streak}<span style="font-size:14px;color:var(--ink-faint)"> 天</span></div></div>
        <div class="stat"><div class="stat-label">🌟 满卡天数</div><div class="stat-value">${allDone}</div><div class="stat-foot">四项全完成</div></div>
        <div class="stat"><div class="stat-label">📈 满卡率</div><div class="stat-value">${U.pct(allDone, total)}%</div></div>
      </div>
      <div class="card" style="margin-bottom:16px">
        <div class="card-head"><div class="card-title"><span class="ico">🌡️</span>近30天打卡热力</span></div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${heat}</div>
        <div class="card-sub" style="margin-top:10px">颜色越深=当日完成项越多（满卡为深紫）</div>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title"><span class="ico">📊</span>各项完成率</div></div>
        ${keys.map(([k, lbl], i) => `<div style="margin-bottom:10px"><div class="progress-label"><span>${lbl}</span><span>${rates[i]}%</span></div>${U.progressBar(rates[i])}</div>`).join('')}
      </div>`;
  }

  function renderShopping(c) {
    const inv = DB.getCol('inventory');
    const need = inv.filter(x => (Number(x.stock) || 0) <= (Number(x.warnLine) || 0));
    const soon = inv.filter(x => { const d = U.estimateDeplete(x.stock, x.dailyUse); return d && U.daysUntil(d) <= 14 && (Number(x.stock) || 0) > (Number(x.warnLine) || 0); });
    const all = [...need, ...soon];
    c.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <div class="card-head"><div class="card-title"><span class="ico">🛒</span>购物清单（${all.length} 项）</div>
          <button class="btn-primary btn-sm" data-act="gen-all">一键加入待办</button></div>
        ${all.length ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>物品</th><th>库存</th><th>预警线</th><th>预估耗尽</th><th>状态</th><th>建议采购量</th></tr></thead><tbody>
          ${all.map(x => { const d = U.estimateDeplete(x.stock, x.dailyUse); const low = (Number(x.stock) || 0) <= (Number(x.warnLine) || 0); const sug = Math.max(Number(x.warnLine) || 0, (Number(x.dailyUse) || 0) * 30) * 2 - (Number(x.stock) || 0); return `<tr><td><b>${U.escapeHtml(x.name)}</b></td><td>${x.stock}${x.unit || ''}</td><td>${x.warnLine}${x.unit || ''}</td><td>${d || '—'}</td><td>${low ? '<span class="chip pink">⚠ 低于预警</span>' : '<span class="chip gold">2周内耗尽</span>'}</td><td>${sug > 0 ? Math.ceil(sug) + (x.unit || '') : '—'}</td></tr>`; }).join('')}
        </tbody></table></div>` : '<div class="empty">暂无需采购物资 ✅</div>'}
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title"><span class="ico">📦</span>全部库存一览</div><span class="card-sub" data-act="goto-inv" style="cursor:pointer;color:var(--primary)">去库存管理 →</span></div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>物品</th><th>库存</th><th>日均消耗</th><th>预估耗尽</th><th>状态</th></tr></thead><tbody>
          ${inv.map(x => { const d = U.estimateDeplete(x.stock, x.dailyUse); const low = (Number(x.stock) || 0) <= (Number(x.warnLine) || 0); return `<tr><td><b>${U.escapeHtml(x.name)}</b></td><td>${x.stock}${x.unit || ''}</td><td>${x.dailyUse}${x.unit || ''}/天</td><td>${d || '—'}</td><td>${low ? '<span class="chip pink">⚠ 需采购</span>' : '<span class="chip mint">充足</span>'}</td></tr>`; }).join('') || '<tr><td colspan=5 class="empty">暂无库存</td></tr>'}
        </tbody></table></div>
      </div>`;
    c.querySelector('[data-act="gen-all"]').onclick = () => {
      let n = 0;
      all.forEach(x => { DB.add('todos', { title: '采购：' + x.name, quadrant: 'q3', done: false, due: U.todayISO(), note: '购物清单自动生成' }); n++; });
      U.toast('已生成 ' + n + ' 条采购待办', 'ok'); App.refresh();
    };
    c.querySelector('[data-act="goto-inv"]').onclick = () => App.navigate('#/supplies/inventory');
  }

  function renderAbout(c) {
    c.innerHTML = `
      <div class="card">
        <div class="card-head"><div class="card-title"><span class="ico">🌸</span>关于云兮成长台</div></div>
        <div class="record-list">
          <div class="record"><div class="record-title">云兮成长 & 自我提升综合管理台 v1.1</div>
            <div class="record-meta">庞云兮专属 · 育儿管理 / 个人成长 & 抖音运营 / 家庭财务 / 物资与全周期提醒</div></div>
          <div class="record"><div class="record-title">📂 数据存储</div>
            <div class="record-meta">全部数据保存在本机浏览器 localStorage，不上传任何服务器；换设备/清缓存前请到「数据备份」导出。</div></div>
          <div class="record"><div class="record-title">📱 安装为 App</div>
            <div class="record-meta">手机/电脑浏览器菜单「添加到主屏幕 / 安装」，即可像 App 一样使用，支持离线打开与本地通知。</div></div>
          <div class="record"><div class="record-title">🔔 提醒机制</div>
            <div class="record-meta">应用打开时自动检查到期事项（7天内）并提醒；每日首次打开推送今日任务；需开启浏览器通知权限以弹窗提醒。</div></div>
        </div>
      </div>`;
  }

  return { parenting, personal, finance, supplies, settings };
})();
