---
title: "Failure 框架实战指南"
date: "2026-03-26 12:00:00 +0800"
description: "Spring Boot 参数校验新选择：无缝兼容 JSR-303，支持 Fail-Fast 快速失败与 Fail-Strict 全量收集，提供 Scene+Group 双维度场景校验与统一异常响应。"
tags: ["Failure", "Spring Boot", "Validation", "Java", "开源框架"]
categories: ["Failure 学习系列"]
---

# 🚀 Failure 框架使用教程 - 4. 生产运维与附录

## 1. 📊 生产运维支持
- **监控指标**：引入 `failure-observability-spring-boot-starter`。它会自动将 `@Validate` 的校验耗时、调用次数、失败率等指标对接到 Spring Boot Actuator (Micrometer)，你可以直接在 Prometheus/Grafana 中展示。
- **链路追踪**：内置 `FailFastTraceIdFilter`，自动生成 `trace-id` 并注入 MDC（方便日志打印），同时在 HTTP Response Header 中回显，方便排查客诉。
- **TraceId 与日志联动（推荐配置）**：开启响应回显 + MDC 后，前端拿到 `traceId`，可以直接在后端日志中全文搜索定位一次请求的全链路日志。默认关闭，需要显式开启。
  当 `fail-fast.trace-id.enabled=false` 时，异常响应体将不再返回 `traceId` 字段。
  ```yaml
  fail-fast:
    trace-id:
      enabled: true
      header-name: X-Trace-Id
      mdc-enabled: true
      mdc-key: traceId
      response-header: true
  ```
  ```yaml
  logging:
    pattern:
      console: "%clr(%d{${LOG_DATEFORMAT_PATTERN:yyyy-MM-dd'T'HH:mm:ss.SSSXXX}}){faint} %clr(${LOG_LEVEL_PATTERN:%5p}) %clr(${PID:-}){magenta} %clr([${spring.application.name:-}]){faint} %clr(---){faint} %clr([%15.15t]){faint} %clr(%-40.40logger{39}){cyan} %clr(:){faint} %m%replace([%X{traceId:-}]){'^\\[\\]$',''}%n${LOG_EXCEPTION_CONVERSION_WORD:%wEx}"
  ```
- **缓存调优**：支持 I18n 国际化资源的缓存配置，减少磁盘 IO。
  在开发环境可以设为 `0` 实现热更新，在生产环境建议保持默认值或适当调大：
  ```yaml
  fail-fast:
    i18n:
      cache-seconds: 3600 # 默认缓存1小时
  ```

## 2. 📚 附录：核心注解速查表
| 注解 | 作用位置 | 核心作用 |
|---|---|---|
| `@Validate` | 方法、参数 | 开启校验，指定 Validator、场景(scene)与分组(groups) |
| `@Scene` | 字段 | 标记该字段仅在特定场景下才参与 JSR-303 校验 |
| `@SkipValidation` | 参数 | 在 `@Validate` 切面中强行跳过该参数的校验 |
| `@FailFastBody` | 参数 | 增强型 `@RequestBody`，支持安全的可选空 Body |
