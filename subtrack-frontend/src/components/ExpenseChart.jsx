import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import * as styles from "../styles/common";

function ExpenseChart({ subscriptions }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Group subscriptions cost by the last 6 months
  const chartData = useMemo(() => {
    const months = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString(undefined, { month: "short" }),
        monthNum: d.getMonth(),
        yearNum: d.getFullYear(),
        total: 0,
      });
    }

    // Allocate subscription costs to each month
    subscriptions.forEach((sub) => {
      if (sub.status !== "active") return;
      
      const price = sub.price || 0;
      // Fallback creation date: if createdAt is missing, use current date
      const subCreated = sub.createdAt ? new Date(sub.createdAt) : new Date();

      months.forEach((m) => {
        // mEnd represents the start of the next month
        const mEnd = new Date(m.yearNum, m.monthNum + 1, 1);
        if (subCreated < mEnd) {
          // Add cost based on billing cycle
          if (sub.billingCycle === "monthly") {
            m.total += price;
          } else {
            m.total += price / 12;
          }
        }
      });
    });

    return months.map((m) => ({
      ...m,
      total: parseFloat(m.total.toFixed(2)),
    }));
  }, [subscriptions]);

  const maxTotal = useMemo(() => {
    const maxVal = Math.max(...chartData.map((d) => d.total));
    return maxVal > 0 ? maxVal * 1.15 : 100; // 15% padding
  }, [chartData]);

  // SVG dimensions
  const width = 700;
  const height = 240;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate path coordinates
  const points = useMemo(() => {
    return chartData.map((d, index) => {
      const x = padding + (index / (chartData.length - 1)) * chartWidth;
      const y = padding + chartHeight - (d.total / maxTotal) * chartHeight;
      return { x, y, label: d.label, total: d.total };
    });
  }, [chartData, maxTotal, chartWidth, chartHeight, padding]);

  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    return `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  }, [points, linePath, height, padding]);

  return (
    <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 flex flex-col font-sans select-none relative overflow-hidden transition-all">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[#1d1d1f] tracking-tight flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#0066cc]" />
            Monthly Cost Curve
          </h3>
          <p className={`${styles.mutedText} text-[10px] mt-0.5`}>
            Expense acceleration over the last 6 months
          </p>
        </div>
        <div className="flex items-center gap-1 text-[#6e6e73] font-medium text-[9px] bg-[#f5f5f7] px-2.5 py-1 rounded-full uppercase tracking-wider">
          <span>USD / Burn</span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full h-[240px]">
        {chartData.every(d => d.total === 0) ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[#a1a1a6] font-normal">
            No active subscription costs to graph.
          </div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0066cc" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#0066cc" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const yVal = padding + chartHeight - ratio * chartHeight;
              return (
                <line
                  key={ratio}
                  x1={padding}
                  y1={yVal}
                  x2={width - padding}
                  y2={yVal}
                  stroke="#e8e8ed"
                  strokeWidth="0.8"
                  strokeDasharray="4,4"
                />
              );
            })}

            {/* Area Path */}
            <path d={areaPath} fill="url(#areaGrad)" />

            {/* Line Path */}
            <path
              d={linePath}
              fill="none"
              stroke="#0066cc"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Scatter Dots & Tooltips */}
            {points.map((p, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <g key={index}>
                  {/* Invisible broad hover sector */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="15"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* Visual dot */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? "6.5" : "4.5"}
                    fill="#0066cc"
                    stroke="white"
                    strokeWidth="1.8"
                    className="transition-all duration-200 pointer-events-none"
                  />

                  {/* Y Axis Grid Label */}
                  {index === 0 && (
                    <text
                      x={padding - 6}
                      y={p.y + 3}
                      textAnchor="end"
                      fontSize="8"
                      className="fill-[#a1a1a6] font-semibold"
                    >
                      ${p.total.toFixed(0)}
                    </text>
                  )}

                  {/* X Axis Labels */}
                  <text
                    x={p.x}
                    y={height - padding + 15}
                    textAnchor="middle"
                    fontSize="9"
                    className="fill-[#a1a1a6] font-semibold"
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {/* CSS Tooltip popup box */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute bg-white/90 backdrop-blur-md text-[#1d1d1f] border border-[#e8e8ed] p-2.5 rounded-xl shadow-sm z-50 pointer-events-none text-[10px] font-medium"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100 - 18}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <p className="uppercase text-[#a1a1a6] text-[8px] tracking-wider mb-0.5">{points[hoveredIndex].label} Spend</p>
            <p className="text-sm font-semibold text-[#0066cc]">${points[hoveredIndex].total.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpenseChart;
