ALTER TABLE raw_requirement
    ADD COLUMN external_company VARCHAR(200) DEFAULT NULL COMMENT '外部提报公司或客户' AFTER proposer_contact,
    ADD COLUMN external_channel VARCHAR(32) DEFAULT NULL COMMENT '外部提报渠道' AFTER submit_origin,
    ADD COLUMN external_identity_provider VARCHAR(32) DEFAULT NULL COMMENT '可选身份识别平台' AFTER external_channel,
    ADD COLUMN external_identity_name VARCHAR(100) DEFAULT NULL COMMENT '身份平台返回展示名称' AFTER external_identity_provider,
    ADD COLUMN external_expected_result TEXT DEFAULT NULL COMMENT '外部提报期望结果' AFTER description,
    ADD COLUMN external_submitted_at DATETIME DEFAULT NULL COMMENT '外部提报时间' AFTER propose_time,
    ADD COLUMN client_request_id VARCHAR(64) DEFAULT NULL COMMENT '外部提报幂等标识' AFTER req_no,
    ADD UNIQUE KEY uk_raw_external_request (client_request_id);
