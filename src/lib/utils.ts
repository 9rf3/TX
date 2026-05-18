

export function cn(...classes: (string | undefined | null | false | 0 | 0n)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatXP(xp: number): string {
  return formatNumber(xp) + " XP";
}

export function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

export function getXPProgress(xp: number): number {
  return (xp % 1000) / 1000 * 100;
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#94a3b8';
    case 'rare': return '#3b82f6';
    case 'epic': return '#8b5cf6';
    case 'legendary': return '#f59e0b';
    default: return '#94a3b8';
  }
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'development': return '💻';
    case 'design': return '🎨';
    case 'data-science': return '📊';
    case 'business': return '📈';
    case 'marketing': return '📱';
    case 'ai': return '🤖';
    default: return '📚';
  }
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'all': return 'All Courses';
    case 'development': return 'Development';
    case 'design': return 'Design';
    case 'data-science': return 'Data Science';
    case 'business': return 'Business';
    case 'marketing': return 'Marketing';
    case 'ai': return 'AI & ML';
    default: return category;
  }
}
