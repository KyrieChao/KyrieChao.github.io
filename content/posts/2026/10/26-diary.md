---
title: "2026-10-26 周一、模拟面试开始"
date: "2026-10-26 09:04:25 +0800"
excerpt: "有点排斥这个模拟面试 都特别急的执行 昨天爬完长城腿酸啊"
tags: ["日志"]
categories: ["日志"]
series: "每日日志"
---

## 日常

周末去爬长城了、今天腿都是酸的。

其实我本来上周日休息的、毕竟没休息好久了。可是这个计划恰好是舍友上上周打算要去的、我没休息然后他们也等我最后没去。

上周日我就得去了...

长城
![长城](/images/10_26_4.jpg)

小猫咪！
![小猫](/images/10_26_3.jpg)

好多人、电梯也好长
![人](/images/10_26_2.jpg)

我爬的快、等了他们1小时左右
![长城](/images/10_26_1.jpg)

我等他们的期间、有一个意大利外国人(中年妇女)跟我问路，但是我英语不好啊☠️。

我中间听到了个 finsh 我后面回想应该在问我 那里是终点么? 但是我回了个 

> Sorry、my english very bad.

我第一次后悔没好好学英语、没有帮到她。我感觉给祖国丢脸了......

### 周一: Day 1 文件操作

核心任务：独立实现文件复制程序

具体练习

编写 `mycp.c`，实现以下命令：

```bash
./mycp source.txt destination.txt
```

要求：

1. 使用 `open()` 打开源文件、创建目标文件。
2. 使用固定大小的缓冲区，例如 `char buf[1024]`。
3. 使用循环调用 `read()`，直到文件读取结束。
4. 对每次读取到的数据使用 `write()` 写入目标文件。
5. 正确处理文件描述符关闭和错误返回。

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>

#define BUFF_SIZE (1024 * 8)

void assess(int dest, int src) {
    if (close(dest) < 0) {
        perror("close dest");
        if (close(src) < 0) perror("close src");
        exit(-1);
    }
    if (close(src) < 0) {
        perror("close src");
        exit(-1);
    }
}

int main(int argc, char **argv) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <src> <dest>\n", argv[0]);
        exit(-1);
    }
    int src = open(argv[1], O_RDONLY);
    if (src < 0) {
        perror("open src");
        exit(-1);
    }
    int dest = open(argv[2], O_WRONLY | O_CREAT | O_EXCL, 0664);
    if (dest < 0) {
        close(src);
        if (errno == EEXIST) {
            fprintf(stderr, "dest %s already exists\n", argv[2]);
        } else {
            perror("open dest");
        }
        exit(-1);
    }
    char buf[BUFF_SIZE] = {0};
    while (1) {
        ssize_t r = 0;
        do {
            r = read(src, buf, BUFF_SIZE);
        } while (r < 0 && errno == EINTR);
        if (r < 0) {
            perror("read src");
            assess(dest, src);
            exit(-1);
        }
        if (r == 0) break;
        ssize_t total = 0;
        while (total < r) {
            ssize_t w;
            do {
                w = write(dest, buf + total, r - total);
            } while (w < 0 && errno == EINTR);
            if (w < 0) {
                perror("write dest");
                assess(dest, src);
                exit(-1);
            }
            if (w == 0) {
                fprintf(stderr, "write returned 0\n");
                assess(dest, src);
                exit(-1);
            }
            total += w;
        }
    }
    assess(dest, src);
    printf("copy file finshed!\n");
    return 0;
}
```

必须测试的情况：

- 源文件为空。
- 源文件小于 1024 字节。
- 源文件大于 1024 字节。
- 源文件不存在。
- 目标文件已存在。

已实现: 

```bash
root@kyriechao:~/work/linux/test# ls -l | grep test_cp_src.txt 
-rw-r--r-- 1 root root    13 Oct 26 10:22 test_cp_src.txt
root@kyriechao:~/work/linux/test# ck mycp.c -- test_cp_src.txt test_cp_dest.txt
[编译] mycp.c → ck/mycp
[运行] ck/mycp test_cp_src.txt test_cp_dest.txt
---
copy file finshed!
---
[退出码: 0]
root@kyriechao:~/work/linux/test# cmp -s test_cp_src.txt test_cp_dest.txt && echo "ok" ||echo "fail"
ok
root@kyriechao:~/work/linux/test# ck mycp.c -- AAA.txt test_cp_dest.txt
[编译] mycp.c → ck/mycp
[运行] ck/mycp AAA.txt test_cp_dest.txt
---
open src: No such file or directory
---
[退出码: 255]
root@kyriechao:~/work/linux/test# ck mycp.c -- test_cp_src.txt test_cp_dest.txt
[编译] mycp.c → ck/mycp
[运行] ck/mycp test_cp_src.txt test_cp_dest.txt
---
dest test_cp_dest.txt already exists
---
[退出码: 255]
root@kyriechao:~/work/linux/test# touch AAA.txt
root@kyriechao:~/work/linux/test# ck mycp.c -- AAA.txt a.txt
[编译] mycp.c → ck/mycp
[运行] ck/mycp AAA.txt a.txt
---
copy file finshed!
---
[退出码: 0]
root@kyriechao:~/work/linux/test# cmp -s AAA.txt a.txt && echo "ok" || echo "fail"
ok
root@kyriechao:~/work/linux/test# ls -l | grep AAA.txt
-rw-r--r-- 1 root root     0 Oct 26 10:24 AAA.txt
root@kyriechao:~/work/linux/test# ls -l | grep a.txt
-rw-r--r-- 1 root root     0 Oct 26 10:24 a.txt
root@kyriechao:~/work/linux/test# 
```
超过 (1024*8)
```bash
root@kyriechao:~/work/linux/test# dd if=/dev/urandom of=big.bin bs=1M count=100
100+0 records in
100+0 records out
104857600 bytes (105 MB, 100 MiB) copied, 0.436657 s, 240 MB/s
root@kyriechao:~/work/linux/test# clear
root@kyriechao:~/work/linux/test# ck mycp.c -- big.bin big_copy.bin
[编译] mycp.c → ck/mycp
[运行] ck/mycp big.bin big_copy.bin
---
copy file finshed!
---
[退出码: 0]
root@kyriechao:~/work/linux/test# cmp -s big.bin big_copy.bin && echo "ok" || echo "fail"ok
root@kyriechao:~/work/linux/test# 

```

达到什么程度才算完成？

你要能解释 `read()` 的三种返回情况：`-1` 表示出错、`0` 表示到达 EOF、正数表示实际读取的字节数。

还有一种情况 `系统调用执行到一半收到信号` 就中断了 这里就是加了个重试机制。

```c
    ssize_t r = 0;
    do {
        r = read(src, buf, BUFF_SIZE);
    } while (r < 0 && errno == EINTR);
    if (r < 0) {
        perror("read src");
        assess(dest, src);
        exit(-1);
    }
    if (r == 0) break;
```

同时必须理解：`write()` 不保证一次写完所有请求的数据，因此要考虑短写；不能把一次 `read()` 当作读取整个文件。缓冲区不需要随着文件大小增长，循环分块处理即可。

```c
    ssize_t total = 0;
    while (total < r) {
        ssize_t w;
        do {
            w = write(dest, buf + total, r - total);
        } while (w < 0 && errno == EINTR);
        if (w < 0) {
            perror("write dest");
            assess(dest, src);
            exit(-1);
        }
        if (w == 0) {
            fprintf(stderr, "write returned 0\n");
            assess(dest, src);
            exit(-1);
        }
        total += w;
    }
```
时间充足后，再补充 `lseek()` 和 `stat()`：写一个小程序，输出文件大小，并通过 `lseek()` 查看文件偏移。

stat小程序

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <time.h>

static void print_mode(mode_t mode) {
    char type;
    if (S_ISREG(mode)) type = '-';
    else if (S_ISDIR(mode)) type = 'd';
    else if (S_ISLNK(mode)) type = 'l';
    else if (S_ISCHR(mode)) type = 'c';
    else if (S_ISBLK(mode)) type = 'b';
    else if (S_ISFIFO(mode)) type = 'p';
    else if (S_ISSOCK(mode)) type = 's';
    else type = '?';

    char perm[10] = {0};
    perm[0] = (mode & S_IRUSR) ? 'r' : '-';
    perm[1] = (mode & S_IWUSR) ? 'w' : '-';
    perm[2] = (mode & S_IXUSR) ? 'x' : '-';
    perm[3] = (mode & S_IRGRP) ? 'r' : '-';
    perm[4] = (mode & S_IWGRP) ? 'w' : '-';
    perm[5] = (mode & S_IXGRP) ? 'x' : '-';
    perm[6] = (mode & S_IROTH) ? 'r' : '-';
    perm[7] = (mode & S_IWOTH) ? 'w' : '-';
    perm[8] = (mode & S_IXOTH) ? 'x' : '-';
    perm[9] = '\0';

    printf("st_mode         : 0%o (%c%s)\n", mode & 07777, type, perm);
}

static void print_time(const char *name, struct timespec ts) {
    char buf[64] = {0};
    struct tm tm;
    localtime_r(&ts.tv_sec, &tm);
    strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", &tm);
    printf("%-16s: %s.%09ld\n", name, buf, ts.tv_nsec);
}

int main(int argc, char **argv) {
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <path>\n", argv[0]);
        return 1;
    }

    struct stat st;
    if (stat(argv[1], &st) < 0) {
        perror("stat");
        return 1;
    }

    printf("== stat: %s ==\n", argv[1]);
    printf("st_dev          : %lu\n", (unsigned long)st.st_dev);
    printf("st_ino          : %lu\n", (unsigned long)st.st_ino);
    print_mode(st.st_mode);
    printf("st_nlink        : %lu\n", (unsigned long)st.st_nlink);
    printf("st_uid          : %u\n", st.st_uid);
    printf("st_gid          : %u\n", st.st_gid);
    printf("st_rdev         : %lu\n", (unsigned long)st.st_rdev);
    printf("st_size         : %ld\n", (long)st.st_size);
    printf("st_blksize      : %ld\n", (long)st.st_blksize);
    printf("st_blocks       : %ld\n", (long)st.st_blocks);
    print_time("st_atim", st.st_atim);
    print_time("st_mtim", st.st_mtim);
    print_time("st_ctim", st.st_ctim);

    printf("\n== 判断宏 ==\n");
    printf("S_ISREG         : %d\n", S_ISREG(st.st_mode));
    printf("S_ISDIR         : %d\n", S_ISDIR(st.st_mode));
    printf("S_ISLNK         : %d\n", S_ISLNK(st.st_mode));
    printf("S_ISCHR         : %d\n", S_ISCHR(st.st_mode));
    printf("S_ISBLK         : %d\n", S_ISBLK(st.st_mode));
    printf("S_ISFIFO        : %d\n", S_ISFIFO(st.st_mode));
    printf("S_ISSOCK        : %d\n", S_ISSOCK(st.st_mode));

    printf("\n== 权限位逐位 ==\n");
    printf("S_IRUSR         : %d\n", !!(st.st_mode & S_IRUSR));
    printf("S_IWUSR         : %d\n", !!(st.st_mode & S_IWUSR));
    printf("S_IXUSR         : %d\n", !!(st.st_mode & S_IXUSR));
    printf("S_IRGRP         : %d\n", !!(st.st_mode & S_IRGRP));
    printf("S_IWGRP         : %d\n", !!(st.st_mode & S_IWGRP));
    printf("S_IXGRP         : %d\n", !!(st.st_mode & S_IXGRP));
    printf("S_IROTH         : %d\n", !!(st.st_mode & S_IROTH));
    printf("S_IWOTH         : %d\n", !!(st.st_mode & S_IWOTH));
    printf("S_IXOTH         : %d\n", !!(st.st_mode & S_IXOTH));

    return 0;
}
```


```bash
root@kyriechao:~/work/linux/test# ck file_info.c -- mycp.c
[编译] file_info.c → ck/file_info
[运行] ck/file_info mycp.c
---
== stat: mycp.c ==
st_dev          : 64771
st_ino          : 661239
st_mode         : 0644 (-rw-r--r--)
st_nlink        : 1
st_uid          : 0
st_gid          : 0
st_rdev         : 0
st_size         : 1828
st_blksize      : 4096
st_blocks       : 8
st_atim         : 2026-10-26 10:15:29.321279549
st_mtim         : 2026-10-26 10:15:29.311278520
st_ctim         : 2026-10-26 10:15:29.314278828

== 判断宏 ==
S_ISREG         : 1
S_ISDIR         : 0
S_ISLNK         : 0
S_ISCHR         : 0
S_ISBLK         : 0
S_ISFIFO        : 0
S_ISSOCK        : 0

== 权限位逐位 ==
S_IRUSR         : 1
S_IWUSR         : 1
S_IXUSR         : 0
S_IRGRP         : 1
S_IWGRP         : 0
S_IXGRP         : 0
S_IROTH         : 1
S_IWOTH         : 0
S_IXOTH         : 0
---
[退出码: 0]
```

lseek

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>

int main(int argc, char **argv) {
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <path>\n", argv[0]);
        return 1;
    }
    int fd = open(argv[1], O_RDONLY);
    if (fd < 0) {
        perror("open file");
        exit(-1);
    }
    char buf[64] = {0};
    printf("初始偏移: %ld\n", (long)lseek(fd, 0, SEEK_CUR));
    int n = read(fd, buf, 10);
    if(n<0) {
        close(fd);
        exit(-1);
    }
    buf[n] = '\0';
    printf("read: %s\n", buf);
    printf("读10字节后: %ld\n", (long)lseek(fd, 0, SEEK_CUR));
    printf("文件大小: %ld\n", (long)lseek(fd, 0, SEEK_END));
    lseek(fd, 0, SEEK_SET);
    printf("回到头: %ld\n", (long)lseek(fd, 0, SEEK_CUR));
    close(fd);
    return 0;
}

```


```bash
root@kyriechao:~/work/linux/test# ck lseek_demo.c -- lseek_demo.c
[编译] lseek_demo.c → ck/lseek_demo
[运行] ck/lseek_demo lseek_demo.c
---
初始偏移: 0
read: #include <
读10字节后: 10
文件大小: 731
回到头: 0
---
[退出码: 0]
```

### 复盘

#### 今天搞懂的

也不算今天搞懂的、懂的是更加细节的地方。

例如 read、write的可能被系统中断知道了`EINTR`。

对熟悉度我更了解了`write`的循环写入的。

#### 踩过的坑

以前就知道套公式、所以对total的位置不清楚写错了。

write的也是忘记从哪里开始写

<details>
<summmary>DeepSeek所说的</summmary>

#### 今天搞懂的
- `read()` 三种返回值：`-1` 出错、`0` EOF、正数实际读到的字节数；循环里三个分支都要有。
- `write()` 不保证一次写完，必须用 `total` 累加、从 `buf + total` 偏移续写，不能写一次就当完事。
- 系统调用可能被信号打断返回 `EINTR`，这不是真错误，`read`/`write` 要 `do...while` 重试；`close` 遇到 `EINTR` 不重试。
- 复制是“循环读一块、写一块”，缓冲区不随文件变大，100MB 文件也是 8KB 一块块过的。
- `lseek` 管的是 fd 的**偏移量**（动态游标），`stat` 看的是文件**元数据**（静态属性），两回事。
- `st_mode` 能拆出文件类型和权限；`st_dev + st_ino` 才能唯一确定一个文件。

#### 踩过的坑
- `total` 定义在循环外没重置，第二次读直接跳过写入。
- `write` 没从 `buf + total` 开始写，短写时会重复写旧数据。
- `perror` 文案写错（`read` 失败报成 `write`）。
- 宏没加括号、`finshed` 拼错，小问题但容易留。

### 待补
- 目标已存在用 `O_CREAT | O_EXCL` 做到原子失败，已实现；但 `O_TRUNC` 覆盖模式下的“复制失败毁掉原目标”还没处理，后面了解临时文件 + `rename`。
- `fsync` 保证落盘、`fchmod`/`futimens` 保留元数据，知道有这些，暂不实现。
- 性能上可以了解 `copy_file_range`、`reflink`，现在 8KB 循环够用。

</details>