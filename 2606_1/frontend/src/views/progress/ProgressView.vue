<template>
  <div class="progress-view">
    <div class="sunset-banner">
      <div class="sunset-banner__title">该页面已进入退出准备，仅保留演示展示</div>
      <div class="sunset-banner__desc">
        当前进度卡片全部基于静态演示数据，不作为正式进度管理能力对外使用。页面入口下线将由主线程统一处理。
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div
        v-for="chip in filterChips"
        :key="chip.key"
        class="filter-chip"
        @click="showReadonlyToast"
      >
        {{ chip.label }} ▾
      </div>
    </div>

    <!-- 进度卡片网格 -->
    <div class="progress-grid">
      <div
        v-for="item in progressItems"
        :key="item.id"
        class="progress-card"
        :class="{ risk: item.isRisk }"
        @click="showReadonlyToast"
      >
        <div class="card-header">
          <div class="card-title">{{ item.title }}</div>
          <div v-if="item.isRisk" class="card-risk">高风险</div>
        </div>
        <div class="ring-wrap">
          <div class="ring" :style="{ '--deg': `${item.percent * 3.6}deg` }">
            <div class="ring-inner">{{ item.percent }}%</div>
          </div>
        </div>
        <div class="ring-meta">
          <div class="ring-label">{{ item.statusLabel }} · 期望上线 {{ item.expectedDate }}</div>
        </div>
        <div class="card-footer">
          <span class="card-tag">{{ item.tag }}</span>
          <span class="card-due" :class="{ urgent: item.daysLeft <= 3 }">
            剩余 {{ item.daysLeft }} 天
          </span>
        </div>
      </div>
    </div>

    <div class="toast" :class="{ show: toastVisible }">{{ toastMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ProgressItem {
  id: number
  title: string
  percent: number
  statusLabel: string
  expectedDate: string
  tag: string
  daysLeft: number
  isRisk: boolean
}

/**
 * 该页仅作为历史演示视图保留，避免正式入口移除前出现空白页。
 * 交互统一降级为只读提示，不再假装具备真实进度管理能力。
 */
const progressItems = ref<ProgressItem[]>([
  {
    id: 1,
    title: '台州各区县采购平台优化',
    percent: 10,
    statusLabel: '待判定',
    expectedDate: '5-25',
    tag: '校园G端',
    daysLeft: 3,
    isRisk: true,
  },
  {
    id: 2,
    title: '智慧食堂支付通道扩容',
    percent: 40,
    statusLabel: '设计中',
    expectedDate: '5-28',
    tag: '校园G端',
    daysLeft: 6,
    isRisk: false,
  },
  {
    id: 3,
    title: '教育局数据报表导出功能',
    percent: 50,
    statusLabel: '研发中',
    expectedDate: '5-22',
    tag: '校园G端',
    daysLeft: 1,
    isRisk: false,
  },
  {
    id: 4,
    title: '山东互联网+明厨亮灶项目',
    percent: 15,
    statusLabel: '待判定',
    expectedDate: '6-11',
    tag: '市监G端',
    daysLeft: 18,
    isRisk: false,
  },
  {
    id: 5,
    title: '仓储屏UI交互改版',
    percent: 40,
    statusLabel: '设计中',
    expectedDate: '6-18',
    tag: '校园G端',
    daysLeft: 25,
    isRisk: false,
  },
  {
    id: 6,
    title: '南昌青山湖区智慧食堂项目系统修改',
    percent: 10,
    statusLabel: '待判定',
    expectedDate: '5-31',
    tag: '校园G端',
    daysLeft: 9,
    isRisk: true,
  },
  {
    id: 7,
    title: '供应商资质审核流程',
    percent: 75,
    statusLabel: '测试中',
    expectedDate: '5-20',
    tag: '校园G端',
    daysLeft: 0,
    isRisk: false,
  },
  {
    id: 8,
    title: '食堂消费流水对账优化',
    percent: 90,
    statusLabel: '已上线',
    expectedDate: '5-18',
    tag: '校园G端',
    daysLeft: 0,
    isRisk: false,
  },
])

const filterChips = [
  { key: 'businessLine', label: '全部业务线' },
  { key: 'assignee', label: '全部负责人' },
  { key: 'riskFirst', label: '高风险优先' },
]

const toastVisible = ref(false)
const toastMessage = ref('')

function showReadonlyToast() {
  showToast('该页面仅保留演示展示，正式进度看板能力已准备退出')
}

function showToast(message: string) {
  toastMessage.value = message
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
  }, 2500)
}
</script>

<style lang="scss" scoped>
.progress-view {
  height: 100%;
}

.sunset-banner {
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 149, 0, 0.25);
  background: rgba(255, 149, 0, 0.08);
  border-radius: var(--radius);
}

.sunset-banner__title {
  font-size: 14px;
  font-weight: 600;
  color: #8a5200;
  margin-bottom: 4px;
}

.sunset-banner__desc {
  font-size: 12px;
  line-height: 1.6;
  color: #8a5200;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.progress-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid transparent;

  &:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-1px);
  }

  &.risk {
    border-color: rgba(255, 59, 48, 0.25);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.card-title {
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  flex: 1;
}

.card-risk {
  font-size: 11px;
  color: var(--danger);
  font-weight: 600;
  background: rgba(255, 59, 48, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
  margin-left: 8px;
}

.ring-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
}

.ring {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(var(--primary) var(--deg), var(--bg) var(--deg));
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-inner {
  width: 72px;
  height: 72px;
  background: var(--surface);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}

.ring-meta {
  text-align: center;
  margin-top: 10px;
}

.ring-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.card-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary);
}

.card-due {
  font-size: 12px;
  color: var(--text-secondary);

  &.urgent {
    color: var(--danger);
    font-weight: 500;
  }
}

@media (max-width: 768px) {
  .progress-grid {
    grid-template-columns: 1fr;
  }
}

.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: #1d1d1f;
  color: #fff;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  z-index: 200;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;

  &.show {
    opacity: 1;
  }
}
</style>
