/* ===== 云兮工作台 · 路由与初始化 ===== */
window.App = (function () {
  const NAV = [
    { key: 'dashboard', label: '首页仪表盘', ico: '🏠' },
    { key: 'parenting', label: '育儿管理', ico: '👶' },
    { key: 'personal', label: '个人成长 & 抖音', ico: '🌱' },
    { key: 'finance', label: '家庭财务', ico: '💰' },
    { key: 'supplies', label: '物资 & 提醒', ico: '🔔' },
    { key: 'settings', label: '设置 & 备份', ico: '⚙️' }
  ];
  const DEFAULT_TAB = { parenting: 'diet', personal: 'english', finance: 'ledger', supplies: 'inventory' };
  const TAB_LABEL = {
    diet: '饮食记录', nutrition: '营养打卡', sleep: '作息日志', vaccines: '疫苗档案', checkups: '儿保体检',
    skills: '成长技能', english: '英语启蒙', knowledge: '早教知识库',
    health: '健康打卡', todos: '待办四象限', douyin: '抖音运营',
    ledger: '收支台账', stats: '自动统计', insurance: '保险档案',
    inventory: '消耗品库存', bills: '固定账单', reminders: '统一提醒中心',
    backup: '数据备份', englishstats: '英语学习统计', about: '关于'
  };
  let shownReminders = new Set();

  function navigate(hash) { if (location.hash === hash) render(); else location.hash = hash; }
  function refresh() { render(); }

  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean);
    const section = parts[0] || 'dashboard';
    const tab = parts[1] || DEFAULT_TAB[section] || '';
    return { section, tab };
  }

  function renderNav(active) {
    const soon = Dashboard.collectReminders().filter(r => U.daysUntil(r.date) <= 7).length;
    U.$('#nav').innerHTML = NAV.map(n => {
      const badge = n.key === 'supplies' && soon ? `<span class="nav-badge">${soon}</span>` : '';
      return `<button class="nav-item ${n.key === active ? 'active' : ''}" data-key="${n.key}">
        <span class="nav-ico">${n.ico}</span><span>${n.label}</span>${badge}</button>`;
    }).join('');
    U.$('#nav').querySelectorAll('.nav-item').forEach(b => b.onclick = () => { closeDrawer(); navigate('#/' + b.dataset.key); });
  }

  function render() {
    const { section, tab } = parseRoute();
    renderNav(section);
    const title = section === 'dashboard' ? '首页仪表盘'
      : (NAV.find(n => n.key === section).label + (tab ? ' · ' + (TAB_LABEL[tab] || '') : ''));
    U.$('#page-title').textContent = title;
    U.$('#topbar-date').textContent = U.fmtDate(new Date()) + '　' + '庞云兮专属工作台';
    const content = U.$('#content');
    content.scrollTop = 0;
    if (section === 'dashboard') Dashboard.render(content);
    else if (section === 'parenting') Views.parenting(content, tab);
    else if (section === 'personal') Views.personal(content, tab);
    else if (section === 'finance') Views.finance(content, tab);
    else if (section === 'supplies') Views.supplies(content, tab);
    else if (section === 'settings') Views.settings(content, tab || 'backup');
    else Dashboard.render(content);
  }

  /* ---- 今日任务弹窗（模拟每日早8点推送） ---- */
  function buildTodayTasks() {
    const today = U.todayISO();
    const nut = DB.getCol('nutrition').filter(r => r.date === today && !r.done);
    const health = DB.getCol('healthCheckin').filter(r => r.date === today && !r.calcium)[0];
    const eng = DB.getCol('englishCheckin').filter(r => r.date === today)[0];
    const engPending = eng ? ['listening', 'speaking', 'vocab', 'review'].filter(k => !eng[k]).length : 4;
    const rem = Dashboard.collectReminders().filter(r => { const d = U.daysUntil(r.date); return d >= 0 && d <= 7; });
    const dueTodos = DB.getCol('todos').filter(t => !t.done && t.due && U.daysUntil(t.due) <= 0);

    const checkHTML = `
      <div class="today-group"><h4>🍼 宝宝营养补充（未完成 ${nut.length}）</h4>
        ${nut.length ? nut.map(n => `<div class="today-task"><span class="tt-text">${U.escapeHtml(n.type)} ${U.escapeHtml(n.dose || '')}</span><span class="chip gray">待打卡</span></div>`).join('') : '<div class="muted">已全部完成 ✓</div>'}</div>
      <div class="today-group"><h4>🥗 个人健康打卡</h4>
        <div class="today-task"><span class="tt-text">${U.escapeHtml(health ? (health.nutrient || '每日营养素') : '钙剂补充')}</span><span class="chip ${health ? 'gray' : 'mint'}">${health ? '待打卡' : '已完成 ✓'}</span></div></div>
      <div class="today-group"><h4>🗣️ 英语学习（未完成 ${engPending} 项）</h4>
        ${engPending ? '<div class="muted">听力 / 口语 / 生词 / 复盘 待完成</div>' : '<div class="muted">今日四项已完成 ✓</div>'}</div>`;

    const remHTML = rem.length ? `<div class="record-list">${rem.map(r => `
      <div class="reminder-item"><div class="ri-ico">${r.icon}</div>
      <div class="ri-main"><div class="ri-title">${U.escapeHtml(r.title)}</div><div class="ri-sub">${r.cat} · ${U.escapeHtml(r.sub || '')}</div></div>
      ${U.countdownBadge(r.date)}</div>`).join('')}</div>` : '<div class="muted">未来7天暂无到期事项 🎉</div>';

    const todoHTML = dueTodos.length ? dueTodos.map(t => `<div class="today-task"><span class="tt-text">${U.escapeHtml(t.title)}</span>${U.countdownBadge(t.due)}</div>`).join('') : '<div class="muted">今日无逾期待办 ✓</div>';

    return `<div class="today-panel">
      <div class="today-group"><h4>✅ 今日打卡任务</h4>${checkHTML}</div>
      <div class="today-group"><h4>⏰ 7天内到期提醒（${rem.length}）</h4>${remHTML}</div>
      <div class="today-group"><h4>📌 今日/逾期待办（${dueTodos.length}）</h4>${todoHTML}</div>
    </div>`;
  }

  function openTodayTasks() {
    const mask = U.$('#modal-mask'), mTitle = U.$('#modal-title'), mBody = U.$('#modal-body'), mFoot = U.$('#modal-foot');
    mTitle.textContent = '📋 今日任务 · ' + U.todayISO();
    mBody.innerHTML = buildTodayTasks();
    mFoot.innerHTML = `<button class="btn-primary" id="tt-go">去仪表盘打卡</button><button class="btn-ghost" id="tt-close">关闭</button>`;
    mask.hidden = false;
    U.$('#tt-go').onclick = () => { mask.hidden = true; navigate('#/dashboard'); };
    U.$('#tt-close').onclick = () => { mask.hidden = true; };
  }

  /* ---- 自动化：到期前提醒 + 每日推送 ---- */
  function checkDueReminders() {
    const rem = Dashboard.collectReminders();
    let count = 0;
    rem.forEach(r => {
      const d = U.daysUntil(r.date);
      if (d >= 0 && d <= 7 && !shownReminders.has(r.title + r.date)) {
        shownReminders.add(r.title + r.date); count++;
        const msg = `提醒：${r.title} ${U.countdownText(r.date)}`;
        notify('云兮工作台', msg);
        U.toast(msg, 'warn');
      }
    });
    return count;
  }

  function maybeDailyPush() {
    // 不再强制弹窗，改为仅在首次当天给一个轻量提示（用户可点顶部按钮主动查看）
    const last = localStorage.getItem('yunxi_lastpush');
    if (last !== U.todayISO()) {
      localStorage.setItem('yunxi_lastpush', U.todayISO());
      // 延迟 1s 后给个轻提示，不阻塞页面
      setTimeout(() => {
        const rem = Dashboard.collectReminders().filter(r => U.daysUntil(r.date) <= 7);
        if (rem.length) U.toast(`今日有 ${rem.length} 项临近提醒，点击「今日任务」查看`, 'warn');
        else U.toast('今日打卡已就绪，点击「今日任务」查看', 'ok');
      }, 1000);
    }
  }

  function bindTopbar() {
    U.$('#btn-today-tasks').onclick = openTodayTasks;
    U.$('#btn-notify').onclick = () => {
      if (!('Notification' in window)) { U.toast('当前浏览器不支持消息推送', 'warn'); return; }
      Notification.requestPermission().then(p => {
        U.toast(p === 'granted' ? '已开启，到期前会弹窗提醒' : '未授权，仅在应用内提醒', p === 'granted' ? 'ok' : 'warn');
      });
    };
    U.$('#btn-reset-demo').onclick = () => {
      if (confirm('将清空所有数据并写入演示数据，确定继续？')) { DB.reset(); U.toast('已重置为演示数据', 'ok'); render(); }
    };
  }

  /* ---- 通知（优先走 Service Worker，支持后台标签弹窗） ---- */
  function notify(title, body) {
    try {
      if ('Notification' in window && Notification.permission === 'granted' &&
          navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'notify', title, body });
        return;
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: body || '' });
        return;
      }
    } catch (e) {}
    U.toast(body || title, 'warn');
  }

  /* ---- 每日早8点推送（页面存活时生效） ---- */
  function scheduleDaily() {
    const now = new Date();
    const next = new Date(now); next.setHours(8, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    setTimeout(() => {
      notify('云兮工作台 · 今日任务', '点击顶部「今日任务」查看今日打卡与临近提醒');
      // 仅发通知，不再强制弹窗，避免干扰用户正在浏览的页面
      scheduleDaily();
    }, next - now);
  }

  /* ---- Service Worker：离线 + 安装 + 周期同步 ---- */
  function initSW() {
    if (!('serviceWorker' in navigator)) return;
    if (!/^https?:$/.test(location.protocol)) return; // file:// 不支持 SW
    navigator.serviceWorker.register('sw.js').catch(() => {});
    navigator.serviceWorker.ready.then(reg => {
      if ('periodicSync' in reg) {
        reg.periodicSync.register('daily-reminder', { minInterval: 12 * 60 * 60 * 1000 }).catch(() => {});
      }
    }).catch(() => {});
    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data && e.data.type === 'check-reminders') checkDueReminders();
    });
  }

  /* ---- 移动端抽屉导航 ---- */
  function openDrawer() {
    const s = U.$('#sidebar'), o = U.$('#sidebar-overlay');
    if (!s || !o) return;
    o.hidden = false;
    requestAnimationFrame(() => { s.classList.add('open'); o.classList.add('show'); });
  }
  function closeDrawer() {
    const s = U.$('#sidebar'), o = U.$('#sidebar-overlay');
    if (!s || !o) return;
    s.classList.remove('open'); o.classList.remove('show');
    setTimeout(() => { if (!s.classList.contains('open')) o.hidden = true; }, 300);
  }
  function bindDrawer() {
    const menu = U.$('#btn-menu'), ov = U.$('#sidebar-overlay');
    if (menu) menu.onclick = openDrawer;
    if (ov) ov.onclick = closeDrawer;
    // 视口放大到桌面尺寸时自动收起抽屉，避免错位
    window.addEventListener('resize', () => { if (window.innerWidth > 760) closeDrawer(); });
  }

  function start() {
    DB.init();
    UI.init();
    bindTopbar();
    bindDrawer();
    window.addEventListener('hashchange', render);
    render();
    maybeDailyPush();
    checkDueReminders();
    setInterval(checkDueReminders, 60000);
    initSW();
    scheduleDaily();
  }

  return { start, navigate, refresh, openTodayTasks };
})();

document.addEventListener('DOMContentLoaded', App.start);
