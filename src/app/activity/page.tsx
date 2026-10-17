import React from 'react';
import CommitGraph from '@/components/CommitGraph';

export const metadata = {
  title: '活动记录 | KyrieChao Blog',
  description: 'GitHub 提交历史与活跃度记录。',
};

export default function ActivityPage() {
  return (
    <div className="w-full py-8">
      <CommitGraph />
    </div>
  );
}
