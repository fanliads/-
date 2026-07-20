<template>
  <div class="product-pool-view">
    <section class="pool-header wb-page-header">
      <div class="pool-title-block">
        <div class="pool-title-row wb-title-row">
          <h2 class="pool-title wb-page-title">产品需求池</h2>
          <span class="pool-count wb-page-meta wb-meta-pill">{{ total }} 条</span>
        </div>
      </div>

      <div class="pool-toolbar wb-actions-row">
        <LnInput v-model="queryForm.keyword" class="linear-pool-search" placeholder="搜索标题、编号、原始需求" clearable @keydown.enter="handleSearch"><template #prefix><LnIcon name="search" /></template></LnInput>
        <LnButton :variant="showFilter ? 'primary' : 'secondary'" @click="showFilter = !showFilter">筛选</LnButton>
        <LnPopover align="end" @update:open="setDisplaySettingsOpen"><template #trigger><LnButton :variant="showDisplaySettings ? 'primary' : 'secondary'">显示</LnButton></template><div class="linear-display-menu"><strong>显示设置</strong><div class="linear-display-field"><span>列表密度</span><LnSelect v-model="listDensity" :options="densityOptions" /></div><LnCheckbox v-model="showTypeTag" label="需求类型"/><LnCheckbox v-model="showBusinessLineTag" label="业务线"/><LnCheckbox v-model="showStatusTag" label="状态"/><LnCheckbox v-model="showPriorityTag" label="优先级"/><LnCheckbox v-model="showHandlerTag" label="处理人"/><LnCheckbox v-model="showSprintTag" label="迭代"/><LnCheckbox v-model="showParentTag" label="项目 / 父需求"/><LnCheckbox v-model="showPrdTag" label="PRD"/></div></LnPopover>
        <LnButton v-if="hasActiveFilters" variant="ghost" @click="clearFilters">清空筛选</LnButton>
        <LnButton v-if="canCreateProduct" variant="primary" @click="handleCreate()">新建产品需求</LnButton>
      </div>
    </section>

    <section class="view-tabs">
      <LnTabs :model-value="activeView" :options="productViewOptions" aria-label="产品需求视图" @update:model-value="selectProductView" />
      <LnTabs class="group-mode-switch" :model-value="groupingMode" :options="groupingOptions" variant="segmented" aria-label="产品需求分组方式" @update:model-value="selectGroupingMode" />
    </section>

    <Transition name="filter-panel">
      <section v-if="showFilter" class="filter-panel-line wb-panel">
        <div class="filter-grid-line">
          <LnSelect v-model="queryForm.status" :options="linearStatusOptions" placeholder="全部状态" searchable clearable />
          <LnSelect v-model="queryForm.priority" :options="linearPriorityOptions" placeholder="全部优先级" clearable />
          <LnSelect v-model="queryBusinessLineId" :options="linearBusinessLineOptions" placeholder="全部业务线" searchable clearable />
          <LnSelect v-model="queryForm.reqType" :options="linearReqTypeOptions" placeholder="需求类型" searchable clearable />
          <LnSelect v-model="querySprintId" :options="linearSprintOptions" placeholder="迭代版本" searchable clearable />
          <LnSelect v-model="queryForm.handler" :options="linearHandlerOptions" placeholder="处理人" searchable clearable />
        </div>

        <div class="filter-actions-line wb-actions-row">
          <LnButton variant="primary" @click="handleSearch">应用筛选</LnButton><LnButton variant="ghost" @click="clearFilters">重置</LnButton>
        </div>
      </section>
    </Transition>

    <section class="workspace-shell wb-shell">
      <div class="list-panel wb-panel grouped-list" :class="`density-${listDensity}`" :aria-busy="loading">
        <template v-if="loading"><section v-for="groupIndex in 2" :key="`group-skeleton-${groupIndex}`" class="requirement-group linear-group-skeleton"><header class="group-header"><div class="group-title"><LnSkeleton circle width="9px"/><LnSkeleton width="72px"/></div></header><div v-for="rowIndex in 3" :key="rowIndex" class="issue-row issue-grid skeleton-row"><div class="skeleton-identity"><LnSkeleton :width="`${48 + rowIndex * 8}%`"/><LnSkeleton width="58px" height="10px"/></div><div class="skeleton-tags"><LnSkeleton v-for="tag in 5" :key="tag" width="62px" height="24px"/></div></div></section></template>
        <div v-else class="list-table" :style="{ minWidth: issueGridMinWidth }">
          <div v-if="tableData.length" class="issue-columns issue-grid" :style="{ gridTemplateColumns: issueGridTemplate }" aria-hidden="true">
            <span>产品需求</span>
            <span v-if="showTypeTag">需求类型</span>
            <span v-if="showBusinessLineTag">业务线</span>
            <span v-if="showStatusTag">状态</span>
            <span v-if="showPriorityTag">优先级</span>
            <span v-if="showHandlerTag">处理人</span>
            <span v-if="showSprintTag">迭代</span>
            <span v-if="showParentTag">原始需求</span>
            <span v-if="showPrdTag">文档</span>
          </div>

          <section v-for="group in displayedRequirementGroups" :key="group.key" class="requirement-group" :class="{ 'is-collapsed': isGroupCollapsed(group.key) }">
            <header class="group-header">
              <button
                class="group-toggle"
                type="button"
                :aria-expanded="!isGroupCollapsed(group.key)"
                :aria-controls="`product-group-${group.key}`"
                @click="toggleGroup(group.key)"
              >
                <span class="group-caret" :class="{ 'is-collapsed': isGroupCollapsed(group.key) }"><LnIcon name="chevron-down" /></span>
                <span class="status-dot" :class="group.tone"></span>
                <strong>{{ group.label }}</strong>
                <span class="group-count">{{ group.items.length }}</span>
              </button>
              <LnButton v-if="canCreateProduct" size="small" icon-only variant="ghost" aria-label="在此分组新建" @click.stop="handleCreate(group.createStatus)"><template #icon><LnIcon name="plus" /></template></LnButton>
            </header>

            <div v-show="!isGroupCollapsed(group.key)" :id="`product-group-${group.key}`" class="group-rows">
              <div
                v-for="item in group.items"
                :key="item.id"
                class="issue-row issue-grid"
                :class="{ selected: activeRequirementId === item.id, voided: isVoided(item.status), hovering: hoverRequirementId === item.id }"
                :style="{ gridTemplateColumns: issueGridTemplate }"
                tabindex="0"
                @click="openRequirement(item, 'detail')"
                @mouseenter="hoverRequirementId = item.id"
                @focus="hoverRequirementId = item.id"
                @mouseleave="hoverRequirementId = hoverRequirementId === item.id ? null : hoverRequirementId"
                @blur="hoverRequirementId = hoverRequirementId === item.id ? null : hoverRequirementId"
              >
                <div class="issue-identity">
                  <div class="title-line">
                    <div class="title-text" :class="{ striked: isVoided(item.status) }">{{ item.title }}</div>
                    <div class="title-flags">
                      <span v-if="item.isDirect === 1" class="meta-text muted">直接创建</span>
                    </div>
                  </div>
                  <span class="req-no">{{ item.reqNo }}</span>
                </div>

                <div v-if="showTypeTag" class="issue-property" @click.stop><LnPropertyPicker :model-value="item.reqType || ''" title="修改需求类型" :options="linearReqTypeOptions" @update:model-value="(val) => handleInlineSave(item.id, 'reqType', val)" /></div>
                <div v-if="showBusinessLineTag" class="issue-property" @click.stop><LnPropertyPicker :model-value="String(item.businessLineId || '')" title="修改业务线" :options="linearBusinessLineOptions" @update:model-value="(val) => handleInlineSave(item.id, 'businessLineId', val ? Number(val) : null)" /></div>
                <div v-if="showStatusTag" class="issue-property" @click.stop><LnPropertyPicker :model-value="item.status || ''" title="修改状态" :options="linearStatusOptions" @update:model-value="(val) => handleInlineSave(item.id, 'status', val)" /></div>
                <div v-if="showPriorityTag" class="issue-property" @click.stop><LnPropertyPicker :model-value="item.priority || ''" title="修改优先级" :options="linearPriorityOptions" @update:model-value="(val) => handleInlineSave(item.id, 'priority', val)" /></div>
                <div v-if="showHandlerTag" class="issue-property" @click.stop><LnPropertyPicker :model-value="item.handler || ''" title="修改处理人" :options="linearHandlerOptions" @update:model-value="(val) => handleInlineSave(item.id, 'handler', val)" /></div>
                <div v-if="showSprintTag" class="issue-property" @click.stop><LnPropertyPicker :model-value="String(item.sprintId || '')" title="修改迭代" :options="linearSprintOptions" @update:model-value="(val) => handleInlineSave(item.id, 'sprintId', val ? Number(val) : null)" /></div>
                <div v-if="showParentTag" class="issue-reference" @click.stop>
                  <LnButton
                    v-if="item.rawReqId && item.isDirect !== 1"
                    class="tag-link"
                    size="small"
                    variant="ghost"
                    :title="`预览原始需求：${item.rawReqTitle || `RAW-${item.rawReqId}`}`"
                    @click.stop="openRawPreview(item.rawReqId)"
                  >
                    {{ item.rawReqTitle || `RAW-${item.rawReqId}` }}
                  </LnButton>
                  <span v-else class="empty-cell">—</span>
                </div>
                <div v-if="showPrdTag" class="issue-document" @click.stop>
                  <LnButton v-if="item.prdUrl" class="tag-link prd-link" size="small" variant="ghost" :href="item.prdUrl" target="_blank" rel="noopener noreferrer" title="打开 PRD" @click.stop><template #icon><LnIcon name="external-link"/></template>PRD</LnButton>
                  <span v-else class="empty-cell">—</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <LnEmptyState v-if="tableData.length === 0 && !loading" title="没有匹配的产品需求" description="筛选、搜索或视图切换后没有匹配结果，列表分组结构会保持不变。"><LnButton v-if="hasActiveFilters" size="small" variant="ghost" @click="clearFilters">清空筛选</LnButton></LnEmptyState>

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
            <div v-if="activeRequirementLoading" class="peek-loading" aria-label="正在加载产品需求详情">
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
                    <LnButton v-if="route.query.from === 'kanban'" size="small" variant="ghost" @click="returnToKanban">← 返回看板</LnButton>
                    <LnButton v-if="previewMode === 'peek'" size="small" variant="primary" @click="previewMode = 'detail'">详情</LnButton><LnButton size="small" icon-only variant="ghost" aria-label="关闭" @click="closeRequirement"><template #icon><LnIcon name="close"/></template></LnButton>
                  </div>
                </div>
                <div class="peek-tags">
                  <span class="status-tag" :class="getStatusClass(activeRequirementDetail.status)">{{ getProductStatusLabel(activeRequirementDetail.status, activeRequirementDetail.statusName) }}</span>
                  <span class="priority-pill">{{ PRIORITY_MAP[activeRequirementDetail.priority] || activeRequirementDetail.priority || '-' }}</span>
                  <span v-if="activeRequirementDetail.isDirect === 1" class="meta-chip muted">直接创建</span>
                </div>
                <div class="peek-meta-line">
                  <span class="peek-meta-item">更新 {{ formatDateTime(activeRequirementDetail.updateTime) }}</span>
                  <span class="peek-meta-sep">·</span>
                  <span class="peek-meta-item">创建 {{ formatDateTime(activeRequirementDetail.createTime) }}</span>
                  <span class="peek-meta-sep">·</span>
                  <span class="peek-meta-item">处理人 {{ activeRequirementDetail.handler || '-' }}</span>
                </div>
              </div>

              <div class="story-stack">
                <section class="story-block primary-story">
                  <div class="story-kicker">用户故事</div>
                  <div class="story-copy" v-html="renderRichText(activeRequirementDetail.description)"></div>
                </section>
                <section class="story-block">
                  <div class="story-kicker">产品经理分析</div>
                  <ul class="analysis-points">
                    <li>需求类型：{{ activeRequirementDetail.reqType || '待补充' }}</li>
                    <li>功能边界：{{ activeRequirementDetail.productModule || '待明确' }}</li>
                    <li>交付判断：{{ activeRequirementDetail.sprintName ? `已进入 ${activeRequirementDetail.sprintName}` : '尚未排期' }}</li>
                  </ul>
                </section>
                <section class="story-block muted-story">
                  <div class="story-kicker">原始需求追加说明</div>
                  <p>{{ activeRequirementDetail.supplements?.[0]?.content || (activeRequirementDetail.rawReqTitle ? `来自「${activeRequirementDetail.rawReqTitle}」，请结合父需求业务判定继续补充。` : '直接创建的产品需求，暂无上游追加说明。') }}</p>
                </section>
              </div>

              <div class="peek-facts wb-detail-facts">
                <div class="peek-fact wb-detail-fact">
                  <span>业务线</span>
                  <strong>{{ activeRequirementDetail.businessLineName || '-' }}</strong>
                </div>
                <div class="peek-fact wb-detail-fact">
                  <span>迭代</span>
                  <strong>{{ activeRequirementDetail.sprintName || '未关联' }}</strong>
                </div>
                <div class="peek-fact wb-detail-fact">
                  <span>功能模块</span>
                  <strong>{{ activeRequirementDetail.productModule || '-' }}</strong>
                </div>
                <div class="peek-fact wb-detail-fact">
                  <span>负责人</span>
                  <strong>{{ activeRequirementDetail.assigneeName || '-' }}</strong>
                </div>
              </div>

              <div class="peek-section wb-section surface-section primary-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">关键信息</div>
                  <div class="peek-section-note wb-section-note">推进时最常改的基础字段直接在这里维护。</div>
                </div>
                <div class="peek-grid">
                  <div class="peek-item">
                    <span>业务线</span>
                    <div class="peek-editable">
                      <LnPropertyPicker :model-value="String(activeRequirementDetail.businessLineId || '')" title="修改业务线" :options="linearBusinessLineOptions" @update:model-value="(val) => handleDetailSave('businessLineId', val ? Number(val) : null)" />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>当前状态</span>
                    <div class="peek-editable">
                      <LnPropertyPicker :model-value="activeRequirementDetail.status || ''" title="修改状态" :options="linearStatusOptions" @update:model-value="(val) => handleDetailSave('status', val)" />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>优先级</span>
                    <div class="peek-editable">
                      <LnPropertyPicker :model-value="activeRequirementDetail.priority || ''" title="修改优先级" :options="linearPriorityOptions" @update:model-value="(val) => handleDetailSave('priority', val)" />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>需求类型</span>
                    <div class="peek-editable">
                      <LnPropertyPicker :model-value="activeRequirementDetail.reqType || ''" title="修改需求类型" :options="linearReqTypeOptions" @update:model-value="(val) => handleDetailSave('reqType', val)" />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>功能模块</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.productModule"
                        type="text"
                        placeholder="待补充"
                        @save="(val) => handleDetailSave('productModule', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>处理人</span>
                    <div class="peek-editable">
                      <LnPropertyPicker :model-value="activeRequirementDetail.handler || ''" title="修改处理人" :options="linearHandlerOptions" @update:model-value="(val) => handleDetailSave('handler', val)" />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>迭代版本</span>
                    <div class="peek-editable">
                      <LnPropertyPicker :model-value="String(activeRequirementDetail.sprintId || '')" title="修改迭代" placeholder="未关联" :options="linearSprintOptions" @update:model-value="(val) => handleDetailSave('sprintId', val ? Number(val) : null)" />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>期望日期</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.expectedDate"
                        type="date"
                        @save="(val) => handleDetailSave('expectedDate', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>PRD 地址</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.prdUrl"
                        type="text"
                        placeholder="待补充"
                        @save="(val) => handleDetailSave('prdUrl', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item">
                    <span>设计文档</span>
                    <div class="peek-editable">
                      <EditableField
                        :value="activeRequirementDetail.designDocUrl"
                        type="text"
                        placeholder="待补充"
                        @save="(val) => handleDetailSave('designDocUrl', val)"
                      />
                    </div>
                  </div>
                  <div class="peek-item"><span>创建人</span><strong>{{ activeRequirementDetail.createByName || activeRequirementDetail.creator || '-' }}</strong></div>
                  <div class="peek-item"><span>负责人</span><strong>{{ activeRequirementDetail.assigneeName || '-' }}</strong></div>
                </div>
              </div>

              <div class="peek-section wb-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">详细说明</div>
                  <div class="peek-section-note wb-section-note">正文与图片都在这里连续阅读。</div>
                </div>
                <div class="peek-rich-text" v-html="renderRichText(activeRequirementDetail.description)"></div>
                <div class="peek-inline-actions">
                  <LnButton size="small" variant="ghost" @click="openDescriptionEditor(activeRequirementDetail.id, activeRequirementDetail.description)">编辑描述</LnButton>
                </div>
              </div>

              <div class="peek-section wb-section relation-section surface-section soft-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">关联信息</div>
                  <div class="peek-section-note wb-section-note">把父需求、时间和价值信息放在同一段关系上下文里。</div>
                </div>
                <div class="peek-grid">
                  <div class="peek-item">
                    <span>父原始需求</span>
                    <strong v-if="activeRequirementDetail.rawReqId && !activeRequirementDetail.isDirect">{{ activeRequirementDetail.rawReqTitle || `RAW-${activeRequirementDetail.rawReqId}` }}</strong>
                    <strong v-else>直接创建，无父原始需求</strong>
                  </div>
                  <div class="peek-item"><span>工作量</span><strong>{{ activeRequirementDetail.workload || '-' }}</strong></div>
                  <div class="peek-item"><span>价值评分</span><strong>{{ activeRequirementDetail.valueScore || '-' }}</strong></div>
                  <div class="peek-item"><span>实际上线日期</span><strong>{{ activeRequirementDetail.actualOnlineDate || '-' }}</strong></div>
                  <div class="peek-item"><span>创建时间</span><strong>{{ formatDateTime(activeRequirementDetail.createTime) }}</strong></div>
                  <div class="peek-item"><span>更新时间</span><strong>{{ formatDateTime(activeRequirementDetail.updateTime) }}</strong></div>
                </div>
              </div>

              <div class="peek-section wb-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">补充记录</div>
                  <div class="peek-section-note wb-section-note">按时间顺序持续追加说明。</div>
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
                <div v-else class="peek-empty-copy">暂无补充记录</div>
              </div>

              <div v-if="previewMode === 'detail'" class="peek-section wb-section action-section">
                <div class="peek-section-head wb-section-head">
                  <div class="peek-section-title wb-section-title">动作</div>
                  <div class="peek-section-note wb-section-note">保留当前对象的关键动作。</div>
                </div>
                <div class="peek-actions">
                  <LnButton v-if="canEditProduct && !isVoided(activeRequirementDetail.status)" @click="handleEditFromDetail">编辑基础信息</LnButton>
                  <LnButton v-if="canCreateProduct && activeRequirementDetail.rawReqId" variant="secondary" @click="handleCreateFromDetail">继续拆分</LnButton>
                  <LnButton variant="ghost" @click="openSupplementDialog">添加补充</LnButton>
                  <LnButton
                    v-if="activeRequirementDetail.rawReqId && !activeRequirementDetail.isDirect"
                    variant="ghost"
                    @click="openRawPreview(activeRequirementDetail.rawReqId)"
                  >
                    查看父原始需求
                  </LnButton>
                  <LnButton v-if="canEditProduct && !isVoided(activeRequirementDetail.status)" variant="danger" @click="handleVoidFromDetail">作废需求</LnButton>
                </div>
              </div>
            </template>
          </div>
        </template>

      </aside>
    </section>

    <LnDrawer v-model="rawDrawerVisible" width="640px" aria-label="原始需求预览">
      <template #header>
        <div v-if="rawDrawerData" class="drawer-header">
          <div class="drawer-id">{{ rawDrawerData.reqNo }}</div>
          <div class="drawer-title">{{ rawDrawerData.title }}</div>
          <div class="drawer-tags">
            <span class="status-tag">{{ rawDrawerData.statusName || rawDrawerData.status }}</span>
            <span class="priority-pill">{{ rawDrawerData.priority || '-' }}</span>
            <span class="meta-chip">{{ rawDrawerData.businessLineName || rawDrawerData.businessLine || '未归类' }}</span>
          </div>
        </div>
      </template>
      <div v-if="rawDrawerData" class="raw-drawer-body">
        <div class="drawer-section">
          <div class="detail-title">概览</div>
          <div class="drawer-grid">
            <div class="detail-card">
              <div class="detail-title">当前状态</div>
              <div class="detail-value">{{ rawDrawerData.statusName || rawDrawerData.status }}</div>
            </div>
            <div class="detail-card">
              <div class="detail-title">优先级</div>
              <div class="detail-value">{{ rawDrawerData.priority || '-' }}</div>
            </div>
            <div class="detail-card">
              <div class="detail-title">业务线</div>
              <div class="detail-value">{{ rawDrawerData.businessLineName || rawDrawerData.businessLine || '-' }}</div>
            </div>
            <div class="detail-card">
              <div class="detail-title">期望上线</div>
              <div class="detail-value">{{ rawDrawerData.expectedOnlineDate ? rawDrawerData.expectedOnlineDate.substring(0, 10) : '-' }}</div>
            </div>
          </div>
        </div>

        <div class="drawer-section">
          <div class="detail-title">需求描述</div>
          <div class="drawer-paragraph">{{ rawDrawerData.description || '-' }}</div>
        </div>
      </div>
    </LnDrawer>

    <LnDialog v-model="createDialogVisible" :title="editingProductId ? '编辑产品需求' : '新建产品需求'" description="完善需求范围、归属和交付上下文。" width="680px" :close-on-backdrop="false">
      <LnForm ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <LnFormItem label="需求标题" prop="title">
          <LnInput v-model="createForm.title" placeholder="输入产品需求标题" />
        </LnFormItem>
        <LnFormItem label="需求描述" prop="description">
          <LnRichTextEditor
            v-model="createForm.description"
            placeholder="补充需求背景、目标和范围，便于后续推进。支持插入图片、粘贴截图和基础格式化。"
          />
        </LnFormItem>
        <div class="form-row">
          <LnFormItem label="优先级" prop="priority">
            <LnSelect v-model="createForm.priority" :options="linearPriorityOptions" placeholder="请选择" />
          </LnFormItem>
          <LnFormItem label="业务线" prop="businessLineId">
            <LnSelect v-model="createBusinessLineValue" :options="linearBusinessLineOptions" placeholder="请选择" searchable />
          </LnFormItem>
        </div>
        <div class="form-row">
          <LnFormItem label="需求类型" prop="reqType">
            <LnSelect v-model="createForm.reqType" :options="linearReqTypeOptions" placeholder="请选择" />
          </LnFormItem>
          <LnFormItem label="功能模块" prop="productModule">
            <LnInput v-model="createForm.productModule" placeholder="如：支付中心 / 消息通知 / 供应商管理" />
          </LnFormItem>
        </div>
        <div class="form-row">
          <LnFormItem label="迭代版本" prop="sprintId">
            <LnSelect v-model="createSprintValue" :options="linearSprintOptions" placeholder="暂不关联" searchable clearable />
          </LnFormItem>
          <LnFormItem label="期望上线时间" prop="expectedDate">
            <LnDateInput v-model="createForm.expectedDate" clearable />
          </LnFormItem>
        </div>
        <div class="form-row">
          <LnFormItem label="负责人 / 处理人" prop="handler">
            <LnSelect v-model="createForm.handler" :options="linearHandlerOptions" placeholder="请选择" searchable />
          </LnFormItem>
          <LnFormItem label="PRD 地址" prop="prdUrl">
            <LnInput v-model="createForm.prdUrl" placeholder="输入 PRD 文档链接" />
          </LnFormItem>
        </div>
      </LnForm>
      <template #footer>
        <LnButton variant="ghost" @click="createDialogVisible = false">取消</LnButton>
        <LnButton variant="primary" :loading="submitLoading" @click="handleSubmitCreate">{{ editingProductId ? '保存' : '创建' }}</LnButton>
      </template>
    </LnDialog>

    <LnDialog v-model="descriptionDialogVisible" title="编辑需求描述" description="补充背景、目标、范围和必要附件。" width="760px" :close-on-backdrop="false">
      <LnRichTextEditor
        v-model="descriptionDraft"
        placeholder="支持插入图片、粘贴截图和基础格式化。"
      />
      <template #footer>
        <LnButton variant="ghost" @click="descriptionDialogVisible = false">取消</LnButton>
        <LnButton variant="primary" @click="saveDescriptionEdit">保存</LnButton>
      </template>
    </LnDialog>

    <SupplementDialog
      v-model:visible="supplementDialogVisible"
      req-type="product"
      :requirement-id="activeRequirementId || 0"
      @success="handleSupplementSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  pageQueryProductRequirements,
  createProductRequirement,
  updateProductRequirement,
  voidProductRequirement,
  getProductRequirementDetail,
  getProductRequirementSupplements,
} from '@/api/product-requirement'
import { getRawRequirementDetail } from '@/api/raw-requirement'
import { listDictData } from '@/api/dict'
import { listSprintOptions } from '@/api/sprint'
import EditableField from '@/components/EditableField.vue'
import SupplementDialog from '@/components/requirement/SupplementDialog.vue'
import { lnToast, LnButton, LnCheckbox, LnDateInput, LnDialog, LnDrawer, LnEmptyState, LnForm, LnFormItem, LnIcon, LnInput, LnPagination, LnPopover, LnPropertyPicker, LnRichTextEditor, LnSelect, LnSkeleton, LnTabs, type LnFormInstance, type LnFormRules, type LnOption, type LnTabOption } from '@/components/linear'
import type {
  ProductRequirementListVO,
  ProductRequirementCreateDTO,
  ProductRequirementUpdateDTO,
  ProductRequirementDetailVO,
  DictDataVO,
  RawRequirementDetailVO,
  SupplementVO,
} from '@/types/requirement'
import { PRODUCT_STATUS_MAP, PRIORITY_MAP } from '@/types/requirement'
import { sanitizeRichText } from '@/utils/rich-text'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const canCreateProduct = computed(() => userStore.hasAnyPermission(['product-pool:add']))
const canEditProduct = computed(() => userStore.hasAnyPermission(['product-pool:edit', 'product-pool:filter', 'product-pool:judge']))

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
const showFilter = ref(false)
const showDisplaySettings = ref(false)
const densityOptions: LnOption[] = [{ label: '紧凑', value: 'compact' }, { label: '舒适', value: 'comfortable' }]
const listDensity = ref('compact')
const showTypeTag = ref(true)
const showBusinessLineTag = ref(true)
const showStatusTag = ref(true)
const showPriorityTag = ref(true)
const showHandlerTag = ref(true)
const showSprintTag = ref(true)
const showParentTag = ref(true)
const showPrdTag = ref(true)
const collapsedGroupKeys = ref<Set<string>>(new Set())

const issueColumns = computed(() => [
  { visible: true, width: 320 },
  { visible: showTypeTag.value, width: 104 },
  { visible: showBusinessLineTag.value, width: 112 },
  { visible: showStatusTag.value, width: 104 },
  { visible: showPriorityTag.value, width: 104 },
  { visible: showHandlerTag.value, width: 104 },
  { visible: showSprintTag.value, width: 116 },
  { visible: showParentTag.value, width: 168 },
  { visible: showPrdTag.value, width: 64 },
].filter((column) => column.visible))

const issueGridTemplate = computed(() =>
  issueColumns.value.map((column, index) => index === 0 ? 'minmax(280px, 1fr)' : `${column.width}px`).join(' '),
)

const issueGridMinWidth = computed(() => {
  const contentWidth = issueColumns.value.reduce((sum, column) => sum + column.width, 0)
  const gapsWidth = Math.max(0, issueColumns.value.length - 1) * 12
  return `${Math.max(760, contentWidth + gapsWidth + 24)}px`
})

const activeRequirementId = ref<number | null>(null)
const previewMode = ref<'peek' | 'detail'>('peek')
const activeRequirementLoading = ref(false)
const activeRequirementDetail = ref<ProductRequirementDetailVO | null>(null)
const hoverRequirementId = ref<number | null>(null)
const spacePreviewCandidateId = ref<number | null>(null)
const spacePreviewRestoreId = ref<number | null>(null)
const spacePreviewOpenedByHold = ref(false)
let spacePreviewTimer: number | null = null
const supplementDialogVisible = ref(false)

const dictPriorityOptions = ref<DictDataVO[]>([])
const dictBusinessLineOptions = ref<DictDataVO[]>([])
const dictReqTypeOptions = ref<DictDataVO[]>([])
const dictSprintOptions = ref<{ id: number; name: string }[]>([])
const dictHandlerOptions = ref<DictDataVO[]>([])

const riskCount = ref(0)

const rawDrawerVisible = ref(false)
const rawDrawerData = ref<RawRequirementDetailVO | null>(null)

const createDialogVisible = ref(false)
const submitLoading = ref(false)
const createTargetStatus = ref('pending_design')
const createRequestId = ref('')
const createFormRef = ref<LnFormInstance>()
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
  expectedDate: undefined,
  rawReqId: undefined,
})

const createRules: LnFormRules = {
  title: [{ required: true, message: '请输入需求标题', trigger: 'blur' }],
}

const productStatusSelectOptions: LnOption[] = [
  { value: 'backlog', label: '待规划', color: '#9b9ba4', icon: 'pending' },
  { value: 'researching', label: '调研中', color: '#d28b36', icon: 'pending' },
  { value: 'pending_design', label: '待设计', color: '#d28b36', icon: 'pending' },
  { value: 'designing', label: '设计中', color: '#5e6ad2', icon: 'progress' },
  { value: 'developing', label: '开发中', color: '#5e6ad2', icon: 'progress' },
  { value: 'testing', label: '测试中', color: '#5e6ad2', icon: 'progress' },
  { value: 'online', label: '已上线', color: '#2f9e6f', icon: 'success' },
  { value: 'accepted', label: '已验收', color: '#2f9e6f', icon: 'check' },
  { value: 'rejected', label: '验收不通过', color: '#d05757', icon: 'blocked' },
  { value: 'suspended', label: '已暂停', color: '#d28b36', icon: 'paused' },
  { value: 'closed', label: '已关闭', color: '#6f6f78', icon: 'closed' },
]

const priorityVisuals: Record<string, Pick<LnOption, 'color' | 'icon'>> = {
  P0: { color: '#d05757', icon: 'priority' }, P1: { color: '#d28b36', icon: 'priority' },
  P2: { color: '#5e6ad2', icon: 'priority' }, P3: { color: '#6f6f78', icon: 'priority' },
}
const linearStatusOptions = productStatusSelectOptions
const linearPriorityOptions = computed<LnOption[]>(() => dictPriorityOptions.value.map(item => ({ label:item.label,value:item.value,...priorityVisuals[item.value] })))
const linearBusinessLineOptions = computed<LnOption[]>(() => [
  { label:'未设置',value:'',icon: 'none' }, ...dictBusinessLineOptions.value.map(item => ({ label:item.label,value:String(item.id),icon: 'business' })),
])
const linearReqTypeOptions = computed<LnOption[]>(() => [
  { label:'未设置',value:'',icon: 'none' }, ...dictReqTypeOptions.value.map(item => ({ label:item.label,value:item.value,icon: 'type' })),
])
const linearSprintOptions = computed<LnOption[]>(() => [
  { label:'未关联',value:'',icon: 'none' }, ...dictSprintOptions.value.map(item => ({ label:item.name,value:String(item.id),icon: 'sprint' })),
])
const linearHandlerOptions = computed<LnOption[]>(() => [
  { label:'未分配',value:'',icon: 'none' }, ...dictHandlerOptions.value.map(item => ({ label:item.label,value:item.value,icon: 'user' })),
])
const queryBusinessLineId = computed({ get:()=>queryForm.businessLineId ? String(queryForm.businessLineId) : '', set:(value:string)=>{ queryForm.businessLineId=normalizeOptionalNumber(value) } })
const querySprintId = computed({ get:()=>queryForm.sprintId ? String(queryForm.sprintId) : '', set:(value:string)=>{ queryForm.sprintId=normalizeOptionalNumber(value) } })
const createBusinessLineValue = computed({ get:()=>createForm.businessLineId ? String(createForm.businessLineId) : '', set:(value:string)=>{ createForm.businessLineId=normalizeOptionalNumber(value) } })
const createSprintValue = computed({ get:()=>createForm.sprintId ? String(createForm.sprintId) : '', set:(value:string)=>{ createForm.sprintId=normalizeOptionalNumber(value) } })

const activeView = ref('all')
const groupingMode = ref<'status' | 'parent'>('status')
const productViews = [
  { key: 'all', label: '全部产品需求' },
  { key: 'unscheduled', label: '未排期' },
  { key: 'pending', label: '待设计' },
  { key: 'developing', label: '开发中' },
  { key: 'current', label: '本迭代' },
]
const productViewOptions = computed<LnTabOption[]>(() => productViews.map((view) => ({ label: view.label, value: view.key, count: view.key === 'unscheduled' ? riskCount.value : undefined })))
const groupingOptions: LnTabOption[] = [{ label: '按状态', value: 'status' }, { label: '按原始需求', value: 'parent' }]

const groupedRequirements = computed(() => {
  const definitions = [
    { key: 'todo', label: 'Todo', tone: 'todo', createStatus: 'pending_design', statuses: ['backlog', 'researching', 'pending_design'] },
    { key: 'active', label: 'Active', tone: 'progress', createStatus: 'designing', statuses: ['designing', 'developing', 'testing'] },
    { key: 'done', label: 'Done', tone: 'done', createStatus: 'online', statuses: ['online', 'accepted'] },
    { key: 'blocked', label: 'Blocked', tone: 'blocked', createStatus: 'rejected', statuses: ['rejected', 'suspended'] },
    { key: 'voided', label: 'Voided', tone: 'closed', createStatus: 'closed', statuses: ['closed'] },
  ]

  return definitions
    .map((definition) => ({
      ...definition,
      items: tableData.value.filter((item) => definition.statuses.includes(String(item.status || '').toLowerCase())),
    }))
})

const parentGroupedRequirements = computed(() => {
  const groups = new Map<string, ProductRequirementListVO[]>()
  tableData.value.forEach((item) => {
    const key = item.isDirect === 1 || !item.rawReqId ? 'direct' : `raw-${item.rawReqId}`
    const existing = groups.get(key) || []
    existing.push(item)
    groups.set(key, existing)
  })

  return Array.from(groups.entries()).map(([key, items]) => ({
    key,
    label: key === 'direct' ? '直接创建' : items[0]?.rawReqTitle || `原始需求 RAW-${items[0]?.rawReqId}`,
    tone: key === 'direct' ? 'todo' : 'progress',
    createStatus: 'pending_design',
    items,
  }))
})

const displayedRequirementGroups = computed(() =>
  groupingMode.value === 'parent' ? parentGroupedRequirements.value : groupedRequirements.value,
)

function setDisplaySettingsOpen(open: boolean) { showDisplaySettings.value = open; if (open) showFilter.value = false }

function selectProductView(key: string) {
  activeView.value = key
  queryForm.status = ''
  queryForm.unscheduled = undefined
  queryForm.sprintId = undefined

  if (key === 'unscheduled') queryForm.unscheduled = true
  if (key === 'pending') queryForm.status = 'pending_design'
  if (key === 'developing') queryForm.status = 'developing'
  if (key === 'current') queryForm.sprintId = dictSprintOptions.value[0]?.id
  handleSearch()
}

function selectGroupingMode(value: string) {
  groupingMode.value = value as 'status' | 'parent'
  collapsedGroupKeys.value = new Set()
}

function isGroupCollapsed(key: string): boolean {
  return collapsedGroupKeys.value.has(key)
}

function toggleGroup(key: string) {
  const nextKeys = new Set(collapsedGroupKeys.value)
  if (nextKeys.has(key)) nextKeys.delete(key)
  else nextKeys.add(key)
  collapsedGroupKeys.value = nextKeys
}

const hasActiveFilters = computed(() => {
  return !!(
    queryForm.status ||
    queryForm.priority ||
    queryForm.businessLineId ||
    queryForm.sprintId ||
    queryForm.keyword ||
    queryForm.reqType ||
    queryForm.handler ||
    queryForm.unscheduled
  )
})

function getStatusClass(status: string): string {
  if (status === 'pending_design' || status === 'PENDING_DESIGN') return 'status-filter'
  if (status === 'designing' || status === 'DESIGNING') return 'status-dispatch'
  if (status === 'developing' || status === 'DEVELOPING') return 'status-dispatch'
  if (status === 'online' || status === 'ONLINE') return 'status-dispatch'
  if (status === 'suspended' || status === 'SUSPENDED' || status === 'closed' || status === 'CLOSED') return 'status-hold'
  return 'status-filter'
}

function getProductStatusLabel(status?: string, statusName?: string): string {
  const normalized = String(status || '').toLowerCase()
  const labels: Record<string, string> = {
    backlog: '待设计',
    researching: '待设计',
    pending_design: '待设计',
    designing: '设计中',
    developing: '开发中',
    testing: '测试中',
    online: '已上线',
    accepted: '已验收',
    rejected: '验收不通过',
    closed: '作废',
    suspended: '已暂停',
  }
  return labels[normalized] || PRODUCT_STATUS_MAP[status || ''] || statusName || status || '-'
}

function renderRichText(content?: string): string {
  return sanitizeRichText(content) || '<span style="color: #8e8e93;">暂无描述</span>'
}

function isVoided(status?: string): boolean {
  return status === 'closed' || status === 'CLOSED'
}

function normalizeOptionalNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined
  const nextValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(nextValue) ? nextValue : undefined
}

function formatDateTime(value?: string): string {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

async function loadData() {
  loading.value = true
  try {
    const res = await pageQueryProductRequirements(queryForm)
    const data = res.data
    tableData.value = data.list || []
    total.value = data.total || 0
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
    // ignore
  }
}

async function loadDictData() {
  try {
    const [priorityRes, bizRes, typeRes, handlerRes, sprintRes] = await Promise.all([
      listDictData('priority_level'),
      listDictData('business_line'),
      listDictData('req_type'),
      listDictData('product_manager'),
      listSprintOptions(),
    ])
    dictPriorityOptions.value = (priorityRes as any).data || []
    dictBusinessLineOptions.value = (bizRes as any).data || []
    dictReqTypeOptions.value = (typeRes as any).data || []
    dictHandlerOptions.value = (handlerRes as any).data || []
    dictSprintOptions.value = (sprintRes as any).data || []
  } catch {
    // ignore
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

async function openRawPreview(rawReqId: number) {
  if (!rawReqId) return
  closeRequirement()
  showFilter.value = false
  showDisplaySettings.value = false
  try {
    const res = await getRawRequirementDetail(rawReqId)
    rawDrawerData.value = res.data as RawRequirementDetailVO
    rawDrawerVisible.value = true
  } catch {
    lnToast.error('加载原始需求详情失败')
  }
}

async function openRequirement(item: ProductRequirementListVO, mode: 'peek' | 'detail' = 'detail') {
  rawDrawerVisible.value = false
  createDialogVisible.value = false
  descriptionDialogVisible.value = false
  supplementDialogVisible.value = false
  showFilter.value = false
  showDisplaySettings.value = false
  previewMode.value = mode
  activeRequirementId.value = item.id
  activeRequirementLoading.value = true
  try {
    const [detailRes, supsRes] = await Promise.all([
      getProductRequirementDetail(item.id),
      getProductRequirementSupplements(item.id),
    ])
    activeRequirementDetail.value = {
      ...(detailRes.data as ProductRequirementDetailVO),
      supplements: (supsRes.data as SupplementVO[]) || [],
    }
  } catch {
    lnToast.error('加载产品需求详情失败')
  } finally {
    activeRequirementLoading.value = false
  }
}

function closeRequirement() {
  activeRequirementId.value = null
  activeRequirementDetail.value = null
  previewMode.value = 'peek'
}

function returnToKanban() {
  let query: Record<string, string> = {}
  try {
    const context = JSON.parse(sessionStorage.getItem('kanban-return-context') || '{}')
    query = Object.fromEntries(
      Object.entries(context)
        .filter(([key, value]) => key !== 'scrollLeft' && value !== '' && value != null)
        .map(([key, value]) => [key, String(value)]),
    )
  } catch {
    query = {}
  }
  void router.push({ path: '/kanban', query })
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

function handleCreate(status = 'pending_design') {
  if (!canCreateProduct.value) return
  createTargetStatus.value = status
  createRequestId.value = crypto.randomUUID()
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
    expectedDate: undefined,
    rawReqId: undefined,
  })
  createDialogVisible.value = true
}

function handleCreateFromRaw(item: ProductRequirementListVO) {
  if (!canCreateProduct.value || !item.rawReqId) return
  createTargetStatus.value = 'pending_design'
  createRequestId.value = crypto.randomUUID()
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
    expectedDate: item.expectedDate || undefined,
    rawReqId: item.rawReqId,
  })
  createDialogVisible.value = true
}

function handleEdit(item: ProductRequirementListVO) {
  if (!canEditProduct.value) return
  createRequestId.value = ''
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
    expectedDate: item.expectedDate || undefined,
    rawReqId: item.rawReqId || undefined,
  })
  createDialogVisible.value = true
}

function handleEditFromDetail() {
  if (!activeRequirementId.value) return
  const row = tableData.value.find((item) => item.id === activeRequirementId.value)
  if (row) handleEdit(row)
}

function handleCreateFromDetail() {
  if (!activeRequirementId.value) return
  const row = tableData.value.find((item) => item.id === activeRequirementId.value)
  if (row) handleCreateFromRaw(row)
}

async function handleSubmitCreate() {
  if (!canCreateProduct.value || submitLoading.value) return
  const form = createFormRef.value
  if (!form) return
  submitLoading.value = true
  try {
    const valid = await form.validate().catch(() => false)
    if (!valid) return
    const payload = {
      ...createForm,
      businessLineId: normalizeOptionalNumber(createForm.businessLineId),
      sprintId: normalizeOptionalNumber(createForm.sprintId),
      description: sanitizeRichText(createForm.description),
      isDirect: createForm.rawReqId ? 0 : 1,
      creator: '当前用户',
      status: createTargetStatus.value,
      ...(!editingProductId.value && createRequestId.value
        ? { clientRequestId: createRequestId.value }
        : {}),
    }
    if (editingProductId.value) {
      await updateProductRequirement(editingProductId.value, payload)
      lnToast.success('已更新产品需求')
    } else {
      await createProductRequirement(payload)
      lnToast.success('已创建产品需求')
    }
    createDialogVisible.value = false
    editingProductId.value = null
    await Promise.all([loadData(), loadStats()])
  } finally {
    submitLoading.value = false
  }
}

function openDescriptionEditor(id: number, description?: string) {
  editingDescriptionId.value = id
  descriptionDraft.value = description || ''
  descriptionDialogVisible.value = true
}

async function saveDescriptionEdit() {
  if (!canEditProduct.value || !editingDescriptionId.value) return
  try {
    const description = sanitizeRichText(descriptionDraft.value)
    await updateProductRequirement(editingDescriptionId.value, { description })
    lnToast.success('需求描述已更新')
    const row = tableData.value.find((item) => item.id === editingDescriptionId.value)
    if (row) row.description = description
    if (activeRequirementDetail.value?.id === editingDescriptionId.value) {
      activeRequirementDetail.value.description = description
    }
    descriptionDialogVisible.value = false
  } catch {
    // ignore
  }
}

async function handleInlineSave(id: number, field: string, value: any) {
  if (!canEditProduct.value) return
  try {
    const payload: ProductRequirementUpdateDTO = {}
    if (field === 'sprintId') {
      ;(payload as any)[field] = value === '' || value === null || value === undefined ? 0 : normalizeOptionalNumber(value)
    } else {
      ;(payload as any)[field] = ['businessLineId', 'assigneeId'].includes(field) ? normalizeOptionalNumber(value) : value
    }

    await updateProductRequirement(id, payload)
    lnToast.success('保存成功')

    const row = tableData.value.find((item) => item.id === id)
    if (row) {
      ;(row as any)[field] = value
      if (field === 'businessLineId') {
        const option = dictBusinessLineOptions.value.find((item) => item.id === Number(value))
        row.businessLineId = Number(value)
        row.businessLineName = option?.label || row.businessLineName
      }
      if (field === 'sprintId') {
        const sprint = dictSprintOptions.value.find((item) => item.id === Number(value))
        row.sprintId = Number(value)
        row.sprintName = sprint?.name || ''
      }
      if (field === 'status') {
        const option = productStatusSelectOptions.find((item) => item.value === value)
        row.statusName = option?.label || row.statusName
      }
    }

    if (activeRequirementDetail.value?.id === id) {
      ;(activeRequirementDetail.value as any)[field] = value
      if (field === 'businessLineId') {
        const option = dictBusinessLineOptions.value.find((item) => item.id === Number(value))
        activeRequirementDetail.value.businessLineId = Number(value)
        activeRequirementDetail.value.businessLineName = option?.label || activeRequirementDetail.value.businessLineName
      }
      if (field === 'sprintId') {
        const sprint = dictSprintOptions.value.find((item) => item.id === Number(value))
        activeRequirementDetail.value.sprintId = Number(value)
        activeRequirementDetail.value.sprintName = sprint?.name || ''
      }
      if (field === 'status') {
        const option = productStatusSelectOptions.find((item) => item.value === value)
        activeRequirementDetail.value.statusName = option?.label || activeRequirementDetail.value.statusName
      }
    }

    if (field === 'sprintId') {
      await loadStats()
    }
  } catch {
    // ignore
  }
}

async function handleDetailSave(field: string, value: any) {
  if (!activeRequirementDetail.value) return
  await handleInlineSave(activeRequirementDetail.value.id, field, value)
}

async function handleVoid(item: ProductRequirementListVO) {
  if (!canEditProduct.value) return
  try {
    await voidProductRequirement(item.id, `作废子产品需求: ${item.title}`)
    lnToast.success('产品需求已作废')
    await loadData()
    if (activeRequirementId.value === item.id) {
      await openRequirement(item, previewMode.value)
    }
  } catch {
    lnToast.error('作废失败')
  }
}

async function handleVoidFromDetail() {
  if (!activeRequirementId.value) return
  const row = tableData.value.find((item) => item.id === activeRequirementId.value)
  if (row) await handleVoid(row)
}

function openSupplementDialog() {
  if (!activeRequirementId.value) return
  supplementDialogVisible.value = true
}

async function handleSupplementSuccess() {
  if (!activeRequirementId.value) return
  const row = tableData.value.find((item) => item.id === activeRequirementId.value)
  if (row) await openRequirement(row, previewMode.value)
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

  const hasBlockingOverlay = rawDrawerVisible.value || createDialogVisible.value || descriptionDialogVisible.value || supplementDialogVisible.value || showFilter.value || showDisplaySettings.value
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

onMounted(async () => {
  await loadData()
  const focusId = Number(route.query.focus)
  if (focusId) {
    const focusedRow = tableData.value.find(item => item.id === focusId)
    if (focusedRow) await openRequirement(focusedRow, 'detail')
  }
  loadStats()
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
.product-pool-view {
  position: relative;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.linear-pool-search { width: 230px; }
:deep(.linear-pool-search .ln-input-wrap) { width: 230px; }
:deep(.filter-grid-line .ln-select-field),
:deep(.filter-grid-line .ln-popover-root),
:deep(.filter-grid-line .ln-popover-trigger),
:deep(.filter-grid-line .ln-select__trigger) { width: 100%; }

.linear-display-menu {
  width: 220px; padding: 4px; display: grid; gap: 3px; font-family: var(--ln-font);
  strong { padding: 6px 7px 8px; color: var(--ln-text-tertiary); font-size: 11px; font-weight: 650; letter-spacing: .06em; text-transform: uppercase; }
  label { min-height: 34px; padding: 0 7px; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-radius: 5px; color: var(--ln-text-secondary); font-size: 12px; &:hover { background: var(--ln-surface-hover); } }
}
.linear-display-field { padding: 5px 7px 8px; display: grid; gap: 5px; color: var(--ln-text-secondary); font-size: 11px; }
:deep(.linear-display-field .ln-select-field),
:deep(.linear-display-field .ln-popover-root),
:deep(.linear-display-field .ln-popover-trigger),
:deep(.linear-display-field .ln-select__trigger) { width: 100%; min-width: 0; }

.linear-group-skeleton { pointer-events: none; }
.linear-group-skeleton .group-header { top: 0; }
.linear-group-skeleton .group-title { min-width: 0; height: 28px; display: flex; align-items: center; gap: 6px; }
.skeleton-row { grid-template-columns: minmax(280px, 1fr) minmax(420px, auto); }
.skeleton-identity { display: flex; align-items: center; gap: 10px; }
.skeleton-tags { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }

.view-tabs {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 2px 8px;
}

.group-mode-switch {
  margin-left: auto;
}

.grouped-list {
  overflow: auto;
  padding-bottom: 8px;
}

.list-table { width: 100%; }
.requirement-group + .requirement-group { border-top: 1px solid var(--border-light); }

.issue-columns {
  position: sticky;
  top: 0;
  z-index: 4;
  min-height: 32px;
  padding: 0 12px;
  align-items: center;
  border-bottom: 1px solid rgba(31, 35, 40, 0.08);
  background: rgba(252, 252, 251, 0.98);
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 620;
  letter-spacing: 0.025em;
  backdrop-filter: blur(10px);
}

.group-header {
  position: sticky;
  top: 32px;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 38px;
  padding: 0 12px;
  background: rgba(249, 249, 248, 0.96);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(31, 35, 40, 0.06);
}

.group-toggle {
  min-width: 0;
  height: 28px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
}
.group-toggle:hover { background: rgba(17, 24, 39, 0.05); }
.group-toggle:focus-visible { outline: 2px solid var(--ln-accent); outline-offset: 1px; }
.group-toggle strong { line-height: 16px; }
.group-caret {
  width: 14px;
  height: 14px;
  display: grid;
  place-items: center;
  flex: 0 0 14px;
  color: var(--text-tertiary);
  font-size: 13px;
  transition: transform 0.16s ease;
}
.group-caret.is-collapsed { transform: rotate(-90deg); }
.group-count { min-width: 12px; line-height: 16px; color: var(--text-tertiary); font-variant-numeric: tabular-nums; text-align: left; }
.group-add { width: 26px; height: 26px; border: 0; border-radius: 6px; background: transparent; color: var(--text-tertiary); cursor: pointer; font-size: 17px; }
.group-add:hover { background: rgba(17, 24, 39, 0.06); color: var(--text-primary); }

.status-dot { width: 9px; height: 9px; box-sizing: border-box; flex: 0 0 9px; border: 1.5px solid #9aa1ab; border-radius: 50%; }
.status-dot.design { border-color: #a18a61; background: #f3ead8; }
.status-dot.progress { border-color: #7087a8; background: #e6edf7; }
.status-dot.done { border-color: #668d77; background: #e2efe7; }
.status-dot.blocked { border-color: #b5796d; background: #f4e4df; }
.status-dot.closed { border-color: #a6a6a6; background: #ececec; }

.issue-grid {
  display: grid;
  column-gap: 12px;
}

.issue-row {
  align-items: center;
  min-height: 54px;
  padding: 7px 12px;
  border-bottom: 1px solid rgba(31, 35, 40, 0.055);
  cursor: pointer;
  transition: background 0.12s ease;

  &:hover,
  &.hovering { background: #f6f6f4; }
  &.selected { background: #f1f2ef; box-shadow: inset 2px 0 0 #6d746f; }
}

.density-compact .issue-row { min-height: 48px; padding-top: 5px; padding-bottom: 5px; }
.density-comfortable .issue-row { min-height: 64px; padding-top: 11px; padding-bottom: 11px; }
.stable-empty { min-height: 120px; display: grid; place-content: center; gap: 6px; text-align: center; color: var(--text-tertiary); font-size: 12px; }
.stable-empty strong { color: var(--text-secondary); font-size: 13px; }

.issue-identity { min-width: 0; display: grid; gap: 3px; }
.issue-property { min-width: 0; display: flex; align-items: center; }
.issue-property :deep(.property-trigger) { width: 100%; justify-content: flex-start; }
.issue-reference,
.issue-document { min-width: 0; display: flex; align-items: center; }
.empty-cell { color: var(--text-tertiary); font-size: 11px; }
.tag-link { width: 100%; max-width: 100%; height: 26px; padding: 0 5px; justify-content: flex-start; font-size: 11px; }
.prd-link { width: auto; padding-inline: 2px; }
:deep(.tag-link .ln-button__label) { min-width: 0; overflow: hidden; text-overflow: ellipsis; }

.story-stack {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}

.story-block {
  padding: 14px 15px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: #fbfbfa;
}

.primary-story {
  border-color: rgba(91, 101, 94, 0.22);
  background: #f7f8f5;
}

.muted-story { background: #faf9f7; }
.story-kicker { margin-bottom: 8px; color: var(--text-tertiary); font-size: 11px; font-weight: 700; letter-spacing: 0.04em; }
.story-copy,
.story-block p,
.analysis-points { margin: 0; color: var(--text-primary); font-size: 13px; line-height: 1.75; }
.analysis-points { padding-left: 18px; }
.analysis-points li + li { margin-top: 3px; }

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

.btn.active {
  border-color: var(--primary);
  color: var(--primary);
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
  grid-template-columns: minmax(400px, 2.55fr) minmax(96px, 0.82fr) minmax(96px, 0.82fr) 74px minmax(88px, 0.78fr) minmax(88px, 0.86fr) minmax(120px, 0.95fr) 96px 98px;
  column-gap: 10px;
  align-items: center;
}

.list-header {
  position: sticky;
  top: 0;
  z-index: 3;
  padding: 0 16px;
  min-height: 42px;
  border-bottom: 1px solid rgba(31, 35, 40, 0.08);
  background: rgba(248, 249, 247, 0.96);
}

.head-cell {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.action-head {
  text-align: center;
}

.list-row {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(31, 35, 40, 0.06);
  cursor: pointer;
  transition: 0.16s ease;

  &:hover {
    background: rgba(17, 24, 39, 0.025);
  }

  &.selected {
    background: linear-gradient(180deg, rgba(59, 130, 246, 0.045) 0%, rgba(255, 255, 255, 0.98) 100%);
    box-shadow: inset 2px 0 0 rgba(59, 130, 246, 0.62);
  }

  &.voided {
    background: rgba(31, 35, 40, 0.02);
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

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.meta-text {
  display: inline-flex;
  align-items: center;
  min-height: 16px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.04);
  font-size: 11px;
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
  font-size: 11px;
  font-weight: 700;

  &.muted {
    color: var(--text-tertiary);
  }
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

  &.striked {
    color: var(--text-secondary);
    text-decoration: line-through;
  }
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
}

.status-filter { background: rgba(59, 130, 246, 0.08); color: #2f6fdb; }
.status-dispatch { background: rgba(52, 199, 89, 0.08); color: #2a8a52; }
.status-hold { background: rgba(17, 24, 39, 0.05); color: var(--text-secondary); }

.raw-link-btn {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.4;

  &:hover {
    color: var(--text-primary);
  }
}

.muted-text,
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
.detail-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.peek-grid,
.drawer-grid,
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 14px;
}

:deep(.ln-form-item__content > .ln-field),
:deep(.ln-form-item__content > .ln-select-field),
:deep(.ln-form-item__content > .ln-select-field .ln-popover-root),
:deep(.ln-form-item__content > .ln-select-field .ln-popover-trigger),
:deep(.ln-form-item__content > .ln-select-field .ln-select__trigger) { width: 100%; }

.peek-grid,
.drawer-grid {
  margin-top: 10px;
}

.peek-item,
.detail-card {
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

  strong,
  .detail-value {
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

  :deep(.editable-field) {
    width: 100%;
    align-items: flex-start;
  }
}

.peek-rich-text {
  margin-top: 8px;
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: none;
  line-height: 1.72;

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 8px 0;
  }
}

.peek-inline-actions,
.peek-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.peek-actions {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.78);
  border: 1px solid rgba(17, 24, 39, 0.05);
}

.timeline-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-item {
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

.peek-empty-copy {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}

.raw-drawer-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px;
}

.drawer-header {
  min-width: 0;
}

.drawer-id {
  font-size: 12px;
  color: var(--text-tertiary);
}

.drawer-title {
  font-size: 16px;
  line-height: 1.2;
  font-weight: 650;
  letter-spacing: -0.02em;
}

.drawer-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drawer-paragraph {
  font-size: 13px;
  line-height: 1.72;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.danger-text {
  color: var(--danger);
  border-color: rgba(212, 92, 71, 0.14);

  &:hover {
    background: rgba(212, 92, 71, 0.06);
  }
}

@media (max-width: 1440px) {
  .row-grid {
    grid-template-columns: minmax(340px, 2.15fr) 92px 92px 72px 84px 84px 112px 88px 92px;
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

  .peek-grid,
  .peek-facts,
  .drawer-grid,
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
