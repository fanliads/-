ALTER TABLE product_requirement
    ADD COLUMN client_request_id VARCHAR(64) DEFAULT NULL COMMENT '客户端创建幂等标识' AFTER req_no,
    ADD UNIQUE KEY uk_product_create_request (create_by, client_request_id);
