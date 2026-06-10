package com.reqmgmt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 需求管理系统主启动类
 */
@SpringBootApplication
@EnableScheduling
public class ReqMgmtApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReqMgmtApplication.class, args);
    }
}
