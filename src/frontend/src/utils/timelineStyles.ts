/**
 * Utility to generate modern gradient-based styles for Daily Timeline segments
 * Converts a base OKLCH color into a gradient with subtle glow effect
 */
export function getSegmentStyle(baseColor: string): {
  background: string;
  boxShadow: string;
} {
  // Parse OKLCH color to extract L, C, H values
  const match = baseColor.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  
  if (!match) {
    // Fallback if color doesn't match expected format
    return {
      background: baseColor,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    };
  }

  const [, l, c, h] = match;
  const lightness = parseFloat(l);
  const chroma = parseFloat(c);
  const hue = parseFloat(h);

  // Create gradient from slightly lighter to base color
  const lighterL = Math.min(lightness + 0.08, 0.95);
  const darkerL = Math.max(lightness - 0.05, 0.3);
  
  const gradientStart = `oklch(${lighterL} ${chroma} ${hue})`;
  const gradientEnd = `oklch(${darkerL} ${chroma} ${hue})`;
  
  // Subtle glow color with reduced opacity
  const glowColor = `oklch(${lightness} ${chroma} ${hue} / 0.4)`;
  
  return {
    background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
    boxShadow: `0 2px 4px rgba(0, 0, 0, 0.1), 0 0 8px ${glowColor}`,
  };
}
