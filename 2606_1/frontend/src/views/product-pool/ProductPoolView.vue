<template>
  <div class="product-pool-view">
    <!-- 顶部工具栏 -->
    <div class="toolbar-header">
      <div class="toolbar-left">
        <div>
          <div class="page-title">产品需求池</div>
          <div class="page-subtitle">折叠模式服务过滤与分发，展开模式保留完整字段总览</div>
        </div>
        <div class="view-switch">
          <button
            class="view-btn"
            :class="{ active: grouping === 'grouped' }"
            @click="switchGrouping('grouped')"
          >按原始需求分组</button>
          <button
            class="view-btn"
            :class="{ active: grouping === 'flat' }"
            @click="switchGrouping('flat')"
          >打散展示</button>
        </div>
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
      </div>
      <div class="toolbar-right">
        <input
          v-model="queryForm.keyword"
          class="search-box"
          placeholder="搜索产品需求..."
          @keyup.enter="handleSearch"
        />
        <button v-if="canCreateProduct" class="btn btn-primary" @click="handleCreate">+ 新建产品需求</button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-chip active">产品需求池</div>
      <el-select v-model="queryForm.status" placeholder="当前状态" clearable class="filter-select" @change="handleSearch">
        <el-option
          v-for="item in dictStatusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-select v-model="queryForm.priority" placeholder="优先级" clearable class="filter-select" @change="handleSearch">
        <el-option v-for="item in dictPriorityOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="queryForm.businessLineId" placeholder="业务线" clearable class="filter-select" @change="handleSearch">
        <el-option v-for="item in dictBusinessLineOptions" :key="item.id" :label="item.label" :value="item.id" />
      </el-select>
      <el-select v-model="queryForm.reqType" placeholder="需求类型" clearable class="filter-select" @change="handleSearch">
        <el-option v-for="item in dictReqTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="queryForm.sprintId" placeholder="迭代版本" clearable class="filter-select" @change="handleSearch">
        <el-option v-for="item in dictSprintOptions" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-model="queryForm.handler" placeholder="处理人" clearable class="filter-select" @change="handleSearch">
        <el-option v-for="item in dictHandlerOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <button class="btn btn-ghost" style="padding:6px 12px;" @click="clearFilters">清除筛选</button>
      <button
        class="btn btn-ghost"
        style="padding:6px 12px;"
        :class="{ active: queryForm.unscheduled }"
        @click="toggleUnscheduled"
      >只看未排期</button>
    </div>

    <!-- 风险提醒条 -->
    <div v-if="riskCount > 0" class="risk-banner">
      <span>当前有 {{ riskCount }} 条产品需求已通过过滤但未进入迭代，建议优先处理排期或挂起决策。</span>
      <button class="btn btn-primary" style="padding:6px 12px;" @click="filterUnscheduled">查看未排期需求</button>
    </div>

    <!-- 内容区域 -->
    <div class="content-scroll">
      <!-- 折叠卡片模式 -->
      <div v-if="viewMode === 'card'" v-loading="loading">
        <!-- 分组视图 -->
        <template v-if="grouping === 'grouped'">
          <div v-for="(items, groupName) in groupedData" :key="groupName" class="section grouped-section">
            <div class="section-header">
              <span class="section-dot" :style="{ background: getGroupColor(groupName) }"></span>
              <span class="section-title">{{ groupName }}</span>
              <span class="section-count">{{ items.length }}</span>
            </div>
            <div class="group-table">
              <div class="group-summary">
                <span class="group-summary-label">原始需求</span>
                <a
                  v-if="items[0]?.rawReqId && items[0]?.isDirect !== 1"
                  class="link-pill"
                  href="javascript:void(0)"
                  @click.stop="openRawPreview(items[0].rawReqId)"
                >{{ groupName }}</a>
                <span v-else class="group-summary-value">{{ groupName }}</span>
              </div>
              <div class="group-table-head">
                <span>编号 / 类型</span>
                <span>标题与描述</span>
                <span>状态</span>
                <span>优先级</span>
                <span>处理人</span>
                <span>迭代</span>
                <span>PRD</span>
                <span>操作</span>
              </div>
              <div class="group-table-body">
                <div v-for="item in items" :key="item.id" class="group-row" :class="{ 'is-voided': isVoided(item.status) }">
                  <div class="group-cell group-cell-code">
                    <span class="code-pill">{{ item.reqNo }}</span>
                    <span v-if="item.reqType" class="tag type-tag">{{ item.reqType }}</span>
                    <span v-if="item.isDirect === 1" class="tag status-dispatch">直接创建</span>
                  </div>
                  <div class="group-cell group-cell-main">
                    <div class="group-row-title" :class="{ 'is-voided-title': isVoided(item.status) }">{{ item.title }}</div>
                    <div class="group-row-desc">{{ getDescriptionPreview(item.description, item.isDirect, item.rawReqTitle) }}</div>
                  </div>
                  <div class="group-cell">
                    <span class="status-tag" :class="getStatusClass(item.status)">{{ item.statusName || PRODUCT_STATUS_MAP[item.status] || item.status }}</span>
                  </div>
                  <div class="group-cell">
                    <span class="tag" :class="'priority-' + (item.priority || 'p2').toLowerCase()">{{ PRIORITY_MAP[item.priority] || item.priority }}</span>
                  </div>
                  <div class="group-cell">
                    <span class="fact-value">{{ item.handler || item.assigneeName || '-' }}</span>
                  </div>
                  <div class="group-cell">
                    <span class="fact-value">{{ item.sprintName || '-' }}</span>
                  </div>
                  <div class="group-cell">
                    <a v-if="item.prdUrl" class="link-pill" :href="item.prdUrl" target="_blank" @click.stop>查看 PRD</a>
                    <span v-else class="fact-value">待补充</span>
                  </div>
                  <div class="group-cell group-cell-actions">
                    <button class="btn btn-ghost btn-compact" @click.stop="toggleDetail(item.id)">{{ expandedDetailIds.has(item.id) ? '收起' : '详情' }}</button>
                    <el-dropdown trigger="click" @command="(command) => handleMoreAction(command, item)">
                      <button class="btn btn-ghost btn-compact" @click.stop>更多</button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item v-if="canEditProduct" command="edit">编辑</el-dropdown-item>
                          <el-dropdown-item v-if="canCreateProduct && item.rawReqId" command="split">继续拆分</el-dropdown-item>
                          <el-dropdown-item v-if="canEditProduct && !isVoided(item.status)" command="void">作废</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                  <div v-show="expandedDetailIds.has(item.id)" class="group-detail">
                    <div class="detail-grid">
                      <div class="detail-card">
                        <div class="detail-title">产品需求编号</div>
                        <div class="detail-value">{{ item.reqNo }}</div>
                      </div>
                      <div class="detail-card">
                        <div class="detail-title">需求类型</div>
                        <div class="detail-value">
                          <InlineEditSelect
                            :value="item.reqType"
                            :options="dictReqTypeOptions"
                            placeholder="选择需求类型"
                            @save="(v: string) => handleInlineSave(item.id, 'reqType', v)"
                          />
                        </div>
                      </div>
                      <div class="detail-card">
                        <div class="detail-title">功能模块</div>
                        <div class="detail-value">
                          <InlineEditText
                            :value="item.productModule"
                            placeholder="待补充"
                            @save="(v: string) => handleInlineSave(item.id, 'productModule', v)"
                          />
                        </div>
                      </div>
                      <div class="detail-card">
                        <div class="detail-title">优先级</div>
                        <div class="detail-value">
                          <InlineEditSelect
                            :value="item.priority"
                            :options="dictPriorityOptions"
                            placeholder="选择优先级"
                            @save="(v: string) => handleInlineSave(item.id, 'priority', v)"
                          />
                        </div>
                      </div>
                      <div class="detail-card">
                        <div class="detail-title">业务线</div>
                        <div class="detail-value">
                          <InlineEditSelect
                            :value="String(item.businessLineId || '')"
                            :options="dictBusinessLineOptions"
                            placeholder="选择业务线"
                            @save="(v: string) => handleInlineSave(item.id, 'businessLineId', Number(v))"
                          />
                        </div>
                      </div>
                      <div class="detail-card">
                        <div class="detail-title">创建人</div>
                        <div class="detail-value">{{ item.creator || item.createByName || '-' }}</div>
                      </div>
                      <div class="detail-card">
                        <div class="detail-title">处理人</div>
                        <div class="detail-value">
                          <InlineEditText
                            :value="item.handler"
                            placeholder="待补充"
                            @save="(v: string) => handleInlineSave(item.id, 'handler', v)"
                          />
                        </div>
                      </div>
                      <div class="detail-card">
                        <div class="detail-title">迭代版本</div>
                        <div class="detail-value">
                          <InlineEditSelect
                            :value="String(item.sprintId || '')"
                            :options="dictSprintOptions.map(s => ({ label: s.name, value: String(s.id) }))"
                            placeholder="未关联"
                            @save="(v: string) => handleInlineSave(item.id, 'sprintId', v ? Number(v) : null)"
                          />
                        </div>
                      </div>
                      <div class="detail-card">
                        <div class="detail-title">PRD 地址</div>
                        <div class="detail-value">
                          <InlineEditText
                            :value="item.prdUrl"
                            placeholder="待补充"
                            @save="(v: string) => handleInlineSave(item.id, 'prdUrl', v)"
                          />
                        </div>
                      </div>
                      <div class="detail-card full">
                        <div class="detail-title">需求描述</div>
                        <div class="detail-value">
                          <div class="rich-text-content" v-html="renderRichText(item.description)"></div>
                          <div class="detail-actions">
                            <button class="btn btn-ghost" @click.stop="openDescriptionEditor(item.id, item.description)">编辑描述</button>
                          </div>
                        </div>
                      </div>
                      <div class="detail-card full">
                        <div class="detail-title">原始需求来源</div>
                        <div class="detail-value">
                          {{ item.isDirect === 1 ? '直接创建，无父原始需求' : item.rawReqTitle || '' }}
                        </div>
                      </div>
                      <div class="detail-card full">
                        <div class="detail-title">状态说明</div>
                        <div class="detail-value">{{ getStatusDescription(item.status) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-if="Object.keys(groupedData).length === 0 && !loading" description="暂无数据" />
        </template>

        <!-- 打散视图 -->
        <template v-else>
          <div class="section">
            <div class="section-header">
              <span class="section-dot" style="background: var(--primary)"></span>
              <span class="section-title">全部产品需求</span>
              <span class="section-count">{{ tableData.length }}</span>
            </div>
            <div class="prd-list">
              <div v-for="item in tableData" :key="item.id" class="prd-item" :class="{ 'is-voided-card': isVoided(item.status) }">
                <div class="prd-main">
                  <div class="prd-head">
                    <div class="prd-summary">
                      <div class="prd-meta">
                        <span class="code-pill">{{ item.reqNo }}</span>
                        <span v-if="item.reqType" class="tag type-tag">{{ item.reqType }}</span>
                        <span v-if="item.isDirect === 1" class="tag status-dispatch">直接创建</span>
                      </div>
                      <div class="prd-title" :class="{ 'is-voided-title': isVoided(item.status) }">{{ item.title }}</div>
                      <div class="prd-desc">{{ getDescriptionPreview(item.description, item.isDirect, item.rawReqTitle) }}</div>
                    </div>
                    <div class="actions actions-inline">
                      <button class="btn btn-ghost btn-compact" @click.stop="toggleDetail(item.id)">{{ expandedDetailIds.has(item.id) ? '收起详情' : '查看详情' }}</button>
                      <el-dropdown trigger="click" @command="(command) => handleMoreAction(command, item)">
                        <button class="btn btn-ghost btn-compact" @click.stop>更多</button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item v-if="canEditProduct" command="edit">编辑</el-dropdown-item>
                            <el-dropdown-item v-if="canCreateProduct && item.rawReqId" command="split">继续拆分</el-dropdown-item>
                            <el-dropdown-item v-if="canEditProduct && !isVoided(item.status)" command="void">作废</el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                  <div class="prd-facts">
                    <div class="fact-item">
                      <span class="fact-label">状态</span>
                      <span class="status-tag" :class="getStatusClass(item.status)">{{ item.statusName || PRODUCT_STATUS_MAP[item.status] || item.status }}</span>
                    </div>
                    <div class="fact-item">
                      <span class="fact-label">业务线</span>
                      <span class="fact-value">{{ item.businessLineName || '-' }}</span>
                    </div>
                    <div class="fact-item">
                      <span class="fact-label">优先级</span>
                      <span class="tag" :class="'priority-' + (item.priority || 'p2').toLowerCase()">{{ PRIORITY_MAP[item.priority] || item.priority }}</span>
                    </div>
                    <div class="fact-item">
                      <span class="fact-label">处理人</span>
                      <span class="fact-value">{{ item.handler || item.assigneeName || '-' }}</span>
                    </div>
                    <div class="fact-item">
                      <span class="fact-label">PRD</span>
                      <a v-if="item.prdUrl" class="link-pill" :href="item.prdUrl" target="_blank" @click.stop>查看 PRD</a>
                      <span v-else class="fact-value">待补充</span>
                    </div>
                    <div class="fact-item">
                      <span class="fact-label">原始需求</span>
                      <span v-if="item.isDirect === 1 || !item.rawReqId" class="fact-value">无</span>
                      <a v-else class="link-pill" href="javascript:void(0)" @click.stop="openRawPreview(item.rawReqId)">{{ item.rawReqTitle || '查看' }}</a>
                    </div>
                  </div>
                </div>

                <!-- Accordion 详情展开区 -->
                <div v-show="expandedDetailIds.has(item.id)" class="detail">
                  <div class="detail-grid">
                    <div class="detail-card">
                      <div class="detail-title">产品需求编号</div>
                      <div class="detail-value">{{ item.reqNo }}</div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-title">需求类型</div>
                      <div class="detail-value">
                        <InlineEditSelect
                          :value="item.reqType"
                          :options="dictReqTypeOptions"
                          placeholder="选择需求类型"
                          @save="(v: string) => handleInlineSave(item.id, 'reqType', v)"
                        />
                      </div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-title">功能模块</div>
                      <div class="detail-value">
                        <InlineEditText
                          :value="item.productModule"
                          placeholder="待补充"
                          @save="(v: string) => handleInlineSave(item.id, 'productModule', v)"
                        />
                      </div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-title">优先级</div>
                      <div class="detail-value">
                        <InlineEditSelect
                          :value="item.priority"
                          :options="dictPriorityOptions"
                          placeholder="选择优先级"
                          @save="(v: string) => handleInlineSave(item.id, 'priority', v)"
                        />
                      </div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-title">业务线</div>
                      <div class="detail-value">
                        <InlineEditSelect
                          :value="String(item.businessLineId || '')"
                          :options="dictBusinessLineOptions"
                          placeholder="选择业务线"
                          @save="(v: string) => handleInlineSave(item.id, 'businessLineId', Number(v))"
                        />
                      </div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-title">创建人</div>
                      <div class="detail-value">{{ item.creator || item.createByName || '-' }}</div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-title">处理人</div>
                      <div class="detail-value">
                        <InlineEditText
                          :value="item.handler"
                          placeholder="待补充"
                          @save="(v: string) => handleInlineSave(item.id, 'handler', v)"
                        />
                      </div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-title">迭代版本</div>
                      <div class="detail-value">
                        <InlineEditSelect
                          :value="String(item.sprintId || '')"
                          :options="dictSprintOptions.map(s => ({ label: s.name, value: String(s.id) }))"
                          placeholder="未关联"
                          @save="(v: string) => handleInlineSave(item.id, 'sprintId', v ? Number(v) : null)"
                        />
                      </div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-title">PRD 地址</div>
                      <div class="detail-value">
                        <InlineEditText
                          :value="item.prdUrl"
                          placeholder="待补充"
                          @save="(v: string) => handleInlineSave(item.id, 'prdUrl', v)"
                        />
                      </div>
                    </div>
                    <div class="detail-card full">
                      <div class="detail-title">需求描述</div>
                      <div class="detail-value">
                        <div class="rich-text-content" v-html="renderRichText(item.description)"></div>
                        <div class="detail-actions">
                          <button class="btn btn-ghost" @click.stop="openDescriptionEditor(item.id, item.description)">编辑描述</button>
                        </div>
                      </div>
                    </div>
                    <div class="detail-card full">
                      <div class="detail-title">原始需求来源</div>
                      <div class="detail-value">
                        {{ item.isDirect === 1 ? '直接创建，无父原始需求' : item.rawReqTitle || '' }}
                      </div>
                    </div>
                    <div class="detail-card full">
                      <div class="detail-title">状态说明</div>
                      <div class="detail-value">{{ getStatusDescription(item.status) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-if="tableData.length === 0 && !loading" description="暂无数据" />
        </template>
      </div>

      <!-- 展开表格模式 -->
      <div v-else>
        <div class="table-wrap">
          <el-table
            v-loading="loading"
            :data="tableData"
            style="width: 100%"
          >
            <el-table-column prop="reqNo" label="产品需求编号" width="170" sortable />
            <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="priority" label="优先级" width="90" sortable>
              <template #default="{ row }">
                <span class="tag" :class="'priority-' + (row.priority || 'p2').toLowerCase()">{{ PRIORITY_MAP[row.priority] || row.priority }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="businessLineName" label="业务线" width="110" />
            <el-table-column label="原始需求" width="160">
              <template #default="{ row }">
                <span v-if="row.isDirect === 1 || !row.rawReqId">—</span>
                <a v-else class="link-pill" href="javascript:void(0)" @click="openRawPreview(row.rawReqId)">{{ row.rawReqTitle || row.rawReqId }}</a>
              </template>
            </el-table-column>
            <el-table-column prop="reqType" label="需求类型" width="110">
              <template #default="{ row }">
                <span v-if="row.reqType" class="tag type-tag">{{ row.reqType }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="prdUrl" label="PRD地址" width="140">
              <template #default="{ row }">
                <a v-if="row.prdUrl" class="link-pill" :href="row.prdUrl" target="_blank">查看 PRD</a>
                <span v-else>待补充</span>
              </template>
            </el-table-column>
            <el-table-column prop="sprintName" label="迭代版本" width="120" />
            <el-table-column prop="creator" label="创建人" width="100" />
            <el-table-column prop="handler" label="处理人" width="100" />
            <el-table-column prop="status" label="当前状态" width="130">
              <template #default="{ row }">
                <span class="status-tag" :class="getStatusClass(row.status)">{{ row.statusName || PRODUCT_STATUS_MAP[row.status] || row.status }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click.stop="toggleDetail(row.id)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
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
    </div>

    <!-- 原始需求预览抽屉 -->
    <el-drawer v-model="rawDrawerVisible" title="原始需求预览" size="640px" destroy-on-close>
      <div v-if="rawDrawerData" class="raw-drawer-body">
        <div class="drawer-id">{{ rawDrawerData.reqNo }}</div>
        <div class="drawer-title">{{ rawDrawerData.title }}</div>
        <div class="drawer-grid">
          <div class="detail-card">
            <div class="detail-title">当前状态</div>
            <div class="detail-value">{{ rawDrawerData.statusName || rawDrawerData.status }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-title">优先级</div>
            <div class="detail-value">{{ rawDrawerData.priority }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-title">业务线</div>
            <div class="detail-value">{{ rawDrawerData.businessLineName || rawDrawerData.businessLine || '-' }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-title">期望上线</div>
            <div class="detail-value">{{ rawDrawerData.expectedOnlineDate ? rawDrawerData.expectedOnlineDate.substring(0, 10) : '-' }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-title">产品经理</div>
            <div class="detail-value">{{ rawDrawerData.productManager || '-' }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-title">项目经理</div>
            <div class="detail-value">{{ rawDrawerData.projectManager || '-' }}</div>
          </div>
        </div>
        <div class="detail-card" style="margin-top:12px;">
          <div class="detail-title">需求单链接</div>
          <div class="detail-value">
            <a
              v-if="rawDrawerData.reqLink"
              :href="rawDrawerData.reqLink"
              target="_blank"
              rel="noopener noreferrer"
              class="link-pill"
            >
              {{ rawDrawerData.reqLink }}
            </a>
            <span v-else>-</span>
          </div>
        </div>
        <div class="detail-card" style="margin-top:12px;">
          <div class="detail-title">需求备注</div>
          <div class="detail-value">{{ rawDrawerData.remark || '-' }}</div>
        </div>
        <div class="detail-card" style="margin-top:12px;">
          <div class="detail-title">产品需求定义</div>
          <div class="detail-value">{{ rawDrawerData.productDefinition || '-' }}</div>
        </div>
      </div>
      <template #footer>
        <div style="display:flex;justify-content:space-between;">
          <router-link to="/raw-pool" class="btn btn-ghost" style="text-decoration:none;" @click="rawDrawerVisible = false">↗ 在原始需求池中打开</router-link>
          <button class="btn btn-primary" @click="rawDrawerVisible = false">关闭</button>
        </div>
      </template>
    </el-drawer>

    <!-- 新建产品需求弹层 -->
    <el-dialog v-model="createDialogVisible" :title="editingProductId ? '编辑产品需求' : '新建产品需求'" width="640px" destroy-on-close>
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="需求标题" prop="title">
          <el-input v-model="createForm.title" placeholder="输入产品需求标题" />
        </el-form-item>
        <el-form-item label="需求描述" prop="description">
          <RichTextEditor
            v-model="createForm.description"
            placeholder="补充需求背景、目标和范围，便于后续过滤与分发。支持插入图片、粘贴截图和基础格式化。"
          />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="createForm.priority" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in dictPriorityOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="业务线" prop="businessLineId">
            <el-select v-model="createForm.businessLineId" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in dictBusinessLineOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="需求类型" prop="reqType">
            <el-select v-model="createForm.reqType" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in dictReqTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="功能模块" prop="productModule">
            <el-input v-model="createForm.productModule" placeholder="如：支付中心 / 消息通知 / 供应商管理" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="迭代版本" prop="sprintId">
            <el-select v-model="createForm.sprintId" placeholder="暂不关联" clearable style="width: 100%">
              <el-option v-for="item in dictSprintOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="PRD 地址" prop="prdUrl">
            <el-input v-model="createForm.prdUrl" placeholder="输入 PRD 文档链接" />
          </el-form-item>
        </div>
        <el-form-item label="处理人" prop="handler">
          <el-select v-model="createForm.handler" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in dictHandlerOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitCreate">{{ editingProductId ? '保存' : '创建' }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="descriptionDialogVisible" title="编辑需求描述" width="760px" destroy-on-close>
      <RichTextEditor
        v-model="descriptionDraft"
        placeholder="支持插入图片、粘贴截图和基础格式化。"
      />
      <template #footer>
        <el-button @click="descriptionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDescriptionEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  pageQueryProductRequirements,
  createProductRequirement,
  updateProductRequirement,
  voidProductRequirement,
} from '@/api/product-requirement'
import { getRawRequirementDetail } from '@/api/raw-requirement'
import { listDictData } from '@/api/dict'
import { listSprintOptions } from '@/api/sprint'
import InlineEditText from '@/components/InlineEditText.vue'
import InlineEditSelect from '@/components/InlineEditSelect.vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import type { ProductRequirementListVO, ProductRequirementCreateDTO, ProductRequirementUpdateDTO, DictDataVO, RawRequirementDetailVO } from '@/types/requirement'
import { PRODUCT_STATUS_MAP, PRIORITY_MAP } from '@/types/requirement'
import { richTextToPlainText, sanitizeRichText } from '@/utils/rich-text'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const viewMode = ref<'card' | 'table'>('card')
const grouping = ref<'grouped' | 'flat'>('grouped')
const queryForm = reactive({
  page: 1,
  size: 10,
  status: '',
  priority: '',
  businessLineId: undefined as number | undefined,
  assigneeId: undefined as number | undefined,
  sprintId: undefined as number | undefined,
  keyword: '',
  reqType: '',
  handler: '',
  unscheduled: undefined as boolean | undefined,
})

const loading = ref(false)
const tableData = ref<ProductRequirementListVO[]>([])
const total = ref(0)
const expandedDetailIds = ref<Set<number>>(new Set())

const groupedData = computed<Record<string, ProductRequirementListVO[]>>(() => {
  if (grouping.value !== 'grouped') return {}

  const result: Record<string, ProductRequirementListVO[]> = {}
  const directKey = '直接创建需求'

  tableData.value.forEach((item) => {
    const key = item.isDirect === 1 || !item.rawReqId
      ? directKey
      : (item.rawReqTitle || `原始需求-${item.rawReqId}`)

    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
  })

  return result
})

// 字典
const dictPriorityOptions = ref<DictDataVO[]>([])
const dictStatusOptions = ref<DictDataVO[]>([])
const dictBusinessLineOptions = ref<DictDataVO[]>([])
const dictReqTypeOptions = ref<DictDataVO[]>([])
const dictSprintOptions = ref<{ id: number; name: string }[]>([])
const dictHandlerOptions = ref<DictDataVO[]>([])

const riskCount = ref(0)

// 原始需求抽屉
const rawDrawerVisible = ref(false)
const rawDrawerData = ref<RawRequirementDetailVO | null>(null)

// 新建
const createDialogVisible = ref(false)
const submitLoading = ref(false)
const createFormRef = ref<FormInstance>()
const editingProductId = ref<number | null>(null)
const descriptionDialogVisible = ref(false)
const editingDescriptionId = ref<number | null>(null)
const descriptionDraft = ref('')
const createForm = reactive<ProductRequirementCreateDTO>({
  title: '',
  description: '',
  priority: 'P2',
  businessLineId: undefined,
  productModule: '',
  reqType: '',
  sprintId: undefined,
  prdUrl: '',
  handler: '',
  rawReqId: undefined,
})
const canCreateProduct = computed(() => userStore.hasAnyPermission(['product-pool:add']))
const canEditProduct = computed(() => userStore.hasAnyPermission(['product-pool:edit', 'product-pool:filter', 'product-pool:judge']))
const createRules: FormRules = {
  title: [{ required: true, message: '请输入需求标题', trigger: 'blur' }],
}

function getStatusClass(status: string): string {
  if (status === 'pending_design' || status === 'PENDING_DESIGN') return 'status-filter'
  if (status === 'designing' || status === 'DESIGNING') return 'status-dispatch'
  if (status === 'developing' || status === 'DEVELOPING') return 'status-dispatch'
  if (status === 'online' || status === 'ONLINE') return 'status-dispatch'
  if (status === 'suspended' || status === 'SUSPENDED') return 'status-hold'
  return 'status-filter'
}

function getGroupColor(groupName: string): string {
  if (groupName.includes('直接创建')) return 'var(--success)'
  if (groupName.includes('待')) return 'var(--primary)'
  return 'var(--primary)'
}

function renderRichText(content?: string): string {
  return sanitizeRichText(content) || '<span style="color: #8e8e93;">暂无描述</span>'
}

function getDescriptionPreview(content?: string, isDirect?: number, rawReqTitle?: string): string {
  const plainText = richTextToPlainText(content)
  if (plainText) return plainText
  return isDirect === 1 ? '直接创建需求，当前可在产品需求池中查看和维护。' : `来自 ${rawReqTitle || '原始需求'}，当前在产品需求池中持续跟进。`
}

function getStatusDescription(status?: string): string {
  switch (status) {
    case 'pending_design':
      return '当前需求处于待设计阶段，等待产品侧补充和设计。'
    case 'designing':
      return '当前需求处于设计中，方案正在推进。'
    case 'developing':
      return '当前需求已进入开发阶段。'
    case 'online':
      return '当前需求已完成并上线。'
    case 'suspended':
      return '当前需求已挂起，暂不继续推进。'
    case 'closed':
      return '当前需求已关闭。'
    default:
      return '当前以查看详情和维护基础信息为主。'
  }
}

function isVoided(status?: string): boolean {
  return status === 'closed' || status === 'CLOSED'
}

function switchGrouping(mode: 'grouped' | 'flat') {
  grouping.value = mode
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const res = await pageQueryProductRequirements(queryForm)
    const data = res.data
    tableData.value = data.list || []
    total.value = data.total || 0
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const res = await pageQueryProductRequirements({
      page: 1,
      size: 1,
      unscheduled: true,
    })
    riskCount.value = res.data?.total || 0
  } catch {
    // error handled by interceptor
  }
}

async function loadDictData() {
  try {
    const [priorityRes, statusRes, bizRes, typeRes, handlerRes, sprintRes] = await Promise.all([
      listDictData('priority_level'),
      listDictData('req_status'),
      listDictData('business_line'),
      listDictData('req_type'),
      listDictData('product_manager'),
      listSprintOptions(),
    ])
    dictPriorityOptions.value = (priorityRes as any).data || []
    dictStatusOptions.value = (statusRes as any).data || []
    dictBusinessLineOptions.value = (bizRes as any).data || []
    dictReqTypeOptions.value = (typeRes as any).data || []
    dictHandlerOptions.value = (handlerRes as any).data || []
    dictSprintOptions.value = (sprintRes as any).data || []
  } catch {
    // error handled by interceptor
  }
}

function handleSearch() {
  queryForm.page = 1
  loadData()
}

function clearFilters() {
  Object.assign(queryForm, {
    page: 1,
    size: 10,
    status: '',
    priority: '',
    businessLineId: undefined,
    assigneeId: undefined,
    sprintId: undefined,
    keyword: '',
    reqType: '',
    handler: '',
    unscheduled: undefined,
  })
  loadData()
}

function toggleUnscheduled() {
  queryForm.unscheduled = !queryForm.unscheduled
  handleSearch()
}

function filterUnscheduled() {
  queryForm.unscheduled = true
  handleSearch()
}

function toggleDetail(id: number) {
  const newSet = new Set(expandedDetailIds.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  expandedDetailIds.value = newSet
}

async function openRawPreview(rawReqId: number) {
  if (!rawReqId) return
  try {
    const res = await getRawRequirementDetail(rawReqId)
    rawDrawerData.value = res.data as RawRequirementDetailVO
    rawDrawerVisible.value = true
  } catch {
    ElMessage.error('加载原始需求详情失败')
  }
}

function handleCreate() {
  if (!canCreateProduct.value) return
  editingProductId.value = null
  Object.assign(createForm, {
    title: '',
    description: '',
    priority: 'P2',
    businessLineId: undefined,
    productModule: '',
    reqType: '',
    sprintId: undefined,
    prdUrl: '',
    handler: '',
    rawReqId: undefined,
  })
  createDialogVisible.value = true
}

function handleCreateFromRaw(item: ProductRequirementListVO) {
  if (!canCreateProduct.value || !item.rawReqId) return
  editingProductId.value = null
  Object.assign(createForm, {
    title: '',
    description: '',
    priority: item.priority || 'P2',
    businessLineId: item.businessLineId || undefined,
    productModule: item.productModule || '',
    reqType: item.reqType || '',
    sprintId: item.sprintId || undefined,
    prdUrl: '',
    handler: item.handler || '',
    rawReqId: item.rawReqId,
  })
  createDialogVisible.value = true
}

function handleEdit(item: ProductRequirementListVO) {
  if (!canEditProduct.value) return
  editingProductId.value = item.id
  Object.assign(createForm, {
    title: item.title || '',
    description: item.description || '',
    priority: item.priority || 'P2',
    businessLineId: item.businessLineId || undefined,
    productModule: item.productModule || '',
    reqType: item.reqType || '',
    sprintId: item.sprintId || undefined,
    prdUrl: item.prdUrl || '',
    handler: item.handler || '',
    rawReqId: item.rawReqId || undefined,
  })
  createDialogVisible.value = true
}

function handleMoreAction(command: string, item: ProductRequirementListVO) {
  if (command === 'edit') {
    handleEdit(item)
    return
  }
  if (command === 'split') {
    handleCreateFromRaw(item)
    return
  }
  if (command === 'void') {
    handleVoid(item)
  }
}

function openDescriptionEditor(id: number, description?: string) {
  editingDescriptionId.value = id
  descriptionDraft.value = description || ''
  descriptionDialogVisible.value = true
}

async function handleSubmitCreate() {
  if (!canCreateProduct.value) return
  const form = createFormRef.value
  if (!form) return
  await form.validate()
  submitLoading.value = true
  try {
    const payload = {
      ...createForm,
      businessLineId: normalizeOptionalNumber(createForm.businessLineId),
      sprintId: normalizeOptionalNumber(createForm.sprintId),
      description: sanitizeRichText(createForm.description),
      isDirect: createForm.rawReqId ? 0 : 1,
      creator: '当前用户',
    }
    if (editingProductId.value) {
      await updateProductRequirement(editingProductId.value, payload)
      ElMessage.success('已更新产品需求')
    } else {
      await createProductRequirement(payload)
      ElMessage.success('已创建产品需求')
    }
    createDialogVisible.value = false
    editingProductId.value = null
    await Promise.all([loadData(), loadStats()])
  } catch {
    // error handled by interceptor
  } finally {
    submitLoading.value = false
  }
}

async function saveDescriptionEdit() {
  if (!canEditProduct.value) return
  if (!editingDescriptionId.value) return
  try {
    const description = sanitizeRichText(descriptionDraft.value)
    await updateProductRequirement(editingDescriptionId.value, { description })
    ElMessage.success('需求描述已更新')
    const updateRow = (row: ProductRequirementListVO) => {
      if (row.id === editingDescriptionId.value) {
        row.description = description
      }
    }
    tableData.value.forEach(updateRow)
    descriptionDialogVisible.value = false
  } catch {
    // error handled by interceptor
  }
}

async function handleInlineSave(id: number, field: string, value: any) {
  if (!canEditProduct.value) return
  try {
    const payload: ProductRequirementUpdateDTO = {}
    if (field === 'sprintId') {
      ;(payload as any)[field] = value === '' || value === null || value === undefined
        ? 0
        : normalizeOptionalNumber(value)
    } else {
      ;(payload as any)[field] = ['businessLineId', 'assigneeId'].includes(field)
        ? normalizeOptionalNumber(value)
        : value
    }
    await updateProductRequirement(id, payload)
    ElMessage.success('保存成功')
    if (field === 'sprintId') {
      await loadData()
      await loadStats()
      return
    }
    // 更新本地数据
    const row = tableData.value.find(r => r.id === id)
    if (row) {
      ;(row as any)[field] = value
    }
  } catch {
    // error handled by interceptor
  }
}

function normalizeOptionalNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }
  const nextValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(nextValue) ? nextValue : undefined
}

async function handleVoid(item: ProductRequirementListVO) {
  if (!canEditProduct.value) return
  try {
    await voidProductRequirement(item.id, `作废子产品需求: ${item.title}`)
    ElMessage.success('产品需求已作废')
    await loadData()
  } catch {
    ElMessage.error('作废失败')
  }
}

onMounted(() => {
  loadData()
  loadStats()
  loadDictData()
})
</script>

<style lang="scss" scoped>
.product-pool-view {
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
  padding: 0 32px;
  flex-shrink: 0;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
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

.view-switch,
.mode-switch {
  display: flex;
  gap: 4px;
  background: var(--bg);
  padding: 4px;
  border-radius: var(--radius-sm);
}

.view-btn,
.mode-btn {
  padding: 6px 12px;
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

.search-box {
  width: 240px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg);
  font-size: 13px;
  color: var(--text-primary);

  &::placeholder {
    color: var(--text-secondary);
  }
}

.btn {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: var(--transition);
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

.btn-danger {
  background: rgba(255, 59, 48, 0.08);
  color: var(--danger);

  &:hover {
    background: rgba(255, 59, 48, 0.14);
  }
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }

  &.active {
    background: rgba(0, 113, 227, 0.08);
    border-color: var(--primary);
    color: var(--primary);
  }
}

.filter-bar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 10px 32px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.filter-chip {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 13px;
  color: var(--text-secondary);

  &.active {
    background: rgba(0, 113, 227, 0.08);
    border-color: var(--primary);
    color: var(--primary);
  }
}

.filter-select {
  width: 140px;

  :deep(.el-input__wrapper) {
    border-radius: 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: none;
    padding: 2px 12px;
  }

  :deep(.el-input__inner) {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.risk-banner {
  margin: 12px 32px 0;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: rgba(255, 149, 0, 0.10);
  color: #8a5a00;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 32px 24px;
}

.rich-text-content {
  line-height: 1.7;
  color: var(--text-primary);

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 8px 0;
    display: block;
  }

  :deep(p) {
    margin: 0 0 8px;
  }

  :deep(ul),
  :deep(ol) {
    margin: 8px 0;
    padding-left: 20px;
  }
}

.detail-actions {
  margin-top: 8px;
}

.section {
  margin-bottom: 20px;
}

.grouped-section {
  position: relative;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-count {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg);
  padding: 2px 10px;
  border-radius: 999px;
}

.prd-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prd-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.prd-main {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
}

.prd-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  min-width: 0;
}

.prd-summary {
  min-width: 0;
  flex: 1;
}

.prd-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}

.code-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-secondary);
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.type-tag {
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary);
}

.prd-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.prd-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.priority-p0 { background: rgba(255, 59, 48, 0.10); color: var(--danger); }
.priority-p1 { background: rgba(255, 149, 0, 0.10); color: #b75c00; }
.priority-p2 { background: rgba(255, 204, 0, 0.12); color: #9a7d00; }
.priority-p3 { background: rgba(142, 142, 147, 0.12); color: var(--text-secondary); }

.status-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.status-filter { background: rgba(0, 113, 227, 0.10); color: var(--primary); }
.status-dispatch { background: rgba(52, 199, 89, 0.10); color: #248a3d; }
.status-hold { background: rgba(142, 142, 147, 0.10); color: var(--text-secondary); }

.link-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(0, 113, 227, 0.08);
  color: var(--primary);
  font-size: 12px;
  text-decoration: none;

  &:hover {
    background: rgba(0, 113, 227, 0.15);
  }
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.actions-inline {
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
}

.btn-compact {
  padding: 6px 10px;
  font-size: 12px;
  line-height: 1;
}

.prd-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
  padding-top: 2px;
}

.fact-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 6px 10px;
  border-radius: 12px;
  background: #f7f8fb;
  border: 1px solid rgba(15, 23, 42, 0.04);
}

.fact-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.fact-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.group-table {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.group-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: linear-gradient(180deg, #fbfcff 0%, #f7f9fd 100%);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.group-summary-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.group-summary-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.group-table-head {
  display: grid;
  grid-template-columns: 1.2fr 2fr 0.9fr 0.7fr 0.8fr 0.8fr 0.8fr 1.4fr;
  gap: 12px;
  padding: 12px 18px;
  background: #f8fafc;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  font-size: 12px;
  color: var(--text-secondary);
}

.group-table-body {
  display: flex;
  flex-direction: column;
}

.group-row {
  display: grid;
  grid-template-columns: 1.2fr 2fr 0.9fr 0.7fr 0.8fr 0.8fr 0.8fr 1.4fr;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.group-row:last-child {
  border-bottom: none;
}

.group-row.is-voided {
  background: rgba(15, 23, 42, 0.018);
}

.group-cell {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.group-cell-code {
  align-items: flex-start;
  flex-direction: column;
}

.group-cell-main {
  align-items: flex-start;
  flex-direction: column;
}

.group-row-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.is-voided-title {
  color: var(--text-secondary);
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
}

.group-row-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-top: 4px;
}

.group-cell-actions {
  justify-content: flex-end;
}

.group-detail {
  grid-column: 1 / -1;
  margin-top: 6px;
  padding-top: 14px;
  border-top: 1px dashed rgba(15, 23, 42, 0.08);
}

.detail {
  padding: 0 14px 14px;
  border-top: 1px solid var(--border);
}

.is-voided-card {
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.9), rgba(244, 246, 248, 0.96));

  .prd-desc,
  .fact-value {
    color: var(--text-secondary);
  }
}

.detail-grid {
  padding-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.detail-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;

  &.full {
    grid-column: 1 / -1;
  }
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

.table-wrap {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  flex-shrink: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}

.raw-drawer-body {
  .drawer-id {
    font-family: monospace;
    font-size: 12px;
    color: var(--text-secondary);
    background: var(--bg);
    padding: 2px 10px;
    border-radius: 4px;
    display: inline-block;
    margin-bottom: 12px;
  }

  .drawer-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--text-primary);
  }

  .drawer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}

@media (max-width: 1100px) {
  .actions {
    justify-content: flex-start;
  }

  .actions-inline {
    flex-wrap: wrap;
  }

  .prd-head {
    flex-direction: column;
  }

  .prd-facts {
    gap: 8px;
  }

  .group-table-head,
  .group-row {
    grid-template-columns: 1fr;
  }

  .group-table-head {
    display: none;
  }

  .group-cell-actions {
    justify-content: flex-start;
  }

  .detail-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
