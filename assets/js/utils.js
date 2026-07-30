/* ===== 云兮工作台 · 通用工具函数 ===== */
window.U = (function () {
  const pad = (n) => String(n).padStart(2, '0');

  function uid(prefix = 'id') {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // 当天 0 点的 UTC 毫秒，避免时区/夏令时误差
  function dayUTC(d) {
    const x = (d instanceof Date) ? d : new Date(d);
    if (isNaN(x)) return NaN;
    return Date.UTC(x.getFullYear(), x.getMonth(), x.getDate());
  }

  function todayISO() {
    const x = new Date();
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  }

  function fmtDate(d) {
    if (!d) return '—';
    const x = new Date(d);
    if (isNaN(x)) return String(d);
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  }

  function fmtDateTime(d) {
    const x = new Date(d);
    if (isNaN(x)) return '—';
    return `${fmtDate(x)} ${pad(x.getHours())}:${pad(x.getMinutes())}`;
  }

  // 距离今天的天数（正数=未来，负数=过去）
  function daysUntil(dateStr) {
    if (!dateStr) return null;
    return Math.round((dayUTC(dateStr) - dayUTC(new Date())) / 86400000);
  }

  // 倒计时文案
  function countdownText(dateStr) {
    const d = daysUntil(dateStr);
    if (d === null) return '—';
    if (d > 0) return `还有 ${d} 天`;
    if (d === 0) return '就是今天';
    return `已逾期 ${Math.abs(d)} 天`;
  }

  // 倒计时等级：soon(7天内) / near(30天内) / ok / past
  function countdownLevel(dateStr) {
    const d = daysUntil(dateStr);
    if (d === null) return 'past';
    if (d < 0) return 'past';
    if (d <= 7) return 'soon';
    if (d <= 30) return 'near';
    return 'ok';
  }

  function countdownBadge(dateStr, label) {
    const lvl = countdownLevel(dateStr);
    const txt = label || countdownText(dateStr);
    const map = { soon: '⏰', near: '🕒', ok: '🗓️', past: '✓' };
    return `<span class="cd ${lvl}">${map[lvl]} ${txt}</span>`;
  }

  // 根据月日均消耗估算耗尽日期
  function estimateDeplete(stock, dailyUse) {
    stock = Number(stock) || 0;
    dailyUse = Number(dailyUse) || 0;
    if (dailyUse <= 0) return null;
    const days = Math.floor(stock / dailyUse);
    const x = new Date();
    x.setDate(x.getDate() + days);
    return fmtDate(x);
  }

  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function money(n) {
    const v = Number(n) || 0;
    return '¥' + v.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function pct(part, total) {
    if (!total) return 0;
    return Math.max(0, Math.min(100, Math.round((part / total) * 100)));
  }

  function progressBar(value, label) {
    const v = Math.max(0, Math.min(100, value || 0));
    return `<div class="progress"><span style="width:${v}%"></span></div>` +
      (label ? `<div class="progress-label"><span>${label}</span><span>${v}%</span></div>` : '');
  }

  // 简易 HTML 转义后的文本高亮（用于搜索，可扩展）
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  let toastTimer = {};
  function toast(msg, type = '') {
    const wrap = $('#toast-wrap');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; }, 2600);
    setTimeout(() => el.remove(), 3000);
  }

  function checkedIcon(v) {
    return v ? '<span style="color:var(--ok);font-weight:700">✓ 已打卡</span>'
             : '<span style="color:var(--ink-faint)">— 未打卡</span>';
  }

  function fmtTime(t) {
    if (!t) return '—';
    return String(t);
  }

  // 固定账单：下次还款日（每月 payDay 号）
  function billNextDate(payDay) {
    payDay = Number(payDay);
    if (!payDay) return null;
    const t = new Date();
    let d = new Date(t.getFullYear(), t.getMonth(), payDay);
    if (d < new Date(t.getFullYear(), t.getMonth(), t.getDate())) {
      d = new Date(t.getFullYear(), t.getMonth() + 1, payDay);
    }
    return fmtDate(d);
  }

  return {
    uid, pad, todayISO, fmtDate, fmtDateTime, daysUntil, countdownText,
    countdownLevel, countdownBadge, estimateDeplete, escapeHtml, money, pct,
    progressBar, $, $all, toast, checkedIcon, fmtTime, billNextDate
  };
})();
