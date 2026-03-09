import React from 'react';
import CommitGraph from '@/components/CommitGraph';

export const metadata = {
  title: '活动记录 | KyrieChao Blog',
  description: 'GitHub 提交历史与活跃度记录。',
};

export default function ActivityPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">活动记录</h1>
      <CommitGraph />
    </div>
  );
}
