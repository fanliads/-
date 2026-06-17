SET NAMES utf8mb4;

-- 清空产品需求池测试数据及其关联记录
DELETE FROM requirement_relation
WHERE source_type = 'product'
   OR target_type = 'product';

DELETE FROM requirement_log
WHERE req_type = 'product';

DELETE FROM requirement_comment
WHERE req_type = 'product';

DELETE FROM requirement_supplement
WHERE req_type = 'product';

DELETE FROM product_requirement;
