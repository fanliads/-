-- V7: 产品需求表字段扩展 + 需求类型字典
-- 添加产品需求表缺失字段
ALTER TABLE product_requirement ADD COLUMN prd_url VARCHAR(500) DEFAULT NULL COMMENT 'PRD地址';
ALTER TABLE product_requirement ADD COLUMN handler VARCHAR(50) DEFAULT NULL COMMENT '处理人';
ALTER TABLE product_requirement ADD COLUMN creator VARCHAR(50) DEFAULT NULL COMMENT '创建人';
ALTER TABLE product_requirement ADD COLUMN is_direct TINYINT DEFAULT 0 COMMENT '是否直接创建(1=直接,0=拆分)';

-- 需求类型字典
INSERT INTO sys_dict_type (dict_code, dict_name) VALUES ('req_type', '需求类型');

INSERT INTO sys_dict_data (dict_type_id, dict_code, label, value, sort)
SELECT id, 'req_type', '优化迭代', '优化迭代', 1
FROM sys_dict_type WHERE dict_code = 'req_type';

INSERT INTO sys_dict_data (dict_type_id, dict_code, label, value, sort)
SELECT id, 'req_type', '问题转需求', '问题转需求', 2
FROM sys_dict_type WHERE dict_code = 'req_type';

INSERT INTO sys_dict_data (dict_type_id, dict_code, label, value, sort)
SELECT id, 'req_type', '设计缺陷', '设计缺陷', 3
FROM sys_dict_type WHERE dict_code = 'req_type';

INSERT INTO sys_dict_data (dict_type_id, dict_code, label, value, sort)
SELECT id, 'req_type', '规划功能', '规划功能', 4
FROM sys_dict_type WHERE dict_code = 'req_type';
