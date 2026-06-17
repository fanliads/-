package com.reqmgmt.common.exception;

import com.reqmgmt.common.response.R;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * 全局异常处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public R<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常: code={}, message={}", e.getErrorCode(), e.getMessage());
        return R.fail(e.getErrorCode(), e.getMessage());
    }

    /**
     * 处理参数校验异常（@Valid/@Validated）
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<Void> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("参数校验异常: {}", message);
        return R.fail(ErrorCode.BAD_REQUEST.getCode(), message);
    }

    /**
     * 处理约束违反异常
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public R<Void> handleConstraintViolationException(ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));
        log.warn("约束违反异常: {}", message);
        return R.fail(ErrorCode.BAD_REQUEST.getCode(), message);
    }

    /**
     * 处理请求体解析异常（如日期格式错误、JSON反序列化失败）
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public R<Void> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        log.warn("请求体解析异常: {}", e.getMessage());
        String message = e.getMessage();
        if (message != null && message.contains("LocalDate")) {
            message = "日期格式错误，请使用 yyyy-MM-dd 格式";
        } else {
            message = "请求参数格式错误，请检查输入内容";
        }
        return R.fail(ErrorCode.BAD_REQUEST.getCode(), message);
    }

    /**
     * 系统错误兜底
     */
    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e) {
        log.error("系统异常: ", e);
        return R.fail(ErrorCode.INTERNAL_ERROR);
    }
}
