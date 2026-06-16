ALTER TABLE raw_requirement
    ADD COLUMN submit_origin VARCHAR(20) NOT NULL DEFAULT 'internal' COMMENT '提交来源类型: internal/external' AFTER source;
