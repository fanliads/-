<template>
  <div class="list-view">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <input
          v-model="queryForm.keyword"
          class="search-box"
          placeholder="搜索编号/标题/描述..."
          @keyup.enter="handleSearch"
        />
        <select v-model="queryForm.status" class="filter-select" @change="handleSearch">
          <option value="">全部状态</option>
          <option v-for="(label, key) in RAW_STATUS_MAP" :key="key" :value="key">{{ label }}</option>
        </select>
        <select v-model="queryForm.priority" class="filter-select" @change="handleSearch">
          <option value="">全部优先级</option>
          <option v-for="(label, key) in PRIORITY_MAP" :key="key" :value="key">{{ label }}</option>
        </select>
        <select v-model="queryForm.source" class="filter-select" @change="handleSearch">
          <option value="">全部来源</option>
          <option v-for="(label, key) in SOURCE_MAP" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
      <div class="toolbar-right">
        <button class="btn btn-primary" @click="$router.push('/submit')">+ 新建需求</button>
      </div>
    </div>

    <!-- 表格容器 -->
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
            <th>需求编号</th>
            <th>标题</th>
            <th>状态</th>
            <th>优先级</th>
            <th>来源</th>
            <th>负责人</th>
            <th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="empty-cell">加载中...</td>
          </tr>
          <tr v-else-if="tableData.length === 0">
            <td colspan="8" class="empty-cell">暂无数据</td>
          </tr>
          <tr
            v-else
            v-for="row in tableData"
            :key="row.id"
            @click="handleRowClick(row)"
            style="cursor: pointer"
          >
            <td><input type="checkbox" :value="row.id" v-model="selectedIds" @click.stop /></td>
            <td>{{ row.reqNo }}</td>
            <td class="req-title">{{ row.title }}</td>
            <td>
              <span class="status-tag" :class="getStatusClass(row.status, row.statusName)">
                {{ getRawRequirementStatusLabel(row.status, row.statusName) }}
              </span>
            </td>
            <td>
              <span class="priority-pill" :class="'priority-' + row.priority?.toLowerCase()">
                {{ row.priority }}
              </span>
            </td>
            <td>{{ SOURCE_MAP[row.source] || row.source || '-' }}</td>
            <td>{{ row.assigneeName || '-' }}</td>
            <td>{{ formatDate(row.createTime) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <div class="pagination-info">共 {{ total }} 条</div>
      <div class="pagination-controls">
        <button class="page-btn" :disabled="queryForm.page <= 1" @click="goPage(1)">«</button>
        <button class="page-btn" :disabled="queryForm.page <= 1" @click="goPage(queryForm.page - 1)">‹</button>
        <span class="page-current">{{ queryForm.page }}</span>
        <button class="page-btn" :disabled="queryForm.page >= totalPages" @click="goPage(queryForm.page + 1)">›</button>
        <button class="page-btn" :disabled="queryForm.page >= totalPages" @click="goPage(totalPages)">»</button>
      </div>
      <select v-model="queryForm.size" class="size-select" @change="handleSearch">
        <option :value="10">10条/页</option>
        <option :value="20">20条/页</option>
        <option :value="50">50条/页</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { pageQueryRawRequirements } from '@/api/raw-requirement'
import type { RawRequirementListVO } from '@/types/requirement'
import {
  RAW_STATUS_MAP,
  PRIORITY_MAP,
  SOURCE_MAP,
  getRawRequirementStatusClass,
  getRawRequirementStatusLabel,
} from '@/types/requirement'


const queryForm = reactive({
  page: 1,
  size: 10,
  status: '',
  priority: '',
  source: '',
  keyword: '',
  sortField: '',
  sortOrder: '',
})

const loading = ref(false)
const tableData = ref<RawRequirementListVO[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])
const selectAll = ref(false)

const totalPages = computed(() => Math.ceil(total.value / queryForm.size) || 1)

function getStatusClass(status: string, statusName?: string): string {
  const rawClass = getRawRequirementStatusClass(status, statusName)
  const map: Record<string, string> = {
    'status-pending': 'status-eval',
    'status-split': 'status-dev',
    'status-progress': 'status-dev',
    'status-online': 'status-closed',
    'status-suspended': 'status-eval',
    'status-rejected': 'status-reject',
    'status-closed': 'status-closed',
  }
  return map[rawClass] || 'status-eval'
}

function formatDate(dt: string): string {
  if (!dt) return '-'
  return dt.substring(0, 10)
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedIds.value = tableData.value.map(r => r.id)
  } else {
    selectedIds.value = []
  }
}

function goPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  queryForm.page = page
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const res = await pageQueryRawRequirements(queryForm)
    const data = res.data
    tableData.value = data.list || []
    total.value = data.total || 0
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.page = 1
  loadData()
}

function handleRowClick(row: RawRequirementListVO) {
  // 可以后续跳转详情
  console.log('点击需求:', row.reqNo)
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.list-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px 32px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-shrink: 0;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.search-box {
  width: 240px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--primary);
  }
}

.filter-select {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 13px;
  color: var(--text-secondary);
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: var(--primary);
  }
}

.btn {
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: var(--primary);
  color: #fff;

  &:hover {
    background: var(--primary-hover);
  }
}

.table-wrap {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  flex: 1;
  overflow-y: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    text-align: left;
    padding: 12px 16px;
    background: var(--bg);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 12px;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 1;
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: rgba(0, 113, 227, 0.02);
  }
}

.req-title {
  font-weight: 500;
}

.status-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.status-eval {
  background: rgba(0, 113, 227, 0.10);
  color: var(--primary);
}

.status-dev {
  background: rgba(52, 199, 89, 0.10);
  color: #248a3d;
}

.status-reject {
  background: rgba(255, 59, 48, 0.10);
  color: #ff3b30;
}

.status-closed {
  background: rgba(142, 142, 147, 0.10);
  color: var(--text-secondary);
}

.priority-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.priority-p0 {
  background: rgba(255, 59, 48, 0.10);
  color: var(--danger);
}

.priority-p1 {
  background: rgba(255, 149, 0, 0.10);
  color: #b75c00;
}

.priority-p2 {
  background: rgba(255, 204, 0, 0.12);
  color: #9a7d00;
}

.priority-p3 {
  background: rgba(142, 142, 147, 0.08);
  color: var(--text-secondary);
}

.empty-cell {
  text-align: center;
  padding: 40px 16px;
  color: var(--text-secondary);
  font-size: 14px;
}

.pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 16px;
  flex-shrink: 0;

  .pagination-info {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .page-btn {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);

    &:hover:not(:disabled) {
      border-color: var(--primary);
      color: var(--primary);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  .page-current {
    min-width: 32px;
    height: 32px;
    border-radius: 6px;
    background: var(--primary);
    color: #fff;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
  }

  .size-select {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    font-size: 12px;
    color: var(--text-secondary);
    outline: none;
    cursor: pointer;
  }
}
</style>
