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

这一篇讲的是“把校验收口到方法入口”：
- Controller/Service 方法加一个 `@Validate` ✅
- DTO 用 JSR-303 注解描述基础规则 ✅
- 复杂业务规则用自定义 Validator 扩展 ✅

---

## 1. 🎛️ `@Validate`：方法级校验总开关

`@Validate` 只能标在 **方法** 上（`@Target(ElementType.METHOD)`），它的作用是：在方法执行前统一完成校验，失败就抛 `Business / MultiBusiness`。

常用参数：
- `value`：指定自定义校验器（实现 `FastValidator` 或 `TypedValidator`）
- `fast`：声明式收集模式控制
    - `true`（默认）：快速失败，只抛第一个错误
    - `false`：全量收集，汇总多个错误后抛 `MultiBusiness`
- `scene`：指定业务场景（配合 `@Scene` 过滤字段校验）
- `groups`：透传给 JSR-303 groups

示例：
```java
@PostMapping("/users")
@Validate(scene = Scenario.CREATE, fast = false)
public ApiResponse<String> create(@FailFastBody UserDTO dto) {
    return ApiResponse.success("ok");
}
```

---

## 2. 🎭 `@Scene`：同一套 DTO 的“场景复用”

很多接口会复用 DTO，但不同场景的约束不同：
- CREATE：用户名/密码必填
- UPDATE：id 必填，其它字段可选

用法是“字段上标 `@Scene`，方法上用 `@Validate(scene=...)` 指定当前场景”：

```java
public class UserDTO {
    @Scene(Scenario.UPDATE)
    @NotNull
    private Long id;

    @Scene({Scenario.CREATE, Scenario.UPDATE})
    @NotBlank
    private String username;
}

@Validate(scene = Scenario.UPDATE)
public void update(@RequestBody UserDTO dto) { }
```

实现语义（很重要）：
- `@Scene` 只影响 JSR-303 这部分的 violation 过滤
- 自定义 Validator 是否执行，仍由 `@Validate` 控制

---

## 3. 🛑 `@SkipValidation`：某个参数不参与校验

当方法上有 `@Validate` 时，切面会收集“可校验参数”。如果你希望某个参数完全跳过（例如某个包装对象、或者你就是不想校验它），用 `@SkipValidation`：

```java
@Validate
public void doSomething(UserDTO user, @SkipValidation HttpServletRequest request) { }
```

---

## 4. 🔍 Scope：集合/嵌套对象校验 + 精确路径

校验集合时，最值钱的是“路径精确到第几个元素的哪个字段”，例如：
- `[0].name`
- `users[2].address.city`

### 4.1 List 集合校验（推荐 PathEntry 写法）

```java
Failure.strict()
    .notNull(users, ResponseCode.VALIDATION_ERROR_400, "用户列表不能为空")
    .forEach(users, scope -> {
        PathEntry<String> name = scope.field(UserDTO::getUsername).as("name");
        PathEntry<String> email = scope.fieldEntry(UserDTO::getEmail);
        PathEntry<Integer> age = scope.fieldEntry(UserDTO::getAge);

        scope.notBlank(name, ResponseCode.VALIDATION_ERROR_400)
             .email(email, ResponseCode.VALIDATION_ERROR_400)
             .positive(age, ResponseCode.VALIDATION_ERROR_400)
             .done();
    })
    .failAll();
```

为什么要这么写？
- `field(getter)` 解析 getter 名称在 Java 里不可靠（会回退到默认 `"field"`），所以推荐用 `.as("name")` 显式指定展示名
- `fieldEntry(getter)` 直接返回 `PathEntry<T>`，适合不需要改名的字段

### 4.2 Map 校验与 nested（思路相同）
- `forEachEntry(...)` 用于 Map 的 value 校验（路径会带上 key）
- `nested(...)` 用于对象嵌套（路径会自动追加子字段）

---

## 5. 🧬 TypedValidator：一个校验器处理多种类型

当你有多个 DTO/Command，希望统一用一个校验入口，但不同类型规则不同，推荐 `TypedValidator`：

```java
public class MyValidator extends TypedValidator {
    @Override
    protected void registerValidators() {
        register(CreateCmd.class, (cmd, ctx) ->
            Failure.with(ctx)
                .notBlank(cmd.getName(), Code.NAME_EMPTY)
                .verify()
        );

        register(UpdateCmd.class, (cmd, ctx) ->
            Failure.with(ctx)
                .notNull(cmd.getId(), Code.ID_EMPTY)
                .verify()
        );
    }
}
```

这里用 `.verify()` 而不是 `.fail()`：
- `.verify()` 只把错误写入 `ctx`
- 是否抛错、抛一个还是抛多个，由外层 `@Validate(fast=...)` 统一决定

---

## 6. 🧾 `@FailFastBody`：可选 RequestBody（避免 400）

`@FailFastBody` 语义上等同 `@RequestBody`，但支持 `required=false`：

```java
@PostMapping("/search")
public ApiResponse<?> search(@FailFastBody(required = false) QueryDTO dto) {
    if (dto == null) {
        return ApiResponse.success("no body");
    }
    return ApiResponse.success(dto);
}
```

---

## 7. 🧯 统一异常处理与日志定位（IDE 可点击跳转）

失败时会返回统一 JSON，且日志中会带上 `(SomeClass.java:34)` 这种可点击定位信息，排查体验非常好。

TraceId 说明：
- 默认关闭（`fail-fast.trace-id.enabled=false`）：响应体不返回 `traceId`
- 显式开启（`enabled=true`）：响应体/响应头/MDC 按配置生效

---

## 8. 🧩 OpenAPI（Swagger）集成

如果你需要让 Swagger UI 展示统一错误结构，可以引入 `failure-openapi-springdoc-starter` 相关模块进行增强。

注意事项：
- Springdoc 与 Spring Boot 的版本要匹配，避免传递依赖引入不兼容的 Boot 版本导致启动异常。
