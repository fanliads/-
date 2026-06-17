SET NAMES utf8mb4;

-- ============================================================
-- 字典类型表
-- ============================================================
CREATE TABLE sys_dict_type (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dict_code VARCHAR(50) NOT NULL UNIQUE COMMENT '字典编码',
    dict_name VARCHAR(100) NOT NULL COMMENT '字典名称',
    remark VARCHAR(255) DEFAULT NULL,
    status TINYINT DEFAULT 1 COMMENT '状态: 1-启用 0-禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典类型表';

-- ============================================================
-- 字典数据表
-- ============================================================
CREATE TABLE sys_dict_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dict_type_id BIGINT NOT NULL COMMENT '字典类型ID',
    dict_code VARCHAR(50) NOT NULL COMMENT '所属字典编码',
    label VARCHAR(100) NOT NULL COMMENT '显示标签',
    value VARCHAR(100) NOT NULL COMMENT '存储值',
    sort INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-启用 0-禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dict_code (dict_code),
    INDEX idx_dict_type_id (dict_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典数据表';
