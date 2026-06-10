SET NAMES utf8mb4;

-- ============================================================
-- 需求管理系统 - 数据库初始化脚本
-- MySQL 8.0 / InnoDB / utf8mb4_unicode_ci
-- ============================================================

-- ============================================================
-- 一、系统管理表
-- ============================================================

-- 1. sys_user 用户表
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '登录账号',
    password VARCHAR(255) NOT NULL COMMENT '密码(BCrypt加密)',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    avatar VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    email VARCHAR(100) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    role_id BIGINT NOT NULL COMMENT '角色ID',
    dept VARCHAR(100) DEFAULT NULL COMMENT '部门',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-启用 0-禁用',
    last_login_time DATETIME DEFAULT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_id (role_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. sys_role 角色表
CREATE TABLE sys_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    role_key VARCHAR(50) NOT NULL UNIQUE COMMENT '角色标识',
    description VARCHAR(200) DEFAULT NULL,
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT NOT NULL DEFAULT 1,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 3. sys_permission 权限表
CREATE TABLE sys_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    permission_name VARCHAR(100) NOT NULL COMMENT '权限名称',
    permission_key VARCHAR(100) NOT NULL UNIQUE COMMENT '权限标识',
    route_path VARCHAR(200) DEFAULT NULL COMMENT '路由路径',
    component VARCHAR(200) DEFAULT NULL COMMENT '前端组件路径',
    type TINYINT NOT NULL COMMENT '类型: 1-菜单 2-按钮 3-接口',
    parent_id BIGINT DEFAULT 0 COMMENT '父权限ID',
    icon VARCHAR(100) DEFAULT NULL COMMENT '图标',
    order_num INT DEFAULT 0 COMMENT '排序',
    status TINYINT NOT NULL DEFAULT 1,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 4. sys_role_permission 角色权限关联表
CREATE TABLE sys_role_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    UNIQUE KEY uk_role_perm (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- ============================================================
-- 二、需求管理表
-- ============================================================

-- 5. business_line 业务线表
CREATE TABLE business_line (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '业务线名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '编码',
    description VARCHAR(500) DEFAULT NULL,
    leader_id BIGINT DEFAULT NULL COMMENT '负责人ID',
    status TINYINT NOT NULL DEFAULT 1,
    sort_order INT DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业务线表';

-- 6. tag 标签表
CREATE TABLE tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '标签名',
    color VARCHAR(20) DEFAULT '#409EFF' COMMENT '颜色',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- 7. raw_requirement 原始需求表
CREATE TABLE raw_requirement (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    req_no VARCHAR(20) NOT NULL UNIQUE COMMENT '需求编号 RAW-YYYYMMDD-NNN',
    title VARCHAR(200) NOT NULL COMMENT '需求标题',
    description TEXT COMMENT '需求描述',
    source VARCHAR(50) NOT NULL COMMENT '来源: 市场部/客服/实施/内部',
    proposer VARCHAR(50) COMMENT '提出人',
    proposer_contact VARCHAR(100) COMMENT '提出人联系方式',
    project_name VARCHAR(100) COMMENT '关联项目',
    req_link VARCHAR(500) COMMENT '需求单链接',
    priority VARCHAR(10) DEFAULT 'P2' COMMENT '优先级: P0/P1/P2/P3',
    status VARCHAR(30) NOT NULL DEFAULT 'pending_evaluate' COMMENT '当前状态',
    assignee_id BIGINT DEFAULT NULL COMMENT '当前指派人ID',
    current_handler_id BIGINT DEFAULT NULL COMMENT '当前处理人ID',
    business_line_id BIGINT DEFAULT NULL COMMENT '业务线ID',
    req_type VARCHAR(30) DEFAULT NULL COMMENT '需求类型: 功能/优化/缺陷/其他',
    expected_date DATE DEFAULT NULL COMMENT '期望完成日期',
    attachment VARCHAR(1000) DEFAULT NULL COMMENT '附件URL(JSON数组)',
    remark TEXT COMMENT '备注',
    is_non_functional TINYINT DEFAULT 0 COMMENT '是否非功能性需求',
    create_by BIGINT NOT NULL COMMENT '创建人ID',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assignee (assignee_id),
    INDEX idx_business_line (business_line_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='原始需求表';

-- 8. product_requirement 产品需求表
CREATE TABLE product_requirement (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    req_no VARCHAR(20) NOT NULL UNIQUE COMMENT '需求编号 PRD-YYYYMMDD-NNN',
    title VARCHAR(200) NOT NULL COMMENT '需求标题',
    description TEXT COMMENT '需求描述',
    priority VARCHAR(10) NOT NULL DEFAULT 'P2' COMMENT '优先级: P0/P1/P2/P3',
    business_line_id BIGINT DEFAULT NULL COMMENT '业务线ID',
    product_module VARCHAR(100) DEFAULT NULL COMMENT '产品模块',
    req_type VARCHAR(30) DEFAULT NULL COMMENT '需求类型: 新功能/优化/技术债务',
    sprint_id BIGINT DEFAULT NULL COMMENT '迭代版本ID',
    workload DECIMAL(5,1) DEFAULT NULL COMMENT '工作量估算(人天)',
    value_score TINYINT DEFAULT NULL COMMENT '价值评分: 1-5',
    status VARCHAR(30) NOT NULL DEFAULT 'pending_assign' COMMENT '当前状态',
    assignee_id BIGINT DEFAULT NULL COMMENT '负责产品经理ID',
    raw_req_id BIGINT DEFAULT NULL COMMENT '关联原始需求ID',
    expected_date DATE DEFAULT NULL COMMENT '期望完成日期',
    actual_online_date DATE DEFAULT NULL COMMENT '实际上线日期',
    design_doc_url VARCHAR(500) DEFAULT NULL COMMENT '设计文档链接',
    create_by BIGINT NOT NULL COMMENT '创建人ID',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assignee (assignee_id),
    INDEX idx_sprint (sprint_id),
    INDEX idx_business_line (business_line_id),
    INDEX idx_raw_req (raw_req_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品需求表';

-- 9. requirement_relation 需求关联表
CREATE TABLE requirement_relation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_type VARCHAR(20) NOT NULL COMMENT '源类型: raw/product',
    source_id BIGINT NOT NULL COMMENT '源需求ID',
    target_type VARCHAR(20) NOT NULL COMMENT '目标类型: raw/product',
    target_id BIGINT NOT NULL COMMENT '目标需求ID',
    relation_type VARCHAR(30) NOT NULL COMMENT '关联类型: parent_child/dependency/related',
    create_by BIGINT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_source (source_type, source_id),
    INDEX idx_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='需求关联表';

-- 10. requirement_log 需求操作日志表
CREATE TABLE requirement_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    req_type VARCHAR(20) NOT NULL COMMENT '需求类型: raw/product',
    req_id BIGINT NOT NULL COMMENT '需求ID',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    operator_name VARCHAR(50) NOT NULL COMMENT '操作人姓名',
    action VARCHAR(50) NOT NULL COMMENT '操作类型: create/update/status_change/assign/comment',
    field_name VARCHAR(50) DEFAULT NULL COMMENT '变更字段名',
    old_value TEXT DEFAULT NULL COMMENT '旧值',
    new_value TEXT DEFAULT NULL COMMENT '新值',
    remark VARCHAR(500) DEFAULT NULL COMMENT '操作备注/审批意见',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_req (req_type, req_id),
    INDEX idx_operator (operator_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='需求操作日志表';

-- 11. requirement_comment 评论表
CREATE TABLE requirement_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    req_type VARCHAR(20) NOT NULL COMMENT '需求类型: raw/product',
    req_id BIGINT NOT NULL COMMENT '需求ID',
    content TEXT NOT NULL COMMENT '评论内容',
    parent_id BIGINT DEFAULT 0 COMMENT '父评论ID(0=顶级评论)',
    user_id BIGINT NOT NULL COMMENT '评论人ID',
    user_name VARCHAR(50) NOT NULL COMMENT '评论人姓名',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_req (req_type, req_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- 12. requirement_supplement 内容补充表
CREATE TABLE requirement_supplement (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    req_type VARCHAR(20) NOT NULL COMMENT '需求类型: raw/product',
    req_id BIGINT NOT NULL COMMENT '需求ID',
    supplement_type VARCHAR(30) NOT NULL COMMENT '补充类型: customer_background/tech_detail/scope_clarify/other',
    content TEXT NOT NULL COMMENT '补充内容',
    attachment VARCHAR(1000) DEFAULT NULL COMMENT '附件URL',
    user_id BIGINT NOT NULL COMMENT '补充人ID',
    user_name VARCHAR(50) NOT NULL COMMENT '补充人姓名',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_req (req_type, req_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容补充表';

-- ============================================================
-- 三、迭代管理表
-- ============================================================

-- 13. sprint 迭代版本表
CREATE TABLE sprint (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '迭代名称',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '结束日期',
    status VARCHAR(20) NOT NULL DEFAULT 'planning' COMMENT '状态: planning/in_progress/delayed/released',
    goal TEXT COMMENT '迭代目标',
    create_by BIGINT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_date (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='迭代版本表';

-- 14. sprint_requirement 迭代需求关联表
CREATE TABLE sprint_requirement (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sprint_id BIGINT NOT NULL,
    req_id BIGINT NOT NULL COMMENT '产品需求ID',
    sort_order INT DEFAULT 0,
    UNIQUE KEY uk_sprint_req (sprint_id, req_id),
    INDEX idx_sprint (sprint_id),
    INDEX idx_req (req_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='迭代需求关联表';

-- ============================================================
-- 四、通知与状态流配置表
-- ============================================================

-- 15. notification 站内通知表
CREATE TABLE notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '接收人ID',
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    content VARCHAR(500) DEFAULT NULL COMMENT '通知内容',
    type VARCHAR(30) NOT NULL COMMENT '通知类型: status_change/assign/comment/deadline_warn',
    ref_type VARCHAR(20) DEFAULT NULL COMMENT '关联对象类型: raw/product/sprint',
    ref_id BIGINT DEFAULT NULL COMMENT '关联对象ID',
    is_read TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读: 0-未读 1-已读',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='站内通知表';

-- 16. status_flow_config 状态流配置表
CREATE TABLE status_flow_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    req_type VARCHAR(20) NOT NULL COMMENT '需求类型: raw/product',
    from_status VARCHAR(30) NOT NULL COMMENT '源状态',
    to_status VARCHAR(30) NOT NULL COMMENT '目标状态',
    allowed_roles VARCHAR(200) NOT NULL COMMENT '允许的角色(逗号分隔)',
    need_approval TINYINT DEFAULT 0 COMMENT '是否需要审批意见',
    action_name VARCHAR(50) NOT NULL COMMENT '操作名称(如:承接/拒绝/通过)',
    sort_order INT DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
    UNIQUE KEY uk_flow (req_type, from_status, to_status),
    INDEX idx_from (req_type, from_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='状态流配置表';
