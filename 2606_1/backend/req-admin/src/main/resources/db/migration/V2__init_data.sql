SET NAMES utf8mb4;

-- ============================================================
-- 需求管理系统 - 初始数据脚本
-- ============================================================

-- ============================================================
-- 一、角色数据
-- ============================================================

INSERT INTO sys_role (id, role_name, role_key, description, sort_order) VALUES
(1, '系统管理员', 'admin', '系统管理员，拥有所有权限', 0),
(2, '市场部', 'market', '市场/一线人员，负责录入需求', 1),
(3, '项目经理', 'pm', '项目经理，负责评估需求', 2),
(4, '产品总监', 'product_director', '产品总监，负责需求判定与拆分', 3),
(5, '产品组长', 'product_leader', '产品组长，负责需求过滤与分发', 4),
(6, '产品经理', 'product_manager', '产品经理，负责需求落地', 5);

-- ============================================================
-- 二、权限数据（菜单 + 按钮级）
-- ============================================================

-- 一级菜单
INSERT INTO sys_permission (id, permission_name, permission_key, route_path, component, type, parent_id, icon, order_num) VALUES
(100, '看板视图', 'kanban', '/kanban', 'views/kanban/index', 1, 0, 'board', 1),
(101, '原始需求池', 'raw-pool', '/raw-pool', 'views/raw-pool/index', 1, 0, 'inbox', 2),
(102, '产品需求池', 'product-pool', '/product-pool', 'views/product-pool/index', 1, 0, 'box', 3),
(103, '我的待办', 'my-tasks', '/my-tasks', 'views/my-tasks/index', 1, 0, 'user', 4),
(104, '新建需求', 'submit-form', '/submit-form', 'views/submit-form/index', 1, 0, 'plus', 5),
(105, '迭代管理', 'sprint', '/sprint', 'views/sprint/index', 1, 0, 'calendar', 6),
(106, '数据看板', 'dashboard', '/dashboard', 'views/dashboard/index', 1, 0, 'chart', 7),
(107, '系统设置', 'system', '/system', 'views/system/index', 1, 0, 'setting', 8);

-- 看板视图 - 操作权限
INSERT INTO sys_permission (id, permission_name, permission_key, route_path, component, type, parent_id, icon, order_num) VALUES
(1001, '查看看板', 'kanban:view', NULL, NULL, 2, 100, NULL, 1),
(1002, '看板导出', 'kanban:export', NULL, NULL, 2, 100, NULL, 2);

-- 原始需求池 - 操作权限
INSERT INTO sys_permission (id, permission_name, permission_key, route_path, component, type, parent_id, icon, order_num) VALUES
(1011, '查看原始需求', 'raw-pool:view', NULL, NULL, 2, 101, NULL, 1),
(1012, '新增原始需求', 'raw-pool:add', NULL, NULL, 2, 101, NULL, 2),
(1013, '编辑原始需求', 'raw-pool:edit', NULL, NULL, 2, 101, NULL, 3),
(1014, '删除原始需求', 'raw-pool:delete', NULL, NULL, 2, 101, NULL, 4),
(1015, '评估原始需求', 'raw-pool:evaluate', NULL, NULL, 2, 101, NULL, 5),
(1016, '审批原始需求', 'raw-pool:approve', NULL, NULL, 2, 101, NULL, 6),
(1017, '导出原始需求', 'raw-pool:export', NULL, NULL, 2, 101, NULL, 7);

-- 产品需求池 - 操作权限
INSERT INTO sys_permission (id, permission_name, permission_key, route_path, component, type, parent_id, icon, order_num) VALUES
(1021, '查看产品需求', 'product-pool:view', NULL, NULL, 2, 102, NULL, 1),
(1022, '新增产品需求', 'product-pool:add', NULL, NULL, 2, 102, NULL, 2),
(1023, '编辑产品需求', 'product-pool:edit', NULL, NULL, 2, 102, NULL, 3),
(1024, '删除产品需求', 'product-pool:delete', NULL, NULL, 2, 102, NULL, 4),
(1025, '判定产品需求', 'product-pool:judge', NULL, NULL, 2, 102, NULL, 5),
(1026, '过滤产品需求', 'product-pool:filter', NULL, NULL, 2, 102, NULL, 6),
(1027, '导出产品需求', 'product-pool:export', NULL, NULL, 2, 102, NULL, 7);

-- 我的待办 - 操作权限
INSERT INTO sys_permission (id, permission_name, permission_key, route_path, component, type, parent_id, icon, order_num) VALUES
(1031, '查看我的待办', 'my-tasks:view', NULL, NULL, 2, 103, NULL, 1),
(1032, '处理我的待办', 'my-tasks:handle', NULL, NULL, 2, 103, NULL, 2);

-- 新建需求 - 操作权限
INSERT INTO sys_permission (id, permission_name, permission_key, route_path, component, type, parent_id, icon, order_num) VALUES
(1041, '新建需求', 'submit-form:add', NULL, NULL, 2, 104, NULL, 1);

-- 迭代管理 - 操作权限
INSERT INTO sys_permission (id, permission_name, permission_key, route_path, component, type, parent_id, icon, order_num) VALUES
(1051, '查看迭代', 'sprint:view', NULL, NULL, 2, 105, NULL, 1),
(1052, '新增迭代', 'sprint:add', NULL, NULL, 2, 105, NULL, 2),
(1053, '编辑迭代', 'sprint:edit', NULL, NULL, 2, 105, NULL, 3),
(1054, '删除迭代', 'sprint:delete', NULL, NULL, 2, 105, NULL, 4),
(1055, '管理迭代需求', 'sprint:manage', NULL, NULL, 2, 105, NULL, 5);

-- 数据看板 - 操作权限
INSERT INTO sys_permission (id, permission_name, permission_key, route_path, component, type, parent_id, icon, order_num) VALUES
(1061, '查看数据看板', 'dashboard:view', NULL, NULL, 2, 106, NULL, 1),
(1062, '导出数据报表', 'dashboard:export', NULL, NULL, 2, 106, NULL, 2);

-- 系统设置 - 操作权限
INSERT INTO sys_permission (id, permission_name, permission_key, route_path, component, type, parent_id, icon, order_num) VALUES
(1071, '查看系统设置', 'system:view', NULL, NULL, 2, 107, NULL, 1),
(1072, '用户管理', 'system:user', NULL, NULL, 2, 107, NULL, 2),
(1073, '角色管理', 'system:role', NULL, NULL, 2, 107, NULL, 3),
(1074, '权限管理', 'system:permission', NULL, NULL, 2, 107, NULL, 4),
(1075, '业务线管理', 'system:business-line', NULL, NULL, 2, 107, NULL, 5),
(1076, '状态流配置', 'system:status-flow', NULL, NULL, 2, 107, NULL, 6);

-- ============================================================
-- 三、角色权限关联
-- ============================================================

-- admin(1): 所有权限
INSERT INTO sys_role_permission (role_id, permission_id) VALUES
(1, 100),(1, 101),(1, 102),(1, 103),(1, 104),(1, 105),(1, 106),(1, 107),
(1, 1001),(1, 1002),
(1, 1011),(1, 1012),(1, 1013),(1, 1014),(1, 1015),(1, 1016),(1, 1017),
(1, 1021),(1, 1022),(1, 1023),(1, 1024),(1, 1025),(1, 1026),(1, 1027),
(1, 1031),(1, 1032),
(1, 1041),
(1, 1051),(1, 1052),(1, 1053),(1, 1054),(1, 1055),
(1, 1061),(1, 1062),
(1, 1071),(1, 1072),(1, 1073),(1, 1074),(1, 1075),(1, 1076);

-- market(2): 新建需求、查看我的待办、查看看板
INSERT INTO sys_role_permission (role_id, permission_id) VALUES
(2, 100),(2, 103),(2, 104),
(2, 1001),
(2, 1031),(2, 1032),
(2, 1041);

-- pm(3): 评估需求、查看原始需求池、查看看板、我的待办
INSERT INTO sys_role_permission (role_id, permission_id) VALUES
(3, 100),(3, 101),(3, 103),
(3, 1001),
(3, 1011),(3, 1015),(3, 1017),
(3, 1031),(3, 1032);

-- product_director(4): 判定需求、拆分需求、查看原始需求池、产品需求池、看板
INSERT INTO sys_role_permission (role_id, permission_id) VALUES
(4, 100),(4, 101),(4, 102),(4, 103),
(4, 1001),
(4, 1011),(4, 1016),(4, 1017),
(4, 1021),(4, 1022),(4, 1025),(4, 1027),
(4, 1031),(4, 1032);

-- product_leader(5): 过滤需求、分发需求、查看产品需求池、看板
INSERT INTO sys_role_permission (role_id, permission_id) VALUES
(5, 100),(5, 102),(5, 103),
(5, 1001),
(5, 1021),(5, 1026),
(5, 1031),(5, 1032);

-- product_manager(6): 接手需求、设计需求、管理迭代、查看产品需求池、看板
INSERT INTO sys_role_permission (role_id, permission_id) VALUES
(6, 100),(6, 102),(6, 103),(6, 105),
(6, 1001),
(6, 1021),(6, 1023),
(6, 1031),(6, 1032),
(6, 1051),(6, 1055);

-- ============================================================
-- 四、默认管理员账号
-- ============================================================

-- 密码: admin123 (BCrypt加密)
INSERT INTO sys_user (id, username, password, real_name, role_id, status) VALUES
(1, 'admin', '$2a$10$oSTnYu7aoe5QKJG3cUo33.UxQlT4gGeBSNcAJ.RYA/1cJRDCzZGlS', '系统管理员', 1, 1);

-- ============================================================
-- 五、初始业务线
-- ============================================================

INSERT INTO business_line (id, name, code, description) VALUES
(1, '核心交易', 'core_trade', '核心交易业务线'),
(2, '用户增长', 'user_growth', '用户增长业务线'),
(3, '数据平台', 'data_platform', '数据平台业务线'),
(4, '基础服务', 'base_service', '基础服务业务线');

-- ============================================================
-- 六、状态流配置 - 原始需求
-- ============================================================

INSERT INTO status_flow_config (req_type, from_status, to_status, allowed_roles, need_approval, action_name, sort_order) VALUES
('raw', 'pending_evaluate', 'evaluating', 'pm', 0, '开始评估', 1),
('raw', 'evaluating', 'accepted', 'pm', 1, '承接', 2),
('raw', 'evaluating', 'rejected', 'pm', 1, '拒绝', 3),
('raw', 'evaluating', 'suspended', 'pm', 1, '挂起', 4),
('raw', 'accepted', 'pending_director', 'pm', 0, '提交总监', 5),
('raw', 'pending_director', 'pending_design', 'product_director', 1, '通过判定', 6),
('raw', 'pending_director', 'rejected', 'product_director', 1, '拒绝', 7),
('raw', 'pending_director', 'suspended', 'product_director', 1, '挂起', 8),
('raw', 'pending_design', 'designing', 'product_manager', 0, '开始设计', 9),
('raw', 'designing', 'designed', 'product_manager', 0, '完成设计', 10),
('raw', 'designed', 'developing', 'product_manager', 0, '进入开发', 11),
('raw', 'developing', 'online', 'product_manager', 0, '已上线', 12);

-- ============================================================
-- 七、状态流配置 - 产品需求
-- ============================================================

INSERT INTO status_flow_config (req_type, from_status, to_status, allowed_roles, need_approval, action_name, sort_order) VALUES
('product', 'pending_assign', 'pending_leader_filter', 'product_director', 0, '指派组长', 1),
('product', 'pending_leader_filter', 'pending_pm', 'product_leader', 1, '通过过滤', 2),
('product', 'pending_leader_filter', 'suspended', 'product_leader', 1, '挂起', 3),
('product', 'pending_pm', 'backlog', 'product_manager', 0, '接手', 4),
('product', 'backlog', 'researching', 'product_manager', 0, '开始调研', 5),
('product', 'researching', 'designing', 'product_manager', 0, '开始设计', 6),
('product', 'designing', 'waiting_confirm', 'product_manager', 0, '等待确认', 7),
('product', 'designing', 'developing', 'product_manager', 0, '进入研发', 8),
('product', 'waiting_confirm', 'developing', 'product_manager', 0, '确认通过', 9),
('product', 'developing', 'testing', 'product_manager', 0, '进入测试', 10),
('product', 'testing', 'online', 'product_manager', 0, '已上线', 11);

-- ============================================================
-- 八、测试用户（用于开发测试）
-- ============================================================

-- 密码都是 123456 (BCrypt)
INSERT INTO sys_user (id, username, password, real_name, role_id, status) VALUES
(2, 'market_zhang', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '张市场', 2, 1),
(3, 'pm_li', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '李项目', 3, 1),
(4, 'director_wang', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '王总监', 4, 1),
(5, 'leader_zhao', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '赵组长', 5, 1),
(6, 'pm_chen', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '陈产品', 6, 1);
