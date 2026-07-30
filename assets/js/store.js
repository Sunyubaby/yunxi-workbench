/* ===== 云兮工作台 · 数据层（localStorage 持久化） ===== */
window.DB = (function () {
  const KEY = 'yunxi_workbench_v1';
  let state = null;

  function defaultState() {
    return {
      // 育儿
      diet: [], nutrition: [], sleep: [], vaccines: [], checkups: [],
      skills: [], knowledge: [], babyEnglish: { goals: [], checkins: [], materials: [], reviewNote: '' },
      // 个人 & 抖音
      englishCheckin: [], healthCheckin: [], todos: [],
      douyin: {
        position: '2岁宝妈｜低龄宝宝英语启蒙｜亲子日常｜带娃自我提升',
        hot: [], avoid: [], scripts: [], plans: [], reviews: []
      },
      // 财务
      ledger: [], insurance: [],
      // 物资 & 提醒
      inventory: [], bills: [],
      // 设置
      settings: { savingGoal: 50000, savingCurrent: 12000, englishStart: '', englishMonths: 3 }
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { U.toast('保存失败：本地存储可能已满', 'err'); }
  }

  function init() {
    const stored = load();
    if (stored && stored.settings) {
      state = Object.assign(defaultState(), stored);
      // 兼容旧字段
      state.settings = Object.assign(defaultState().settings, stored.settings || {});
      state.douyin = Object.assign(defaultState().douyin, stored.douyin || {});
      state.babyEnglish = Object.assign(defaultState().babyEnglish, stored.babyEnglish || {});
    } else {
      state = defaultState();
      seed();
      save();
    }
  }

  function get() { return state; }
  function getCol(name) { return state[name] || []; }
  function setCol(name, arr) { state[name] = arr; save(); }

  function find(name, id) { return state[name].find(x => x.id === id); }

  function add(name, obj) {
    const col = state[name];
    obj.id = obj.id || U.uid(name);
    col.unshift(obj);
    save();
    return obj;
  }

  function update(name, id, patch) {
    const item = find(name, id);
    if (item) { Object.assign(item, patch); save(); }
    return item;
  }

  function remove(name, id) {
    state[name] = state[name].filter(x => x.id !== id);
    save();
  }

  function reset() {
    state = defaultState();
    seed();
    save();
  }

  /* ---------- 备份：导出 / 导入 / 合并 ---------- */
  function exportJSON() {
    return JSON.stringify({ __app: 'yunxi_workbench', __version: 1, exportedAt: new Date().toISOString(), data: state }, null, 2);
  }
  function downloadBackup() {
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'yunxi-backup-' + U.todayISO() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  // mode: 'replace' 整体替换 | 'merge' 同 id 覆盖、新 id 追加
  function importJSON(text, mode) {
    let obj; try { obj = JSON.parse(text); } catch (e) { return { ok: false, msg: '文件不是有效 JSON' }; }
    const data = obj.data || obj;
    if (!data || typeof data !== 'object') return { ok: false, msg: '未识别到备份数据' };
    if (mode === 'replace') { state = Object.assign(defaultState(), data); }
    else {
      const cur = state;
      const mergeArr = (a, b) => { const m = {}; a.forEach(x => m[x.id] = x); b.forEach(x => { m[x.id] = Object.assign({}, m[x.id] || {}, x); }); return Object.values(m); };
      Object.keys(defaultState()).forEach(k => {
        if (Array.isArray(data[k])) cur[k] = mergeArr(cur[k] || [], data[k]);
        else if (data[k] && typeof data[k] === 'object') cur[k] = Object.assign({}, cur[k] || {}, data[k]);
      });
    }
    save();
    return { ok: true };
  }

  /* ---------- 演示种子数据（首次运行自动写入） ---------- */
  function seed() {
    const t = new Date();
    const iso = (offset) => {
      const d = new Date(t); d.setDate(d.getDate() + offset);
      return U.fmtDate(d);
    };

    // 宝宝日常
    state.diet.push(
      { id: U.uid('diet'), date: iso(0), breakfast: '米粉+蛋黄', lunch: '西兰花土豆泥+肉松', dinner: '番茄碎面', complementary: '根茎类/蔬果', appetite: '良好', water: 220, note: '便便正常' },
      { id: U.uid('diet'), date: iso(-1), breakfast: '小米粥', lunch: '南瓜鸡肉泥', dinner: '菠菜面', complementary: '肉类/蔬果', appetite: '一般', water: 180, note: '午后有点闹' }
    );
    state.nutrition.push(
      { id: U.uid('nut'), date: iso(0), type: '维D', dose: '400IU', done: true, note: '' },
      { id: U.uid('nut'), date: iso(0), type: '钙剂', dose: '半包', done: false, note: '晚餐后补' }
    );
    state.sleep.push(
      { id: U.uid('slp'), date: iso(0), wakeup: '07:10', nap: 120, bedtime: '20:40', nightWake: '1次（夜奶）' }
    );
    state.vaccines.push(
      { id: U.uid('vac'), name: '麻腮风疫苗(MMR)', date: iso(-20), nextDate: iso(5), place: '社区卫生院', reaction: '低热1天，已退' },
      { id: U.uid('vac'), name: '水痘疫苗', date: iso(-120), nextDate: iso(40), place: '妇幼保健院', reaction: '无' }
    );
    state.checkups.push(
      { id: U.uid('chk'), month: 18, date: iso(-15), height: 82.5, weight: 11.2, eval: '发育良好，语言略超前', advice: '多引导表达，注意用眼', nextDate: iso(75) }
    );
    state.skills.push(
      { id: U.uid('skl'), category: '大运动', name: '独立上楼梯', achievedDate: iso(-10), note: '扶栏可上，仍需保护' },
      { id: U.uid('skl'), category: '语言', name: '能说双词短句', achievedDate: iso(-3), note: '妈妈抱/要吃/走吧' },
      { id: U.uid('skl'), category: '精细动作', name: '叠高4块积木', achievedDate: iso(-25), note: '录了视频存档' }
    );
    state.knowledge.push(
      { id: U.uid('knw'), category: '亲子游戏', title: '袜子配对游戏', monthTag: '18-24月', content: '把几双袜子打乱让宝宝配对，练分类与精细动作。' },
      { id: U.uid('knw'), category: '护理知识', title: '湿疹居家护理', monthTag: '通用', content: '保湿霜每日多次厚涂，洗澡水温<37℃，避免羊毛织物。' }
    );
    state.babyEnglish = {
      goals: [
        { monthTag: '18-20月', goal: '磨耳朵：SSS 儿歌每日输入，熟悉 30+ 日常词汇' },
        { monthTag: '20-22月', goal: '互动短句：能听懂并回应简单指令（give me / sit down）' },
        { monthTag: '22-24月', goal: '主动输出：能说 10+ 英文单词与 2-3 个短句' }
      ],
      checkins: [
        { id: U.uid('be'), date: iso(-1), sss: true, words: true, sentences: false, review: '复习了 animals 主题' },
        { id: U.uid('be'), date: iso(-2), sss: true, words: false, sentences: false, review: '' }
      ],
      materials: [
        { id: U.uid('bm'), title: 'Super Simple Songs 合集', type: '儿歌', link: '收藏在抖音/网盘' },
        { id: U.uid('bm'), title: '日常实物闪卡 100张', type: '词汇', link: '自购纸质' }
      ],
      reviewNote: '每 7 天滚动复习本周词汇与儿歌'
    };

    // 个人 & 抖音
    state.englishCheckin.push(
      { id: U.uid('ec'), date: iso(0), listening: true, speaking: false, vocab: true, review: true, note: '今日听力 30min（老友记+Slow English）', material: '播客' },
      { id: U.uid('ec'), date: iso(-1), listening: true, speaking: true, vocab: true, review: false, note: '跟读 15 组句型', material: 'APP' }
    );
    state.healthCheckin.push(
      { id: U.uid('hc'), date: iso(0), nutrient: '复合维生素+钙片', calcium: true, note: '' }
    );
    state.todos.push(
      { id: U.uid('td'), title: '预约下季度儿保体检', quadrant: 'q2', done: false, due: iso(20), note: '提前两周预约' },
      { id: U.uid('td'), title: '回复品牌合作私信', quadrant: 'q1', done: false, due: iso(1), note: '报价待定' },
      { id: U.uid('td'), title: '整理本月收支台账', quadrant: 'q3', done: false, due: iso(3), note: '' },
      { id: U.uid('td'), title: '研究竞品账号选题', quadrant: 'q4', done: true, due: iso(-2), note: '' }
    );
    state.douyin = {
      position: '2岁宝妈｜低龄宝宝英语启蒙｜亲子日常｜带娃自我提升',
      hot: [
        { id: U.uid('dh'), title: '0基础宝妈带娃英语启蒙，每天10分钟', reason: '痛点强+可复制，易涨粉' },
        { id: U.uid('dh'), title: '庞云兮的英语启蒙一日vlog', reason: '真实记录+人设温度' },
        { id: U.uid('dh'), title: '千万别这样教宝宝英语（避坑）', reason: '反差标题，完播率高' }
      ],
      avoid: [
        { id: U.uid('da'), title: '单纯晒娃无信息量', reason: '无记忆点，难涨粉' },
        { id: U.uid('da'), title: '硬广堆砌产品', reason: '掉粉、限流风险' }
      ],
      scripts: [
        { id: U.uid('ds'), title: '10分钟英语启蒙模板', content: '开头痛点→展示今日玩法→宝宝实操→金句总结→引导关注', tags: '#英语启蒙 #宝妈 #庞云兮' }
      ],
      plans: [
        { id: U.uid('dp'), date: iso(0), idea: '云兮学动物的英文', status: '已发布', plays: 0, likes: 0 }
      ],
      reviews: [
        { id: U.uid('dr'), date: iso(-3), plays: 12400, likes: 860, topic: '英语启蒙一日vlog', summary: '真实记录完播高，下条加字幕' }
      ]
    };

    // 财务
    const curMonth = t.getMonth();
    const mIso = (off) => { const d = new Date(t.getFullYear(), curMonth, off); return U.fmtDate(d); };
    state.ledger.push(
      { id: U.uid('lg'), date: mIso(1), type: '支出', amount: 6800, category: '房贷', note: '月度还款' },
      { id: U.uid('lg'), date: mIso(3), type: '支出', amount: 2200, category: '育儿支出', note: '奶粉+尿不湿+绘本' },
      { id: U.uid('lg'), date: mIso(5), type: '支出', amount: 1500, category: '日常消费', note: '全家采购' },
      { id: U.uid('lg'), date: mIso(8), type: '支出', amount: 680, category: '医疗', note: '儿保自费项' },
      { id: U.uid('lg'), date: mIso(10), type: '收入', amount: 8600, category: '其他', note: '工资+自媒体收益' },
      { id: U.uid('lg'), date: mIso(12), type: '支出', amount: 900, category: '餐饮', note: '周末聚餐' },
      { id: U.uid('lg'), date: mIso(15), type: '支出', amount: 600, category: '出行', note: '回老家高铁' }
    );
    state.insurance.push(
      { id: U.uid('ins'), person: '本人', holder: '李女士', type: '重疾险', name: 'X康无忧重疾', period: '保至70岁', annual: 6800, payDate: iso(12), expireDate: iso(365), note: '等待期90天，轻症额外赔' },
      { id: U.uid('ins'), person: '庞云兮', holder: '李女士', type: '医疗险', name: '少儿门诊险', period: '1年', annual: 980, payDate: iso(6), expireDate: iso(360), note: '含门诊+住院，免赔100' },
      { id: U.uid('ins'), person: '配偶', holder: '王先生', type: '意外险', name: '综合意外', period: '1年', annual: 320, payDate: iso(50), expireDate: iso(410), note: '含交通意外双倍' }
    );

    // 物资
    state.inventory.push(
      { id: U.uid('inv'), name: '尿不湿(L码)', stock: 28, dailyUse: 5, warnLine: 30, unit: '片', note: '山姆囤货' },
      { id: U.uid('inv'), name: '宝宝护肤霜', stock: 1, dailyUse: 0.05, warnLine: 1, unit: '支', note: '湿疹期多用' },
      { id: U.uid('inv'), name: '钙剂', stock: 12, dailyUse: 1, warnLine: 7, unit: '袋', note: '每日1袋' },
      { id: U.uid('inv'), name: '维D滴剂', stock: 40, dailyUse: 1, warnLine: 10, unit: '滴', note: '每日1滴' }
    );
    state.bills.push(
      { id: U.uid('bl'), name: '房贷', payDay: 5, amount: 6800, note: '每月5号' },
      { id: U.uid('bl'), name: '车贷', payDay: 15, amount: 2600, note: '每月15号' }
    );

    state.settings = { savingGoal: 50000, savingCurrent: 12000, englishStart: iso(-30), englishMonths: 3 };
  }

  return { init, get, getCol, setCol, find, add, update, remove, reset, save, defaultState,
    exportJSON, downloadBackup, importJSON };
})();
