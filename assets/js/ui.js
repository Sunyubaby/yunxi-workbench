/* ===== 云兮工作台 · 通用 CRUD 界面（schema 驱动） ===== */
window.UI = (function () {
  let mask, modal, mTitle, mBody, mFoot;

  function init() {
    mask = U.$('#modal-mask'); modal = U.$('#modal');
    mTitle = U.$('#modal-title'); mBody = U.$('#modal-body'); mFoot = U.$('#modal-foot');
    U.$('#modal-close').onclick = closeModal;
    mask.addEventListener('click', (e) => { if (e.target === mask) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mask.hidden) closeModal(); });
  }

  /* ---- 嵌套集合解析（支持 douyin.scripts 之类） ---- */
  function resolveArr(col) {
    if (col.includes('.')) { const [a, b] = col.split('.'); return DB.get()[a][b]; }
    return DB.getCol(col);
  }
  function commitArr(col, arr) {
    if (col.includes('.')) { const [a, b] = col.split('.'); DB.get()[a][b] = arr; DB.save(); }
    else DB.setCol(col, arr);
  }

  /* ---- 取值展示 ---- */
  function displayOption(f, v) {
    if (!f.options) return v;
    const o = f.options.find(x => (typeof x === 'object' ? x.value : x) === v);
    return o ? (typeof o === 'object' ? o.label : o) : v;
  }
  function trunc(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n) + '…' : s; }

  function cellHTML(sc, f, row) {
    const v = row[f.key];
    if (f.type === 'checkbox') return U.checkedIcon(v);
    if (f.type === 'select') return v === undefined || v === '' ? '—' : `<span class="chip">${U.escapeHtml(displayOption(f, v))}</span>`;
    if (f.type === 'date') return v ? U.fmtDate(v) : '—';
    if (f.type === 'time') return v || '—';
    if (f.type === 'textarea') return v ? `<span title="${U.escapeHtml(v)}">${U.escapeHtml(trunc(v, 36))}</span>` : '—';
    return (v === undefined || v === '') ? '—' : U.escapeHtml(String(v));
  }

  /* ---- 排序：有 date 字段按日期倒序 ---- */
  function sortRows(sc, rows) {
    const hasDate = sc.fields.some(f => f.key === 'date');
    const arr = rows.slice();
    if (hasDate) {
      arr.sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
      });
    }
    return arr;
  }

  /* ---- 表格 ---- */
  function tableHTML(sc, rows) {
    const cols = sc.fields.map(f => f.label);
    const compLabels = (sc.computed || []).map(c => c.label);
    const thead = `<tr><th>#</th>${cols.map(c => `<th>${U.escapeHtml(c)}</th>`).join('')}` +
      `${compLabels.map(c => `<th>${U.escapeHtml(c)}</th>`).join('')}<th>操作</th></tr>`;
    const tbody = rows.map((r, i) => {
      const cells = sc.fields.map(f => `<td>${cellHTML(sc, f, r)}</td>`).join('');
      const comps = (sc.computed || []).map(c => `<td>${c.html(r)}</td>`).join('');
      const acts = `<td><div class="row-actions">` +
        `<button class="btn-soft btn-sm" data-act="edit" data-id="${r.id}">编辑</button>` +
        `<button class="btn-danger btn-sm" data-act="del" data-id="${r.id}">删除</button></div></td>`;
      return `<tr><td class="muted">${i + 1}</td>${cells}${comps}${acts}</tr>`;
    }).join('');
    return `<div class="table-wrap"><table class="tbl"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
  }

  /* ---- 整块 CRUD 视图 ---- */
  function crudHTML(key, rows) {
    const sc = SCHEMAS[key];
    const head = `<div class="card-head"><div class="card-title"><span class="ico">${sc.icon}</span>${U.escapeHtml(sc.title)}</div>` +
      `<button class="btn-primary btn-sm" data-act="add">＋ 新增</button></div>`;
    const desc = sc.desc ? `<div class="section-desc">${U.escapeHtml(sc.desc)}</div>` : '';
    const body = rows.length ? tableHTML(sc, rows) : `<div class="empty">暂无记录，点击右上角「新增」开始录入 👆</div>`;
    return `<div class="card">${head}${desc}${body}</div>`;
  }

  function mountCrud(root, key) {
    const sc = SCHEMAS[key];
    const rows = sortRows(sc, resolveArr(sc.col));
    root.innerHTML = crudHTML(key, rows);
    root.querySelectorAll('[data-act]').forEach(btn => {
      btn.onclick = () => {
        const act = btn.dataset.act, id = btn.dataset.id;
        if (act === 'add') openForm(key);
        else if (act === 'edit') openForm(key, id);
        else if (act === 'del') {
          if (confirm('确认删除该条记录？')) { deleteRow(key, id); U.toast('已删除'); App.refresh(); }
        }
      };
    });
  }

  /* ---- 表单 ---- */
  function fieldHTML(f, v) {
    const id = 'f_' + f.key;
    const val = v ? v[f.key] : (f.type === 'checkbox' ? false : '');
    const req = f.required ? '<span class="req">*</span>' : '';
    if (f.type === 'checkbox') {
      return `<div class="form-field full"><label class="check-row"><input type="checkbox" id="${id}" ${val ? 'checked' : ''}/> <span>${U.escapeHtml(f.label)}</span></label></div>`;
    }
    if (f.type === 'textarea') {
      return `<div class="form-field ${f.full ? 'full' : ''}"><label>${req}${U.escapeHtml(f.label)}</label>` +
        `<textarea id="${id}" placeholder="${U.escapeHtml(f.placeholder || '')}">${U.escapeHtml(val || '')}</textarea></div>`;
    }
    if (f.type === 'select') {
      const opts = f.options.map(o => {
        const ov = typeof o === 'object' ? o.value : o, ol = typeof o === 'object' ? o.label : o;
        return `<option value="${U.escapeHtml(ov)}" ${ov == val ? 'selected' : ''}>${U.escapeHtml(ol)}</option>`;
      }).join('');
      return `<div class="form-field ${f.full ? 'full' : ''}"><label>${req}${U.escapeHtml(f.label)}</label><select id="${id}">${opts}</select></div>`;
    }
    const itype = f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'time' ? 'time' : 'text';
    const step = f.type === 'number' ? 'step="any"' : '';
    return `<div class="form-field ${f.full ? 'full' : ''}"><label>${req}${U.escapeHtml(f.label)}</label>` +
      `<input id="${id}" type="${itype}" ${step} value="${U.escapeHtml(val || '')}" placeholder="${U.escapeHtml(f.placeholder || '')}"/></div>`;
  }

  function openForm(key, id) {
    const sc = SCHEMAS[key];
    const rows = resolveArr(sc.col);
    const row = id ? rows.find(r => r.id === id) : null;
    mTitle.textContent = (id ? '编辑 · ' : '新增 · ') + sc.title;
    mBody.innerHTML = `<form id="crud-form" class="form-grid">${sc.fields.map(f => fieldHTML(f, row)).join('')}</form>`;
    mFoot.innerHTML = `<button class="btn-ghost" data-act="cancel">取消</button><button class="btn-primary" data-act="save">保存</button>`;
    mask.hidden = false;
    mFoot.querySelector('[data-act="save"]').onclick = () => submitForm(key, id);
    mFoot.querySelector('[data-act="cancel"]').onclick = closeModal;
    const first = mBody.querySelector('input,select,textarea');
    if (first) setTimeout(() => first.focus(), 50);
  }

  function submitForm(key, id) {
    const sc = SCHEMAS[key];
    const obj = {};
    for (const f of sc.fields) {
      const el = document.getElementById('f_' + f.key);
      if (f.type === 'checkbox') obj[f.key] = el.checked;
      else if (f.type === 'number') obj[f.key] = el.value === '' ? '' : Number(el.value);
      else obj[f.key] = el.value;
    }
    for (const f of sc.fields) {
      if (f.required) {
        const v = obj[f.key];
        if (v === '' || v === undefined || v === null) { U.toast('请填写：' + f.label, 'warn'); return; }
      }
    }
    if (id) { updateRow(key, id, obj); U.toast('已更新', 'ok'); }
    else { addRow(key, obj); U.toast('已添加', 'ok'); }
    closeModal();
    if (window.App) App.refresh();
  }

  function addRow(key, obj) {
    const sc = SCHEMAS[key]; const arr = resolveArr(sc.col);
    obj.id = U.uid(key); arr.unshift(obj); commitArr(sc.col, arr);
  }
  function updateRow(key, id, obj) {
    const sc = SCHEMAS[key]; const arr = resolveArr(sc.col);
    const it = arr.find(r => r.id === id); if (it) Object.assign(it, obj); commitArr(sc.col, arr);
  }
  function deleteRow(key, id) {
    const sc = SCHEMAS[key]; let arr = resolveArr(sc.col);
    arr = arr.filter(r => r.id !== id); commitArr(sc.col, arr);
  }

  function closeModal() { mask.hidden = true; }

  return {
    init, mountCrud, openForm, resolveArr, commitArr,
    addRow, updateRow, deleteRow
  };
})();
