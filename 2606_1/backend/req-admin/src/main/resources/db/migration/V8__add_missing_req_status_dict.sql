SET NAMES utf8mb4;

-- ============================================================
-- V8: 补充 req_status 字典缺失的状态选项
-- ============================================================

-- 获取 req_status 的 dict_type_id（id=2）
INSERT INTO sys_dict_data (dict_type_id, dict_code, label, value, sort) VALUES
(2, 'req_status', '待评估', '待评估', 0),
(2, 'req_status', '待承接', '待承接', 1),
(2, 'req_status', '已承接', '已承接', 2),
(2, 'req_status', '待产品总监判定', '待产品总监判定', 3),
(2, 'req_status', '设计中', '设计中', 4),
(2, 'req_status', '已拒绝', '已拒绝', 9),
(2, 'req_status', '已挂起', '已挂起', 10),
(2, 'req_status', '已拆分待跟进', '已拆分待跟进', 11),
(2, 'req_status', '已关闭', '已关闭', 12);
