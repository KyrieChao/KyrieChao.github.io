---
title: "2026-10-21 状态回归或者"
date: "2026-10-21 10:22:52 +0800"
excerpt: "状态回归或者 今晚状态特别好 写什么会什么"
tags: ["日志"]
categories: ["日志"]
series: "每日日志"
---

## 规则

阅读文档，理解基本概念。

合上文档，自己写一个最小程序。实在不知道怎么开始，可以重新查阅文档，但先明确自己卡在哪里。

记录一个具体结果：程序运行成功了什么，或者自己在哪一步卡住了。

## 日常 

今天答辩了MCU的阶段性项目 我看到好多有实力的项目 

我没做出来 因为前几天状态不在 低迷了 对完成项目 不期待了 

然后我觉得 还是对自己有兴趣的方面捣鼓的话 学习的很快 进步也很快 我傲慢着看着他们。

为什么我说我是傲慢的呢 我从始至终 没觉得有人有我的代码深度 都是刚入门的新手 我起码敲了有几年了。

> 我这次是真的补了 之前的内容了 起码可以敲出来了 不看别的 能记住api了

今天我敲代码的时候发现 我差点又忍不住去弄项目了 例如 krio 在服务器充当把文件复制移动到 as/下的 然后我可以在网页复制文件内容了

这个krio就是 解决了 Xshell连接服务器后 我无法复制长文件的内容 手动复制的话 最多复制38行 krio直接复制移动到 复制网址部署目录下 我就可以在网页点击复制

网站是:[https://as.chaokyrie.asia](https://as.chaokyrie.asia)

我想修改成任何人都可以往这里传 前提是有注册的 当前就是我能使用。


另一个就是 CKit的了 

接触到 静态库和共享库 我想加进CKit里面 让CKit更加的方便 但是我觉得先别做 

等过几天还是觉得需要的再做 好多都是三分钟热度 即使做成了 价值不高的话 时间利用率就低了


### 力扣 
这个是deep seek 给的答案
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

这个是我自己写的 额 还是说一下 我没发现 num-1会无限递归 deepseek看了之后我才知道的 但是我思路的代码成功了
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
    int* brr = getRow(num - 2, &n1);
    for (int i = 1; i < num - 1; i++) {
        arr[i] = brr[i - 1] + brr[i];
    }
    free(brr);
    return arr;
}
```


我看了几天的日志 写的挺多的 功劳应该在我的Blog变好看的原因吧 愿意看愿意写了。


今天完成了一天一题，复习了day1-day6 day7 day8也看了看 今天讲了 多线程同步控制、死锁还需要多看看多理解理解。


多发发 我觉得有意思的图片吧

![原神](/images/10_21_1.jpg)

![原神](/images/10_21_2.jpg)

![原神](/images/10_21_3.jpg)


虽然今晚也是挺饿的 但是我感觉状态很好  这个不足为惧。

又解决一道 虽然很简单 但是苍蝇再小也是肉
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