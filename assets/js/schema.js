/* ===== 云兮工作台 · 各模块 Schema（驱动通用表格/表单） ===== */
window.SCHEMAS = (function () {

  // 选项可写成字符串数组，或 {value,label}
  const APP = { value: 'q1', label: '紧急重要' };
  const APP2 = { value: 'q2', label: '重要不紧急' };
  const APP3 = { value: 'q3', label: '紧急不重要' };
  const APP4 = { value: 'q4', label: '延后事项' };

  const S = {
    /* ---------- 板块1 育儿管理 ---------- */
    diet: {
      title: '每日饮食记录', icon: '🍚', col: 'diet',
      desc: '记录宝宝每日三餐、辅食、饮水与身体备注，长周期追踪进食规律。',
      fields: [
        { key: 'date', label: '日期', type: 'date', required: true },
        { key: 'breakfast', label: '早餐', type: 'text', placeholder: '如：米粉+蛋黄' },
        { key: 'lunch', label: '午餐', type: 'text', placeholder: '如：西兰花土豆泥' },
        { key: 'dinner', label: '晚餐', type: 'text', placeholder: '如：番茄碎面' },
        { key: 'complementary', label: '辅食品类', type: 'text', placeholder: '蔬果/肉类/谷物' },
        { key: 'appetite', label: '进食情况', type: 'select', options: ['良好', '一般', '偏少', '拒食'] },
        { key: 'water', label: '饮水量(ml)', type: 'number' },
        { key: 'note', label: '过敏/身体状况备注', type: 'textarea', full: true }
      ]
    },
    nutrition: {
      title: '营养补充打卡', icon: '💊', col: 'nutrition',
      desc: '钙剂/维D 等每日补充循环打卡，漏打一目了然。',
      fields: [
        { key: 'date', label: '日期', type: 'date', required: true },
        { key: 'type', label: '补充品类', type: 'select', options: ['钙剂', '维D', '铁剂', '锌', 'DHA', '其他'], required: true },
        { key: 'dose', label: '剂量', type: 'text', placeholder: '如：400IU / 半包' },
        { key: 'done', label: '已打卡', type: 'checkbox' },
        { key: 'note', label: '备注', type: 'textarea', full: true }
      ]
    },
    sleep: {
      title: '作息日志', icon: '🌙', col: 'sleep',
      desc: '记录起床、午睡、入睡与夜醒，掌握宝宝睡眠节律。',
      fields: [
        { key: 'date', label: '日期', type: 'date', required: true },
        { key: 'wakeup', label: '起床时间', type: 'time' },
        { key: 'nap', label: '午睡时长(分钟)', type: 'number' },
        { key: 'bedtime', label: '夜间入睡时间', type: 'time' },
        { key: 'nightWake', label: '夜醒情况', type: 'text', placeholder: '如：1次夜奶' }
      ]
    },
    vaccines: {
      title: '疫苗记录表', icon: '🛡️', col: 'vaccines',
      desc: '接种与下次接种时间，到期前自动倒计时提醒。',
      fields: [
        { key: 'name', label: '疫苗名称', type: 'text', required: true },
        { key: 'date', label: '接种日期', type: 'date' },
        { key: 'nextDate', label: '下次接种时间', type: 'date' },
        { key: 'place', label: '接种地点', type: 'text' },
        { key: 'reaction', label: '不良反应记录', type: 'textarea', full: true }
      ],
      computed: [
        { label: '倒计时', html: r => U.countdownBadge(r.nextDate) }
      ]
    },
    checkups: {
      title: '儿保体检档案', icon: '📏', col: 'checkups',
      desc: '身高体重、发育评估与下次体检提醒。',
      fields: [
        { key: 'month', label: '体检月龄', type: 'number', placeholder: '如：18' },
        { key: 'date', label: '体检日期', type: 'date' },
        { key: 'height', label: '身高(cm)', type: 'number' },
        { key: 'weight', label: '体重(kg)', type: 'number' },
        { key: 'eval', label: '发育评估', type: 'select', options: ['优秀', '良好', '正常', '偏低', '偏高', '需关注'] },
        { key: 'advice', label: '医生建议', type: 'textarea' },
        { key: 'nextDate', label: '下次体检提醒', type: 'date' }
      ],
      computed: [
        { label: '下次提醒', html: r => U.countdownBadge(r.nextDate) }
      ]
    },
    skills: {
      title: '成长技能记录', icon: '🌟', col: 'skills',
      desc: '大运动/精细动作/语言/社交技能达成时间与素材备注。',
      fields: [
        { key: 'category', label: '技能类别', type: 'select', options: ['大运动', '精细动作', '语言', '社交'], required: true },
        { key: 'name', label: '技能名称', type: 'text', required: true },
        { key: 'achievedDate', label: '达成时间', type: 'date' },
        { key: 'note', label: '素材备注(视频/说明)', type: 'textarea', full: true }
      ]
    },
    knowledge: {
      title: '早教知识库', icon: '📚', col: 'knowledge',
      desc: '分月龄亲子游戏、护理知识与育儿经验笔记。',
      fields: [
        { key: 'category', label: '分类', type: 'select', options: ['亲子游戏', '护理知识', '经验笔记'], required: true },
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'monthTag', label: '适用月龄', type: 'text', placeholder: '如：18-24月' },
        { key: 'content', label: '内容', type: 'textarea', full: true }
      ]
    },

    /* 宝宝英语启蒙（嵌套在 babyEnglish 对象内） */
    babyEnglishGoals: {
      title: '分月龄启蒙目标', icon: '🎯', col: 'babyEnglish.goals',
      desc: '按宝宝月龄拆解英语启蒙目标。',
      fields: [
        { key: 'monthTag', label: '适用月龄', type: 'text', placeholder: '如：18-20月', required: true },
        { key: 'goal', label: '目标', type: 'textarea', full: true, required: true }
      ]
    },
    babyEnglishCheckins: {
      title: '每日打卡清单', icon: '✅', col: 'babyEnglish.checkins',
      desc: 'SSS 儿歌 / 日常词汇 / 互动短句 每日打卡 + 复习备注。',
      fields: [
        { key: 'date', label: '日期', type: 'date', required: true },
        { key: 'sss', label: 'SSS儿歌', type: 'checkbox' },
        { key: 'words', label: '日常词汇', type: 'checkbox' },
        { key: 'sentences', label: '互动短句', type: 'checkbox' },
        { key: 'review', label: '复习备注', type: 'textarea', full: true }
      ]
    },
    babyEnglishMaterials: {
      title: '启蒙素材库', icon: '📦', col: 'babyEnglish.materials',
      desc: '儿歌、词汇、动画等启蒙素材归档。',
      fields: [
        { key: 'title', label: '素材名称', type: 'text', required: true },
        { key: 'type', label: '类型', type: 'text', placeholder: '儿歌/词汇/动画' },
        { key: 'link', label: '链接/说明', type: 'text' }
      ]
    },

    /* ---------- 板块2 个人成长 & 抖音 ---------- */
    englishCheckin: {
      title: '英语学习每日打卡', icon: '🗣️', col: 'englishCheckin',
      desc: '听力/口语/生词/复盘四项循环打卡，3个月流利沟通目标拆解。',
      fields: [
        { key: 'date', label: '日期', type: 'date', required: true },
        { key: 'listening', label: '听力练习', type: 'checkbox' },
        { key: 'speaking', label: '口语跟读', type: 'checkbox' },
        { key: 'vocab', label: '生词积累', type: 'checkbox' },
        { key: 'review', label: '当日复盘', type: 'checkbox' },
        { key: 'material', label: '学习素材', type: 'text', placeholder: '播客/APP/视频' },
        { key: 'note', label: '复盘笔记', type: 'textarea', full: true }
      ]
    },
    healthCheckin: {
      title: '个人健康打卡', icon: '🥗', col: 'healthCheckin',
      desc: '每日营养素与钙剂补充循环打卡。',
      fields: [
        { key: 'date', label: '日期', type: 'date', required: true },
        { key: 'nutrient', label: '每日营养素', type: 'text', placeholder: '如：复合维生素+钙片' },
        { key: 'calcium', label: '钙剂补充', type: 'checkbox' },
        { key: 'note', label: '备注', type: 'textarea', full: true }
      ]
    },
    todos: {
      title: '通用待办（四象限）', icon: '✅', col: 'todos',
      desc: '紧急重要 / 重要不紧急 / 紧急不重要 / 延后事项。',
      fields: [
        { key: 'title', label: '事项', type: 'text', required: true },
        { key: 'quadrant', label: '象限', type: 'select', options: [APP, APP2, APP3, APP4], required: true },
        { key: 'done', label: '已完成', type: 'checkbox' },
        { key: 'due', label: '截止日期', type: 'date' },
        { key: 'note', label: '备注', type: 'textarea', full: true }
      ],
      computed: [
        { label: '截止', html: r => r.due ? U.countdownBadge(r.due) : '<span class="muted">—</span>' }
      ]
    },

    /* ---------- 抖音运营（嵌套在 douyin 对象内） ---------- */
    douyinHot: {
      title: '高潜力爆款方向', icon: '🔥', col: 'douyin.hot',
      desc: '值得持续深耕的高潜力选题方向。',
      fields: [
        { key: 'title', label: '选题', type: 'text', required: true },
        { key: 'reason', label: '潜力说明', type: 'textarea', full: true }
      ]
    },
    douyinAvoid: {
      title: '避雷选题', icon: '⚠️', col: 'douyin.avoid',
      desc: '易限流/掉粉/无记忆点的选题，谨慎避开。',
      fields: [
        { key: 'title', label: '选题', type: 'text', required: true },
        { key: 'reason', label: '避雷说明', type: 'textarea', full: true }
      ]
    },
    douyinScripts: {
      title: '脚本库', icon: '🎬', col: 'douyin.scripts',
      desc: '可复用的视频脚本结构与话题标签。',
      fields: [
        { key: 'title', label: '脚本标题', type: 'text', required: true },
        { key: 'content', label: '脚本内容', type: 'textarea', full: true },
        { key: 'tags', label: '话题标签', type: 'text', placeholder: '#英语启蒙 #宝妈' }
      ]
    },
    douyinPlans: {
      title: '发布计划表', icon: '📅', col: 'douyin.plans',
      desc: '拍摄灵感转化为发布计划，跟踪状态与节点。',
      fields: [
        { key: 'date', label: '计划日期', type: 'date', required: true },
        { key: 'idea', label: '拍摄选题/灵感', type: 'text', full: true, required: true },
        { key: 'status', label: '状态', type: 'select', options: ['待拍摄', '拍摄中', '已发布', '已搁置'] }
      ],
      computed: [
        { label: '节点', html: r => U.countdownBadge(r.date) }
      ]
    },
    douyinReviews: {
      title: '视频数据复盘', icon: '📊', col: 'douyin.reviews',
      desc: '播放、点赞、选题总结，沉淀爆款方法论。',
      fields: [
        { key: 'date', label: '发布日期', type: 'date', required: true },
        { key: 'plays', label: '播放量', type: 'number' },
        { key: 'likes', label: '点赞量', type: 'number' },
        { key: 'topic', label: '选题', type: 'text' },
        { key: 'summary', label: '总结', type: 'textarea', full: true }
      ],
      computed: [
        { label: '赞播比', html: r => {
            const p = Number(r.plays) || 0, l = Number(r.likes) || 0;
            return p ? (l / p * 100).toFixed(1) + '%' : '—';
          } }
      ]
    },

    /* ---------- 板块3 家庭财务 ---------- */
    ledger: {
      title: '收支流水台账', icon: '💰', col: 'ledger',
      desc: '房贷/车贷/日常/育儿/医疗/出行/餐饮分类记账。',
      fields: [
        { key: 'date', label: '日期', type: 'date', required: true },
        { key: 'type', label: '收支类型', type: 'select', options: ['收入', '支出'], required: true },
        { key: 'amount', label: '金额(元)', type: 'number', required: true },
        { key: 'category', label: '分类标签', type: 'select', options: ['房贷', '车贷', '日常消费', '育儿支出', '医疗', '出行', '餐饮', '其他'], required: true },
        { key: 'note', label: '备注', type: 'textarea', full: true }
      ]
    },
    insurance: {
      title: '全家保险档案', icon: '📄', col: 'insurance',
      desc: '本人/配偶/云兮/父母保单，续保自动倒计时提醒。',
      fields: [
        { key: 'person', label: '人员', type: 'select', options: ['本人', '配偶', '庞云兮', '父', '母'], required: true },
        { key: 'holder', label: '投保人', type: 'text' },
        { key: 'type', label: '险种', type: 'text', placeholder: '重疾/医疗/意外/寿险' },
        { key: 'name', label: '保单名称', type: 'text' },
        { key: 'period', label: '保障期限', type: 'text', placeholder: '保至70岁 / 1年' },
        { key: 'annual', label: '年保费(元)', type: 'number' },
        { key: 'payDate', label: '缴费日期', type: 'date' },
        { key: 'expireDate', label: '到期时间', type: 'date' },
        { key: 'note', label: '重要条款备注', type: 'textarea', full: true }
      ],
      computed: [
        { label: '续保倒计时', html: r => U.countdownBadge(r.payDate) }
      ]
    },

    /* ---------- 板块4 物资 & 提醒 ---------- */
    inventory: {
      title: '母婴消耗品库存', icon: '🧸', col: 'inventory',
      desc: '尿不湿/护肤品等日均消耗与预估耗尽，到预警线自动提醒采购。',
      fields: [
        { key: 'name', label: '物品名称', type: 'text', required: true },
        { key: 'stock', label: '现有库存', type: 'number', required: true },
        { key: 'dailyUse', label: '日均消耗', type: 'number' },
        { key: 'warnLine', label: '预警线', type: 'number' },
        { key: 'unit', label: '单位', type: 'text', placeholder: '片/支/袋' },
        { key: 'note', label: '备注', type: 'textarea', full: true }
      ],
      computed: [
        { label: '预估耗尽', html: r => {
            const d = U.estimateDeplete(r.stock, r.dailyUse);
            return d ? U.countdownBadge(d) : '<span class="muted">—</span>';
          } },
        { label: '状态', html: r => {
            const stock = Number(r.stock) || 0, warn = Number(r.warnLine) || 0;
            if (stock <= warn) return '<span class="chip pink">⚠ 需采购</span>';
            return '<span class="chip mint">充足</span>';
          } }
      ]
    },
    bills: {
      title: '固定账单提醒', icon: '🏦', col: 'bills',
      desc: '房贷/车贷每月还款日，自动倒计时。',
      fields: [
        { key: 'name', label: '账单名称', type: 'select', options: ['房贷', '车贷', '其他'], required: true },
        { key: 'payDay', label: '每月还款日(号)', type: 'number', required: true },
        { key: 'amount', label: '金额(元)', type: 'number' },
        { key: 'note', label: '备注', type: 'textarea', full: true }
      ],
      computed: [
        { label: '本月还款', html: r => U.countdownBadge(U.billNextDate(r.payDay)) }
      ]
    }
  };

  return S;
})();
