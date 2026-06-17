SET NAMES utf8mb4;

-- ============================================================
-- V16: 原始需求状态收口与历史数据归并
-- 目标状态:
--   pending_judgement  待判定
--   pending_split      待拆分
--   in_progress        开发中
--   online             已上线
--   closed             已关闭
--   suspended          已挂起
--   rejected           已拒绝
-- 说明:
-- 1. 只处理 raw_requirement 当前状态数据
-- 2. 兼容旧英文编码、中文旧值、大小写旧值
-- 3. 未明确识别的状态保留原值，便于后续人工复核
-- ============================================================

UPDATE raw_requirement
SET status = CASE
    -- 待判定
    WHEN LOWER(TRIM(status)) IN ('pending_evaluate', 'evaluating')
        OR TRIM(status) IN ('待评估', '评估中')
    THEN 'pending_judgement'

    -- 待拆分
    WHEN LOWER(TRIM(status)) IN (
        'accepted',
        'pending_director',
        'pending_leader_filter',
        'pending_design',
        'designed'
    )
        OR TRIM(status) IN (
            '待承接',
            '已承接',
            '待总监判定',
            '待产品总监判定',
            '待组长过滤',
            '待设计',
            '已设计',
            '已拆分待跟进'
        )
    THEN 'pending_split'

    -- 开发中
    WHEN LOWER(TRIM(status)) IN (
        'designing',
        'developing',
        'testing',
        'waiting_confirm',
        'researching',
        'backlog',
        'pending_pm',
        'pending_confirm'
    )
        OR TRIM(status) IN (
            '设计中',
            '研发中',
            '开发中',
            '测试中',
            '等待确认',
            '调研中',
            '待办需求',
            '待产品经理接手',
            '待确认'
        )
    THEN 'in_progress'

    -- 已上线
    WHEN LOWER(TRIM(status)) = 'online'
        OR TRIM(status) IN ('上线', '已上线')
    THEN 'online'

    -- 已关闭
    WHEN LOWER(TRIM(status)) = 'closed'
        OR TRIM(status) IN ('关闭', '已关闭')
    THEN 'closed'

    -- 已挂起
    WHEN LOWER(TRIM(status)) = 'suspended'
        OR TRIM(status) IN ('挂起', '已挂起')
    THEN 'suspended'

    -- 已拒绝
    WHEN LOWER(TRIM(status)) = 'rejected'
        OR TRIM(status) IN ('拒绝', '已拒绝', '验收不通过')
    THEN 'rejected'

    ELSE status
END
WHERE status IS NOT NULL
  AND TRIM(status) <> '';

-- 清理原始需求相关的旧状态字典项，仅保留非本次收口范围的其他字典值
DELETE FROM sys_dict_data
WHERE dict_code = 'req_status'
  AND (
      value IN (
          '待评估', '评估中', '待承接', '已承接', '待总监判定', '待产品总监判定',
          '待组长过滤', '待设计', '已设计', '设计中', '开发中', '研发中', '测试中',
          '等待确认', '调研中', '待办需求', '待产品经理接手', '待确认', '已上线',
          '上线', '已关闭', '关闭', '已挂起', '挂起', '已拒绝', '拒绝', '验收不通过',
          '已拆分待跟进'
      )
      OR label IN (
          '待评估', '评估中', '待承接', '已承接', '待总监判定', '待产品总监判定',
          '待组长过滤', '待设计', '已设计', '设计中', '开发中', '研发中', '测试中',
          '等待确认', '调研中', '待办需求', '待产品经理接手', '待确认', '已上线',
          '上线', '已关闭', '关闭', '已挂起', '挂起', '已拒绝', '拒绝', '验收不通过',
          '已拆分待跟进'
      )
  );

INSERT INTO sys_dict_data (dict_type_id, dict_code, label, value, sort)
SELECT 2, 'req_status', t.label, t.value, t.sort
FROM (
    SELECT '待判定' AS label, '待判定' AS value, 1 AS sort
    UNION ALL SELECT '待拆分', '待拆分', 2
    UNION ALL SELECT '开发中', '开发中', 3
    UNION ALL SELECT '已上线', '已上线', 4
    UNION ALL SELECT '已关闭', '已关闭', 5
    UNION ALL SELECT '已挂起', '已挂起', 6
    UNION ALL SELECT '已拒绝', '已拒绝', 7
) t
WHERE NOT EXISTS (
    SELECT 1
    FROM sys_dict_data d
    WHERE d.dict_code = 'req_status'
      AND d.label = t.label
      AND d.value = t.value
);
