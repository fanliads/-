<template>
  <div class="raw-pool-view">
    <section class="pool-header wb-page-header">
      <div class="pool-title-block">
        <div class="pool-title-row wb-title-row">
          <h2 class="pool-title wb-page-title">原始需求池</h2>
          <span class="pool-count wb-page-meta wb-meta-pill">{{ total }} 条</span>
        </div>
      </div>

      <div class="pool-toolbar wb-actions-row">
        <LnInput
          v-model="queryForm.keyword"
          class="linear-pool-search"
          placeholder="搜索标题、编号、项目名"
          clearable
          @keydown.enter="handleSearch"
        ><template #prefix><LnIcon name="search" /></template></LnInput>
        <LnButton :variant="showFilter ? 'primary' : 'secondary'" @click="showFilter = !showFilter">筛选</LnButton>
        <LnPopover align="end" @update:open="setDisplaySettingsOpen">
          <template #trigger><LnButton :variant="showDisplaySettings ? 'primary' : 'secondary'">显示</LnButton></template>
          <div class="linear-display-menu" aria-label="显示设置">
            <strong>显示设置</strong>
            <div class="linear-display-field"><span>列表密度</span><LnSelect v-model="listDensity" :options="densityOptions" /></div>
            <LnCheckbox v-model="showBusinessLine" label="业务线" />
            <LnCheckbox v-model="showStatus" label="状态" />
            <LnCheckbox v-model="showPriority" label="优先级" />
            <LnCheckbox v-model="showProductManager" label="产品经理" />
            <LnCheckbox v-model="showProjectManager" label="项目经理" />
            <LnCheckbox v-model="showProposer" label="提出人" />
            <LnCheckbox v-model="showExpectedOnlineDate" label="期望上线时间" />
            <LnCheckbox v-model="showCreatedAt" label="创建时间" />
          </div>
        </LnPopover>
        <LnButton v-if="hasActiveFilters" variant="ghost" @click="handleReset">清空筛选</LnButton>
        <LnButton v-if="canEditRaw" variant="secondary" :loading="aiAssessLoading" @click="handleBatchAiAssess">
          {{ aiAssessLoading ? 'AI 定级中…' : '批量 AI 定级' }}
        </LnButton>
        <LnButton v-if="canCreateRaw" variant="primary" @click="handleCreate">新建需求</LnButton>
      </div>
    </section>

    <section class="view-tabs"><LnTabs :model-value="activeView" :options="rawViewOptions" aria-label="原始需求视图" @update:model-value="selectRawView" /></section>

    <Transition name="filter-panel">
      <section v-if="showFilter" class="filter-panel-line wb-panel">
        <div class="filter-grid-line">
          <LnSelect v-model="queryForm.status" :options="linearStatusOptions" placeholder="全部状态" searchable clearable />
          <LnSelect v-model="queryForm.businessLine" :options="linearBusinessLineOptions" placeholder="全部业务线" searchable clearable />
          <LnSelect v-model="queryForm.productManager" :options="linearProductManagerOptions" placeholder="全部产品经理" searchable clearable />
          <LnSelect v-model="queryForm.projectManager" :options="linearProjectManagerOptions" placeholder="全部项目经理" searchable clearable />
          <LnSelect v-model="queryUrgentValue" :options="urgentOptions" placeholder="是否加急" clearable />
          <LnDateRange v-model="dateRange" clearable @change="handleDateChange" />
        </div>

        <div class="filter-actions-line wb-actions-row">
          <LnButton variant="primary" @click="handleSearch">应用筛选</LnButton>
          <LnButton variant="ghost" @click="handleReset">重置</LnButton>
        </div>
      </section>
    </Transition>

    <section class="workspace-shell wb-shell">
      <div class="list-panel wb-panel" :class="`density-${listDensity}`" :aria-busy="loading">
        <div class="list-header wb-list-header row-grid" :style="{ gridTemplateColumns: rawGridTemplate }">
          <div class="head-cell urgent-head">急</div>
          <div class="head-cell title-head">原始需求</div>
          <div v-if="showBusinessLine" class="head-cell">业务线</div>
          <div v-if="showStatus" class="head-cell">状态</div>
          <div v-if="showPriority" class="head-cell">优先级</div>
          <div v-if="showProductManager" class="head-cell">产品经理</div>
          <div v-if="showProjectManager" class="head-cell project-manager-column">项目经理</div>
          <div v-if="showProposer" class="head-cell">提出人</div>
          <div v-if="showExpectedOnlineDate" class="head-cell">期望上线时间</div>
          <div v-if="showCreatedAt" class="head-cell created-at-column">创建时间</div>
        </div>

        <template v-if="loading">
          <div v-for="index in Math.min(queryForm.size, 8)" :key="`skeleton-${index}`" class="list-row wb-list-row row-grid linear-skeleton-row" :class="{ 'hide-project-manager': !showProjectManager, 'hide-created-at': !showCreatedAt }">
            <div class="cell"><LnSkeleton circle width="14px" /></div>
            <div class="cell skeleton-title"><LnSkeleton width="68%" /><LnSkeleton width="54px" height="10px" /></div>
            <div class="cell"><LnSkeleton width="70%" /></div><div class="cell"><LnSkeleton width="64px" /></div><div class="cell"><LnSkeleton width="48px" /></div><div class="cell"><LnSkeleton width="58px" /></div>
            <div v-if="showProjectManager" class="cell project-manager-column"><LnSkeleton width="58px" /></div><div class="cell"><LnSkeleton width="48px" /></div><div class="cell"><LnSkeleton width="76px" /></div><div v-if="showCreatedAt" class="cell created-at-column"><LnSkeleton width="72px" /></div>
          </div>
        </template>
        <div
          v-for="row in loading ? [] : tableData"
          :key="row.id"
          class="list-row wb-list-row row-grid"
          :class="{ selected: activeRequirementId === row.id, hovering: hoverRequirementId === row.id }"
          :style="{ gridTemplateColumns: rawGridTemplate }"
          tabindex="0"
          @click="openRequirement(row, 'detail')"
          @mouseenter="hoverRequirementId = row.id"
          @focus="hoverRequirementId = row.id"
          @mouseleave="hoverRequirementId = hoverRequirementId === row.id ? null : hoverRequirementId"
          @blur="hoverRequirementId = hoverRequirementId === row.id ? null : hoverRequirementId"
        >
          <div class="cell urgent-cell">
            <span v-if="row.isUrgent === 1" class="urgent-mark">急</span>
          </div>

          <div class="cell title-cell">
            <div class="title-line">
              <div class="title-text">{{ row.title }}</div>
              <div class="title-flags">
                <span v-if="isExternalSubmit(row)" class="flat-icon" title="外部提交" aria-label="外部提交">↗</span>
                <span v-if="!isContentReady(row)" class="meta-text muted">待补充</span>
              </div>
            </div>
            <span class="req-no">{{ row.reqNo }}</span>
          </div>

          <div v-if="showBusinessLine" class="cell" @click.stop>
            <EditableCell
              :value="row.businessLine"
              type="select"
              :options="dictBusinessLineOptions"
              @save="(val) => handleInlineSave(row, 'businessLine', val)"
            />
          </div>

          <div v-if="showStatus" class="cell linear-property-cell" @click.stop>
            <LnPropertyPicker
              :model-value="row.status || ''"
              title="修改状态"
              :options="linearStatusOptions"
              @update:model-value="(val) => handleInlineSave(row, 'status', val)"
            />
          </div>

          <div v-if="showPriority" class="cell linear-property-cell" @click.stop>
            <LnPropertyPicker
              :model-value="row.priority || ''"
              title="修改优先级"
              :options="linearPriorityOptions"
              @update:model-value="(val) => handleInlineSave(row, 'priority', val)"
            />
          </div>

          <div v-if="showProductManager" class="cell" @click.stop>
            <EditableCell
              :value="row.productManager"
              type="select"
              :options="dictProductManagerOptions"
              @save="(val) => handleInlineSave(row, 'productManager', val)"
            />
          </div>

          <div v-if="showProjectManager" class="cell project-manager-column" @click.stop>
            <EditableCell
              :value="row.projectManager"
              type="select"
              :options="dictProjectManagerOptions"
              @save="(val) => handleInlineSave(row, 'projectManager', val)"
            />
          </div>

          <div v-if="showProposer" class="cell proposer-cell" @click.stop>
            <EditableCell
              :value="row.proposer || ''"
              type="text"
              placeholder="未填写"
              @save="(val) => handleInlineSave(row, 'proposer', val)"
            />
          </div>
          <div v-if="showExpectedOnlineDate" class="cell expected-date-cell" @click.stop>
            <EditableCell
              :value="row.expectedOnlineDate || ''"
              type="date"
              @save="(val) => handleInlineSave(row, 'expectedOnlineDate', val)"
            />
          </div>
          <div v-if="showCreatedAt" class="cell time-cell created-at-column">{{ formatListDate(row.createTime) }}</div>
        </div>

        <LnEmptyState v-if="tableData.length === 0 && !loading" title="没有匹配的原始需求" description="筛选、搜索或视图切换后没有匹配结果，表头与工作区结构会保持不变。"><LnButton v-if="hasActiveFilters" size="small" variant="ghost" @click="handleReset">清空筛选</LnButton></LnEmptyState>

        <div class="pagination-line">
          <LnPagination v-model:page="queryForm.page" v-model:page-size="queryForm.size" :total="total" @change="loadData" />
        </div>
      </div>

      <div v-if="activeRequirementId && previewMode === 'detail'" class="detail-backdrop" @click="closeRequirement"></div>
      <aside
        v-if="activeRequirementId"
        class="peek-panel wb-panel"
        :class="previewMode === 'detail' ? 'detail-mode' : 'peek-mode'"
      >
        <template v-if="activeRequirementId">
          <div class="peek-scroll wb-detail-scroll">
            <div v-if="activeRequirementLoading" class="peek-loading" aria-label="正在加载原始需求详情">
              <LnSkeleton width="86px" height="10px" />
              <LnSkeleton width="72%" height="22px" />
              <div class="peek-loading__tags"><LnSkeleton v-for="index in 3" :key="index" width="68px" height="24px" /></div>
              <LnSkeleton v-for="index in 5" :key="`detail-${index}`" :width="index % 2 ? '100%' : '78%'" height="58px" />
            </div>
            <template v-else-if="activeRequirementDetail">
              <div class="peek-header">
                <div class="peek-id">{{ activeRequirementDetail.reqNo }}</div>
                <div class="peek-title-row">
                  <h3 class="peek-title">{{ activeRequirementDetail.title }}</h3>
                  <div class="peek-header-actions">
                    <LnButton v-if="previewMode === 'peek'" size="small" variant="primary" @click="previewMode = 'detail'">详情</LnButton>
                    <LnButton size="small" icon-only variant="ghost" aria-label="关闭" @click="closeRequirement"><template #icon>×</template></LnButton>
                  </div>
                </div>
                <div class="peek-tags">
                  <span class="status-tag" :class="getStatusClass(activeRequirementDetail.status, activeRequirementDetail.statusName)">
                    {{ getStatusLabel(activeRequirementDetail.status, activeRequirementDetail.statusName) }}
                  </span>
                  <span class="priority-chip effective">{{ getPriorityLabel(activeRequirementDetail.effectiveLevel || activeRequirementDetail.priority) }}</span>
                  <span v-if="activeRequirementDetail.isUrgent === 1" class="meta-chip urgent">加急</span>
                  <span v-if="activeRequirementDetail.submitOrigin === 'external'" class="meta-chip">外部提报</span>
                </div>
                <div class="peek-meta-line">
                  <span class="peek-meta-item">更新 {{ formatDateTime(activeRequirementDetail.updateTime) }}</span>
                  <span class="peek-meta-sep">·</span>
                  <span class="peek-meta-item">创建 {{ formatDateTime(activeRequirementDetail.createTime) }}</span>
                  <span class="peek-meta-sep">·</span>
                  <span class="peek-meta-item">提出人 {{ activeRequirementDetail.proposer || '-' }}</span>
                </div>
              </div>

              <div class="peek-facts wb-detail-facts">
                <div class="peek-fact wb-detail-fact">
                  <span>业务线</span>
                  <strong>{{ activeRequirementDetail.businessLineName || activeRequirementDetail.businessLine || '-' }}</strong>
                </div>
                <div class="peek-fact wb-detail-fact">
                  <span>产品经理</span>
                  <strong>{{ activeRequirementDetail.productManager || '-' }}</strong>
                </div>
                <div class="peek-fact wb-detail-fact">
                  <span>项目名称</span>
                  <strong>{{ activeRequirementDetail.projectName || '-' }}</strong>
                </div>
                <div class="peek-fact wb-detail-fact">
                  <span>期望上线</span>
                  <strong>{{ activeRequirementDetail.expectedOnlineDate || '-' }}</strong>
                </div>
              </div>

              <div class="peek-section wb-section surface-section primary-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">关键信息</div>
                  <div class="peek-section-note wb-section-note">常改字段直接在这里维护。</div>
                </div>
                <div class="peek-grid">
                  <div class="peek-item">
                    <span>业务线</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.businessLine"
                        type="select"
                        :options="dictBusinessLineOptions"
                        @save="(val) => handleDetailSave('businessLine', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>当前状态</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.status"
                        type="select"
                        :options="dictStatusOptions"
                        @save="(val) => handleDetailSave('status', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>优先级</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.priority"
                        type="select"
                        :options="dictPriorityOptions"
                        @save="(val) => handleDetailSave('priority', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>产品经理</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.productManager"
                        type="select"
                        :options="dictProductManagerOptions"
                        @save="(val) => handleDetailSave('productManager', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>项目经理</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.projectManager"
                        type="select"
                        :options="dictProjectManagerOptions"
                        @save="(val) => handleDetailSave('projectManager', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item"><span>提出人</span><strong>{{ activeRequirementDetail.proposer || '-' }}</strong></div>
                  <div class="peek-item"><span>联系方式</span><strong>{{ activeRequirementDetail.proposerContact || '-' }}</strong></div>
                  <div class="peek-item">
                    <span>项目名称</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.projectName"
                        type="text"
                        @save="(val) => handleDetailSave('projectName', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>期望上线</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.expectedOnlineDate"
                        type="date"
                        @save="(val) => handleDetailSave('expectedOnlineDate', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>是否加急</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.isUrgent"
                        type="switch"
                        @save="(val) => handleDetailSave('isUrgent', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item"><span>需求来源</span><strong>{{ activeRequirementDetail.source || '-' }}</strong></div>
                </div>
              </div>

              <div class="peek-section wb-section surface-section soft-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">系统判定结果</div>
                  <div class="peek-section-note wb-section-note">快速回看系统给出的判断与缺口。</div>
                </div>
                <div class="peek-grid">
                  <div class="peek-item"><span>系统分级</span><strong>{{ activeRequirementDetail.systemLevel || '-' }}</strong></div>
                  <div class="peek-item"><span>生效等级</span><strong>{{ activeRequirementDetail.effectiveLevel || activeRequirementDetail.priority || '-' }}</strong></div>
                  <div class="peek-item"><span>处理策略</span><strong>{{ activeRequirementDetail.strategyHint || '-' }}</strong></div>
                  <div class="peek-item"><span>缺失字段</span><strong>{{ activeRequirementDetail.missingFields || '-' }}</strong></div>
                </div>
              </div>

              <div class="peek-section wb-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">需求描述</div>
                  <div class="peek-section-note wb-section-note">保留完整原文上下文。</div>
                </div>
                <div class="peek-paragraph editable-block">
                  <EditableField
                    :value="activeRequirementDetail.description"
                    type="textarea"
                    placeholder="暂无需求描述"
                    @save="(val) => handleDetailSave('description', val)"
                  />
                </div>
              </div>

              <div class="peek-section wb-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">处理备注</div>
                  <div class="peek-section-note wb-section-note">记录当前判断和流转说明。</div>
                </div>
                <div class="peek-paragraph editable-block">
                  <EditableField
                    :value="activeRequirementDetail.remark"
                    type="textarea"
                    placeholder="暂无处理备注"
                    @save="(val) => handleDetailSave('remark', val)"
                  />
                </div>
              </div>

              <div class="peek-section wb-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">补充字段</div>
                  <div class="peek-section-note wb-section-note">影响后续拆分、承接和排期的补充信息。</div>
                </div>
                <div class="peek-grid">
                  <div class="peek-item">
                    <span>加急原因</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.urgentReason"
                        type="text"
                        placeholder="暂无加急原因"
                        @save="(val) => handleDetailSave('urgentReason', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>价值量化评估</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.valueAssessment"
                        type="text"
                        placeholder="暂无价值量化评估"
                        @save="(val) => handleDetailSave('valueAssessment', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>产品需求定义</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.productDefinition"
                        type="text"
                        placeholder="暂无产品需求定义"
                        @save="(val) => handleDetailSave('productDefinition', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>需求单链接</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.reqLink"
                        type="text"
                        placeholder="暂无需求单链接"
                        @save="(val) => handleDetailSave('reqLink', val)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="peek-section wb-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">系统信息</div>
                  <div class="peek-section-note wb-section-note">保留追溯所需的系统侧属性。</div>
                </div>
                <div class="peek-grid">
                  <div class="peek-item"><span>登记人</span><strong>{{ activeRequirementDetail.registerName || '-' }}</strong></div>
                  <div class="peek-item"><span>需求类型</span><strong>{{ activeRequirementDetail.reqType || '-' }}</strong></div>
                  <div class="peek-item"><span>期望日期</span><strong>{{ activeRequirementDetail.expectedDate || '-' }}</strong></div>
                  <div class="peek-item"><span>负责人</span><strong>{{ activeRequirementDetail.assigneeName || '-' }}</strong></div>
                  <div class="peek-item"><span>创建人</span><strong>{{ activeRequirementDetail.createByName || '-' }}</strong></div>
                  <div class="peek-item"><span>创建时间</span><strong>{{ formatDateTime(activeRequirementDetail.createTime) }}</strong></div>
                  <div class="peek-item"><span>更新时间</span><strong>{{ formatDateTime(activeRequirementDetail.updateTime) }}</strong></div>
                  <div class="peek-item"><span>非功能需求</span><strong>{{ activeRequirementDetail.isNonFunctional ? '是' : '否' }}</strong></div>
                </div>
              </div>

              <div v-if="previewMode === 'detail'" class="peek-section wb-section action-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">动作</div>
                  <div class="peek-section-note wb-section-note">只保留当前对象最相关的后续动作。</div>
                </div>
                <div class="peek-actions">
                  <LnButton
                    v-if="canShowHandoffAction(activeRequirementDetail)"
                    @click="handleHandoff(activeRequirementDetail)"
                  >
                    承接需求
                  </LnButton>
                  <LnButton
                    v-else-if="canShowSplitAction(activeRequirementDetail)"
                    @click="handleSplit(activeRequirementDetail)"
                  >
                    拆分需求
                  </LnButton>
                  <LnButton variant="ghost" @click="openSupplementDialog">添加补充</LnButton>
                  <LnButton variant="ghost" :loading="aiAssessLoading" @click="handleAiAssess(activeRequirementDetail)">
                    {{ aiAssessLoading ? 'AI 定级中…' : 'AI 重新定级' }}
                  </LnButton>
                  <LnButton
                    v-if="normalizedActiveReqLink"
                    variant="ghost"
                    :href="normalizedActiveReqLink || undefined"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    打开需求单
                  </LnButton>
                </div>
              </div>

              <div class="peek-section wb-section decision-section" v-if="activeBusinessDecisionSections.length">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">业务判定信息</div>
                  <div class="peek-section-note wb-section-note">完整回看业务判定表单，仅查看。</div>
                </div>
                <div v-for="section in activeBusinessDecisionSections" :key="section.title" class="decision-block">
                  <div class="decision-title">{{ section.title }}</div>
                  <div class="decision-grid">
                    <div v-for="item in section.items" :key="item.label" class="decision-item">
                      <span>{{ item.label }}</span>
                      <strong>{{ item.value }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div class="peek-section wb-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">追加记录</div>
                  <div class="peek-section-note wb-section-note">按时间顺序连续阅读后续补充。</div>
                </div>
                <div v-if="activeRequirementDetail.supplements?.length" class="timeline-list">
                  <div v-for="sup in activeRequirementDetail.supplements" :key="sup.id" class="timeline-item">
                    <div class="timeline-head">
                      <span class="meta-chip">{{ sup.supplementTypeName || sup.supplementType }}</span>
                      <span>{{ formatDateTime(sup.createTime) }}</span>
                    </div>
                    <div class="timeline-content">{{ sup.content }}</div>
                  </div>
                </div>
                <div v-else class="peek-empty-copy">暂无追加记录</div>
              </div>

              <div class="peek-section wb-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">历史活动记录</div>
                  <div class="peek-section-note wb-section-note">保留字段调整、状态流转、拆分和补充操作的完整留痕。</div>
                </div>
                <div v-if="requirementLogs.length" class="timeline-list">
                  <div v-for="log in requirementLogs" :key="log.id" class="timeline-item">
                    <div class="timeline-head">
                      <strong>{{ log.operatorName || '系统' }}</strong>
                      <span>{{ formatDateTime(log.createTime) }}</span>
                    </div>
                    <div class="timeline-content">
                      {{ log.actionName || log.action }}
                      <template v-if="log.fieldName"> · {{ log.fieldName }}</template>
                      <template v-if="log.oldValue || log.newValue">：{{ log.oldValue || '-' }} → {{ log.newValue || '-' }}</template>
                      <template v-if="log.remark"> · {{ log.remark }}</template>
                    </div>
                  </div>
                </div>
                <div v-else class="peek-empty-copy">暂无历史活动记录</div>
              </div>

              <div class="peek-section wb-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">下钻产品需求</div>
                  <div class="peek-section-note wb-section-note">查看从这条原始需求继续拆出的产品需求。</div>
                </div>
                <div v-if="activeRequirementDetail.linkedProducts?.length" class="linked-list">
                  <div v-for="prd in activeRequirementDetail.linkedProducts" :key="prd.id" class="linked-item">
                    <div class="linked-copy">
                      <span class="linked-no">{{ prd.reqNo }}</span>
                      <span>{{ prd.title }}</span>
                    </div>
                    <span class="status-tag" :class="getStatusClass(prd.status, prd.statusName)">{{ getStatusLabel(prd.status, prd.statusName) }}</span>
                  </div>
                </div>
                <div v-else class="peek-empty-copy">暂无关联产品需求</div>
              </div>
            </template>
          </div>
        </template>

      </aside>
    </section>

    <LnDialog v-model="splitDialogVisible" title="拆分原始需求" description="参考原始内容并创建一个或多个产品需求。" width="90vw" :close-on-backdrop="false">
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
              <LnButton size="small" variant="ghost" class="split-copy-btn" @click="copySplitSourceText">复制原文</LnButton>
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
            </div>
          </div>

          <div class="split-items">
            <div class="split-items-header">
              <span>拆分产品需求</span>
              <LnButton size="small" variant="ghost" @click="addSplitItem"><template #icon>＋</template>添加一条</LnButton>
            </div>

            <div v-for="(item, idx) in splitItems" :key="idx" class="split-item-card">
              <div class="split-item-header">
                <span>产品需求 #{{ idx + 1 }}</span>
                <LnButton v-if="splitItems.length > 1" size="small" variant="ghost" @click="removeSplitItem(idx)">删除</LnButton>
              </div>
              <div class="split-item-form">
                <div class="form-row">
                  <div class="form-field">
                    <div class="field-label">产品需求标题（选填）</div>
                    <LnInput v-model="item.title" placeholder="可不填，系统会按说明自动生成标题" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-field">
                    <div class="field-label">需求说明（选填）</div>
                    <LnTextarea v-model="item.description" placeholder="若标题为空，系统将基于说明自动生成标题" />
                  </div>
                </div>
                <div class="form-row dual">
                  <div class="form-field">
                    <div class="field-label">建议负责人</div>
                    <LnSelect v-model="item.handler" :options="linearProductManagerOptions" placeholder="请选择负责人" searchable clearable />
                  </div>
                  <div class="form-field">
                    <div class="field-label">优先级</div>
                    <LnSelect v-model="item.priority" :options="linearPriorityOptions" placeholder="请选择优先级" clearable />
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

          <div v-else-if="normalizedSplitReqLink && iframeLoadError" class="split-preview-error">
            <div class="split-preview-error-text">该链接不支持内嵌预览，请在新窗口打开</div>
            <LnButton class="split-preview-error-btn" :href="normalizedSplitReqLink || undefined" target="_blank" rel="noopener noreferrer">
              新窗口打开链接
            </LnButton>
          </div>

          <div v-else class="split-preview-empty">
            当前原始需求未填写“需求单链接”，无法预览。
          </div>
        </div>
      </div>

      <template #footer>
        <LnButton variant="ghost" @click="splitDialogVisible = false">取消</LnButton>
        <LnButton variant="primary" :loading="splitLoading" @click="submitSplit">确认拆分</LnButton>
      </template>
    </LnDialog>

    <LnDialog v-model="createDialogVisible" title="新建原始需求" description="记录需求背景、业务归属和优先级判断上下文。" width="720px" :close-on-backdrop="false">
      <LnForm ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <LnFormItem label="需求标题" prop="title">
          <LnInput v-model="createForm.title" placeholder="请输入需求标题" />
        </LnFormItem>
        <LnFormItem label="需求描述" prop="description">
          <LnTextarea v-model="createForm.description" placeholder="请输入需求描述" />
        </LnFormItem>
        <LnFormItem label="业务线" prop="businessLine">
          <LnSelect v-model="createForm.businessLine" :options="linearBusinessLineOptions" placeholder="请选择业务线" searchable />
        </LnFormItem>
        <LnFormItem label="提出人">
          <LnInput :model-value="createForm.proposer || '-'" disabled />
        </LnFormItem>
        <LnFormItem label="需求单链接" prop="reqLink">
          <LnInput v-model="createForm.reqLink" placeholder="请输入需求单链接" />
        </LnFormItem>
        <LnFormItem label="期望上线时间" prop="expectedOnlineDate">
          <LnDateInput v-model="createForm.expectedOnlineDate" clearable />
        </LnFormItem>
        <LnFormItem label="价值量化评估" prop="valueAssessment">
          <LnInput v-model="createForm.valueAssessment" placeholder="请输入价值量化评估" />
        </LnFormItem>

        <div class="form-divider"><span>V3 业务判定信息</span></div>

        <div class="dialog-grid">
          <LnFormItem label="项目名称"><LnInput v-model="assessmentCreateForm.projectName" placeholder="请输入项目名称" /></LnFormItem>
          <LnFormItem label="客户名称"><LnInput v-model="assessmentCreateForm.customerName" placeholder="请输入客户名称" /></LnFormItem>
          <LnFormItem label="合同编号"><LnInput v-model="assessmentCreateForm.contractNo" placeholder="请输入合同编号" /></LnFormItem>
          <LnFormItem label="合同金额"><LnInput v-model="assessmentCreateForm.contractAmount" placeholder="请输入合同金额" /></LnFormItem>
          <LnFormItem label="项目类型"><LnInput v-model="assessmentCreateForm.projectType" placeholder="如：常规营收项目/专属定制" /></LnFormItem>
          <LnFormItem label="商务负责人"><LnInput v-model="assessmentCreateForm.businessOwner" placeholder="请输入商务负责人" /></LnFormItem>
          <LnFormItem label="合同范围"><LnInput v-model="assessmentCreateForm.contractScope" placeholder="请输入合同范围" /></LnFormItem>
          <LnFormItem label="预估工时"><LnInput v-model="assessmentCreateForm.estimatedWorkload" placeholder="请输入预估工时" /></LnFormItem>
          <LnFormItem label="刚性交付日期"><LnDateInput v-model="assessmentCreateForm.rigidDeliveryDate" clearable /></LnFormItem>
          <LnFormItem label="可复用性"><LnInput v-model="assessmentCreateForm.reusability" placeholder="如：可复用技术建设" /></LnFormItem>
          <LnFormItem label="履约风险">
            <LnSelect v-model="assessmentCreateForm.deliveryRisk" :options="yesNoOptions" placeholder="请选择" clearable />
          </LnFormItem>
          <LnFormItem label="回款风险">
            <LnSelect v-model="assessmentCreateForm.paymentRisk" :options="yesNoOptions" placeholder="请选择" clearable />
          </LnFormItem>
          <LnFormItem label="验收风险">
            <LnSelect v-model="assessmentCreateForm.acceptanceRisk" :options="yesNoOptions" placeholder="请选择" clearable />
          </LnFormItem>
          <LnFormItem label="安全/合规风险">
            <LnSelect v-model="assessmentCreateForm.securityOrComplianceRisk" :options="yesNoOptions" placeholder="请选择" clearable />
          </LnFormItem>
          <LnFormItem label="重大故障风险">
            <LnSelect v-model="assessmentCreateForm.majorIncidentRisk" :options="yesNoOptions" placeholder="请选择" clearable />
          </LnFormItem>
          <LnFormItem label="省级督办">
            <LnSelect v-model="assessmentCreateForm.govSupervision" :options="yesNoOptions" placeholder="请选择" clearable />
          </LnFormItem>
          <LnFormItem label="战略客户/标杆客户">
            <LnSelect v-model="assessmentCreateForm.strategicCustomer" :options="yesNoOptions" placeholder="请选择" clearable />
          </LnFormItem>
          <LnFormItem label="核心产品线">
            <LnSelect v-model="assessmentCreateForm.coreProductLine" :options="yesNoOptions" placeholder="请选择" clearable />
          </LnFormItem>
          <LnFormItem label="是否样板">
            <LnSelect v-model="assessmentCreateForm.benchmarkCase" :options="yesNoOptions" placeholder="请选择" clearable />
          </LnFormItem>
        </div>

        <LnFormItem label="特殊备注">
          <LnTextarea v-model="assessmentCreateForm.specialRemark" placeholder="请输入会影响优先级判定的补充说明" />
        </LnFormItem>
        <LnFormItem label="需求备注" prop="remark">
          <LnTextarea v-model="createForm.remark" placeholder="请输入需求备注" />
        </LnFormItem>
      </LnForm>
      <template #footer>
        <LnButton variant="ghost" @click="createDialogVisible = false">取消</LnButton>
        <LnButton variant="primary" :loading="submitLoading" @click="handleSubmitCreate">确定</LnButton>
      </template>
    </LnDialog>

    <SupplementDialog
      v-model:visible="supplementDialogVisible"
      req-type="raw"
      :requirement-id="activeRequirementId || 0"
      @success="handleSupplementSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import {
  pageQueryRawRequirements,
  createRawRequirement,
  splitRawRequirement,
  getRawRequirementDetail,
  getRawRequirementSupplements,
  getRawRequirementLogs,
  updateRawRequirement,
  reassessRawRequirementPriority,
} from '@/api/raw-requirement'
import { executeAction } from '@/api/workflow'
import { listDictData } from '@/api/dict'
import EditableCell from '@/components/EditableCell.vue'
import EditableField from '@/components/EditableField.vue'
import SupplementDialog from '@/components/requirement/SupplementDialog.vue'
import { lnToast, LnButton, LnCheckbox, LnDateInput, LnDateRange, LnDialog, LnEmptyState, LnForm, LnFormItem, LnIcon, LnInput, LnPagination, LnPopover, LnPropertyPicker, LnSelect, LnSkeleton, LnTabs, LnTextarea, isLnConfirmCancelled, lnConfirm, lnPrompt, type LnFormInstance, type LnFormRules, type LnOption, type LnTabOption } from '@/components/linear'
import type {
  RawRequirementListVO,
  RawRequirementCreateDTO,
  RawRequirementDetailVO,
  DictDataVO,
  SupplementVO,
  RequirementLogVO,
  PriorityAssessmentContextDTO,
  RawRequirementUnifiedStatus,
} from '@/types/requirement'
import {
  getRawRequirementStatusClass,
  getRawRequirementStatusLabel,
  normalizeRawRequirementStatus,
} from '@/types/requirement'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const canCreateRaw = computed(() => userStore.hasAnyPermission(['raw-pool:add']))
const canEditRaw = computed(() => userStore.hasAnyPermission(['raw-pool:edit', 'raw-pool:evaluate', 'raw-pool:approve']))
const canSplitRaw = computed(() => userStore.hasAnyPermission(['product-pool:add', 'raw-pool:approve']))
const canHandoffRaw = computed(() => userStore.hasAnyPermission(['raw-pool:evaluate', 'raw-pool:approve']))

const dictStatusOptions = ref<DictDataVO[]>([])
const dictPriorityOptions = ref<DictDataVO[]>([])
const dictBusinessLineOptions = ref<DictDataVO[]>([])
const dictProductManagerOptions = ref<DictDataVO[]>([])
const dictProjectManagerOptions = ref<DictDataVO[]>([])
const statusVisuals: Record<string, Pick<LnOption, 'color' | 'icon'>> = {
  pending_judgement: { color: '#9b9ba4', icon: '○' },
  pending_split: { color: '#d28b36', icon: '◔' },
  in_progress: { color: '#5e6ad2', icon: '◒' },
  online: { color: '#2f9e6f', icon: '●' },
  closed: { color: '#6f6f78', icon: '✓' },
  suspended: { color: '#d28b36', icon: 'Ⅱ' },
  rejected: { color: '#d05757', icon: '⊘' },
}
const priorityVisuals: Record<string, Pick<LnOption, 'color' | 'icon'>> = {
  P0: { color: '#d05757', icon: '●' },
  P1: { color: '#d28b36', icon: '●' },
  P2: { color: '#5e6ad2', icon: '●' },
  P3: { color: '#6f6f78', icon: '●' },
}
const fallbackStatusOptions: DictDataVO[] = [
  { label: '待判定', value: 'pending_judgement' },
  { label: '待拆分', value: 'pending_split' },
  { label: '处理中', value: 'in_progress' },
  { label: '已上线', value: 'online' },
  { label: '已关闭', value: 'closed' },
  { label: '已挂起', value: 'suspended' },
  { label: '已拒绝', value: 'rejected' },
] as DictDataVO[]
const toLinearOptions = (items: DictDataVO[]): LnOption[] => items.map((item) => ({ label: item.label, value: item.value }))
const linearStatusOptions = computed<LnOption[]>(() => dictStatusOptions.value.map((item) => ({
  label: item.label,
  value: item.value,
  ...statusVisuals[item.value],
})))
const linearPriorityOptions = computed<LnOption[]>(() => dictPriorityOptions.value.map((item) => ({
  label: item.label,
  value: item.value,
  ...priorityVisuals[item.value],
})))
const linearBusinessLineOptions = computed(() => toLinearOptions(dictBusinessLineOptions.value))
const linearProductManagerOptions = computed(() => toLinearOptions(dictProductManagerOptions.value))
const linearProjectManagerOptions = computed(() => toLinearOptions(dictProjectManagerOptions.value))
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
const urgentOptions: LnOption[] = [{ label: '是', value: '1' }, { label: '否', value: '0' }]
const queryUrgentValue = computed({
  get: () => queryForm.isUrgent === undefined ? '' : String(queryForm.isUrgent),
  set: (value: string) => { queryForm.isUrgent = value === '' ? undefined : Number(value) },
})
const showFilter = ref(false)
const showDisplaySettings = ref(false)
const densityOptions: LnOption[] = [{ label: '紧凑', value: 'compact' }, { label: '舒适', value: 'comfortable' }]
const listDensity = ref('compact')
const showBusinessLine = ref(true)
const showStatus = ref(true)
const showPriority = ref(true)
const showProductManager = ref(true)
const showProjectManager = ref(true)
const showProposer = ref(true)
const showExpectedOnlineDate = ref(true)
const showCreatedAt = ref(true)
const rawGridTemplate = computed(() => [
  '28px',
  'minmax(260px, 1.6fr)',
  showBusinessLine.value ? 'minmax(90px, .7fr)' : '',
  showStatus.value ? 'minmax(88px, .7fr)' : '',
  showPriority.value ? 'minmax(96px, .75fr)' : '',
  showProductManager.value ? 'minmax(86px, .65fr)' : '',
  showProjectManager.value ? 'minmax(86px, .65fr)' : '',
  showProposer.value ? 'minmax(72px, .55fr)' : '',
  showExpectedOnlineDate.value ? '124px' : '',
  showCreatedAt.value ? '132px' : '',
].filter(Boolean).join(' '))
const loading = ref(false)
const aiAssessLoading = ref(false)
const tableData = ref<RawRequirementListVO[]>([])
const total = ref(0)

const activeRequirementId = ref<number | null>(null)
const previewMode = ref<'peek' | 'detail'>('peek')
const activeRequirementLoading = ref(false)
const activeRequirementDetail = ref<RawRequirementDetailVO | null>(null)
const requirementLogs = ref<RequirementLogVO[]>([])
const hoverRequirementId = ref<number | null>(null)
const spacePreviewCandidateId = ref<number | null>(null)
const spacePreviewRestoreId = ref<number | null>(null)
const spacePreviewOpenedByHold = ref(false)
let spacePreviewTimer: number | null = null
const supplementDialogVisible = ref(false)

function setDisplaySettingsOpen(open: boolean) {
  showDisplaySettings.value = open
  if (open) showFilter.value = false
}

const createDialogVisible = ref(false)
const submitLoading = ref(false)
const createFormRef = ref<LnFormInstance>()
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

  if (splitTarget.value.supplements?.length) {
    const supplementText = splitTarget.value.supplements
      .map((sup, index) => `${index + 1}. ${sup.supplementTypeName || sup.supplementType}\n${sup.content}`)
      .join('\n\n')
    appendSection('追加记录', supplementText)
  }

  return sections.join('\n\n')
})

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

  tableData.value.forEach((row) => {
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

type RawCountKey = 'pendingJudgement' | 'pendingSplit' | 'inProgress' | 'online'
const activeView = ref('all')
const rawViews: Array<{ key: string; label: string; countKey?: RawCountKey }> = [
  { key: 'all', label: '全部原始需求' },
  { key: 'pending_judgement', label: '待评估', countKey: 'pendingJudgement' },
  { key: 'pending_split', label: '待设计', countKey: 'pendingSplit' },
  { key: 'urgent', label: '加急' },
]
const rawViewOptions = computed<LnTabOption[]>(() => rawViews.map((view) => ({ label: view.label, value: view.key, count: view.countKey ? statusCount.value[view.countKey] : undefined })))

function selectRawView(key: string) {
  activeView.value = key
  queryForm.status = ''
  queryForm.isUrgent = undefined
  if (key === 'pending_judgement' || key === 'pending_split') queryForm.status = key
  if (key === 'urgent') queryForm.isUrgent = 1
  handleSearch()
}

const hasActiveFilters = computed(() => {
  return !!(
    queryForm.keyword ||
    queryForm.status ||
    queryForm.priority ||
    queryForm.source ||
    queryForm.businessLine ||
    queryForm.registerName ||
    queryForm.projectManager ||
    queryForm.productManager ||
    queryForm.isUrgent !== undefined ||
    queryForm.startDate ||
    queryForm.endDate
  )
})

const activeBusinessDecisionSections = computed(() => {
  const raw = activeRequirementDetail.value?.aiAssessmentContext
  if (!raw) return []

  try {
    const ctx = JSON.parse(raw) as PriorityAssessmentContextDTO
    return [
      {
        title: '项目与客户',
        items: [
          { label: '项目名称', value: ctx.projectName },
          { label: '客户名称', value: ctx.customerName },
          { label: '商务负责人', value: ctx.businessOwner },
        ],
      },
      {
        title: '合同与交付',
        items: [
          { label: '合同编号', value: ctx.contractNo },
          { label: '合同金额', value: ctx.contractAmount },
          { label: '合同范围', value: ctx.contractScope },
          { label: '刚性交付日期', value: ctx.rigidDeliveryDate },
          { label: '期望上线时间', value: ctx.expectedOnlineTime },
          { label: '预估工时', value: ctx.estimatedWorkload },
        ],
      },
      {
        title: '风险与督办',
        items: [
          { label: '履约风险', value: ctx.deliveryRisk },
          { label: '回款风险', value: ctx.paymentRisk },
          { label: '验收风险', value: ctx.acceptanceRisk },
          { label: '安全/合规风险', value: ctx.securityOrComplianceRisk },
          { label: '重大故障风险', value: ctx.majorIncidentRisk },
          { label: '省级督办', value: ctx.govSupervision },
        ],
      },
      {
        title: '战略属性',
        items: [
          { label: '战略客户/标杆客户', value: ctx.strategicCustomer },
          { label: '核心产品线', value: ctx.coreProductLine },
          { label: '项目类型', value: ctx.projectType },
          { label: '可复用性', value: ctx.reusability },
          { label: '是否样板', value: ctx.benchmarkCase },
        ],
      },
      {
        title: '补充说明',
        items: [{ label: '特殊备注', value: ctx.specialRemark }],
      },
    ]
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.value),
      }))
      .filter((section) => section.items.length > 0)
  } catch {
    return []
  }
})

const normalizedActiveReqLink = computed(() => {
  const rawLink = activeRequirementDetail.value?.reqLink?.trim()
  if (!rawLink) return ''
  if (/^https?:\/\//i.test(rawLink)) return rawLink
  return `https://${rawLink}`
})

const validateReqLinkOrRemark = (_rule: unknown, _value: unknown, callback: (error?: Error) => void) => {
  if (createForm.reqLink?.trim() || createForm.remark?.trim()) {
    callback()
    return
  }
  callback(new Error('需求单链接和需求备注至少完善一项'))
}

const createRules: LnFormRules = {
  title: [{ required: true, message: '请输入需求标题', trigger: 'blur' }],
  reqLink: [{ validator: validateReqLinkOrRemark, trigger: 'blur' }],
  remark: [{ validator: validateReqLinkOrRemark, trigger: 'blur' }],
}

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

function formatDateTime(value?: string): string {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

function formatListDate(value?: string): string {
  if (!value) return '-'
  return value.slice(0, 10)
}

function isContentReady(row: RawRequirementListVO): boolean {
  return Boolean(row.description?.trim() || row.remark?.trim() || row.productDefinition?.trim() || row.supplements?.length)
}

function isExternalSubmit(row: RawRequirementListVO): boolean {
  return row.submitOrigin === 'external'
}

function needsHandoffBeforeSplit(row: RawRequirementListVO): boolean {
  return isExternalSubmit(row) && getUnifiedStatus(row.status, row.statusName) === 'pending_judgement'
}

function canShowSplitAction(row: RawRequirementListVO): boolean {
  const unifiedStatus = getUnifiedStatus(row.status, row.statusName)
  if (!canSplitRaw.value || ['online', 'closed', 'suspended', 'rejected'].includes(unifiedStatus)) return false
  if (isExternalSubmit(row)) return unifiedStatus === 'pending_split'
  return ['pending_split', 'in_progress'].includes(unifiedStatus)
}

function canShowHandoffAction(row: RawRequirementListVO): boolean {
  return canHandoffRaw.value && needsHandoffBeforeSplit(row)
}

async function openRequirement(row: RawRequirementListVO, mode: 'peek' | 'detail' = 'detail') {
  createDialogVisible.value = false
  splitDialogVisible.value = false
  supplementDialogVisible.value = false
  showFilter.value = false
  showDisplaySettings.value = false
  previewMode.value = mode
  activeRequirementId.value = row.id
  activeRequirementLoading.value = true
  try {
    const [detailRes, supsRes, logsRes] = await Promise.all([
      getRawRequirementDetail(row.id),
      getRawRequirementSupplements(row.id),
      getRawRequirementLogs(row.id),
    ])
    activeRequirementDetail.value = {
      ...(detailRes.data as RawRequirementDetailVO),
      supplements: (supsRes.data as SupplementVO[]) || [],
    }
    requirementLogs.value = (logsRes.data as RequirementLogVO[]) || []
  } catch {
    lnToast.error('加载详情失败')
  } finally {
    activeRequirementLoading.value = false
  }
}

function closeRequirement() {
  activeRequirementId.value = null
  activeRequirementDetail.value = null
  requirementLogs.value = []
  previewMode.value = 'peek'
}

function clearSpacePreviewState() {
  if (spacePreviewTimer) {
    window.clearTimeout(spacePreviewTimer)
    spacePreviewTimer = null
  }
  spacePreviewCandidateId.value = null
  spacePreviewRestoreId.value = null
  spacePreviewOpenedByHold.value = false
}

function getHoveredOrActiveRow() {
  const candidateId = hoverRequirementId.value ?? activeRequirementId.value
  if (!candidateId) return null
  return tableData.value.find((item) => item.id === candidateId) || null
}

function reopenRequirementById(id: number | null) {
  if (!id) return
  const row = tableData.value.find((item) => item.id === id)
  if (row) openRequirement(row, 'peek')
}

function openSupplementDialog() {
  if (!activeRequirementId.value) return
  supplementDialogVisible.value = true
}

async function handleInlineSave(row: RawRequirementListVO, field: string, value: any) {
  if (!canEditRaw.value) return

  try {
    let nextValue = value
    if (field === 'status' && getUnifiedStatus(String(value), String(value)) === 'rejected') {
      let reason = ''
      try {
        reason = await lnPrompt({
          title: '拒绝原始需求',
          message: '请填写拒绝原因，保存后将记录到活动中。',
          confirmText: '确认拒绝',
          cancelText: '取消',
          tone: 'danger',
          placeholder: '输入拒绝原因',
          inputPattern: /\S+/,
          inputErrorMessage: '拒绝原因不能为空',
        })
      } catch (error) {
        if (isLnConfirmCancelled(error)) return
        throw error
      }
      nextValue = value
      await updateRawRequirement(row.id, { remark: `拒绝原因：${reason}` })
    }
    const updateData: Record<string, any> = {}
    updateData[field] = nextValue
    await updateRawRequirement(row.id, updateData)
    ;(row as any)[field] = nextValue

    if (field === 'status') {
      ;(row as any).statusName = getStatusLabel(String(value))
    }

    if (field === 'businessLine') {
      const blOption = dictBusinessLineOptions.value.find((o) => o.value === value)
      ;(row as any).businessLineName = blOption ? blOption.label : value
    }

    if (activeRequirementDetail.value && activeRequirementDetail.value.id === row.id) {
      ;(activeRequirementDetail.value as any)[field] = value
      if (field === 'status') {
        activeRequirementDetail.value.statusName = getStatusLabel(String(value))
      }
    }

    lnToast.success('保存成功')
  } catch {
    lnToast.error('保存失败')
  }
}

async function handleAiAssess(row: RawRequirementListVO | RawRequirementDetailVO) {
  if (!canEditRaw.value || aiAssessLoading.value) return
  aiAssessLoading.value = true
  try {
    const res = await reassessRawRequirementPriority(row.id)
    const result = res.data
    lnToast.success(`AI 定级完成：${result.effectiveLevelLabel || result.effectiveLevel || result.priority || '已更新'}`)
    await loadData()
    const latestRow = tableData.value.find((item) => item.id === row.id)
    if (latestRow && activeRequirementId.value === row.id) await openRequirement(latestRow, previewMode.value)
  } catch {
    lnToast.error('AI 定级失败，请稍后重试')
  } finally {
    aiAssessLoading.value = false
  }
}

async function handleBatchAiAssess() {
  if (!canEditRaw.value || aiAssessLoading.value || tableData.value.length === 0) return
  try {
    await lnConfirm({
      title: '批量 AI 定级',
      message: `将对当前列表中的 ${tableData.value.length} 条需求重新执行 AI 定级，是否继续？`,
      confirmText: '开始定级',
      cancelText: '取消',
      tone: 'warning',
    })
  } catch {
    return
  }

  aiAssessLoading.value = true
  try {
    const results = await Promise.allSettled(tableData.value.map((item) => reassessRawRequirementPriority(item.id)))
    const successCount = results.filter((item) => item.status === 'fulfilled').length
    await loadData()
    lnToast.success(`AI 定级完成：成功 ${successCount} 条，失败 ${results.length - successCount} 条`)
  } finally {
    aiAssessLoading.value = false
  }
}

async function handleDetailSave(field: string, value: any) {
  if (!activeRequirementDetail.value) return

  const row = tableData.value.find((item) => item.id === activeRequirementDetail.value?.id)
  if (!row) return

  await handleInlineSave(row, field, value)
}

async function handleSupplementSuccess() {
  if (!activeRequirementId.value) return
  const row = tableData.value.find((item) => item.id === activeRequirementId.value)
  if (row) {
    await openRequirement(row, previewMode.value)
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
    lnToast.success('承接成功')
  } catch {
    lnToast.error('承接失败')
  }
}

function addSplitItem() {
  splitItems.value.push({ title: '', description: '', handler: '', priority: '' })
}

function removeSplitItem(idx: number) {
  splitItems.value.splice(idx, 1)
}

async function submitSplit() {
  if (!canSplitRaw.value || !splitTarget.value) return

  for (let i = 0; i < splitItems.value.length; i++) {
    const item = splitItems.value[i]
    if (!item.title.trim() && !item.description.trim()) {
      lnToast.warning(`第 ${i + 1} 条拆分项的标题和需求说明不能同时为空，请至少填写一个`)
      return
    }
  }

  splitLoading.value = true
  try {
    await splitRawRequirement(splitTarget.value.id, {
      rawReqId: splitTarget.value.id,
      items: splitItems.value.map((item) => ({
        title: item.title.trim() || undefined,
        description: item.description.trim() || undefined,
        handler: item.handler || undefined,
        priority: item.priority || undefined,
      })),
    })
    lnToast.success('拆分成功')
    splitDialogVisible.value = false
    loadData()
  } catch {
    lnToast.error('拆分请求失败')
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
    // ignore
  }
}

async function copySplitSourceText() {
  if (!splitSourceText.value) {
    lnToast.warning('当前没有可复制的原文内容')
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
    lnToast.success('原文已复制')
  } catch {
    lnToast.error('复制失败，请手动复制')
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await pageQueryRawRequirements(queryForm)
    const data = res.data
    tableData.value = data.list || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

async function loadDictData() {
  const results = await Promise.allSettled([
      listDictData('req_status'),
      listDictData('priority_level'),
      listDictData('business_line'),
      listDictData('product_manager'),
      listDictData('project_manager'),
  ])
  const dataAt = (index: number): DictDataVO[] =>
    results[index]?.status === 'fulfilled' ? ((results[index].value as any).data || []) : []
  const statuses = dataAt(0).filter((item) =>
    ['pending_judgement', 'pending_split', 'in_progress', 'online', 'closed', 'suspended', 'rejected'].includes(item.value),
  )
  dictStatusOptions.value = statuses.length ? statuses : fallbackStatusOptions
  dictPriorityOptions.value = dataAt(1)
  dictBusinessLineOptions.value = dataAt(2)
  dictProductManagerOptions.value = dataAt(3)
  dictProjectManagerOptions.value = dataAt(4)
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

function handleGlobalKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const tagName = target?.tagName?.toLowerCase()
  const isTypingTarget = !!target && (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable ||
    target.closest('.ln-field') ||
    target.closest('.ln-textarea-field') ||
    target.closest('.ln-select-field')
  )

  if (isTypingTarget) return

  const hasBlockingOverlay = createDialogVisible.value || splitDialogVisible.value || supplementDialogVisible.value || showFilter.value || showDisplaySettings.value
  if (hasBlockingOverlay) return

  if ((event.code === 'ArrowDown' || event.code === 'ArrowUp') && activeRequirementId.value && previewMode.value === 'peek') {
    event.preventDefault()
    const currentIndex = tableData.value.findIndex((item) => item.id === activeRequirementId.value)
    if (currentIndex < 0) return
    const offset = event.code === 'ArrowDown' ? 1 : -1
    const next = tableData.value[currentIndex + offset]
    if (next) openRequirement(next, 'peek')
    return
  }

  if (event.code === 'Space') {
    event.preventDefault()
    if (event.repeat || spacePreviewCandidateId.value) return
    const row = getHoveredOrActiveRow()
    if (!row) return
    spacePreviewCandidateId.value = row.id
    spacePreviewRestoreId.value = activeRequirementId.value && activeRequirementId.value !== row.id ? activeRequirementId.value : null
    spacePreviewTimer = window.setTimeout(() => {
      if (!spacePreviewCandidateId.value) return
      spacePreviewOpenedByHold.value = true
      openRequirement(row, 'peek')
    }, 180)
    return
  }

  if (event.code === 'Escape' && activeRequirementId.value) {
    event.preventDefault()
    clearSpacePreviewState()
    closeRequirement()
  }
}

function handleGlobalKeyup(event: KeyboardEvent) {
  if (event.code !== 'Space') return
  if (!spacePreviewCandidateId.value) return
  event.preventDefault()

  const candidateId = spacePreviewCandidateId.value
  const restoreId = spacePreviewRestoreId.value
  const openedByHold = spacePreviewOpenedByHold.value
  clearSpacePreviewState()

  if (openedByHold) {
    if (restoreId) {
      reopenRequirementById(restoreId)
      return
    }
    closeRequirement()
    return
  }

  if (activeRequirementId.value === candidateId) {
    closeRequirement()
    return
  }

  reopenRequirementById(candidateId)
}

async function handleSubmitCreate() {
  const form = createFormRef.value
  if (!form) return

  try {
    await form.validate()
  } catch {
    lnToast.warning('请完善表单必填项')
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
    lnToast.success('创建成功')
    createDialogVisible.value = false
    loadData()
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadData()
  loadDictData()
  window.addEventListener('keydown', handleGlobalKeydown)
  window.addEventListener('keyup', handleGlobalKeyup)
})

onUnmounted(() => {
  clearSpacePreviewState()
  window.removeEventListener('keydown', handleGlobalKeydown)
  window.removeEventListener('keyup', handleGlobalKeyup)
})
</script>

<style lang="scss" scoped>
.raw-pool-view {
  position: relative;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.linear-pool-search {
  width: 230px;
}

.linear-property-cell {
  overflow: visible;
}

.linear-display-menu {
  width: 220px;
  padding: 4px;
  display: grid;
  gap: 3px;
  font-family: var(--ln-font);

  strong {
    padding: 6px 7px 8px;
    color: var(--ln-text-tertiary);
    font-size: 10px;
    font-weight: 650;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  label {
    min-height: 34px;
    padding: 0 7px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-radius: 5px;
    color: var(--ln-text-secondary);
    font-size: 12px;

    &:hover { background: var(--ln-surface-hover); }
  }

}

.linear-display-field { padding: 5px 7px 8px; display: grid; gap: 5px; color: var(--ln-text-secondary); font-size: 11px; }
:deep(.linear-display-field .ln-select-field),
:deep(.linear-display-field .ln-popover-root),
:deep(.linear-display-field .ln-popover-trigger),
:deep(.linear-display-field .ln-select__trigger) { width: 100%; min-width: 0; }

.linear-skeleton-row {
  pointer-events: none;
}

.skeleton-title {
  display: flex;
  align-items: center;
  gap: 9px;
}

:deep(.linear-pool-search .ln-input-wrap) {
  width: 230px;
}

:deep(.filter-grid-line .ln-select-field),
:deep(.filter-grid-line .ln-popover-root),
:deep(.filter-grid-line .ln-popover-trigger),
:deep(.filter-grid-line .ln-select__trigger) {
  width: 100%;
}

:deep(.filter-grid-line .ln-date-range) {
  width: 100%;
}

:deep(.filter-grid-line .ln-date-range input) {
  min-width: 0;
  width: 50%;
}

.view-tabs {
  padding: 0 2px 8px;
}

.flat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
  font-size: 12px;
}

.pool-header,
.summary-strip,
.filter-panel-line,
.list-panel,
.peek-panel {
  border: 1px solid rgba(17, 24, 39, 0.06);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.05);
  backdrop-filter: blur(16px);
}

.pool-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 2px 2px 6px;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.pool-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pool-title {
  font-size: 18px;
  line-height: 1.12;
  letter-spacing: -0.03em;
  font-weight: 720;
}

.pool-count,
.pool-shortcut {
}

.pool-subtitle {
  margin-top: 6px;
  max-width: 760px;
  line-height: 1.7;
}

.pool-toolbar {
  justify-content: flex-end;
}

.line-search {
  width: 280px;
}

.summary-strip {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 10px;
  border-radius: 12px;
}

.summary-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(17, 24, 39, 0.04);
}

.summary-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.summary-value {
  font-size: 14px;
  font-weight: 700;
}

.filter-panel-line {
  position: absolute;
  top: 58px;
  right: 96px;
  z-index: 31;
  width: min(920px, calc(100% - 112px));
  padding: 12px;
  border-radius: 12px;
}

.filter-panel-enter-active,
.filter-panel-leave-active { transition: opacity var(--ln-normal), transform var(--ln-normal); transform-origin: top right; }
.filter-panel-enter-from,
.filter-panel-leave-to { opacity: 0; transform: translateY(-6px) scale(.985); }

.filter-grid-line {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

.filter-actions-line {
  margin-top: 12px;
  justify-content: flex-end;
}

.workspace-shell {
  min-height: 0;
  flex: 1;
  display: block;
}

.list-panel,
.peek-panel {
  border-radius: 14px;
  min-height: 0;
}

.list-panel {
  overflow: hidden;
}

.row-grid {
  display: grid;
  grid-template-columns: 24px minmax(300px, 2.2fr) minmax(100px, 0.82fr) 90px 68px minmax(88px, 0.72fr) minmax(88px, 0.72fr) 84px 124px 132px;
  column-gap: 12px;
  align-items: center;
}

.row-grid.hide-project-manager {
  grid-template-columns: 24px minmax(300px, 2.2fr) minmax(100px, 0.82fr) 90px 68px minmax(88px, 0.72fr) 84px 124px 132px;
}
.row-grid.hide-created-at {
  grid-template-columns: 24px minmax(300px, 2.2fr) minmax(100px, 0.82fr) 90px 68px minmax(88px, 0.72fr) minmax(88px, 0.72fr) 84px 124px;
}
.row-grid.hide-project-manager.hide-created-at {
  grid-template-columns: 24px minmax(300px, 2.2fr) minmax(100px, 0.82fr) 90px 68px minmax(88px, 0.72fr) 84px 124px;
}
.density-compact .list-row { padding-top: 7px; padding-bottom: 7px; }
.density-comfortable .list-row { padding-top: 14px; padding-bottom: 14px; }
.stable-empty { min-height: 150px; display: grid; place-content: center; gap: 6px; text-align: center; color: var(--text-tertiary); font-size: 12px; }
.stable-empty strong { color: var(--text-secondary); font-size: 13px; }

.list-header {
  position: sticky;
  top: 0;
  z-index: 3;
  padding: 0 16px;
  min-height: 40px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  background: rgba(249, 250, 251, 0.98);
}

.head-cell {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.urgent-head,
.action-head {
  text-align: center;
}

.list-row {
  padding: 11px 16px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.05);
  cursor: pointer;
  transition: 0.16s ease;

  &:hover {
    background: rgba(17, 24, 39, 0.025);
  }

  &.selected {
    background: linear-gradient(180deg, rgba(59, 130, 246, 0.045) 0%, rgba(255, 255, 255, 0.98) 100%);
    box-shadow: inset 2px 0 0 rgba(59, 130, 246, 0.62);
  }

  &.hovering {
    .row-actions {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }
  }

  &.selected {
    .row-actions {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }
  }
}

.cell {
  min-width: 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--text-primary);
}

.urgent-cell {
  display: flex;
  justify-content: center;
}

.urgent-mark {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(212, 92, 71, 0.1);
  color: #c46246;
  font-size: 9px;
  font-weight: 800;
}

.title-cell {
  min-width: 0;
  gap: 3px;
}

.title-line {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
}

.title-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 18px;
  flex-wrap: wrap;
}

.title-prefix {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.title-flags {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex-wrap: wrap;
}

.req-no {
  display: block;
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.015em;
  color: #7b8595;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.title-text {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13.5px;
  font-weight: 650;
  line-height: 1.42;

  :deep(.display-value) {
    font-weight: 650;
  }
}

.expected-date-cell,
.time-cell {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.expected-date-cell :deep(.editable-cell-display) {
  white-space: nowrap;
}

.title-subline {
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-secondary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta-text {
  display: inline-flex;
  align-items: center;
  min-height: 16px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.04);
  font-size: 10px;
  font-weight: 700;
  color: var(--text-secondary);
  white-space: nowrap;

  &.muted {
    color: var(--text-tertiary);
    background: rgba(148, 163, 184, 0.1);
  }
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  min-height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.05);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;

  &.muted {
    color: var(--text-tertiary);
  }

  &.urgent {
    background: rgba(212, 92, 71, 0.08);
    color: #c46246;
  }
}

.priority-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.86);
  font-size: 11px;
  font-weight: 700;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.86);
  color: var(--text-secondary);
}

.proposer-cell,
.time-cell {
  color: var(--text-secondary);
  font-size: 12px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.row-actions {
  display: flex;
  justify-content: center;
  gap: 6px;
  opacity: 0;
  transform: translateX(2px);
  pointer-events: none;
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.pagination-line {
  padding: 14px 16px 16px;
}

.peek-panel {
  overflow: hidden;
  position: fixed;
  z-index: 70;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.1);
  box-shadow: 0 24px 70px rgba(18, 24, 31, 0.2);
  animation: panel-enter 0.18s ease-out;
}

.peek-panel.peek-mode {
  top: 72px;
  right: 18px;
  bottom: 18px;
  width: min(520px, calc(100vw - 48px));
}

.peek-panel.detail-mode {
  top: 28px;
  right: 28px;
  bottom: 28px;
  left: max(276px, calc((100vw - 1180px) / 2));
  border-radius: 16px;
}

.detail-backdrop {
  position: fixed;
  inset: 0;
  z-index: 69;
  background: rgba(21, 24, 27, 0.24);
  backdrop-filter: blur(2px);
}

.peek-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

@keyframes panel-enter {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

.peek-scroll {
  height: 100%;
  overflow: auto;
  padding: 18px 18px 22px;
}

.peek-loading { display: grid; gap: 14px; padding: 4px 0; }
.peek-loading__tags { display: flex; flex-wrap: wrap; gap: 8px; }

.form-divider { position: relative; margin: 22px 0 18px; display: flex; align-items: center; color: var(--ln-text-tertiary); font: 620 10px/1 var(--ln-font); letter-spacing: .09em; text-transform: uppercase; &::after { content: ''; height: 1px; flex: 1; margin-left: 10px; background: var(--ln-border); } span { white-space: nowrap; } }

.peek-empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
  color: var(--text-secondary);
}

.peek-empty-title {
  font-size: 16px;
  font-weight: 650;
  color: var(--text-primary);
}

.peek-empty-desc {
  margin-top: 8px;
  max-width: 280px;
  font-size: 12px;
  line-height: 1.75;
}

.peek-header {
  position: sticky;
  top: -18px;
  z-index: 2;
  margin: -18px -18px 0;
  padding: 18px 18px 14px;
  border-bottom: 1px solid rgba(31, 35, 40, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.93) 100%);
  backdrop-filter: blur(14px);
}

.peek-id {
  font-size: 12px;
  color: var(--text-tertiary);
}

.peek-title-row {
  margin-top: 6px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.peek-title {
  font-size: 20px;
  line-height: 1.24;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.peek-close {
}

.peek-tags {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.peek-meta-line {
  margin-top: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.peek-meta-item {
  white-space: nowrap;
}

.peek-meta-sep {
  color: rgba(148, 163, 184, 0.8);
}

.peek-facts {
  margin-top: 16px;
  padding: 14px 0 4px;
  border-top: 1px solid rgba(17, 24, 39, 0.06);
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
}

.peek-section-title,
.decision-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.peek-grid,
.decision-grid {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 14px;
}

.peek-item,
.decision-item {
  padding: 8px 0;
  border-radius: 0;
  background: transparent;
  border: none;
  border-bottom: 1px dashed rgba(17, 24, 39, 0.06);

  span {
    display: block;
    font-size: 11px;
    color: var(--text-tertiary);
  }

  strong {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.45;
  }
}

.surface-section .peek-grid {
  margin-top: 12px;
  padding: 4px 12px 0;
  border-radius: 14px;
  border: 1px solid rgba(17, 24, 39, 0.05);
  background: rgba(248, 250, 252, 0.72);
}

.soft-section .peek-grid {
  background: rgba(246, 248, 251, 0.88);
}

.peek-editable {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-primary);

  :deep(.editable-field) {
    width: 100%;
    align-items: flex-start;
  }

  :deep(.display-value) {
    font-size: 13px;
    line-height: 1.6;
  }
}

.peek-paragraph {
  margin-top: 8px;
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: none;
  font-size: 13px;
  line-height: 1.72;
  white-space: pre-wrap;
}

.editable-block {
  :deep(.editable-field) {
    width: 100%;
    align-items: flex-start;
  }

  :deep(.display-value) {
    display: block;
    width: 100%;
    min-height: 24px;
    line-height: 1.75;
  }
}

.decision-block + .decision-block {
  margin-top: 12px;
}

.decision-block {
  padding: 12px 12px 2px;
  border-radius: 14px;
  border: 1px solid rgba(17, 24, 39, 0.05);
  background: rgba(248, 250, 252, 0.72);
}

.decision-title {
  font-size: 12px;
  letter-spacing: 0.01em;
}

.timeline-list,
.linked-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-item,
.linked-item {
  position: relative;
  padding: 12px 0 12px 14px;
  border-radius: 0;
  background: transparent;
  border: none;
  border-bottom: 1px dashed rgba(17, 24, 39, 0.06);

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 17px;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.55);
  }
}

.timeline-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.timeline-content {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.65;
}

.linked-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.linked-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.linked-no {
  font-size: 11px;
  color: var(--text-tertiary);
}

.peek-empty-copy {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}

.peek-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.78);
  border: 1px solid rgba(17, 24, 39, 0.05);
}

.dialog-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

:deep(.ln-form-item__content > .ln-field),
:deep(.ln-form-item__content > .ln-textarea-field),
:deep(.ln-form-item__content > .ln-date-field),
:deep(.ln-form-item__content > .ln-select-field),
:deep(.ln-form-item__content > .ln-select-field .ln-popover-root),
:deep(.ln-form-item__content > .ln-select-field .ln-popover-trigger),
:deep(.ln-form-item__content > .ln-select-field .ln-select__trigger) { width: 100%; }

.split-dialog-body {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(340px, 0.9fr);
  gap: 18px;
}

.split-editor {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.split-origin,
.split-extract-panel,
.split-items,
.split-preview-panel {
  border: 1px solid rgba(31, 35, 40, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  padding: 14px;
}

.split-origin-label,
.split-link-label,
.split-extract-label,
.split-preview-subtitle,
.field-label {
  font-size: 12px;
  color: var(--text-tertiary);
}

.split-origin-title,
.split-extract-title,
.split-preview-title {
  margin-top: 6px;
  font-size: 16px;
  font-weight: 700;
}

.split-origin-no,
.split-link-hint,
.split-extract-subtitle {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.split-link {
  display: inline-block;
  margin-top: 8px;
  color: var(--primary);
  word-break: break-all;
}

.split-extract-header,
.split-items-header,
.split-preview-header,
.split-item-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.split-extract-body,
.split-item-form {
  margin-top: 12px;
}

.split-extract-block + .split-extract-block,
.split-item-card + .split-item-card {
  margin-top: 12px;
}

.split-extract-content,
.split-supplement-type,
.split-preview-empty,
.split-preview-error-text {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.7;
}

.split-item-card {
  padding: 12px;
  border-radius: 14px;
  background: rgba(31, 35, 40, 0.03);
}

.split-item-form :deep(.ln-field),
.split-item-form :deep(.ln-textarea-field),
.split-item-form :deep(.ln-select-field),
.split-item-form :deep(.ln-select-field .ln-popover-root),
.split-item-form :deep(.ln-select-field .ln-popover-trigger),
.split-item-form :deep(.ln-select-field .ln-select__trigger) { width: 100%; }

.btn-remove {
  border: none;
  background: transparent;
  color: var(--danger);
  cursor: pointer;
}

.form-row.dual {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.split-preview-frame-wrap {
  margin-top: 12px;
  height: 540px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.split-preview-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.split-preview-open {
  color: var(--primary);
}

@media (max-width: 1440px) {
  .row-grid {
    grid-template-columns: 32px minmax(340px, 2.1fr) 92px 92px 72px 84px 84px 68px 88px 92px;
  }
}

@media (max-width: 1200px) {
  .workspace-shell {
    grid-template-columns: 1fr;
  }

  .peek-panel {
    min-height: 480px;
  }

  .row-actions {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }

  .filter-grid-line {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .pool-header {
    flex-direction: column;
  }

  .pool-toolbar {
    width: 100%;
    justify-content: flex-start;
  }

  .line-search {
    width: 100%;
  }

  .peek-facts,
  .dialog-grid,
  .form-row.dual,
  .split-dialog-body {
    grid-template-columns: 1fr;
  }
}
</style>
