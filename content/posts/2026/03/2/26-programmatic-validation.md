---
title: "Failure 框架实战指南"
date: "2026-03-26 09:00:00 +0800"
description: "Spring Boot 参数校验新选择：无缝兼容 JSR-303，支持 Fail-Fast 快速失败与 Fail-Strict 全量收集，提供 Scene+Group 双维度场景校验与统一异常响应。"
tags: ["Failure", "Spring Boot", "Validation", "Java", "开源框架"]
categories: ["Failure 学习系列"]
---

# 🚀 Failure 框架使用教程 - 1. 编程式链式校验（核心基础）

当你需要在 Service 层手写复杂的校验逻辑时，Failure 提供了极度流畅的链式 API。

## 1. 🏃‍♂️ 两种校验哲学：begin() vs strict()

- **`Failure.begin()`（快速失败 Fail-Fast）** 🏎️
    - **行为**：遇到第一个不满足的条件，立即终止链式调用并抛出 `Business` 异常。
    - **场景**：性能敏感的接口、或者表单填写时前端只需要逐项提示的场景。

- **`Failure.strict()`（全量收集 Fail-Strict）** 🕵️‍♂️
    - **行为**：即使某个条件失败，也会继续执行后续校验，最后统一抛出包含所有错误的 `MultiBusiness` 异常。
    - **场景**：希望一次性告诉前端所有填错的字段，提升用户体验。

## 2. 🛠️ 链式 API 完整清单与自定义规则

除了常用的 `notNull`, `notBlank`, `positive`，你还可以使用高阶扩展：

- **`check(boolean condition, Code code)`**：传入任意布尔表达式。
- **自定义 Predicate `satisfies()`**：
  ```java
  Failure.begin()
      .satisfies(str, s -> s.startsWith("A"), ErrorCode.MUST_START_WITH_A)
      .fail();
  ```
- **控制流：`when()` 与 `resume()` 状态开关**：
  你可以通过 `when(boolean)` 动态开启或关闭后续的校验逻辑：
  ```java
  Failure.begin()
      .when(user.isVip()) // 如果不是 VIP，后续校验将被忽略
      .notNull(user.getVipLevel(), Code.VIP_LEVEL_REQUIRED)
      .resume()           // 恢复全量校验模式
      .notBlank(user.getUsername(), Code.NAME_BLANK)
      .fail();
  ```

## 3. 🚦 短路逻辑控制
在 `strict()` 模式下，有时你希望某个关键错误发生后**局部短路**：
```java
Failure.strict()
       .notNull(user, Code.USER_NULL)
       .stopOnFail() // 如果 user 是 null，立刻停下，防止下面的 getUsername 报 NPE！
       .notBlank(user.getUsername(), Code.NAME_BLANK)
       .resume()     // 恢复全量收集模式
       .failAll();
```
同时支持组合条件：`.or(chain -> chain.notNull(a).notNull(b))` 满足其一即可。

## 4. 🧳 延迟计算 (defer)
如果你需要在校验链中执行一些耗时的数据库查询，可以使用 `defer`，它只在前面的校验都通过时才会执行：
```java
Failure.begin()
       .notBlank(user.getUsername(), Code.NAME_BLANK)
       .defer(() -> userService.findByUsername(user.getUsername()) == null, Code.USER_EXISTS)
       .fail();
```
