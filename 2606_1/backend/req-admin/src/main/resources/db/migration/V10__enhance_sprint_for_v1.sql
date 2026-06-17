-- V9: sprint 主链路增强（V1）

ALTER TABLE sprint
    ADD COLUMN team_name VARCHAR(100) NOT NULL DEFAULT '' COMMENT '所属团队' AFTER name,
    ADD COLUMN cadence_type VARCHAR(20) NOT NULL DEFAULT 'weekly' COMMENT '迭代周期: weekly/biweekly' AFTER team_name;

ALTER TABLE sprint
    ADD UNIQUE KEY uk_team_cadence_window (team_name, cadence_type, start_date, end_date);
