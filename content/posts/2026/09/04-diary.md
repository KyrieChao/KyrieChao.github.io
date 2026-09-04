---
title: "2026-09-04 进入新阶段MCU"
date: "2026-09-04 21:08:44 +0800"
excerpt: "进入新阶段MCU"
tags: ["Rust", "C语言", "培训", "日志"]
categories: ["日志"]
series: "每日日志"
---

## 技术


### C 语言
今天意识到写项目并非能很有效地学习C语言数据结构。

今天靠Codex，温习链表真的自己写出来的一点没靠ai 打算今天练习完哈希+链表的。但是老师进度较快 安装了很多软件。

所以不得不暂缓数据结构。

明天继续通过Codex 训练自己的C语言数据结构。

写一半才

```c

#include "lua_demo.h"
#include <stdio.h>

// LRU 缓存
struct node {
    int data;
    struct node *next, *prev;
};

struct head {
    Node* head;
    Node* tail;
    // size_t capacity;
};

// 初始化
List* list_init() {
    List* l = malloc(sizeof(List));
    if (!l) return NULL;
    Node* node = malloc(sizeof(Node));
    if (!node) {
        free(l);
        return NULL;
    }
    node->prev = node->next = NULL;
    l->head = node;
    l->tail = NULL;
    return l;
}
static void link_head(List* l, Node* n) {
    Node* p = l->head->next;
    n->next = p;
    n->prev = l->head;
    p->prev = n;
    l->head->next = n;
}
// 头插
int insert_head(List* l, int data) {
    if (!l) return -1;
    Node* n = malloc(sizeof(Node));
    if (!n) return -1;
    n->data = data;
    n->next = n->prev = NULL;
    if (l->head->next == NULL) {
        l->head->next = n;
        n->prev = l->head;
        l->tail = n;
        return 0;
    }
    link_head(l, n);
    return 0;
}

// 取任意节点
Node* fetch(List* l, int target) {
    if (l == NULL) return NULL;
    Node* p = l->head->next;
    while (p != NULL && p->data != target) p = p->next;
    if (p == NULL) return NULL;
    return p;
}

// 删除尾节点
int delete_tail(List* l) {
    if (!l || !l->tail) return -1;
    Node* p = l->tail;
    p->prev->next = NULL;
    if (p->prev == l->head)
        l->tail = NULL;
    else
        l->tail = p->prev;
    free(p);
    return 0;
}

// 把一个已在链表中的节点移到头部（只改指针，不 malloc、不 free）
int move_to_head(List* l, Node* node) {
    if (!l || !node) return -1;
    Node* prev = node->prev;
    Node* next = node->next;
    if (prev == l->head) return 0;
    if (next == NULL) {
        prev->next = NULL;
        l->tail = prev;
    } else {
        prev->next = next;
        next->prev = prev;
    }
    node->prev = node->next = NULL;
    link_head(l, node);
    return 0;
}

// 销毁
int destroy(List* l) {
    Node* p = l->tail;
    if (p == NULL) {
        free(l->head);
        free(l);
        return 0;
    }
    while (p != NULL) {
        Node* tmp = p->prev;
        free(p);
        p = tmp;
    }
    free(l);
    return 0;
}

void show(List* l) {
    Node* p = l->head->next;
    if (p == NULL) {
        printf("NULL\n");
        return;
    }
    while (p != NULL) {
        printf("%d ", p->data);
        p = p->next;
    }
    printf("\n");
}

int main() {
    // int a;
    // scanf("%d", &a);
    List* list = list_init();
    insert_head(list, 5);
    insert_head(list, 4);
    insert_head(list, 3);
    insert_head(list, 2);
    insert_head(list, 1);
    show(list);
    // printf("%d\n", list->tail->data);
    Node* p = fetch(list, 5);
    move_to_head(list, p);
    // show(list);
    // destroy(list);
    // insert_head(list, 1);
    show(list);
    // delete_tail(list);
    // insert_head(list, 3);
    // insert_head(list, 2);
    // insert_head(list, 1);
    // Node* p = fetch(list, 1);
    // move_to_head(list, p);
    // delete_tail(list);
    // int n = delete_tail(list);
    // printf("%d\n", n);
    // show(list);
    destroy(list);
    return 0;
}

```

- 图像处理工具（使用 BMP 图像格式，实现灰度化、负片
老师之前发的让我做的项目：
- 文件压缩工具（基于哈夫曼树实现）、模糊、边缘检测等）
- 智能温控风扇、智能储物柜、智能密码锁等

我对第一第二个项目很感兴趣，第三个是能做但感觉不是很难 感觉没什么技术含量。

### Rust
无
## 思考
无
## 明日计划

1.写完Lua的练习测试 跟住老师的进度同时巩固C语言数据结构。
2.学习好MCU
3.做项目（文件压缩工具、图像处理工具、智能温控风扇、智能储物柜、智能密码锁等）

