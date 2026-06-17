SET NAMES utf8mb4;

-- ============================================================
-- 初始化字典类型数据
-- ============================================================

INSERT INTO sys_dict_type (id, dict_code, dict_name, remark) VALUES
(1, 'business_line', '业务线', '业务线分类'),
(2, 'req_status', '当前状态', '需求当前状态'),
(3, 'req_definition', '产品需求定义', '产品需求定义类型'),
(4, 'product_manager', '产品经理', '产品经理列表'),
(5, 'project_manager', '项目经理', '项目经理列表'),
(6, 'priority_level', '优先级定级', '优先级定级分类');

-- ============================================================
-- 初始化字典数据 - 业务线
-- ============================================================

INSERT INTO sys_dict_data (dict_type_id, dict_code, label, value, sort) VALUES
(1, 'business_line', '校园G端', '校园G端', 1),
(1, 'business_line', '市监G端', '市监G端', 2),
(1, 'business_line', 'B端团餐', 'B端团餐', 3),
(1, 'business_line', '技术支撑（硬件等）', '技术支撑（硬件等）', 4);

-- ============================================================
-- 初始化字典数据 - 当前状态
-- ============================================================

INSERT INTO sys_dict_data (dict_type_id, dict_code, label, value, sort) VALUES
(2, 'req_status', '评估中', '评估中', 1),
(2, 'req_status', '待设计', '待设计', 2),
(2, 'req_status', '已设计', '已设计', 3),
(2, 'req_status', '开发中', '开发中', 4),
(2, 'req_status', '已上线', '已上线', 5),
(2, 'req_status', '验收不通过', '验收不通过', 6),
(2, 'req_status', '拒绝', '拒绝', 7),
(2, 'req_status', '挂起', '挂起', 8);

-- ============================================================
-- 初始化字典数据 - 产品需求定义
-- ============================================================

INSERT INTO sys_dict_data (dict_type_id, dict_code, label, value, sort) VALUES
(3, 'req_definition', '产品基线', '产品基线', 1),
(3, 'req_definition', '标准化模块', '标准化模块', 2),
(3, 'req_definition', '定制化适配', '定制化适配', 3),
(3, 'req_definition', '非功能需求', '非功能需求', 4);

-- ============================================================
-- 初始化字典数据 - 产品经理
-- ============================================================

INSERT INTO sys_dict_data (dict_type_id, dict_code, label, value, sort) VALUES
(4, 'product_manager', '郑文明', '郑文明', 1),
(4, 'product_manager', '韦亦夫', '韦亦夫', 2),
(4, 'product_manager', '张建兴', '张建兴', 3),
(4, 'product_manager', '蒋家豪', '蒋家豪', 4),
(4, 'product_manager', '蒋磊', '蒋磊', 5),
(4, 'product_manager', '章寅祥', '章寅祥', 6),
(4, 'product_manager', '田园', '田园', 7),
(4, 'product_manager', '周林', '周林', 8),
(4, 'product_manager', '方玄亮', '方玄亮', 9),
(4, 'product_manager', '范立', '范立', 10);

-- ============================================================
-- 初始化字典数据 - 项目经理（含梁勇斌）
-- ============================================================

INSERT INTO sys_dict_data (dict_type_id, dict_code, label, value, sort) VALUES
(5, 'project_manager', '张涛', '张涛', 1),
(5, 'project_manager', '郑剑雄', '郑剑雄', 2),
(5, 'project_manager', '徐鹤伟', '徐鹤伟', 3),
(5, 'project_manager', '郑齐', '郑齐', 4),
(5, 'project_manager', '梁勇斌', '梁勇斌', 5);

-- ============================================================
-- 初始化字典数据 - 优先级定级
-- ============================================================

INSERT INTO sys_dict_data (dict_type_id, dict_code, label, value, sort) VALUES
(6, 'priority_level', '一级A类（P0）', 'P0', 1),
(6, 'priority_level', '一级B类（P1）', 'P1', 2),
(6, 'priority_level', '二级（P2）', 'P2', 3),
(6, 'priority_level', '三级（P3）', 'P3', 4);
