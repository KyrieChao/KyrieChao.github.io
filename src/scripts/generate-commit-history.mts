import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUTPUT_PATH = path.join(process.cwd(), 'public', 'commit-history.json');

interface Activity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

try {
  console.log('Generating commit history...');
  
  // Get all commit dates
  // Format: YYYY-MM-DD
  const cmd = 'git log --date=short --format="%ad"';
  const output = execSync(cmd).toString().trim();
  
  if (!output) {
    console.log('No commits found.');
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify([]));
    process.exit(0);
  }

  const dates = output.split('\n');
  const counts: Record<string, number> = {};

  // Count commits per day
  dates.forEach(date => {
    counts[date] = (counts[date] || 0) + 1;
  });

  // Calculate max commits for scaling
  const maxCommits = Math.max(...Object.values(counts));

  // Generate the activity array
  const activities: Activity[] = Object.entries(counts).map(([date, count]) => {
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    
    if (count === 0) level = 0;
    else if (count <= maxCommits * 0.25) level = 1;
    else if (count <= maxCommits * 0.5) level = 2;
    else if (count <= maxCommits * 0.75) level = 3;
    else level = 4;

    return { date, count, level };
  });

  // Sort by date
  activities.sort((a, b) => a.date.localeCompare(b.date));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(activities, null, 2));
  console.log(`Generated history for ${activities.length} days. Max commits: ${maxCommits}`);

} catch (error) {
  console.error('Failed to generate commit history:', error);
  // Fallback to empty array to prevent build failure
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify([]));
}
