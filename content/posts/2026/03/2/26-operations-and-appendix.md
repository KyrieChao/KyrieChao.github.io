---
title: "Failure 框架指南"
date: "2026-03-26 12:00:00 +0800"
description: "Spring Boot 参数校验新选择：无缝兼容 JSR-303，支持 Fail-Fast 快速失败与 Fail-Strict 全量收集，提供 Scene+Group 双维度场景校验与统一异常响应。"
excerpt: "Spring Boot 参数校验新选择：无缝兼容 JSR-303，支持 Fail-Fast 快速失败与 Fail-Strict 全量收集，提供 Scene+Group 双维度场景校验与统一异常响应。"
tags: ["Failure", "Spring Boot", "Validation", "Java", "开源框架"]
categories: ["Failure 学习系列"]
series: "Failure 学习系列"
---

# 🚀 Failure 框架使用教程 - 4. 生产运维与附录

这一篇关注“上线以后你最关心的事”：
- 监控：失败率、耗时、QPS 📈
- 排障：TraceId、日志一键定位 🔎
- 国际化：文案缓存与刷新 🌍

---

## 1. 📊 可观测性（Micrometer）

如果你接入了 `failure-observability-spring-boot-starter`（且项目里有 `MeterRegistry`），框架会自动上报校验相关指标。

建议在 Grafana 上至少做 3 张图：
- 校验耗时（Timer）
- 校验次数（Counter）
- 校验失败率（fail / total）

---

## 2. 🧵 TraceId（默认关闭，按需开启）

### 2.1 开启后的收益
开启 `trace-id` 后，你会获得三件事：
- 响应体（可选）/响应头（可选）回传 TraceId，前端报错时能把它带回来
- MDC 注入：日志自动包含 TraceId
- 控制台日志里可以直接全文搜索 TraceId，定位整条请求链路

### 2.2 推荐配置（开启）

```yaml
fail-fast:
  trace-id:
    enabled: true
    header-name: X-Trace-Id
    response-header: true
    response-header-name: X-Trace-Id
    generate-if-missing: true
    mdc-enabled: true
    mdc-key: traceId
```

### 2.3 关闭语义（方案 A）

```yaml
fail-fast:
  trace-id:
    enabled: false
```

当 `enabled=false` 时：
- TraceId Filter 不会注册
- 异常响应体将不再返回 `traceId` 字段（关掉就是彻底没有）

---

## 3. 🧾 日志 Pattern（把 TraceId 打到日志里）

如果你启用了 `mdc-enabled=true`，建议把 MDC 字段拼到 console pattern：

```yaml
logging:
  pattern:
    console: "%clr(%d{${LOG_DATEFORMAT_PATTERN:yyyy-MM-dd'T'HH:mm:ss.SSSXXX}}){faint} %clr(${LOG_LEVEL_PATTERN:%5p}) %clr(${PID:-}){magenta} %clr([${spring.application.name:-}]){faint} %clr(---){faint} %clr([%15.15t]){faint} %clr(%-40.40logger{39}){cyan} %clr(:){faint} %m%replace([%X{traceId:-}]){'^\\[\\]$',''}%n${LOG_EXCEPTION_CONVERSION_WORD:%wEx}"
```

这样前端拿到的 `traceId` 可以直接在日志里一搜就定位到错误原因。

---

## 4. 🌍 I18n 缓存调优

Failure 的错误信息可以走国际化资源文件。缓存配置项是：

```yaml
fail-fast:
  i18n:
    cache-seconds: 3600
```

建议：
- 开发环境：`cache-seconds: 0`（方便你改文案立即生效）
- 生产环境：保持默认（减少磁盘 IO）

---

## 5. 📚 附录：注解速查表

| 注解 | 位置 | 作用 |
|---|---|---|
| `@Validate` | 方法 | 声明式校验总开关（scene/groups/fast） |
| `@Scene` | 字段 | 场景化过滤 JSR-303 violation |
| `@SkipValidation` | 参数 | 指定参数不参与校验 |
| `@FailFastBody` | 参数 | 可选 RequestBody（required=false） |

---

## 6. 🧩 FAQ（常见问题）

### 6.1 为什么我关闭 trace-id 仍看到 traceId？
如果你把 `fail-fast.trace-id.enabled=false` 后仍看到 `traceId`，通常是：
- 你没生效到当前环境配置文件（profile 配置覆盖）
- 你启用了旧版本（升级后需要重新发布）

### 6.2 为什么日志里能点击 `(SomeClass.java:34)`？
框架在异常日志里打印了触发异常的源码位置，IDEA 会识别并提供点击跳转，这对排查定位非常省时间。
