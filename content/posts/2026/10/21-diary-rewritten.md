---
title: "状态回来了，也更愿意记录了 Copilot 修改版"
date: "2026-10-21 10:22:52 +0800"
excerpt: "今天答辩了 MCU 阶段性项目，也重新找回了学习和写代码的状态。"
tags: ["日志"]
categories: ["日志"]
series: "每日日志"
---

## 给自己的学习规则

先阅读文档，弄懂基本概念；然后合上文档，试着独立写一个最小程序。如果不知道从哪里开始，就重新查文档，但要先想清楚自己具体卡在了哪里。

最后记下一个明确的结果：程序成功做到了什么，或者自己停在了哪一步。

## 今天的答辩和状态

今天参加了 MCU 阶段性项目答辩，现场有不少完成度很高、也很有实力的项目。可惜我自己的项目没有做出来。前几天状态比较低迷，我对完成项目也渐渐没了期待。

我发现，做自己真正感兴趣的事情时，学习会更快，进步也更明显。看到其他人的项目后，我并没有觉得自己在代码方面不如他们，甚至有些傲慢：我总觉得他们还在入门阶段，而自己已经写了好几年代码。

不过，这次我确实把之前落下的内容补了起来，至少现在能自己敲出来，也开始记住一些 API 了。这是实实在在的进步。

## 又差点开始做新项目

今天写代码时，我发现自己差点又忍不住跑去折腾项目了。比如 Krio：我想让它在服务器上把文件复制或移动到 AS 的部署目录里，这样我就能在网页上复制文件内容。

Krio 最初是为了解决一个很具体的问题：通过 Xshell 连接服务器时，我不方便复制长文件，手动复制最多只能处理大约 38 行。于是我做了这个工具，把文件放到网站的部署目录，再通过网页查看并点击复制。

网站地址：[https://as.chaokyrie.asia](https://as.chaokyrie.asia)

现在这个功能只有我自己能用。我还想把它扩展成注册用户也能上传文件，不过暂时先记下这个想法，不急着动手。

另一个想法是给 CKit 加入静态库和共享库支持，让它用起来更方便。但我打算先等等：过几天如果还是觉得有必要，再开始做。很多想法都只有三分钟热度；即使做完了，如果实际价值不高，投入的时间也未必划算。

## 力扣：杨辉三角 II

下面是 DeepSeek 给出的解法：

```c
/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* getRow(int rowIndex, int* returnSize) {
    int num = rowIndex + 1;
    int* arr = malloc(sizeof(int) * num);
    *returnSize = num;
    for (int i = 0; i < num; i++)
        arr[i] = 1;

    for (int i = 2; i < num; i++) {
        for (int j = i - 1; j > 0; j--) {
            arr[j] = arr[j] + arr[j - 1];
        }
    }
    return arr;
}
```

下面是我自己写的版本。我的思路是递归地先拿到上一行，再计算当前行；不过一开始没发现递归参数如果写成 `num - 1` 就会一直求同一行。DeepSeek 指出这个问题后，我才意识到应该传入 `num - 2`，这样才能得到上一行。改好之后，代码就能按这个思路运行了。

```c
/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* getRow(int rowIndex, int* returnSize) {
    int num = rowIndex + 1;
    int* arr = malloc(sizeof(int) * num);
    arr[0] = arr[num - 1] = 1;
    *returnSize = num;
    if (num < 2) {
        return arr;
    }
    int n1;
    int* brr = getRow(num - 2, &n1); // 这里 num -1 会死循环
    // 这里我想拿到的是arr的上一层 num是rowIndex + 1
    // num -1 一直求rowIndex的
    // 没有求到rowIndex-1的 所以 疏忽了
    for (int i = 1; i < num - 1; i++) {
        arr[i] = brr[i - 1] + brr[i];
    }
    free(brr);
    return arr;
}
```

回头看了最近几天的日志，发现自己写了不少东西。我猜这和 Blog 变好看了也有关系：页面舒服了一些，我就更愿意打开它、看看自己的记录，再接着写下去。

今天完成了一天一题，也复习了 Day 1 到 Day 6。Day 7 和 Day 8 我也看了看，今天学的是多线程同步控制和死锁，这些内容还需要再多理解几遍。

以后多发一些自己觉得有意思的图片吧。

![原神](/images/10_21_1.jpg)

![原神](/images/10_21_2.jpg)

![原神](/images/10_21_3.jpg)

今晚虽然也挺饿，但状态很好，这点不舒服不算什么。

又做完一道题了。题目虽然简单，但苍蝇再小也是肉。

```c
// 给定一个非负整数 num，反复将各个位上的数字相加，直到结果为一位数。返回这个结果。

// 示例 :
// 输入: num = 38
// 输出: 2
// 解释: 各位相加的过程为：
// 38 --> 3 + 8 --> 11
// 11 --> 1 + 1 --> 2
// 由于 2 是一位数，所以返回 2。

int addDigits(int num) {
    int n = 0;
    while (1) {
        n += num % 10;
        num /= 10;
        if (num <= 0)
            break;
    }
    if (n >= 10) {
        return addDigits(n);
    }else{
        return n;
    }

}
```
