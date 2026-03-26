---
title: "Failure 框架实战指南"
date: "2026-03-26 10:00:00 +0800"
description: "Spring Boot 参数校验新选择：无缝兼容 JSR-303，支持 Fail-Fast 快速失败与 Fail-Strict 全量收集，提供 Scene+Group 双维度场景校验与统一异常响应。"
excerpt: "Spring Boot 参数校验新选择：无缝兼容 JSR-303，支持 Fail-Fast 快速失败与 Fail-Strict 全量收集，提供 Scene+Group 双维度场景校验与统一异常响应。"
tags: ["Failure", "Spring Boot", "Validation", "Java", "开源框架"]
categories: ["Failure 学习系列"]
series: "Failure 学习系列"
---

# 🚀 Failure 框架使用教程 - 2. 声明式校验与 Web 层集成（实战主力）

通过 AOP 和注解，Failure 能让你的 Controller 层代码干净到极致。

## 1. 🎛️ @Validate 参数详解与多层叠加
`@Validate` 是触发校验的总开关。
- **`value`**：指定自定义的 `FastValidator` 实现类。
- **`fast`**：**声明式收集模式控制**。
    - `true` (默认)：快速失败模式。遇到第一个校验错误（无论是 JSR-303 还是自定义 Validator）立即停止并抛出异常。
    - `false`：全量收集模式。收集该方法入参的所有校验错误，最后抛出 `MultiBusiness` 异常。
- **`scene`**：指定当前业务场景（如 `Scenario.CREATE`）。
- **`groups`**：透传给 JSR-303 的校验分组。

**合并策略**：方法上的 `@Validate` 会与参数上的 `@Validate` 合并，方法级别优先级更高。

## 2. 🎭 @Scene 进阶：场景化校验
复用 DTO 是常态，但创建和更新的规则往往不同。
```java
public class UserDTO {
    @Scene(Scenario.UPDATE) // 只有更新场景才校验 ID
    @NotNull
    private Long id;
    
    @Scene({Scenario.CREATE, Scenario.UPDATE}) // 两个场景都校验
    @NotBlank
    private String username;
}

// Controller
@Validate(scene = Scenario.UPDATE)
@PostMapping("/update")
public void update(@RequestBody UserDTO dto) { ... }
```

## 3. 🛑 @SkipValidation
如果 Controller 方法里有个参数你绝对不想让 `@Validate` 去碰它：
```java
@Validate
public void doSomething(UserDTO user, @SkipValidation HttpServletRequest request) { ... }
```

## 4. 🔍 Scope 深度用法：优雅处理集合与嵌套
当你需要校验 `List<Item>` 时，如何让报错信息精确指出 `items[2].price` 有问题？
```java
Failure.strict()
    .forEach("items", order::getItems, scope -> scope
        // 显式指定字段名 "price"，否则路径会回退到默认的 "field"
        .notNull(scope.field("price", Item::getPrice), Code.PRICE_NULL)
        .done()
    )
    .failAll();
// 报错时，框架会自动拼接出精确路径：items[0].price
```
```java
// 推荐用 PathEntry
Failure.strict()
        .notNull(users, ResponseCode.VALIDATION_ERROR_400, "用户列表不能为空")
        .forEach(users, scope -> {
            PathEntry<String> name = scope.field(UserDTO::getUsername).as("name");
            PathEntry<String> email = scope.fieldEntry(UserDTO::getEmail);
            PathEntry<Integer> age = scope.fieldEntry(UserDTO::getAge);
            scope.notBlank(name, ResponseCode.VALIDATION_ERROR_400)
                    .email(email, ResponseCode.VALIDATION_ERROR_400)
                    .positive(age, ResponseCode.VALIDATION_ERROR_400)
                    .merge();
        })
        .failAll();
```
还支持 `forEachEntry` 遍历 Map，以及 `nested` 校验嵌套对象。

## 5. 🧬 TypedValidator：复杂多态 DTO 的终极方案
当你有一个基类 `Command` 和多个子类，怎么校验？
```java
public class MyValidator extends TypedValidator {
    @Override
    protected void registerValidators() {
        register(CreateCmd.class, (cmd, ctx) -> Failure.with(ctx).notBlank(cmd.name, Code.ERR).verify());
        register(UpdateCmd.class, (cmd, ctx) -> Failure.with(ctx).notNull(cmd.id, Code.ERR).verify());
    }
}
```
**注意**：`Failure.with(ctx)` 是精髓，它复用了 `@Validate` 切面传进来的上下文，确保错误被正确收集。最后使用 `.verify()` 来将校验结果同步到上下文中，这里不使用 `.fail()` 因为切面会统一抛出异常。

## 6. 🛡️ Web 层增强
- **`@FailFastBody`**：可选的 RequestBody。设置 `required=false` 时，如果前端没传 body，Controller 会收到 `null`，而不是 Spring 默认报出的 400 `HttpMessageNotReadableException`。

- **统一异常处理与精确日志定位**：框架自带 `FailFastExceptionHandler`。无论是业务抛出的 `Business`，还是 JSR-303 抛出的异常，最终都会被拦截，转化为如下标准 JSON：
  ```json
  {
      "traceId": "ae0fe5e1-0511-498e-91c1-6208e5f2a92c",
      "code": 40001,
      "description": "参数错误",
      "message": "参数错误",
      "errors": [
          {
              "path": null,
              "code": 40001,
              "rejected": null,
              "detail": "参数错误",
              "message": "参数错误"
          }
      ],
      "scene": "CREATE",
      "timestamp": "2026-03-26 14:57:05"
  }
  ```
  **💡 开发者体验拉满的控制台日志**：
  框架在打印异常日志时，会自动追踪并打印触发错误的**具体代码行号**（例如 `(FailureController.java:34)`）。在 IDEA 等主流 IDE 中，**点击该行号即可直接跳转到报错的那行代码**，极大提升了排查效率！
  ```text
  2026-03-26T14:57:05.179+08:00 ERROR 22124 [failure-test] --- [nio-8686-exec-1] c.c.f.advice.FailFastExceptionHandler    : [FailureController#scene] {code=400_01, mes=参数错误, des=参数错误} (FailureController.java:34)[ae0fe5e1-0511-498e-91c1-6208e5f2a92c]
  ```
- **OpenAPI 完美集成**：引入 `failure-openapi-springdoc-starter` 后，Swagger UI 会自动解析并展示这些错误结构。
