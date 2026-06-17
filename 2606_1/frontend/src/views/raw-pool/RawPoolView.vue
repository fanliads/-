<template>
  <div class="raw-pool-view">
    <!-- 顶部工具栏 -->
    <div class="toolbar-header">
      <div class="toolbar-left">
        <div>
          <div class="page-title">原始需求池</div>
          <div class="page-subtitle">核心字段评估列表，展开后再看完整上下文和拆分结果</div>
        </div>
        <input
          v-model="queryForm.keyword"
          class="search-box"
          placeholder="搜索原始需求标题、编号..."
          @keyup.enter="handleSearch"
        />
        <button v-if="hasActiveFilters" class="btn btn-ghost btn-clear" @click="handleReset">
          <span class="clear-icon">×</span> 清空筛选
        </button>
      </div>
      <div class="toolbar-right">
        <button v-if="canCreateRaw" class="btn btn-primary" @click="handleCreate">+ 新建需求</button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="mode-switch">
        <button
          class="mode-btn"
          :class="{ active: viewMode === 'card' }"
          @click="viewMode = 'card'"
        >折叠</button>
        <button
          class="mode-btn"
          :class="{ active: viewMode === 'table' }"
          @click="viewMode = 'table'"
        >展开</button>
      </div>
      <div
        class="filter-chip"
        :class="{ active: !!queryForm.status }"
        @click="showFilter = !showFilter"
      >当前状态</div>

    </div>

    <!-- 高级筛选面板 -->
    <el-collapse-transition>
      <div v-show="showFilter" class="filter-panel">
        <el-form :model="queryForm" inline label-width="90px">
          <el-form-item label="当前状态">
            <el-select v-model="queryForm.status" placeholder="全部" clearable style="width: 140px">
              <el-option v-for="item in dictStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="业务线">
            <el-select v-model="queryForm.businessLine" placeholder="全部" clearable style="width: 140px">
              <el-option v-for="item in dictBusinessLineOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="登记人">
            <el-input v-model="queryForm.registerName" placeholder="请输入登记人" clearable style="width: 140px" />
          </el-form-item>
          <el-form-item label="项目经理">
            <el-select v-model="queryForm.projectManager" placeholder="全部" clearable style="width: 140px">
              <el-option v-for="item in dictProjectManagerOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="产品经理">
            <el-select v-model="queryForm.productManager" placeholder="全部" clearable style="width: 140px">
              <el-option v-for="item in dictProductManagerOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否加急">
            <el-select v-model="queryForm.isUrgent" placeholder="全部" clearable style="width: 140px">
              <el-option label="是" :value="1" />
              <el-option label="否" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 260px"
              @change="handleDateChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-collapse-transition>

    <!-- 状态统计卡片 -->
    <div v-if="viewMode === 'table'" class="summary">
      <div class="summary-card">
        <div class="summary-k">待判定</div>
        <div class="summary-v">{{ statusCount.pendingJudgement }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-k">待拆分</div>
        <div class="summary-v">{{ statusCount.pendingSplit }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-k">开发中</div>
        <div class="summary-v">{{ statusCount.inProgress }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-k">已上线</div>
        <div class="summary-v">{{ statusCount.online }}</div>
      </div>
    </div>

    <!-- 数据内容区域 -->
    <div class="pool-scroll">
      <!-- 紧凑卡片模式 -->
      <div v-if="viewMode === 'card'" class="compact-list">
        <div v-for="row in tableData" :key="row.id" class="compact-item">
          <div class="compact-main">
            <div class="compact-lead">
              <div class="title">
                <EditableField
                  :value="row.title"
                  type="text"
                  @save="(val) => handleInlineSave(row, 'title', val)"
                />
              </div>
              <div class="desc">{{ getRequirementPreview(row) }}</div>
            </div>
            <div class="field-group">
              <div class="field-slot field-slot-emphasis">
                <div class="field-k">当前状态</div>
                <div class="field-v">
                  <EditableCell
                    :value="row.status"
                    type="select"
                    :options="dictStatusOptions"
                    @save="(val) => handleInlineSave(row, 'status', val)"
                  >
                    <span class="status-tag" :class="getStatusClass(row.status, row.statusName)">{{ getStatusLabel(row.status, row.statusName) }}</span>
                  </EditableCell>
                </div>
              </div>

              <div class="field-slot">
                <div class="field-k">业务线</div>
                <div class="field-v">
                  <EditableField
                    :value="row.businessLine"
                    type="select"
                    :options="dictBusinessLineOptions"
                    @save="(val) => handleInlineSave(row, 'businessLine', val)"
                  />
                </div>
              </div>

              <div class="field-slot field-slot-stack">
                <div class="field-k">优先级</div>
                <div class="field-v">
                  <EditableCell
                    :value="row.priority"
                    type="select"
                    :options="dictPriorityOptions"
                    @save="(val) => handleInlineSave(row, 'priority', val)"
                  >
                    <span class="priority-pill">{{ row.priority || '-' }}</span>
                  </EditableCell>
                </div>
              </div>

              <div class="field-slot field-slot-stack">
                <div class="field-k">判定来源</div>
                <div class="field-v">
                  <span class="judge-pill" :class="getJudgeSourceClass(row)">{{ getJudgeSourceLabel(row) }}</span>
                </div>
              </div>

              <div class="field-slot field-slot-link">
                <div class="field-k">需求单链接</div>
                <div class="field-v">
                  <EditableCell
                    :value="row.reqLink"
                    type="text"
                    @save="(val) => handleInlineSave(row, 'reqLink', val)"
                  >
                    <a v-if="row.reqLink" class="link-pill" :href="row.reqLink" target="_blank" @click.stop>查看需求单</a>
                    <span v-else class="editable-placeholder">-</span>
                  </EditableCell>
                </div>
              </div>

              <div class="field-slot field-slot-minor">
                <div class="field-k">提出人</div>
                <div class="field-v">
                  <EditableField
                    :value="row.proposer"
                    type="text"
                    @save="(val) => handleInlineSave(row, 'proposer', val)"
                  />
                </div>
                <div class="field-meta">
                  <span class="priority-chip effective">{{ getPriorityLabel(row.effectiveLevel || row.priority) }}</span>
                  <span v-if="row.systemLevel && row.systemLevel !== (row.effectiveLevel || row.priority)" class="priority-chip system">
                    系统 {{ getPriorityLabel(row.systemLevel) }}
                  </span>
                  <span v-if="isExternalSubmit(row)" class="origin-chip">外部提报</span>
                </div>
              </div>
            </div>
            <div class="actions" @click.stop>
              <button
                v-if="canShowHandoffAction(row)"
                class="btn btn-primary"
                @click="handleHandoff(row)"
              >承接</button>
              <button
                v-else-if="canShowSplitAction(row)"
                class="btn btn-primary"
                @click="handleSplit(row)"
              >拆分</button>
              <button class="btn btn-ghost" @click="toggleDetail(row.id)">
                {{ expandedIds.has(row.id) ? '收起详情' : '展开详情' }}
              </button>
            </div>
          </div>

          <!-- Accordion 就地展开详情区域 -->
          <div class="detail" :class="{ open: expandedIds.has(row.id) }">
            <div class="detail-grid">
              <div class="detail-card">
                <div class="detail-title">需求单</div>
                <div class="detail-value">{{ row.reqNo || '-' }}</div>
              </div>
              <div class="detail-card">
                <div class="detail-title">业务线</div>
                <div class="detail-value">
                  <EditableField
                    :value="row.businessLine"
                    type="select"
                    :options="dictBusinessLineOptions"
                    @save="(val) => handleInlineSave(row, 'businessLine', val)"
                  />
                </div>
              </div>
              <div class="detail-card">
                <div class="detail-title">登记人</div>
                <div class="detail-value">
                  <EditableField
                    :value="row.registerName"
                    type="text"
                    @save="(val) => handleInlineSave(row, 'registerName', val)"
                  />
                </div>
              </div>
              <div class="detail-card">
                <div class="detail-title">提出时间</div>
                <div class="detail-value">{{ row.createTime ? row.createTime.substring(0, 10) : '-' }}</div>
              </div>
              <div class="detail-card">
                <div class="detail-title">项目经理</div>
                <div class="detail-value">
                  <EditableField
                    :value="row.projectManager"
                    type="select"
                    :options="dictProjectManagerOptions"
                    @save="(val) => handleInlineSave(row, 'projectManager', val)"
                  />
                </div>
              </div>
              <div class="detail-card">
                <div class="detail-title">产品经理</div>
                <div class="detail-value">
                  <EditableField
                    :value="row.productManager"
                    type="select"
                    :options="dictProductManagerOptions"
                    @save="(val) => handleInlineSave(row, 'productManager', val)"
                  />
                </div>
              </div>
              <div class="detail-card">
                <div class="detail-title">优先级建议</div>
                <div class="detail-value">
                  <EditableField
                    :value="row.priority"
                    type="select"
                    :options="dictPriorityOptions"
                    @save="(val) => handleInlineSave(row, 'priority', val)"
                  />
                </div>
              </div>
              <div class="detail-card span-2">
                <div class="detail-title">系统分级摘要</div>
                <div class="detail-value detail-assessment">
                  <span class="priority-chip effective">{{ getPriorityLabel(row.effectiveLevel || row.priority) }}</span>
                  <span v-if="row.systemLevel" class="priority-chip system">系统 {{ getPriorityLabel(row.systemLevel) }}</span>
                  <span v-if="row.strategyHint" class="assessment-hint">{{ row.strategyHint }}</span>
                </div>
              </div>
              <div class="detail-card">
                <div class="detail-title">当前状态</div>
                <div class="detail-value">
                  <EditableField
                    :value="row.status"
                    type="select"
                    :options="dictStatusOptions"
                    @save="(val) => handleInlineSave(row, 'status', val)"
                  />
                </div>
              </div>
              <div class="detail-card">
                <div class="detail-title">是否加急</div>
                <div class="detail-value">
                  <EditableField
                    :value="row.isUrgent"
                    type="switch"
                    @save="(val) => handleInlineSave(row, 'isUrgent', val)"
                  />
                </div>
              </div>
              <div class="detail-card" v-if="row.isUrgent === 1">
                <div class="detail-title">加急原因</div>
                <div class="detail-value">
                  <EditableField
                    :value="row.urgentReason"
                    type="text"
                    @save="(val) => handleInlineSave(row, 'urgentReason', val)"
                  />
                </div>
              </div>
              <div class="detail-card">
                <div class="detail-title">期望上线时间</div>
                <div class="detail-value">
                  <EditableField
                    :value="row.expectedOnlineDate ? row.expectedOnlineDate.substring(0, 10) : ''"
                    type="date"
                    @save="(val) => handleInlineSave(row, 'expectedOnlineDate', val)"
                  />
                </div>
              </div>
              <div class="detail-card">
                <div class="detail-title">关联项目</div>
                <div class="detail-value">
                  <EditableField
                    :value="row.projectName"
                    type="text"
                    @save="(val) => handleInlineSave(row, 'projectName', val)"
                  />
                </div>
              </div>
              <div class="detail-card">
                <div class="detail-title">价值量化评估</div>
                <div class="detail-value">
                  <EditableField
                    :value="row.valueAssessment"
                    type="text"
                    @save="(val) => handleInlineSave(row, 'valueAssessment', val)"
                  />
                </div>
              </div>
              <div class="detail-card span-2">
                <div class="detail-title">需求单链接</div>
                <div class="detail-value">
                  <EditableField
                    :value="row.reqLink"
                    type="text"
                    placeholder="点击填写需求单链接"
                    @save="(val) => handleInlineSave(row, 'reqLink', val)"
                  />
                </div>
              </div>
              <div class="detail-card full">
                <div class="detail-title">处理备注</div>
                <div class="detail-tip">记录录入说明、处理背景和补充判断，不替代正文。</div>
                <div class="detail-value">
                  <EditableField
                    :value="row.remark"
                    type="textarea"
                    placeholder="点击添加处理备注"
                    @save="(val) => handleInlineSave(row, 'remark', val)"
                  />
                </div>
              </div>
              <div class="detail-card full" v-if="row.productDefinition">
                <div class="detail-title">产品需求定义</div>
                <div class="detail-value">
                  <EditableField
                    :value="row.productDefinition"
                    type="select"
                    :options="dictReqDefinitionOptions"
                    @save="(val) => handleInlineSave(row, 'productDefinition', val)"
                  />
                </div>
              </div>
              <div class="detail-card full">
                <div class="detail-title">需求描述</div>
                <div class="detail-tip">主正文，用于说明这条原始需求本身要解决什么问题。</div>
                <div class="detail-value detail-description">{{ row.description || '暂无需求描述' }}</div>
              </div>

              <!-- 下钻产品需求列表（仅在有拆分结果时显示） -->
              <div class="detail-card full" v-if="row.linkedProducts && row.linkedProducts.length > 0">
                <div class="detail-title">下钻产品需求</div>
                <div class="linked-list">
                  <div v-for="prd in row.linkedProducts" :key="prd.id" class="linked-item">
                    <span>{{ prd.reqNo }} {{ prd.title }}</span>
                    <span class="status-tag" :class="getStatusClass(prd.status, prd.statusName)">{{ getStatusLabel(prd.status, prd.statusName) }}</span>
                  </div>
                </div>
              </div>

              <!-- 内容补充区域 -->
              <div class="detail-card full">
                <div class="detail-title">追加记录</div>
                <div class="detail-tip">按时间追加的补充信息，作为正文后的增量上下文。</div>
                <div class="detail-value" v-if="row.supplements && row.supplements.length > 0">
                  <div v-for="sup in row.supplements" :key="sup.id" class="sup-item">
                    <div class="sup-meta">
                      <span class="sup-type">{{ sup.supplementTypeName }}</span>
                      <span class="sup-time">{{ formatDateTime(sup.createTime) }}</span>
                    </div>
                    <div class="sup-content">{{ sup.content }}</div>
                  </div>
                </div>
                <div class="detail-value" v-else>暂无追加记录</div>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-if="tableData.length === 0 && !loading" description="暂无数据" />
      </div>

      <!-- 表格模式 -->
      <div v-else class="table-wrap">
        <div class="custom-table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>业务线</th>
                <th>原始需求标题</th>
                <th>需求单</th>
                <th>主描述摘要</th>
                <th>处理备注</th>
                <th>登记人</th>
                <th>提出人</th>
                <th>提出时间</th>
                <th>当前状态</th>
                <th>产品需求定义</th>
                <th>产品经理</th>
                <th>项目经理</th>
                <th>优先级建议</th>
                <th>系统分级</th>
                <th>是否加急</th>
                <th>加急原因</th>
                <th>关联项目</th>
                <th>期望上线时间</th>
                <th>价值量化评估</th>
                <th>完整度</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tableData" :key="row.id">
                <td>
                  <EditableCell
                    :value="row.businessLine"
                    type="select"
                    :options="dictBusinessLineOptions"
                    @save="(val) => handleInlineSave(row, 'businessLine', val)"
                  />
                </td>
                <td>
                  <EditableCell
                    :value="row.title"
                    type="text"
                    @save="(val) => handleInlineSave(row, 'title', val)"
                  />
                </td>
                <td>
                  <a v-if="row.reqLink" class="link-pill" :href="row.reqLink" target="_blank">{{ row.reqNo }}</a>
                  <span v-else>{{ row.reqNo }}</span>
                </td>
                <td class="col-description" :title="row.description || ''">
                  {{ getRequirementPreview(row) }}
                </td>
                <td class="col-remark" :title="row.remark || ''">
                  <EditableCell
                    :value="row.remark"
                    type="text"
                    @save="(val) => handleInlineSave(row, 'remark', val)"
                  />
                </td>
                <td>
                  <EditableCell
                    :value="row.registerName"
                    type="text"
                    @save="(val) => handleInlineSave(row, 'registerName', val)"
                  />
                </td>
                <td>{{ row.proposer || '-' }}</td>
                <td>{{ row.createTime ? row.createTime.substring(0, 10) : '-' }}</td>
                <td>
                  <EditableCell
                  :value="row.status"
                  type="select"
                  :options="dictStatusOptions"
                  @save="(val) => handleInlineSave(row, 'status', val)"
                >
                    <span class="status-tag" :class="getStatusClass(row.status, row.statusName)">{{ getStatusLabel(row.status, row.statusName) }}</span>
                  </EditableCell>
                </td>
                <td>
                  <EditableCell
                    :value="row.productDefinition"
                    type="select"
                    :options="dictReqDefinitionOptions"
                    @save="(val) => handleInlineSave(row, 'productDefinition', val)"
                  />
                </td>
                <td>
                  <EditableCell
                    :value="row.productManager"
                    type="select"
                    :options="dictProductManagerOptions"
                    @save="(val) => handleInlineSave(row, 'productManager', val)"
                  />
                </td>
                <td>
                  <EditableCell
                    :value="row.projectManager"
                    type="select"
                    :options="dictProjectManagerOptions"
                    @save="(val) => handleInlineSave(row, 'projectManager', val)"
                  />
                </td>
                <td>
                  <EditableCell
                    :value="row.priority"
                    type="select"
                    :options="dictPriorityOptions"
                    @save="(val) => handleInlineSave(row, 'priority', val)"
                  />
                </td>
                <td>
                  <div class="table-assessment">
                    <span class="priority-chip effective">{{ getPriorityLabel(row.effectiveLevel || row.priority) }}</span>
                    <span v-if="row.systemLevel && row.systemLevel !== (row.effectiveLevel || row.priority)" class="priority-chip system">
                      系统 {{ getPriorityLabel(row.systemLevel) }}
                    </span>
                  </div>
                </td>
                <td>
                  <EditableCell
                    :value="row.isUrgent"
                    type="switch"
                    @save="(val) => handleInlineSave(row, 'isUrgent', val)"
                  />
                </td>
                <td>
                  <EditableCell
                    :value="row.urgentReason"
                    type="text"
                    @save="(val) => handleInlineSave(row, 'urgentReason', val)"
                  />
                </td>
                <td>
                  <EditableCell
                    :value="row.projectName"
                    type="text"
                    @save="(val) => handleInlineSave(row, 'projectName', val)"
                  />
                </td>
                <td>
                  <EditableCell
                    :value="row.expectedOnlineDate ? row.expectedOnlineDate.substring(0, 10) : ''"
                    type="date"
                    @save="(val) => handleInlineSave(row, 'expectedOnlineDate', val)"
                  />
                </td>
                <td>
                  <EditableCell
                    :value="row.valueAssessment"
                    type="text"
                    @save="(val) => handleInlineSave(row, 'valueAssessment', val)"
                  />
                </td>
                <td>
                  <span class="info-badge" :class="isContentReady(row) ? 'info-ok' : 'info-missing'">
                    {{ isContentReady(row) ? '完整' : '待补充' }}
                  </span>
                  <span v-if="isExternalSubmit(row)" class="origin-chip table-origin-chip">外部提报</span>
                </td>
                <td class="table-actions">
                  <button v-if="canShowHandoffAction(row)" class="btn btn-primary" @click.stop="handleHandoff(row)">承接</button>
                  <button v-else-if="canShowSplitAction(row)" class="btn btn-primary" @click.stop="handleSplit(row)">拆分</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <el-empty v-if="tableData.length === 0 && !loading" description="暂无数据" />
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryForm.page"
          v-model:page-size="queryForm.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </div>

    <!-- 需求拆分对话框 -->
    <el-dialog v-model="splitDialogVisible" title="拆分原始需求" width="90vw" destroy-on-close class="split-dialog">
      <div class="split-dialog-body">
        <div class="split-editor">
          <div class="split-origin">
            <div class="split-origin-label">原始需求</div>
            <div class="split-origin-title">{{ splitTarget?.title || '' }}</div>
            <div v-if="splitTarget?.reqNo" class="split-origin-no">{{ splitTarget.reqNo }}</div>
            <div v-if="splitTarget?.reqLink" class="split-link-panel">
              <div class="split-link-label">需求单链接</div>
              <a
                class="split-link"
                :href="normalizedSplitReqLink"
                target="_blank"
                rel="noopener noreferrer"
                @click.stop
              >
                {{ splitTarget.reqLink }}
              </a>
              <div class="split-link-hint">右侧可直接预览原始内容，拆分窗口不会关闭。</div>
            </div>
          </div>

          <div class="split-extract-panel">
            <div class="split-extract-header">
              <div>
                <div class="split-extract-title">原文摘录区</div>
                <div class="split-extract-subtitle">固定展示系统内已有原始内容，便于直接复制后拆分</div>
              </div>
              <button class="btn btn-ghost split-copy-btn" @click="copySplitSourceText">复制原文</button>
            </div>

            <div class="split-extract-body">
              <div v-if="splitTarget?.description" class="split-extract-block">
                <div class="split-extract-label">需求描述</div>
                <div class="split-extract-content">{{ splitTarget.description }}</div>
              </div>

              <div v-if="splitTarget?.remark" class="split-extract-block">
                <div class="split-extract-label">处理备注</div>
                <div class="split-extract-content">{{ splitTarget.remark }}</div>
              </div>

              <div v-if="splitTarget?.productDefinition" class="split-extract-block">
                <div class="split-extract-label">产品需求定义</div>
                <div class="split-extract-content">{{ splitTarget.productDefinition }}</div>
              </div>

              <div v-if="splitTarget?.urgentReason" class="split-extract-block">
                <div class="split-extract-label">加急原因</div>
                <div class="split-extract-content">{{ splitTarget.urgentReason }}</div>
              </div>

              <div
                v-if="splitTarget?.supplements && splitTarget.supplements.length > 0"
                class="split-extract-block"
              >
                <div class="split-extract-label">追加记录</div>
                <div class="split-supplement-list">
                  <div v-for="sup in splitTarget.supplements" :key="sup.id" class="split-supplement-item">
                    <div class="split-supplement-type">{{ sup.supplementTypeName || sup.supplementType }} · {{ formatDateTime(sup.createTime) }}</div>
                    <div class="split-extract-content">{{ sup.content }}</div>
                  </div>
                </div>
              </div>

              <div
                v-if="!splitTarget?.description && !splitTarget?.remark && !splitTarget?.productDefinition && !splitTarget?.urgentReason && (!splitTarget?.supplements || splitTarget.supplements.length === 0)"
                class="split-extract-empty"
              >
                当前原始需求暂无可摘录内容，请优先补充需求描述、处理备注或追加记录。
              </div>
            </div>
          </div>

          <div class="split-items">
            <div class="split-items-header">
              <span>拆分产品需求</span>
              <button class="btn btn-ghost" @click="addSplitItem">+ 添加一条</button>
            </div>

            <div v-for="(item, idx) in splitItems" :key="idx" class="split-item-card">
              <div class="split-item-header">
                <span>产品需求 #{{ idx + 1 }}</span>
                <button v-if="splitItems.length > 1" class="btn-remove" @click="removeSplitItem(idx)">删除</button>
              </div>
              <div class="split-item-form">
                <div class="form-row">
                  <div class="form-field">
                    <div class="field-label">产品需求标题（选填）</div>
                    <el-input v-model="item.title" placeholder="可不填，系统会按说明自动生成标题" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-field">
                    <div class="field-label">需求说明（选填）</div>
                    <el-input
                      v-model="item.description"
                      type="textarea"
                      :rows="3"
                      placeholder="若标题为空，系统将基于说明自动生成标题"
                    />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-field">
                    <div class="field-label">建议负责人</div>
                    <el-select v-model="item.handler" placeholder="请选择负责人" style="width: 100%">
                      <el-option v-for="pm in dictProductManagerOptions" :key="pm.value" :label="pm.label" :value="pm.value" />
                    </el-select>
                  </div>
                  <div class="form-field">
                    <div class="field-label">优先级</div>
                    <el-select v-model="item.priority" placeholder="请选择优先级" style="width: 100%">
                      <el-option v-for="p in dictPriorityOptions" :key="p.value" :label="p.label" :value="p.value" />
                    </el-select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="split-preview-panel">
          <div class="split-preview-header">
            <div>
              <div class="split-preview-title">需求单预览</div>
              <div class="split-preview-subtitle">在当前窗口查看原始链接内容，便于复制后拆分</div>
            </div>
            <a
              v-if="splitTarget?.reqLink"
              class="split-preview-open"
              :href="normalizedSplitReqLink"
              target="_blank"
              rel="noopener noreferrer"
            >
              新标签打开
            </a>
          </div>

          <div v-if="normalizedSplitReqLink && !iframeLoadError" class="split-preview-frame-wrap">
            <iframe
              class="split-preview-frame"
              :src="normalizedSplitReqLink"
              referrerpolicy="no-referrer"
              @load="iframeLoadError = false"
              @error="iframeLoadError = true"
            />
          </div>

          <div v-if="normalizedSplitReqLink && iframeLoadError" class="split-preview-error">
            <div class="split-preview-error-text">该链接不支持内嵌预览，请在新窗口打开</div>
            <a
              class="btn btn-primary split-preview-error-btn"
              :href="normalizedSplitReqLink"
              target="_blank"
              rel="noopener noreferrer"
            >
              新窗口打开链接
            </a>
          </div>

          <div v-else class="split-preview-empty">
            当前原始需求未填写“需求单链接”，无法预览。
          </div>

          <div v-if="normalizedSplitReqLink" class="split-preview-tip">
            如果右侧页面显示为空白，通常是目标网站禁止嵌入 iframe。此时可点击“新标签打开”，拆分窗口仍会保留。
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="splitDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="splitLoading" @click="submitSplit">确认拆分</el-button>
      </template>
    </el-dialog>

    <!-- 新建需求弹窗 -->
    <el-dialog v-model="createDialogVisible" title="新建原始需求" width="640px" destroy-on-close>
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="需求标题" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入需求标题" />
        </el-form-item>
        <el-form-item label="需求描述" prop="description">
          <el-input v-model="createForm.description" type="textarea" :rows="3" placeholder="请输入需求描述" />
        </el-form-item>
        <el-form-item label="业务线" prop="businessLine">
          <el-select v-model="createForm.businessLine" placeholder="请选择业务线" style="width: 100%">
            <el-option v-for="item in dictBusinessLineOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="提出人">
          <el-input :model-value="createForm.proposer || '-'" disabled />
        </el-form-item>
        <el-form-item label="需求单链接" prop="reqLink">
          <el-input v-model="createForm.reqLink" placeholder="请输入需求单链接" />
        </el-form-item>
        <el-form-item label="期望上线时间" prop="expectedOnlineDate">
          <el-date-picker v-model="createForm.expectedOnlineDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="价值量化评估" prop="valueAssessment">
          <el-input v-model="createForm.valueAssessment" placeholder="请输入价值量化评估" />
        </el-form-item>
        <el-divider content-position="left">V3 业务判定信息</el-divider>
        <div class="dialog-grid">
          <el-form-item label="项目名称">
            <el-input v-model="assessmentCreateForm.projectName" placeholder="请输入项目名称" />
          </el-form-item>
          <el-form-item label="客户名称">
            <el-input v-model="assessmentCreateForm.customerName" placeholder="请输入客户名称" />
          </el-form-item>
          <el-form-item label="合同编号">
            <el-input v-model="assessmentCreateForm.contractNo" placeholder="请输入合同编号" />
          </el-form-item>
          <el-form-item label="合同金额">
            <el-input v-model="assessmentCreateForm.contractAmount" placeholder="请输入合同金额" />
          </el-form-item>
          <el-form-item label="项目类型">
            <el-input v-model="assessmentCreateForm.projectType" placeholder="如：常规营收项目/专属定制" />
          </el-form-item>
          <el-form-item label="商务负责人">
            <el-input v-model="assessmentCreateForm.businessOwner" placeholder="请输入商务负责人" />
          </el-form-item>
          <el-form-item label="合同范围">
            <el-input v-model="assessmentCreateForm.contractScope" placeholder="请输入合同范围" />
          </el-form-item>
          <el-form-item label="预估工时">
            <el-input v-model="assessmentCreateForm.estimatedWorkload" placeholder="请输入预估工时" />
          </el-form-item>
          <el-form-item label="刚性交付日期">
            <el-date-picker v-model="assessmentCreateForm.rigidDeliveryDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
          <el-form-item label="可复用性">
            <el-input v-model="assessmentCreateForm.reusability" placeholder="如：可复用技术建设" />
          </el-form-item>
          <el-form-item label="履约风险">
            <el-select v-model="assessmentCreateForm.deliveryRisk" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`raw-delivery-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="回款风险">
            <el-select v-model="assessmentCreateForm.paymentRisk" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`raw-payment-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="验收风险">
            <el-select v-model="assessmentCreateForm.acceptanceRisk" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`raw-acceptance-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="安全/合规风险">
            <el-select v-model="assessmentCreateForm.securityOrComplianceRisk" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`raw-compliance-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="重大故障风险">
            <el-select v-model="assessmentCreateForm.majorIncidentRisk" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`raw-incident-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="省级督办">
            <el-select v-model="assessmentCreateForm.govSupervision" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`raw-gov-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="战略客户/标杆客户">
            <el-select v-model="assessmentCreateForm.strategicCustomer" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`raw-strategic-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="核心产品线">
            <el-select v-model="assessmentCreateForm.coreProductLine" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`raw-core-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否样板">
            <el-select v-model="assessmentCreateForm.benchmarkCase" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in yesNoOptions" :key="`raw-benchmark-${item.value}`" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="特殊备注">
          <el-input v-model="assessmentCreateForm.specialRemark" type="textarea" :rows="3" placeholder="请输入会影响优先级判定的补充说明" />
        </el-form-item>
        <el-form-item label="需求备注" prop="remark">
          <el-input v-model="createForm.remark" type="textarea" :rows="2" placeholder="请输入需求备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitCreate">确定</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  pageQueryRawRequirements,
  createRawRequirement,
  splitRawRequirement,
  getRawRequirementDetail,
  getRawRequirementSupplements,
  updateRawRequirement,
} from '@/api/raw-requirement'
import { executeAction } from '@/api/workflow'
import { listDictData } from '@/api/dict'
import EditableField from '@/components/EditableField.vue'
import EditableCell from '@/components/EditableCell.vue'
import type {
  RawRequirementListVO,
  RawRequirementCreateDTO,
  RawRequirementDetailVO,
  DictDataVO,
  SupplementVO,
  PriorityAssessmentContextDTO,
  RawRequirementUnifiedStatus,
} from '@/types/requirement'
import {
  getRawRequirementStatusClass,
  getRawRequirementStatusLabel,
  normalizeRawRequirementStatus,
} from '@/types/requirement'
import { useUserStore } from '@/store/user'

// 视图模式
const viewMode = ref<'card' | 'table'>('card')
const userStore = useUserStore()
const canCreateRaw = computed(() => userStore.hasAnyPermission(['raw-pool:add']))
const canEditRaw = computed(() => userStore.hasAnyPermission(['raw-pool:edit', 'raw-pool:evaluate', 'raw-pool:approve']))
const canSplitRaw = computed(() => userStore.hasAnyPermission(['product-pool:add', 'raw-pool:approve']))
const canHandoffRaw = computed(() => userStore.hasAnyPermission(['raw-pool:evaluate', 'raw-pool:approve']))

// 字典数据
const dictStatusOptions = ref<DictDataVO[]>([])
const dictPriorityOptions = ref<DictDataVO[]>([])
const dictBusinessLineOptions = ref<DictDataVO[]>([])
const dictProductManagerOptions = ref<DictDataVO[]>([])
const dictProjectManagerOptions = ref<DictDataVO[]>([])
const dictReqDefinitionOptions = ref<DictDataVO[]>([])
const yesNoOptions = [
  { label: '是', value: '是' },
  { label: '否', value: '否' },
]

function createDefaultAssessmentContext(): PriorityAssessmentContextDTO {
  return {
    projectName: '',
    customerName: '',
    contractNo: '',
    contractAmount: '',
    deliveryRisk: '',
    paymentRisk: '',
    acceptanceRisk: '',
    securityOrComplianceRisk: '',
    majorIncidentRisk: '',
    govSupervision: '',
    strategicCustomer: '',
    coreProductLine: '',
    projectType: '',
    reusability: '',
    benchmarkCase: '',
    contractScope: '',
    rigidDeliveryDate: '',
    estimatedWorkload: '',
    businessOwner: '',
    expectedOnlineTime: '',
    specialRemark: '',
  }
}

// 查询参数
const queryForm = reactive({
  page: 1,
  size: 10,
  status: '',
  priority: '',
  source: '',
  businessLine: '',
  registerName: '',
  projectManager: '',
  productManager: '',
  isUrgent: undefined as number | undefined,
  assigneeId: undefined as number | undefined,
  keyword: '',
  startDate: '',
  endDate: '',
  sortField: '',
  sortOrder: '',
})

const dateRange = ref<string[]>([])
const showFilter = ref(false)
const loading = ref(false)
const tableData = ref<RawRequirementListVO[]>([])
const total = ref(0)

// Accordion 展开 ID 集合
const expandedIds = ref<Set<number>>(new Set())

// 新建需求
const createDialogVisible = ref(false)
const submitLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive<RawRequirementCreateDTO>({
  title: '',
  description: '',
  source: '',
  proposer: '',
  reqLink: '',
  remark: '',
  businessLine: '',
  expectedOnlineDate: undefined,
  valueAssessment: '',
})
const assessmentCreateForm = reactive<PriorityAssessmentContextDTO>(createDefaultAssessmentContext())

const validateReqLinkOrRemark = (_rule: unknown, _value: unknown, callback: (error?: Error) => void) => {
  if (createForm.reqLink?.trim() || createForm.remark?.trim()) {
    callback()
    return
  }
  callback(new Error('需求单链接和需求备注至少完善一项'))
}

const createRules: FormRules = {
  title: [{ required: true, message: '请输入需求标题', trigger: 'blur' }],
  reqLink: [{ validator: validateReqLinkOrRemark, trigger: 'blur' }],
  remark: [{ validator: validateReqLinkOrRemark, trigger: 'blur' }],
}

// 拆分对话框
const splitDialogVisible = ref(false)
const splitLoading = ref(false)
const splitTarget = ref<RawRequirementListVO | null>(null)
const splitItems = ref<Array<{ title: string; description: string; handler: string; priority: string }>>([])
const iframeLoadError = ref(false)
const normalizedSplitReqLink = computed(() => {
  const rawLink = splitTarget.value?.reqLink?.trim()
  if (!rawLink) return ''
  if (/^https?:\/\//i.test(rawLink)) return rawLink
  return `https://${rawLink}`
})
const splitSourceText = computed(() => {
  if (!splitTarget.value) return ''

  const sections: string[] = []
  const appendSection = (label: string, content?: string) => {
    const value = content?.trim()
    if (!value) return
    sections.push(`${label}：\n${value}`)
  }

  appendSection('原始需求标题', splitTarget.value.title)
  appendSection('需求单编号', splitTarget.value.reqNo)
  appendSection('需求单链接', normalizedSplitReqLink.value || splitTarget.value.reqLink)
  appendSection('需求描述', splitTarget.value.description)
  appendSection('处理备注', splitTarget.value.remark)
  appendSection('产品需求定义', splitTarget.value.productDefinition)
  appendSection('加急原因', splitTarget.value.urgentReason)

  if (splitTarget.value.supplements && splitTarget.value.supplements.length > 0) {
    const supplementText = splitTarget.value.supplements
      .map((sup, index) => `${index + 1}. ${sup.supplementTypeName || sup.supplementType}\n${sup.content}`)
      .join('\n\n')
    appendSection('追加记录', supplementText)
  }

  return sections.join('\n\n')
})

// 状态统计
const statusCount = computed(() => {
  const counts: Record<RawRequirementUnifiedStatus, number> = {
    pending_judgement: 0,
    pending_split: 0,
    in_progress: 0,
    online: 0,
    closed: 0,
    suspended: 0,
    rejected: 0,
  }
  tableData.value.forEach(row => {
    const unified = normalizeRawRequirementStatus(row.status, row.statusName)
    counts[unified]++
  })
  return {
    pendingJudgement: counts.pending_judgement,
    pendingSplit: counts.pending_split,
    inProgress: counts.in_progress,
    online: counts.online,
    closed: counts.closed,
    suspended: counts.suspended,
    rejected: counts.rejected,
  }
})

// 是否有激活的筛选条件
const hasActiveFilters = computed(() => {
  return !!(queryForm.keyword || queryForm.status || queryForm.priority || queryForm.source || queryForm.businessLine || queryForm.registerName || queryForm.projectManager || queryForm.productManager || queryForm.isUrgent !== undefined || queryForm.startDate || queryForm.endDate)
})

function getUnifiedStatus(status?: string, statusName?: string): RawRequirementUnifiedStatus {
  return normalizeRawRequirementStatus(status, statusName)
}

function getStatusLabel(status?: string, statusName?: string): string {
  return getRawRequirementStatusLabel(status, statusName)
}

function getStatusClass(status?: string, statusName?: string): string {
  return getRawRequirementStatusClass(status, statusName)
}

function getPriorityLabel(priority?: string): string {
  if (priority === 'P0') return '一级A类（P0）'
  if (priority === 'P1') return '一级B类（P1）'
  if (priority === 'P2') return '二级（P2）'
  if (priority === 'P3') return '三级（P3）'
  return priority || '-'
}

function getRequirementPreview(row: RawRequirementListVO): string {
  return row.description?.trim() || '暂无更多需求描述'
}

function formatDateTime(value?: string): string {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

function isContentReady(row: RawRequirementListVO): boolean {
  return Boolean(
    row.description?.trim() ||
    row.remark?.trim() ||
    row.productDefinition?.trim() ||
    (row.supplements && row.supplements.length > 0)
  )
}

function isExternalSubmit(row: RawRequirementListVO): boolean {
  return row.submitOrigin === 'external'
}

function getJudgeSourceLabel(row: RawRequirementListVO): string {
  return row.overrideFlag === 1 ? '人工' : 'AI'
}

function getJudgeSourceClass(row: RawRequirementListVO): string {
  return row.overrideFlag === 1 ? 'judge-manual' : 'judge-ai'
}

function needsHandoffBeforeSplit(row: RawRequirementListVO): boolean {
  return isExternalSubmit(row) && getUnifiedStatus(row.status, row.statusName) === 'pending_judgement'
}

function canShowSplitAction(row: RawRequirementListVO): boolean {
  const unifiedStatus = getUnifiedStatus(row.status, row.statusName)
  if (!canSplitRaw.value || ['online', 'closed', 'suspended', 'rejected'].includes(unifiedStatus)) return false
  if (isExternalSubmit(row)) {
    return unifiedStatus === 'pending_split'
  }
  return ['pending_split', 'in_progress'].includes(unifiedStatus)
}

function canShowHandoffAction(row: RawRequirementListVO): boolean {
  return canHandoffRaw.value && needsHandoffBeforeSplit(row)
}

// ===== Accordion 展开/收起 =====
function toggleDetail(id: number) {
  const newSet = new Set(expandedIds.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
    // 展开时加载详情数据（补充内容等）
    loadExpandedData(id)
  }
  expandedIds.value = newSet
}

async function loadExpandedData(id: number) {
  try {
    const [detailRes, supsRes] = await Promise.all([
      getRawRequirementDetail(id),
      getRawRequirementSupplements(id),
    ])
    const detail = detailRes.data as RawRequirementDetailVO
    const supplements = supsRes.data as SupplementVO[]
    // 把详情数据回写到 tableData 中对应的行
    const row = tableData.value.find(r => r.id === id)
    if (row) {
      ;(row as any).linkedProducts = (detail as any).linkedProducts || []
      ;(row as any).supplements = supplements || []
    }
  } catch {
    // error handled by interceptor - 不影响界面展示
  }
}

// ===== 内联编辑 =====
async function handleInlineSave(row: RawRequirementListVO, field: string, value: any) {
  if (!canEditRaw.value) return
  try {
    const updateData: Record<string, any> = {}
    updateData[field] = value
    await updateRawRequirement(row.id, updateData)
    ;(row as any)[field] = value
    // 同步更新关联的显示名称
    if (field === 'status') {
      ;(row as any).statusName = getStatusLabel(String(value))
    }
    if (field === 'businessLine') {
      const blOption = dictBusinessLineOptions.value.find(o => o.value === value)
      ;(row as any).businessLineName = blOption ? blOption.label : value
    }
    ElMessage.success('保存成功')
  } catch {
    // error handled by interceptor
    ElMessage.error('保存失败')
  }
}

function handleSplit(row: RawRequirementListVO) {
  if (!canSplitRaw.value) return
  splitTarget.value = row
  splitItems.value = [{ title: '', description: '', handler: '', priority: '' }]
  iframeLoadError.value = false
  splitDialogVisible.value = true
  loadSplitContext(row.id)
}

async function handleHandoff(row: RawRequirementListVO) {
  if (!canShowHandoffAction(row)) return
  try {
    await executeAction({
      reqType: 'raw',
      reqId: row.id,
      toStatus: 'pending_split',
      remark: '外部提报需求承接',
    })
    row.status = 'pending_split'
    row.statusName = '待拆分'
    ElMessage.success('承接成功')
  } catch {
    ElMessage.error('承接失败')
  }
}

function addSplitItem() {
  splitItems.value.push({ title: '', description: '', handler: '', priority: '' })
}

function removeSplitItem(idx: number) {
  splitItems.value.splice(idx, 1)
}

async function submitSplit() {
  if (!canSplitRaw.value) return
  if (!splitTarget.value) return

  // 逐项校验：标题和说明至少填一个
  for (let i = 0; i < splitItems.value.length; i++) {
    const item = splitItems.value[i]
    if (!item.title.trim() && !item.description.trim()) {
      ElMessage.warning(`第 ${i + 1} 条拆分项的标题和需求说明不能同时为空，请至少填写一个`)
      return
    }
  }

  const validItems = splitItems.value.map(item => ({
    title: item.title.trim(),
    description: item.description.trim(),
    handler: item.handler,
    priority: item.priority,
  }))

  splitLoading.value = true
  try {
    await splitRawRequirement(splitTarget.value.id, {
      rawReqId: splitTarget.value.id,
      items: validItems.map(item => ({
        title: item.title || undefined,
        description: item.description || undefined,
        handler: item.handler || undefined,
        priority: item.priority || undefined,
      })),
    })
    ElMessage.success('拆分成功')
    splitDialogVisible.value = false
    loadData()
  } catch {
    // error handled by interceptor
    ElMessage.error('拆分请求失败')
  } finally {
    splitLoading.value = false
  }
}

async function loadSplitContext(id: number) {
  try {
    const [detailRes, supsRes] = await Promise.all([
      getRawRequirementDetail(id),
      getRawRequirementSupplements(id),
    ])
    const detail = detailRes.data as RawRequirementDetailVO
    const supplements = supsRes.data as SupplementVO[]

    if (!splitTarget.value || splitTarget.value.id !== id) return

    splitTarget.value = {
      ...splitTarget.value,
      ...detail,
      supplements: supplements || [],
    }
  } catch {
    // error handled by interceptor - 摘录区尽力展示，不阻塞拆分
  }
}

async function copySplitSourceText() {
  if (!splitSourceText.value) {
    ElMessage.warning('当前没有可复制的原文内容')
    return
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(splitSourceText.value)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = splitSourceText.value
      textarea.setAttribute('readonly', 'true')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    ElMessage.success('原文已复制')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

// ===== 数据加载 =====
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

async function loadDictData() {
  try {
    const [statusRes, priorityRes, businessLineRes, pmRes, projRes, defRes] = await Promise.all([
      listDictData('req_status'),
      listDictData('priority_level'),
      listDictData('business_line'),
      listDictData('product_manager'),
      listDictData('project_manager'),
      listDictData('req_definition'),
    ])
    dictStatusOptions.value = ((statusRes as any).data || []).filter((item: DictDataVO) =>
      ['pending_judgement', 'pending_split', 'in_progress', 'online', 'closed', 'suspended', 'rejected'].includes(item.value),
    )
    dictPriorityOptions.value = (priorityRes as any).data || []
    dictBusinessLineOptions.value = (businessLineRes as any).data || []
    dictProductManagerOptions.value = (pmRes as any).data || []
    dictProjectManagerOptions.value = (projRes as any).data || []
    dictReqDefinitionOptions.value = (defRes as any).data || []
  } catch {
    // error handled by interceptor
  }
}

function handleSearch() {
  queryForm.page = 1
  loadData()
}

function handleReset() {
  Object.assign(queryForm, {
    page: 1,
    size: 10,
    status: '',
    priority: '',
    source: '',
    businessLine: '',
    registerName: '',
    projectManager: '',
    productManager: '',
    isUrgent: undefined,
    assigneeId: undefined,
    keyword: '',
    startDate: '',
    endDate: '',
    sortField: '',
    sortOrder: '',
  })
  dateRange.value = []
  loadData()
}

function handleDateChange(val: string[] | null) {
  if (val) {
    queryForm.startDate = val[0]
    queryForm.endDate = val[1]
  } else {
    queryForm.startDate = ''
    queryForm.endDate = ''
  }
}

function handleCreate() {
  const currentUserName = userStore.userInfo?.realName || userStore.userInfo?.username || ''
  Object.assign(createForm, {
    title: '',
    description: '',
    source: '',
    proposer: currentUserName,
    reqLink: '',
    remark: '',
    businessLine: '',
    expectedOnlineDate: undefined,
    valueAssessment: '',
  })
  Object.assign(assessmentCreateForm, createDefaultAssessmentContext())
  createDialogVisible.value = true
}

async function handleSubmitCreate() {
  const form = createFormRef.value
  if (!form) return
  try {
    await form.validate()
  } catch {
    ElMessage.warning('请完善表单必填项')
    return
  }
  submitLoading.value = true
  try {
    const payload: RawRequirementCreateDTO = {
      ...createForm,
      submitOrigin: 'internal',
      title: createForm.title.trim(),
      description: createForm.description?.trim() || undefined,
      businessLine: createForm.businessLine?.trim() || undefined,
      proposer: createForm.proposer?.trim() || undefined,
      reqLink: createForm.reqLink?.trim() || undefined,
      remark: createForm.remark?.trim() || undefined,
      expectedOnlineDate: createForm.expectedOnlineDate || undefined,
      valueAssessment: createForm.valueAssessment?.trim() || undefined,
      assessmentContext: {
        ...assessmentCreateForm,
        projectName: assessmentCreateForm.projectName?.trim() || undefined,
        customerName: assessmentCreateForm.customerName?.trim() || undefined,
        contractNo: assessmentCreateForm.contractNo?.trim() || undefined,
        contractAmount: assessmentCreateForm.contractAmount?.trim() || undefined,
        deliveryRisk: assessmentCreateForm.deliveryRisk || undefined,
        paymentRisk: assessmentCreateForm.paymentRisk || undefined,
        acceptanceRisk: assessmentCreateForm.acceptanceRisk || undefined,
        securityOrComplianceRisk: assessmentCreateForm.securityOrComplianceRisk || undefined,
        majorIncidentRisk: assessmentCreateForm.majorIncidentRisk || undefined,
        govSupervision: assessmentCreateForm.govSupervision || undefined,
        strategicCustomer: assessmentCreateForm.strategicCustomer || undefined,
        coreProductLine: assessmentCreateForm.coreProductLine || undefined,
        projectType: assessmentCreateForm.projectType?.trim() || undefined,
        reusability: assessmentCreateForm.reusability?.trim() || undefined,
        benchmarkCase: assessmentCreateForm.benchmarkCase || undefined,
        contractScope: assessmentCreateForm.contractScope?.trim() || undefined,
        rigidDeliveryDate: assessmentCreateForm.rigidDeliveryDate || undefined,
        estimatedWorkload: assessmentCreateForm.estimatedWorkload?.trim() || undefined,
        businessOwner: assessmentCreateForm.businessOwner?.trim() || undefined,
        expectedOnlineTime: createForm.expectedOnlineDate || undefined,
        specialRemark: assessmentCreateForm.specialRemark?.trim() || undefined,
      },
    }
    await createRawRequirement(payload)
    ElMessage.success('创建成功')
    createDialogVisible.value = false
    loadData()
  } catch {
    // error handled by interceptor
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadData()
  loadDictData()
})
</script>

<style lang="scss" scoped>
.raw-pool-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.toolbar-header {
  height: 64px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.page-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.filter-bar {
  padding: 12px 24px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.mode-switch {
  display: flex;
  gap: 4px;
  background: var(--bg);
  padding: 4px;
  border-radius: var(--radius-sm);
}

.mode-btn {
  padding: 6px 14px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);

  &.active {
    background: var(--surface);
    color: var(--text-primary);
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }
}

.filter-panel {
  padding: 16px 24px;
  background: var(--surface);
  flex-shrink: 0;
}

.pool-scroll {
  flex: 1;
  overflow: auto;
  padding: 0 24px 24px;
}

// ===== 紧凑卡片模式 =====
.compact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
}

.compact-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: var(--transition);

  &:hover {
    box-shadow: var(--shadow-hover);
  }
}

.compact-main {
  display: grid;
  grid-template-columns: minmax(320px, 1.45fr) minmax(0, 2.25fr) auto;
  gap: 20px;
  align-items: start;
  padding: 16px 18px;
}

.compact-lead {
  min-width: 0;
  display: grid;
  gap: 8px;
  padding-right: 4px;
}

.title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;

  :deep(.editable-field) {
    font-weight: 700;
    font-size: 15px;
  }
}

.desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
}

.field-group {
  display: grid;
  grid-template-columns: repeat(5, minmax(112px, 1fr)) minmax(140px, 1.1fr);
  gap: 18px;
  align-items: start;
}

.field-slot {
  display: grid;
  gap: 8px;
  align-content: start;
  min-width: 0;
}

.field-slot-stack {
  min-width: 100px;
}

.field-slot-link {
  min-width: 132px;
}

.field-slot-minor {
  min-width: 160px;
}

.field-slot-emphasis {
  padding-left: 2px;
}

.field-k {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.1;
}

.field-v {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;

  :deep(.editable-field),
  :deep(.editable-cell) {
    max-width: 100%;
  }
}

.field-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.priority-pill,
.judge-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  width: fit-content;
}

.priority-pill {
  background: rgba(201, 122, 21, 0.12);
  color: #b56912;
}

.judge-pill {
  background: rgba(22, 104, 220, 0.1);
  color: var(--primary);
}

.judge-pill.judge-manual {
  background: rgba(47, 143, 99, 0.12);
  color: #1f8f5f;
}

.judge-pill.judge-ai {
  background: rgba(22, 104, 220, 0.1);
  color: var(--primary);
}

.editable-placeholder {
  cursor: pointer;
  border-bottom: 1px dashed transparent;
  transition: border-color 0.2s;

  &:hover {
    border-bottom-color: var(--primary);
    color: var(--primary);
  }
}

.status-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.status-pending { background: rgba(0, 113, 227, 0.10); color: var(--primary); }
.status-split { background: rgba(255, 149, 0, 0.10); color: #b75c00; }
.status-progress { background: rgba(52, 199, 89, 0.10); color: #248a3d; }
.status-online { background: rgba(88, 86, 214, 0.12); color: #4f46b5; }
.status-closed { background: rgba(120, 120, 128, 0.12); color: #5c5c61; }
.status-suspended { background: rgba(255, 159, 10, 0.12); color: #b56a00; }
.status-rejected { background: rgba(255, 59, 48, 0.10); color: #c23030; }

.link-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(22, 104, 220, 0.08);
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    background: rgba(22, 104, 220, 0.15);
  }
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  white-space: nowrap;
}

// ===== 操作按钮样式 =====
.btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.btn-primary {
  background: var(--primary);
  color: #fff;

  &:hover {
    opacity: 0.9;
  }
}

.btn-success {
  background: rgba(52, 199, 89, 0.10);
  color: #248a3d;

  &:hover {
    background: rgba(52, 199, 89, 0.18);
  }
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
}

.btn-clear {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  border-color: var(--border);

  .clear-icon {
    font-size: 14px;
    font-weight: 700;
  }

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
}

// ===== Accordion 详情展开区域 =====
.detail {
  display: none;
  padding: 0 18px 18px;
  border-top: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.015);
}

.detail.open {
  display: block;
}

.detail-grid {
  padding-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px 18px;
}

.detail-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
}

.detail-card.full {
  grid-column: 1 / -1;
}

.detail-card.span-2 {
  grid-column: span 2;
}

.detail-title {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.detail-value {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-primary);
}

// ===== 下钻产品需求列表 =====
.linked-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.linked-item {
  background: var(--bg);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

// ===== 补充内容区域 =====
.sup-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.sup-type {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary);
  font-size: 11px;
  font-weight: 600;
  margin-right: 8px;
}

.sup-content {
  font-size: 13px;
  color: var(--text-primary);
}

// ===== 拆分对话框 =====
:deep(.split-dialog) {
  .el-dialog {
    max-width: 1200px;
  }
  .el-dialog__body {
    max-height: 80vh;
    overflow: hidden;
  }
}

.split-dialog-body {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.9fr);
  gap: 20px;
  min-height: 70vh;
  max-height: 80vh;
}

.split-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  max-height: calc(80vh - 40px);
}

.split-origin {
  background: var(--bg, #f5f5f7);
  border-radius: 8px;
  padding: 14px 16px;
}

.split-origin-label {
  font-size: 12px;
  color: var(--text-secondary, #86868b);
  margin-bottom: 4px;
}

.split-origin-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #1d1d1f);
}

.split-origin-no {
  font-size: 12px;
  color: var(--text-secondary, #86868b);
  margin-top: 2px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.split-link-panel {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.split-link-label {
  font-size: 12px;
  color: var(--text-secondary, #86868b);
  margin-bottom: 4px;
}

.split-link {
  color: var(--primary, #0071e3);
  word-break: break-all;
  text-decoration: none;
}

.split-link:hover {
  text-decoration: underline;
}

.split-link-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-secondary, #86868b);
}

.split-items-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.split-extract-panel {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface, #ffffff);
  overflow: hidden;
}

.split-extract-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: rgba(52, 199, 89, 0.04);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.split-extract-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #1d1d1f);
}

.split-extract-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary, #86868b);
}

.split-copy-btn {
  flex-shrink: 0;
}

.split-extract-body {
  max-height: 280px;
  overflow: auto;
  padding: 14px 16px;
}

.split-extract-block + .split-extract-block {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.split-extract-label,
.split-supplement-type {
  font-size: 12px;
  color: var(--text-secondary, #86868b);
  margin-bottom: 6px;
}

.split-extract-content {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-primary, #1d1d1f);
}

.split-supplement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.split-supplement-item {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--bg, #f5f5f7);
}

.split-extract-empty {
  font-size: 13px;
  color: var(--text-secondary, #86868b);
  line-height: 1.6;
}

.split-item-card {
  background: var(--bg, #f5f5f7);
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 12px;
}

.split-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #1d1d1f);
}

.btn-remove {
  background: none;
  border: none;
  color: var(--danger, #ff3b30);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 8px;

  &:hover {
    text-decoration: underline;
  }
}

// ===== 表格模式 =====
.table-wrap {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  margin-top: 16px;
}

.table-actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
}

.origin-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary, #0071e3);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
}

.table-origin-chip {
  margin-left: 8px;
  margin-top: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  flex-shrink: 0;
}

// ===== 状态统计卡片 =====
.summary {
  padding: 14px 24px 0;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  min-width: 180px;
}

.summary-k {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.summary-v {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

// ===== 自定义表格 =====
.custom-table-scroll {
  overflow-x: auto;
}

.data-table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  text-align: left;
  padding: 10px 14px;
  background: var(--bg);
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 12px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 2;
}

.data-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
  white-space: nowrap;
}

.data-table td.col-remark {
  max-width: 280px;

  :deep(.editable-cell) {
    max-width: 100%;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }
}

.data-table tr:hover td {
  background: rgba(0, 113, 227, 0.02);
}

.info-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.info-ok {
  background: rgba(52, 199, 89, 0.10);
  color: #248a3d;
}

.info-missing {
  background: rgba(255, 149, 0, 0.12);
  color: #9a6200;
}

// ===== 拆分对话框表单 =====
.split-item-form {
  margin-top: 10px;
}

.split-item-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.split-item-form .field-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.split-item-form .required {
  color: var(--danger);
}

.split-preview-panel {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface, #ffffff);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.split-preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: rgba(0, 113, 227, 0.03);
}

.split-preview-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #1d1d1f);
}

.split-preview-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary, #86868b);
}

.split-preview-open {
  flex-shrink: 0;
  color: var(--primary, #0071e3);
  text-decoration: none;
  font-size: 12px;
}

.split-preview-open:hover {
  text-decoration: underline;
}

.split-preview-frame-wrap {
  flex: 1;
  min-height: 480px;
  background: #fff;
}

.split-preview-frame {
  width: 100%;
  height: 100%;
  min-height: 480px;
  border: 0;
  border-radius: 8px;
  background: #fff;
}

.split-preview-error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 24px;
  min-height: 480px;
}

.split-preview-error-text {
  font-size: 14px;
  color: var(--text-secondary, #86868b);
  text-align: center;
  line-height: 1.6;
}

.split-preview-error-btn {
  text-decoration: none;
  font-size: 13px;
}

.split-preview-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: var(--text-secondary, #86868b);
  font-size: 13px;
  text-align: center;
}

.split-preview-tip {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-secondary, #86868b);
  background: var(--bg, #f5f5f7);
}

@media (max-width: 1100px) {
  .split-dialog-body {
    grid-template-columns: 1fr;
  }

  .compact-main {
    grid-template-columns: 1fr;
  }

  .field-group {
    grid-template-columns: repeat(3, minmax(120px, 1fr));
  }

  .actions {
    justify-content: flex-start;
  }

  .detail-grid {
    grid-template-columns: 1fr 1fr;
  }

  .detail-card.span-2 {
    grid-column: 1 / -1;
  }
}

@media (max-width: 760px) {
  .field-group {
    grid-template-columns: 1fr 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
