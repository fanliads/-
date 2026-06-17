CREATE TABLE IF NOT EXISTS external_identity_mapping (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '内部用户ID',
    provider VARCHAR(32) NOT NULL COMMENT '外部身份提供方:dingtalk/wecom',
    external_user_id VARCHAR(128) NOT NULL COMMENT '外部用户唯一标识',
    external_union_id VARCHAR(128) NULL COMMENT '外部联合标识',
    external_name VARCHAR(128) NULL COMMENT '外部用户名称',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1启用 0停用',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_provider_external_user (provider, external_user_id),
    KEY idx_external_identity_user (user_id)
) COMMENT='外部身份映射表';

ALTER TABLE raw_requirement
    ADD COLUMN ai_assessment_context TEXT NULL COMMENT 'AI优先级评定上下文JSON' AFTER value_assessment;
