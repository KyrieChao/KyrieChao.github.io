---
title: "Failure 框架实战指南"
date: "2026-03-26 08:00:00 +0800"
description: "Spring Boot 参数校验新选择：无缝兼容 JSR-303，支持 Fail-Fast 快速失败与 Fail-Strict 全量收集，提供 Scene+Group 双维度场景校验与统一异常响应。"
tags: ["Failure", "Spring Boot", "Validation", "Java", "开源框架"]
categories: ["Failure 学习系列"]
---

# 🚀 Failure 框架使用教程 - 0. 前置准备（快速开始）

## 1. 🛠️ 环境要求
- **JDK 版本**：JDK 17 或以上
- **Spring Boot**：3.x 系列（强依赖 `jakarta.validation` 和 Spring Boot 3 的自动装配机制）

## 2. 📦 依赖引入
在 `pom.xml` 中引入核心 Starter：

```xml
<dependency>
    <groupId>io.github.kyriechao</groupId>
    <artifactId>failure-spring-boot-starter</artifactId>
    <version>1.2.0</version><!-- 请使用最新版本 -->
</dependency>
```

## 3. ⚙️ 自动配置原理简述
引入 Starter 后，`FailFastAutoConfiguration` 会在幕后为你自动完成以下工作：
- 注入 `@Validate` 切面（`ValidationAspect`）。
- 注册 `OptionalBodyResolver` 以支持 `@FailFastBody`。
- 注册 `FailFastExceptionHandler` 接管全局异常并输出标准 JSON。
- 注册链路追踪和上下文清理的 Web 过滤器。

## 4. ⚡ 与 Spring Boot Starter Validation 的关系
**绝不是替代，而是增强！** Failure 完美兼容并底层调用了 `spring-boot-starter-validation` (Hibernate Validator)。它将原本生硬的约束异常转换为了优雅的业务异常（`Business` / `MultiBusiness`），并提供了强大的场景化过滤和统一返回体。

## 5. 🎯 第一个完整示例
让我们快速体验一下从传统校验到 Failure 校验的进化：

**传统写法 😖：**
```java
if (user.getUsername() == null) {
    throw new RuntimeException("用户名不能为空");
}
if (user.getAge() < 18) {
    throw new RuntimeException("未成年");
}
```

**Failure 编程式写法 🤩：**
```java
Failure.begin()
       .notBlank(user.getUsername(), UserCode.USERNAME_BLANK)
       .positive(user.getAge(), UserCode.AGE_INVALID)
       .fail(); // 任意一步失败，立即抛出对应的 Business 异常！
```


