---
title: "Failure 框架实战指南"
date: "2026-03-26 11:00:00 +0800"
description: "Spring Boot 参数校验新选择：无缝兼容 JSR-303，支持 Fail-Fast 快速失败与 Fail-Strict 全量收集，提供 Scene+Group 双维度场景校验与统一异常响应。"
tags: ["Failure", "Spring Boot", "Validation", "Java", "开源框架"]
categories: ["Failure 学习系列"]
---

# 🚀 Failure 框架使用教程 - 3. 函数式结果处理 (Result)

如果你讨厌 `try-catch` 满天飞，Failure 提供了另一套哲学：**Monad Result**。

## 1. 🤔 Result vs 异常的选择决策树
- **选异常 (Business)**：在 Controller/Service 顶层，希望框架自动拦截并返回错误给前端。
- **选 Result**：在内部复杂业务流转、聚合调用多个外部接口时，希望显式处理每一步的成功与失败。

## 2. 🔗 Result 链式操作
`Result<T>` 封装了 `Success` 和 `Fail` 两种状态：
```java
Result<String> result = Result.ok("data")
    .tap(s -> log.info("处理成功: {}", s))       // 成功时执行，不改变结果
    .tapAsync(s -> service.asyncLog(s))        // 异步执行副作用
    .map(String::toUpperCase)
    .flatMap(s -> Result.ok(s + "_PROCESSED"))
    .recover(fail -> "DEFAULT_VALUE") // 失败降级，直接返回降级后的值 T
```    .fold(
        success -> "最终成功：" + success,
        fail -> "最终失败：" + fail.getMessage()
    );
```

## 3. 🧰 Results 工具类全览
- **`tryOf()`**：捕获旧代码的异常。
  `Result<User> res = Results.tryOf(() -> dao.get(), Code.DB_ERR);`
- **`fromOptional()`**：Optional 转 Result。
- **`sequence()`**：将 `List<Result<T>>` 反转为 `Result<List<T>>`。如果有任何一个 Fail，整体就是 Fail。
- **`fold()` (针对列表)**：对 `List<Result<T>>` 进行归约（Reduce）操作，类似于 Stream 的 reduce。

## 4. 🌊 与 Java Stream API 集成
```java
Result<List<String>> res = Result.ok(List.of("a", "b"));
res.stream().forEach(System.out::println); // 如果是 Fail，stream 会为空，不会报 NPE
```
