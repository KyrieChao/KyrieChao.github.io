---
title: "Failure 框架指南"
date: "2026-03-26 11:00:00 +0800"
description: "Spring Boot 参数校验新选择：无缝兼容 JSR-303，支持 Fail-Fast 快速失败与 Fail-Strict 全量收集，提供 Scene+Group 双维度场景校验与统一异常响应。"
excerpt: "Spring Boot 参数校验新选择：无缝兼容 JSR-303，支持 Fail-Fast 快速失败与 Fail-Strict 全量收集，提供 Scene+Group 双维度场景校验与统一异常响应。"
tags: ["Failure", "Spring Boot", "Validation", "Java", "开源框架"]
categories: ["Failure 学习系列"]
series: "Failure 学习系列"
---

# 🚀 Failure 框架使用教程 - 3. 函数式结果处理 (Result)

如果你讨厌 `try-catch` 满天飞，Failure 提供了另一套哲学：**Monad Result**。

## 1. 🤔 Result vs 异常的选择决策树
- **选异常 (Business)**：在 Controller/Service 顶层，希望框架自动拦截并返回错误给前端。
- **选 Result**：在内部复杂业务流转、聚合调用多个外部接口时，希望显式处理每一步的成功与失败。

在这个框架里，两种风格可以并存：
- 对外接口（Controller）建议用异常风格，交给 `FailFastExceptionHandler` 输出统一 JSON。
- 对内逻辑（Service/聚合层）建议用 `Result<T>`，把失败当作“数据”来传递和组合。

## 2. 🔗 Result 链式操作
`Result<T>` 封装了 `Success` 和 `Fail` 两种状态：

- `Result.ok(data)`：成功
- `Result.fail(code)` / `Result.fail(business)`：失败

```java
Result<String> result = Result.ok("data")
    .peek(s -> log.info("处理成功: {}", s))              // 成功副作用，不改变结果
    .map(String::toUpperCase)                           // 成功值映射
    .flatMap(s -> Result.ok(s + "_PROCESSED"))          // 成功值映射到新的 Result
    .recover(fail -> "DEFAULT_VALUE")                   // 失败降级：把 Fail 变成 Success 值
    .peekError(fail -> log.warn("处理失败: {}", fail))   // 失败副作用
    .fold(                                              // 双路映射：把成功/失败都映射到同一类型
        success -> "最终成功：" + success,
        fail -> "最终失败：" + fail.getMessage()
    );
```

补充说明：
- `recover(...)` 的 lambda 需要返回的是 `T`（解包后的值），如果你想返回 `Result<T>`，请用 `recoverWith(...)`。
- `fold(...)` 返回的是 `Result<R>`，不是直接 `R`（仍然保持“结果容器”的一致性）。

常用小技巧：
- “把失败变成默认值”：`recover(...)`
- “把成功值加一层校验”：`filter(predicate, code)`

```java
Result<Integer> age = Result.ok(16)
    .filter(a -> a >= 18, Code.AGE_INVALID, "未成年");
```

## 3. 🧰 Results 工具类全览
`Results` 适合做“批量/集合/副作用”相关的操作（静态工具方法）。

- **`tryOf()`**：捕获旧代码的异常并转为 Result。
  ```java
  Result<User> res = Results.tryOf(() -> dao.get(), Code.DB_ERR, "查询用户失败");
  ```
- **`tryRun()`**：把 `Runnable` 包装成 `Result<Void>`。
- **`fromOptional()`**：Optional 转 Result。
- **`sequence()`**：`List<Result<T>>` → `Result<List<T>>`（fail-fast：有一个失败就返回失败）。
- **`sequenceAll()`**：全量收集版 sequence（失败会聚合成 `MultiBusiness`）。
- **`traverse()`**：先 map 再 sequence（fail-fast）。
- **`traverseAll()`**：全量收集版 traverse。
- **`partition()`**：同时拿到 successes 与 failures（更像“统计报表”）。
- **`fold()` (针对列表)**：对 `List<Result<T>>` 做归约（Reduce）。
- **`tap()` / `tapAsync()`**：对 Result 做“非破坏性”副作用（日志、埋点、异步通知等）。

```java
Result<User> r = Results.tryOf(() -> dao.get(), Code.DB_ERR);

r = Results.tap(r, it -> log.info("当前结果: success={}, fail={}", it.isSuccess(), it.isFail()));
r = Results.tapAsync(r, it -> metrics.record(it));
```

## 4. 🌊 与 Java Stream API 集成
```java
Result<List<String>> res = Result.ok(List.of("a", "b"));
res.stream().forEach(System.out::println); // 如果是 Fail，stream 会为空，不会报 NPE
```

## 5. 🧪 常见落地范式（推荐）

### 5.1 外部调用聚合（fail-fast）
当你有多个外部依赖，任意一个失败就直接失败：
```java
Result<User> user = Results.tryOf(() -> userRepo.find(id), Code.DB_ERR);
Result<Order> order = Results.tryOf(() -> orderRepo.latest(id), Code.DB_ERR);

Result<List<Object>> all = Results.sequence(
    user.map(u -> (Object) u),
    order.map(o -> (Object) o)
);
```

### 5.2 外部调用聚合（全量收集）
当你希望“尽可能多拿到信息，同时把失败集中返回”：
```java
Result<List<User>> users = Results.traverseAll(ids, uid ->
    Results.tryOf(() -> userRepo.find(uid), Code.DB_ERR)
);
```
