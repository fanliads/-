ALTER TABLE raw_requirement
    ADD COLUMN system_level VARCHAR(32) NULL COMMENT '系统规则判定等级编码' AFTER priority,
    ADD COLUMN effective_level VARCHAR(32) NULL COMMENT '当前生效等级编码' AFTER system_level,
    ADD COLUMN strategy_hint VARCHAR(255) NULL COMMENT '处理策略提示' AFTER effective_level,
    ADD COLUMN rule_hits TEXT NULL COMMENT '命中规则项JSON' AFTER strategy_hint,
    ADD COLUMN explanation_summary TEXT NULL COMMENT 'AI解释摘要' AFTER rule_hits,
    ADD COLUMN missing_fields TEXT NULL COMMENT '缺失字段JSON' AFTER explanation_summary,
    ADD COLUMN override_flag TINYINT NOT NULL DEFAULT 0 COMMENT '是否人工覆盖' AFTER missing_fields,
    ADD COLUMN override_reason VARCHAR(500) NULL COMMENT '人工覆盖原因' AFTER override_flag,
    ADD COLUMN override_by BIGINT NULL COMMENT '人工覆盖人ID' AFTER override_reason,
    ADD COLUMN override_time DATETIME NULL COMMENT '人工覆盖时间' AFTER override_by;
