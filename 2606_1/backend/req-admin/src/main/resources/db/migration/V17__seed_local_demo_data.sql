SET NAMES utf8mb4;

-- 本地联调用最小演示数据
-- 目标：
-- 1. 保留现有原始需求种子数据
-- 2. 当产品需求/迭代为空时，补充最小可见链路
-- 3. 支撑原始需求池、产品需求池、看板、迭代管理联调

-- 迭代演示数据
INSERT INTO sprint (name, team_name, cadence_type, start_date, end_date, status, goal, auto_created, create_by)
SELECT 'XY2606_01', '校园G端', 'weekly', '2026-06-02', '2026-06-08', 'planning', '校园项目常规优化与上线保障', 0, 1
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM sprint LIMIT 1);

INSERT INTO sprint (name, team_name, cadence_type, start_date, end_date, status, goal, auto_created, create_by)
SELECT 'SJ2606_01', '市监G端', 'weekly', '2026-06-09', '2026-06-15', 'in_progress', '监管项目交付与风险问题收敛', 0, 1
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM sprint WHERE name = 'SJ2606_01');

INSERT INTO sprint (name, team_name, cadence_type, start_date, end_date, status, goal, auto_created, create_by)
SELECT 'TC2606_01', 'B端团餐', 'biweekly', '2026-06-02', '2026-06-15', 'planning', '团餐业务需求规划与评审', 0, 1
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM sprint WHERE name = 'TC2606_01');

INSERT INTO sprint_team_config (team_name, default_cadence_type, auto_create_enabled, create_by)
SELECT '校园G端', 'weekly', 1, 1
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM sprint_team_config WHERE team_name = '校园G端');

INSERT INTO sprint_team_config (team_name, default_cadence_type, auto_create_enabled, create_by)
SELECT '市监G端', 'weekly', 1, 1
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM sprint_team_config WHERE team_name = '市监G端');

INSERT INTO sprint_team_config (team_name, default_cadence_type, auto_create_enabled, create_by)
SELECT 'B端团餐', 'biweekly', 1, 1
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM sprint_team_config WHERE team_name = 'B端团餐');

-- 产品需求演示数据
INSERT INTO product_requirement (
    req_no, title, description, priority, business_line_id, product_module, req_type,
    sprint_id, workload, value_score, status, assignee_id, raw_req_id, expected_date,
    design_doc_url, prd_url, handler, creator, is_direct, create_by
)
SELECT
    'PRD-20260615-001',
    '台州采购平台筛选能力优化',
    '补充采购平台筛选条件与批量处理能力，便于多区县统一操作。',
    'P2',
    1,
    '采购平台',
    '优化迭代',
    (SELECT id FROM sprint WHERE name = 'XY2606_01' LIMIT 1),
    5.0,
    4,
    'designing',
    6,
    1,
    '2026-06-08',
    'https://example.com/design/PRD-20260615-001',
    'https://example.com/prd/PRD-20260615-001',
    '陈产品',
    '系统管理员',
    0,
    1
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM product_requirement LIMIT 1);

INSERT INTO product_requirement (
    req_no, title, description, priority, business_line_id, product_module, req_type,
    sprint_id, workload, value_score, status, assignee_id, raw_req_id, expected_date,
    design_doc_url, prd_url, handler, creator, is_direct, create_by
)
SELECT
    'PRD-20260615-002',
    '青山湖智慧食堂菜单配置修正',
    '整理菜单配置、点餐流程与展示细节，收敛线上反馈问题。',
    'P2',
    1,
    '智慧食堂',
    '问题转需求',
    (SELECT id FROM sprint WHERE name = 'XY2606_01' LIMIT 1),
    3.0,
    3,
    'developing',
    6,
    2,
    '2026-06-09',
    'https://example.com/design/PRD-20260615-002',
    'https://example.com/prd/PRD-20260615-002',
    '陈产品',
    '系统管理员',
    0,
    1
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM product_requirement WHERE req_no = 'PRD-20260615-002');

INSERT INTO product_requirement (
    req_no, title, description, priority, business_line_id, product_module, req_type,
    sprint_id, workload, value_score, status, assignee_id, raw_req_id, expected_date,
    design_doc_url, prd_url, handler, creator, is_direct, create_by
)
SELECT
    'PRD-20260615-003',
    '山东监管大屏项目字段补齐',
    '监管大屏增加缺失业务字段与联动展示，保障项目验收。',
    'P1',
    2,
    '监管大屏',
    '规划功能',
    (SELECT id FROM sprint WHERE name = 'SJ2606_01' LIMIT 1),
    6.0,
    5,
    'backlog',
    6,
    3,
    '2026-06-15',
    'https://example.com/design/PRD-20260615-003',
    'https://example.com/prd/PRD-20260615-003',
    '陈产品',
    '系统管理员',
    0,
    1
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM product_requirement WHERE req_no = 'PRD-20260615-003');

INSERT INTO product_requirement (
    req_no, title, description, priority, business_line_id, product_module, req_type,
    sprint_id, workload, value_score, status, assignee_id, raw_req_id, expected_date,
    design_doc_url, prd_url, handler, creator, is_direct, create_by
)
SELECT
    'PRD-20260615-004',
    '延庆校园项目基础档案补录',
    '补齐学校基础档案与初始化配置，支持后续功能拆分。',
    'P2',
    1,
    '基础档案',
    '优化迭代',
    NULL,
    2.0,
    3,
    'researching',
    6,
    14,
    '2026-06-20',
    'https://example.com/design/PRD-20260615-004',
    'https://example.com/prd/PRD-20260615-004',
    '陈产品',
    '系统管理员',
    0,
    1
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM product_requirement WHERE req_no = 'PRD-20260615-004');

INSERT INTO product_requirement (
    req_no, title, description, priority, business_line_id, product_module, req_type,
    sprint_id, workload, value_score, status, assignee_id, raw_req_id, expected_date,
    design_doc_url, prd_url, handler, creator, is_direct, create_by
)
SELECT
    'PRD-20260615-005',
    '宁波工程学院团餐结算规则梳理',
    '针对团餐业务补齐结算规则和异常场景说明。',
    'P3',
    3,
    '团餐结算',
    '设计缺陷',
    (SELECT id FROM sprint WHERE name = 'TC2606_01' LIMIT 1),
    4.0,
    2,
    'testing',
    6,
    19,
    '2026-06-18',
    'https://example.com/design/PRD-20260615-005',
    'https://example.com/prd/PRD-20260615-005',
    '陈产品',
    '系统管理员',
    0,
    1
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM product_requirement WHERE req_no = 'PRD-20260615-005');

INSERT INTO product_requirement (
    req_no, title, description, priority, business_line_id, product_module, req_type,
    sprint_id, workload, value_score, status, assignee_id, raw_req_id, expected_date,
    actual_online_date, design_doc_url, prd_url, handler, creator, is_direct, create_by
)
SELECT
    'PRD-20260615-006',
    '视频黑屏控制能力复盘优化',
    '已上线需求补充复盘结论和可复用方案归档。',
    'P0',
    2,
    '视频监管',
    '优化迭代',
    (SELECT id FROM sprint WHERE name = 'SJ2606_01' LIMIT 1),
    1.0,
    5,
    'online',
    6,
    11,
    '2026-06-12',
    '2026-06-12',
    'https://example.com/design/PRD-20260615-006',
    'https://example.com/prd/PRD-20260615-006',
    '陈产品',
    '系统管理员',
    0,
    1
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM product_requirement WHERE req_no = 'PRD-20260615-006');

-- 父子关系与迭代关联补齐
INSERT INTO requirement_relation (source_type, source_id, target_type, target_id, relation_type, create_by)
SELECT 'raw', pr.raw_req_id, 'product', pr.id, 'parent_child', 1
FROM product_requirement pr
WHERE pr.req_no IN (
    'PRD-20260615-001',
    'PRD-20260615-002',
    'PRD-20260615-003',
    'PRD-20260615-004',
    'PRD-20260615-005',
    'PRD-20260615-006'
)
AND NOT EXISTS (
    SELECT 1
    FROM requirement_relation rr
    WHERE rr.source_type = 'raw'
      AND rr.source_id = pr.raw_req_id
      AND rr.target_type = 'product'
      AND rr.target_id = pr.id
      AND rr.relation_type = 'parent_child'
);

INSERT INTO sprint_requirement (sprint_id, req_id, sort_order)
SELECT pr.sprint_id, pr.id, 0
FROM product_requirement pr
WHERE pr.sprint_id IS NOT NULL
  AND pr.req_no IN (
      'PRD-20260615-001',
      'PRD-20260615-002',
      'PRD-20260615-003',
      'PRD-20260615-005',
      'PRD-20260615-006'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM sprint_requirement sr
      WHERE sr.sprint_id = pr.sprint_id
        AND sr.req_id = pr.id
  );

-- 最小日志，保证详情页留痕可见
INSERT INTO requirement_log (req_type, req_id, operator_id, operator_name, action, field_name, old_value, new_value, remark)
SELECT 'product', pr.id, 1, '系统管理员', 'create', NULL, NULL, NULL, '初始化本地演示产品需求'
FROM product_requirement pr
WHERE pr.req_no IN (
    'PRD-20260615-001',
    'PRD-20260615-002',
    'PRD-20260615-003',
    'PRD-20260615-004',
    'PRD-20260615-005',
    'PRD-20260615-006'
)
AND NOT EXISTS (
    SELECT 1
    FROM requirement_log rl
    WHERE rl.req_type = 'product'
      AND rl.req_id = pr.id
      AND rl.action = 'create'
);
