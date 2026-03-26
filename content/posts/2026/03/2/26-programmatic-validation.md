---
title: "Failure 框架实战指南"
date: "2026-03-26 09:00:00 +0800"
description: "Spring Boot 参数校验新选择：无缝兼容 JSR-303，支持 Fail-Fast 快速失败与 Fail-Strict 全量收集，提供 Scene+Group 双维度场景校验与统一异常响应。"
excerpt: "Spring Boot 参数校验新选择：无缝兼容 JSR-303，支持 Fail-Fast 快速失败与 Fail-Strict 全量收集，提供 Scene+Group 双维度场景校验与统一异常响应。"
tags: ["Failure", "Spring Boot", "Validation", "Java", "开源框架"]
categories: ["Failure 学习系列"]
series: "Failure 学习系列"
---

# 🚀 Failure 框架使用教程 - 1. 编程式链式校验（核心基础）

当你需要在 Service 层手写复杂的校验逻辑时，Failure 提供了极度流畅的链式 API。

这一篇只讲“编程式校验”的核心：用 `Failure.begin()/strict()` 直接在代码里把规则写清楚，并用统一的异常模型（`Business/MultiBusiness`）把错误抛出去。

## 1. 🏃‍♂️ 两种校验哲学：begin() vs strict()

- **`Failure.begin()`（快速失败 Fail-Fast）** 🏎️
    - **行为**：遇到第一个不满足的条件，立即终止链式调用并抛出 `Business` 异常。
    - **场景**：性能敏感的接口、或者表单填写时前端只需要逐项提示的场景。

- **`Failure.strict()`（全量收集 Fail-Strict）** 🕵️‍♂️
    - **行为**：即使某个条件失败，也会继续执行后续校验，最后统一抛出包含所有错误的 `MultiBusiness` 异常。
    - **场景**：希望一次性告诉前端所有填错的字段，提升用户体验。

### 1.1 终结方法速查（很重要）
链式调用最后一定要“收口”，否则只是在描述规则，不会真正触发抛错：

- `Failure.begin() ... .fail()`：快速失败（抛 `Business`）
- `Failure.strict() ... .failAll()`：全量收集（抛 `MultiBusiness`）
- `Failure.with(ctx) ... .verify()`：只写入上下文，不直接抛错（通常用于切面托管）

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

### 2.1 常用方法速查（字符串）
如果你在写“用户注册/登录”一类的校验，这些会非常常见：

- `notBlank(str)` / `blank(str)`
- `lengthBetween(str, min, max)`
- `match(str, regex)`
- `email(email)`
- `startsWith/endsWith/contains`

示例（完全符合当前代码实现）：
```java
Failure.begin()
       .notBlank(email, Code.EMAIL_EMPTY)
       .email(email, Code.EMAIL_INVALID)
       .lengthBetween(password, 8, 32, Code.PASSWORD_LENGTH)
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

## 5. 🧩 上下文复用与终结方法对比
在普通的 Service/Controller 中，你通常会使用 `.fail()`（快速失败）或 `.failAll()`（全量收集）来**直接抛出异常**。
但当你编写被 AOP 切面托管的自定义校验器时，你需要复用切面传进来的上下文：

- **`Failure.with(ctx)`**：基于现有的 `ValidationContext` 启动校验，继承外层的收集模式（fast/strict）。
- **`verify()` vs `fail()`**：
    - `.fail() / .failAll()`：**立即抛出** `Business / MultiBusiness` 异常，中断当前线程。
    - `.verify()`：**不抛出异常**，它仅仅是将错误写入 `ctx` 并触发监控埋点。异常抛出的动作将由外层的 `@Validate` 切面统一接管。

```java
// 在自定义校验器中
public void validate(User user, ValidationContext ctx) {
    Failure.with(ctx) // 复用上下文
           .notBlank(user.getName(), Code.NAME_EMPTY)
           .verify(); // 仅记录错误，不抛出异常
}
```

### 5.1 如何选 verify / fail（一句话）
- 你自己写的业务流程里：选 `fail()/failAll()`（立刻抛错，控制流清晰）。
- 你写的是被 `@Validate` 触发的校验器：选 `verify()`（把“抛错权”交给切面统一处理）。
