<template>
  <div class="dashboard-view">
    <!-- KPI 行 -->
    <div class="kpi-row">
      <div v-for="kpi in kpiData" :key="kpi.label" class="kpi-card">
        <div class="kpi-label">{{ kpi.label }}</div>
        <div class="kpi-value">
          {{ kpi.value }}
          <span v-if="kpi.unit" class="kpi-unit">{{ kpi.unit }}</span>
        </div>
        <div class="kpi-change" :class="kpi.isUp ? 'kpi-up' : 'kpi-down'">
          {{ kpi.isUp ? '+' : '' }}{{ kpi.change }} 环比上月
        </div>
      </div>
    </div>

    <!-- 图表行 -->
    <div class="chart-row">
      <!-- 饼图：需求状态分布 -->
      <div class="chart-card">
        <div class="chart-title">需求状态分布</div>
        <div class="pie-chart">
          <div class="pie-circle">
            <div class="pie-inner"></div>
          </div>
          <div class="pie-legend">
            <div v-for="item in pieData" :key="item.label" class="legend-item">
              <span class="legend-dot" :style="{ background: item.color }"></span>
              {{ item.label }} {{ item.percent }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 柱状图：各业务线吞吐量 -->
      <div class="chart-card">
        <div class="chart-title">各业务线吞吐量</div>
        <div class="bar-chart">
          <div v-for="bar in barData" :key="bar.label" class="bar-item">
            <div class="bar-track">
              <div class="bar-fill" :style="{ height: bar.value + '%' }"></div>
            </div>
            <div class="bar-label">{{ bar.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 价值评估排行 -->
    <div class="value-section">
      <div class="value-title">价值回归评估排行</div>
      <div class="value-list">
        <div v-for="(item, idx) in valueData" :key="idx" class="value-item">
          <div class="value-rank">{{ idx + 1 }}</div>
          <div class="value-name">{{ item.name }}</div>
          <div class="value-score">
            <span
              v-for="n in 5"
              :key="n"
              class="star"
              :class="{ empty: n > item.score }"
            >★</span>
          </div>
          <span class="value-meta">{{ item.score.toFixed(1) }}分 · {{ item.reviews }}条评价</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/** KPI 数据 */
const kpiData = ref([
  { label: '本月新增需求', value: 42, unit: '', change: '+12%', isUp: true },
  { label: '本月完成需求', value: 38, unit: '', change: '+8%', isUp: true },
  { label: '平均处理周期', value: '5.2', unit: '天', change: '-15%', isUp: false },
  { label: '挂起率', value: 8, unit: '%', change: '-3%', isUp: false },
])

/** 饼图数据 */
const pieData = ref([
  { label: '待评估', percent: 30, color: 'var(--primary)' },
  { label: '进行中', percent: 20, color: 'var(--success)' },
  { label: '已完成', percent: 35, color: 'var(--warning)' },
  { label: '已拒绝', percent: 10, color: 'var(--danger)' },
  { label: '挂起', percent: 5, color: '#e8e8ed' },
])

/** 柱状图数据 */
const barData = ref([
  { label: '核心交易', value: 85 },
  { label: '用户增长', value: 60 },
  { label: '数据平台', value: 45 },
  { label: '基础服务', value: 28 },
])

/** 价值评估排行数据 */
const valueData = ref([
  { name: '智慧食堂支付通道扩容', score: 5, reviews: 8 },
  { name: '供应商资质审核流程优化', score: 4, reviews: 6 },
  { name: '教育局数据报表导出', score: 4, reviews: 5 },
  { name: '食安溯源链上存证', score: 3, reviews: 4 },
  { name: '后勤巡检移动端适配', score: 3, reviews: 3 },
])
</script>

<style lang="scss" scoped>
.dashboard-view {
  max-width: 1200px;
}

/* KPI 行 */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.kpi-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;

  .kpi-unit {
    font-size: 16px;
    font-weight: 400;
  }
}

.kpi-change {
  font-size: 12px;
  margin-top: 4px;
}

.kpi-up {
  color: var(--success);
}

.kpi-down {
  color: var(--danger);
}

/* 图表行 */
.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.chart-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

/* 饼图 */
.pie-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 20px;
}

.pie-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: conic-gradient(
    var(--primary) 0deg 108deg,
    var(--success) 108deg 180deg,
    var(--warning) 180deg 252deg,
    var(--danger) 252deg 324deg,
    #e8e8ed 324deg 360deg
  );
  position: relative;
  flex-shrink: 0;
}

.pie-inner {
  position: absolute;
  inset: 24px;
  background: var(--surface);
  border-radius: 50%;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 柱状图 */
.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 160px;
  padding: 0 20px;
  gap: 16px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar-track {
  width: 100%;
  background: var(--bg);
  border-radius: 6px 6px 0 0;
  height: 120px;
  position: relative;
}

.bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--primary);
  border-radius: 6px 6px 0 0;
  transition: height 0.6s ease;
}

.bar-label {
  font-size: 11px;
  color: var(--text-secondary);
  text-align: center;
}

/* 价值评估 */
.value-section {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.value-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

.value-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.value-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.value-rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.value-name {
  flex: 1;
  font-size: 13px;
}

.value-score {
  display: flex;
  gap: 2px;
}

.star {
  color: #ffcc00;
  font-size: 14px;

  &.empty {
    color: #e8e8ed;
  }
}

.value-meta {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* 响应式 */
@media (max-width: 768px) {
  .kpi-row {
    grid-template-columns: 1fr 1fr;
  }

  .chart-row {
    grid-template-columns: 1fr;
  }
}
</style>
