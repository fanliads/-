ALTER TABLE raw_requirement
    MODIFY COLUMN description MEDIUMTEXT COMMENT '需求描述';

ALTER TABLE product_requirement
    MODIFY COLUMN description MEDIUMTEXT COMMENT '需求描述';
