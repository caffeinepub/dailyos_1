/**
 * Custom label renderer for Recharts Pie that positions percentage text
 * inside the slice to prevent overflow on mobile devices
 */
export interface PiePercentLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
  isMobile?: boolean;
}

export function renderPiePercentLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
  isMobile = false,
}: PiePercentLabelProps) {
  const RADIAN = Math.PI / 180;
  // Position label inside the slice at 70% of the radius
  const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Use smaller font on mobile
  const fontSize = isMobile ? 11 : 13;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={fontSize}
      fontWeight="600"
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}
