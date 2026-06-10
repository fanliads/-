CREATE TABLE sprint_team_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    team_name VARCHAR(100) NOT NULL COMMENT '团队名称',
    default_cadence_type VARCHAR(20) NOT NULL DEFAULT 'weekly' COMMENT '默认迭代周期: weekly/biweekly',
    auto_create_enabled TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用自动创建',
    create_by BIGINT DEFAULT NULL COMMENT '创建人',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_team_name (team_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='团队迭代配置';

ALTER TABLE sprint
    ADD COLUMN auto_created TINYINT NOT NULL DEFAULT 0 COMMENT '是否自动创建' AFTER goal;

INSERT INTO sprint_team_config (team_name, default_cadence_type, auto_create_enabled)
SELECT DISTINCT team_name, cadence_type, 1
FROM sprint
WHERE team_name IS NOT NULL AND team_name <> ''
ON DUPLICATE KEY UPDATE
    default_cadence_type = VALUES(default_cadence_type),
    auto_create_enabled = VALUES(auto_create_enabled);
