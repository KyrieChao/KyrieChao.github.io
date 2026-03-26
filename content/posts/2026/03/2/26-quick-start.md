---
title: "Failure 框架指南"
date: "2026-03-26 08:00:00 +0800"
description: "Spring Boot 参数校验新选择：无缝兼容 JSR-303，支持 Fail-Fast 快速失败与 Fail-Strict 全量收集，提供 Scene+Group 双维度场景校验与统一异常响应。"
excerpt: "Spring Boot 参数校验新选择：无缝兼容 JSR-303，支持 Fail-Fast 快速失败与 Fail-Strict 全量收集，提供 Scene+Group 双维度场景校验与统一异常响应。"
tags: ["Failure", "Spring Boot", "Validation", "Java", "开源框架"]
categories: ["Failure 学习系列"]
series: "Failure 学习系列"
---

# 🚀 Failure 框架使用教程 - 0. 前置准备（快速开始）

这一篇目标只有一个：让你在一个 Spring Boot 项目里 **5 分钟跑通 Failure** ✅

---

## 1. 🧰 环境要求
- **JDK**：17+
- **Spring Boot**：3.x
- **Web 技术栈**：Spring MVC（Servlet）。当前 Starter 的 Web 增强能力（例如 `@FailFastBody`、TraceId Filter）基于 Servlet 体系。

---

## 2. 📦 引入依赖（Maven）

```xml
<dependency>
    <groupId>io.github.kyriechao</groupId>
    <artifactId>failure-spring-boot-starter</artifactId>
    <version>1.1.1</version>
</dependency>
```

如果你还没有引入参数校验依赖，建议同时引入：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

---

## 3. ⚙️ 自动配置会帮你做什么

引入 Starter 后，自动配置类会把关键能力装配进 Spring 容器（无需手工注册）：
- `@Validate` 的 AOP 切面：统一触发 JSR-303 + 自定义 Validator
- `@FailFastBody` 的参数解析增强：支持 “可选 body”
- 默认异常处理：统一输出 JSON（`Business / MultiBusiness / JSR-303` 异常都会被处理）

---

## 4. 🧪 第一个可运行示例（编程式 vs 声明式）

下面给你一套“对照组”，看完你就能分清两种使用方式：

### 4.1 编程式：Service 里链式校验（推荐用于复杂业务规则）

```java
Failure.begin()
       .notBlank(dto.getName(), Code.NAME_EMPTY)
       .positive(dto.getAge(), Code.AGE_INVALID)
       .fail(); // 触发抛错（fail-fast）
```

如果你希望一次性返回多个错误（全量收集）：
```java
Failure.strict()
       .notBlank(dto.getName(), Code.NAME_EMPTY)
       .positive(dto.getAge(), Code.AGE_INVALID)
       .failAll();
```

### 4.2 声明式：Controller/Service 方法上 `@Validate`

```java
@PostMapping("/users")
@Validate(scene = Scenario.CREATE, fast = false)
public ApiResponse<String> create(@FailFastBody UserDTO dto) {
    return ApiResponse.success("ok");
}
```

它会做两件事：
1) 先走 `jakarta.validation`（DTO 上的 `@NotNull/@NotBlank/...`）
2) 再走你指定的自定义校验器（`FastValidator` / `TypedValidator`）

---

## 5. 📤 失败时会返回什么

失败时默认会返回统一 JSON（字段可能会随 verbose/trace-id 配置有所变化）：

```json
{
  "code": 400,
  "message": "参数校验失败",
  "description": "参数校验失败",
  "errors": [
    {
      "path": "name",
      "code": 400,
      "rejected": "",
      "detail": "不能为空",
      "message": "参数校验失败"
    }
  ],
  "timestamp": "2026-03-26 15:17:59"
}
```

---

## 6. 🧾 TraceId（默认关闭，按需开启）

如果你希望前端拿到 `traceId` 用于反查日志，可以开启：
```yaml
fail-fast:
  trace-id:
    enabled: true
    header-name: X-Trace-Id
    response-header: true
    response-header-name: X-Trace-Id
    mdc-enabled: true
    mdc-key: traceId
    generate-if-missing: true
```

如果你显式关闭：
```yaml
fail-fast:
  trace-id:
    enabled: false
```
则异常响应体将不返回 `traceId` 字段（“关掉就是彻底没有”）。


