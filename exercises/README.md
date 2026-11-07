# 练习代码

各语言练习的存放地。文章里通过 GitHub 链接引用，源码不进入站点构建产物。

## 目录规则

```
exercises/<语言>/<年>/<月>/<日>/<主题>.<扩展名>
```

日期全部由目录承担，文件名只写主题。能单文件运行的就放单文件，需要构建配置的建目录，目录名加 `d-` 前缀（directory）和单文件区分。

```
exercises/
├── rust/
│   └── 2026/
│       └── 11/
│           └── 07/
│               ├── linked-list.rs
│               ├── two-sum.rs
│               └── d-thread-pool/
│                   ├── Cargo.toml
│                   └── src/main.rs
├── java/
│   └── 2026/11/07/
│       └── LinkedList.java
└── cpp/
    └── 2026/11/07/
        └── linked-list.cpp
```

日期用两位数字，和日志目录（`content/posts/2026/11/07_11/`）的层级对齐，写文章时一眼能对上。

## 创建文件

用项目根目录的 `blog code` 命令，不要手动建目录：

```bash
./blog.exe code python hello       # exercises/python/2026/11/07/hello.py
./blog.exe code rust two-sum 11-5  # exercises/rust/2026/11/05/two-sum.rs
./blog.exe code java two-sum       # exercises/java/2026/11/07/TwoSum.java
```

日期规则和 `blog img` 一致：`2026-11-5`、`11-5`、`5` 三种写法，省略就是今天。创建的是空文件，已存在则不覆盖。

## 语言目录

| 语言 | 目录名 | 备注 |
| --- | --- | --- |
| Rust | `rust` | |
| C | `c` | |
| C++ | `cpp` | 不用 `c++`，`+` 在 URL 里要转义 |
| Python | `python` | |
| Go | `go` | |
| Java | `java` | |
| C# | `csharp` | 不用 `c#`，`#` 会被当成 URL 锚点 |
| JavaScript | `javascript` | |
| TypeScript | `typescript` | |

## 单文件还是项目目录

| 语言 | 单文件 | 需要目录时最小结构 |
| --- | --- | --- |
| Rust | 可以 | `Cargo.toml` + `src/main.rs` |
| C | 可以 | `Makefile` |
| C++ | 可以 | `CMakeLists.txt` |
| Python | 可以 | `pyproject.toml` |
| Go | 可以 | `go.mod` + `main.go` |
| Java | 可以（Java 11+） | `pom.xml` 或 `build.gradle` |
| C# | 不建议 | `Program.cs` + `<名字>.csproj` |
| JavaScript | 可以 | `package.json` |
| TypeScript | 可以 | `tsconfig.json` |

判断标准只有一条：**能不能一条命令跑起来**。要装依赖、要配构建的，就建 `d-` 目录。

## 命名

主题用小写连字符：`linked-list`、`quick-sort`、`thread-pool`。

LeetCode 一类刷题加题号前缀，便于排序查找：`0001-two-sum.rs`、`0206-reverse-linked-list.rs`。

项目目录额外加 `d-` 前缀：`d-thread-pool/`、`d-my-cli/`。

文件名遵循各语言社区约定：

| 语言 | 文件命名 | 示例 |
| --- | --- | --- |
| Rust | snake_case | `linked_list.rs` |
| C / C++ | snake_case 或连字符 | `linked_list.cpp` |
| Python | snake_case（PEP 8） | `linked_list.py` |
| Go | snake_case | `linked_list.go` |
| Java | PascalCase，且必须等于 public 类名 | `LinkedList.java` |
| C# | PascalCase | `LinkedList.cs` |
| JavaScript | 连字符或 camelCase | `linked-list.js` |
| TypeScript | 同 JavaScript | `linked-list.ts` |

## 项目

现阶段以小段练习为主，不放完整项目。将来需要时，在日期目录下建 `d-` 前缀的目录，结构不用调整：

```
exercises/rust/2026/11/15/
├── ownership.rs
└── d-my-cli/
    ├── Cargo.toml
    └── src/main.rs
```

`d-` 前缀一眼标识这是项目而不是练习文件，目录里放完整的构建配置（`Cargo.toml`、`go.mod`、`pom.xml`、`package.json` 等）。

## 在文章里引用

用 GitHub 的 blob 链接：

```markdown
[链表练习（Rust）](https://github.com/KyrieChao/KyrieChao.github.io/blob/main/exercises/rust/2026/11/07/linked-list.rs)
```

想在新标签页打开，直接写 HTML（渲染管线允许原始 HTML）：

```html
<a href="https://github.com/KyrieChao/KyrieChao.github.io/blob/main/exercises/rust/2026/11/07/linked-list.rs" target="_blank" rel="noopener noreferrer">链表练习（Rust）</a>
```

链接到 `main` 分支意味着代码改动后文章里的内容会跟着变。想让文章对应固定版本，改用 commit permalink：

```
https://github.com/KyrieChao/KyrieChao.github.io/blob/<commit-sha>/exercises/rust/2026/11/07/linked-list.rs
```

## 注意事项

- **不要放进 `public/`**。`public/` 下的文件会被复制到构建产物随站点部署，`exercises/` 放在仓库根目录则完全不参与构建。
- 仓库是公开的，练习代码里不要留路径、密钥、个人信息。
- 同一天写了多个练习，靠主题名区分，不要用 `-2`、`-3` 后缀。日期只精确到日，同一天同主题只保留最终版本，中间过程交给 git 提交历史。
