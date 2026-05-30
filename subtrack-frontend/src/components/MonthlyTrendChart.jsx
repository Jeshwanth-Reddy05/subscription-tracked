import { useMemo, useState } from "react";
import { BarChart } from "lucide-react";
import * as styles from "../styles/common";

function MonthlyTrendChart({ subscriptions }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Group subscriptions count & cost by month for the last 6 months
  const monthlyData = useMemo(() => {
    const months = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString(undefined, { month: "short" }),
        monthNum: d.getMonth(),
        yearNum: d.getFullYear(),
        cost: 0,
        count: 0,
      });
    }

    subscriptions.forEach((sub) => {
      if (sub.status !== "active") return;
      const price = sub.price || 0;
      const subCreated = new Date(sub.createdAt || sub.renewalDate);

      months.forEach((m) => {
        const mStart = new Date(m.yearNum, m.monthNum, 1);
        if (subCreated <= mStart) {
          m.count += 1;
          if (sub.billingCycle === "monthly") {
            m.cost += price;
          } else {
            m.cost += price / 12;
          }
        }
      });
    });

    return months.map((m) => ({
      ...m,
      cost: parseFloat(m.cost.toFixed(2)),
    }));
  }, [subscriptions]);

  const maxCost = useMemo(() => {
    const maxVal = Math.max(...monthlyData.map((d) => d.cost));
    return maxVal > 0 ? maxVal * 1.15 : 100;
  }, [monthlyData]);

  // SVG parameters
  const width = 500;
  const height = 240;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = 24;

  const bars = useMemo(() => {
    const numBars = monthlyData.length;
    const spacing = chartWidth / numBars;

    return monthlyData.map((d, index) => {
      const x = padding + index * spacing + spacing / 2 - barWidth / 2;
      const barHeight = (d.cost / maxCost) * chartHeight;
      const y = padding + chartHeight - barHeight;

      return {
        x,
        y,
        w: barWidth,
        h: Math.max(4, barHeight), // min height of 4 for visibility
        label: d.label,
        cost: d.cost,
        count: d.count,
      };
    });
  }, [monthlyData, maxCost, chartWidth, chartHeight, padding]);

  return (
    <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 flex flex-col font-sans select-none relative overflow-hidden transition-all">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[#1d1d1f] tracking-tight flex items-center gap-1.5">
            <BarChart className="w-4 h-4 text-[#0066cc]" />
            Billing Cycle Velocity
          </h3>
          <p className={`${styles.mutedText} text-[10px] mt-0.5`}>
            Service volume versus total expenditure
          </p>
        </div>
      </div>

      <div className="relative w-full h-[240px]">
        {monthlyData.every((d) => d.cost === 0) ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[#a1a1a6] font-normal">
            No expenses found to chart trends.
          </div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
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

            {/* Custom SVG Columns / Bars */}
            {bars.map((bar, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <g key={index}>
                  {/* Invisible broad hover backdrop block */}
                  <rect
                    x={bar.x - 10}
                    y={padding}
                    width={bar.w + 20}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* Visual column with smooth radius */}
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={bar.w}
                    height={bar.h}
                    rx="5"
                    fill={isHovered ? "#0066cc" : "#aeaeb2"}
                    opacity={isHovered ? 1 : 0.85}
                    className="transition-all duration-300"
                  />

                  {/* Y Axis Grid Labels */}
                  {index === 0 && (
                    <text
                      x={padding - 6}
                      y={bar.y + 3}
                      textAnchor="end"
                      fontSize="8"
                      className="fill-[#a1a1a6] font-semibold"
                    >
                      ${bar.cost.toFixed(0)}
                    </text>
                  )}

                  {/* X Axis labels */}
                  <text
                    x={bar.x + bar.w / 2}
                    y={height - padding + 15}
                    textAnchor="middle"
                    fontSize="9"
                    className="fill-[#a1a1a6] font-semibold"
                  >
                    {bar.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {/* Tooltip Overlay */}
        {hoveredIndex !== null && bars[hoveredIndex] && (
          <div
            className="absolute bg-white/90 backdrop-blur-md text-[#1d1d1f] border border-[#e8e8ed] p-2.5 rounded-xl shadow-sm z-50 pointer-events-none text-[10px] font-medium"
            style={{
              left: `${((bars[hoveredIndex].x + barWidth / 2) / width) * 100}%`,
              top: `${(bars[hoveredIndex].y / height) * 100 - 18}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <p className="uppercase text-[#a1a1a6] text-[8px] tracking-wider mb-0.5">{bars[hoveredIndex].label} Spend</p>
            <p className="text-sm font-semibold text-[#0066cc]">${bars[hoveredIndex].cost.toFixed(2)}</p>
            <p className="text-[8.5px] text-[#6e6e73] mt-1">{bars[hoveredIndex].count} Active Subscriptions</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MonthlyTrendChart;
