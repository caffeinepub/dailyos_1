// Deterministic color palette for activity timeline segments
const ACTIVITY_COLORS = [
  'oklch(0.65 0.20 250)', // Blue
  'oklch(0.70 0.18 150)', // Green
  'oklch(0.68 0.20 50)',  // Orange
  'oklch(0.65 0.18 300)', // Purple
  'oklch(0.72 0.18 180)', // Cyan
  'oklch(0.68 0.20 30)',  // Yellow-orange
  'oklch(0.65 0.18 330)', // Pink
  'oklch(0.70 0.16 120)', // Lime
];

/**
 * Simple hash function for strings
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get a deterministic color for an activity based on its name only
 * This ensures all activities with the same name get the same color
 */
export function getActivityColorByName(name: string): string {
  const hash = hashString(name);
  const colorIndex = hash % ACTIVITY_COLORS.length;
  return ACTIVITY_COLORS[colorIndex];
}

/**
 * Legacy function for backward compatibility
 * Now delegates to name-based coloring
 */
export function getActivityColor(activityId: bigint, createdAt: bigint, name: string): string {
  return getActivityColorByName(name);
}
