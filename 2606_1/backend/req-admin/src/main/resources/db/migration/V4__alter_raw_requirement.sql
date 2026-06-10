SET NAMES utf8mb4;

-- ============================================================
-- 修改原始需求表：添加字典关联字段
-- ============================================================

ALTER TABLE raw_requirement
    ADD COLUMN business_line VARCHAR(50) DEFAULT NULL COMMENT '业务线（关联字典 business_line）' AFTER business_line_id,
    ADD COLUMN register_name VARCHAR(50) DEFAULT NULL COMMENT '登记人' AFTER proposer_contact,
    ADD COLUMN propose_time DATE DEFAULT NULL COMMENT '提出时间' AFTER register_name,
    ADD COLUMN product_definition VARCHAR(50) DEFAULT NULL COMMENT '产品需求定义（关联字典 req_definition）' AFTER req_type,
    ADD COLUMN product_manager VARCHAR(50) DEFAULT NULL COMMENT '产品经理（关联字典 product_manager）' AFTER product_definition,
    ADD COLUMN project_manager VARCHAR(50) DEFAULT NULL COMMENT '项目经理（关联字典 project_manager）' AFTER product_manager,
    ADD COLUMN is_urgent TINYINT DEFAULT 0 COMMENT '是否加急插队' AFTER is_non_functional,
    ADD COLUMN urgent_reason VARCHAR(255) DEFAULT NULL COMMENT '加急原因简述' AFTER is_urgent,
    ADD COLUMN expected_online_date DATE DEFAULT NULL COMMENT '期望上线时间' AFTER expected_date,
    ADD COLUMN value_assessment VARCHAR(255) DEFAULT NULL COMMENT '价值量化评估' AFTER expected_online_date;
