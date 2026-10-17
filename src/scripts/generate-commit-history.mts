import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const HISTORY_PATH = path.join(PUBLIC_DIR, 'commit-history.json');
const RECORDS_PATH = path.join(PUBLIC_DIR, 'commit-records.json');

interface Activity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface CommitRecord {
  hash: string;
  shortHash: string;
  date: string;
  subject: string;
}

console.log('Generating commit history...');
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const output = execFileSync('git', [
  'log',
  '--date=short',
  '--format=%H%x1f%ad%x1f%s',
]).toString().trim();

if (!output) {
  fs.writeFileSync(HISTORY_PATH, JSON.stringify([]));
  fs.writeFileSync(RECORDS_PATH, JSON.stringify([]));
  console.log('No commits found.');
} else {
  const records: CommitRecord[] = output.split(/\r?\n/).map((line) => {
    const [hash, date, ...subjectParts] = line.split('\x1f');
    return {
      hash,
      shortHash: hash.slice(0, 7),
      date,
      subject: subjectParts.join('\x1f'),
    };
  });

  const counts: Record<string, number> = {};
  records.forEach(({ date }) => {
    counts[date] = (counts[date] || 0) + 1;
  });

  const maxCommits = Math.max(...Object.values(counts));
  const activities: Activity[] = Object.entries(counts).map(([date, count]) => {
    const level = Math.min(4, Math.ceil((count / maxCommits) * 4)) as Activity['level'];
    return { date, count, level };
  });
  activities.sort((a, b) => a.date.localeCompare(b.date));

  fs.writeFileSync(HISTORY_PATH, JSON.stringify(activities, null, 2));
  fs.writeFileSync(RECORDS_PATH, JSON.stringify(records, null, 2));
  console.log(`Generated history for ${activities.length} days and ${records.length} commits. Max commits: ${maxCommits}`);
}
