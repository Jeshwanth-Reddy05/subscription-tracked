import { useMemo, useState } from "react";
import { PieChart } from "lucide-react";
import * as styles from "../styles/common";

// Helper function to generate SVG path for a solid pie sector
const getSectorPath = (startPercent, endPercent, cx, cy, r) => {
  // Convert percentages to angles (in radians), starting at -90 degrees (top center)
  const startAngle = (startPercent * 360 - 90) * (Math.PI / 180);
  const endAngle = (endPercent * 360 - 90) * (Math.PI / 180);
  
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  
  const largeArcFlag = (endPercent - startPercent) > 0.5 ? 1 : 0;
  
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

function CategoryPieChart({ subscriptions }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Colors mapping for category sectors - Premium Apple Light Shades
  const colors = [
    { fill: "#0066cc", text: "text-[#0066cc]" }, // Primary Blue
    { fill: "#5e5e6e", text: "text-[#5e5e6e]" }, // Slate Dark
    { fill: "#8e8e93", text: "text-[#8e8e93]" }, // System Gray
    { fill: "#aeaeb2", text: "text-[#aeaeb2]" }, // Light Gray
    { fill: "#d1d1d6", text: "text-[#d1d1d6]" }, // Very Light Gray
    { fill: "#c7c7cc", text: "text-[#c7c7cc]" }, // Alternative System Gray
  ];

  const categoryTotals = useMemo(() => {
    const categories = {
      Entertainment: 0,
      Software: 0,
      Utilities: 0,
      Health: 0,
      Work: 0,
      Others: 0,
    };

    let grandTotal = 0;

    subscriptions.forEach((sub) => {
      if (sub.status !== "active") return;
      const price = sub.price || 0;
      const monthlyPrice = sub.billingCycle === "monthly" ? price : price / 12;
      
      const cat = categories[sub.category] !== undefined ? sub.category : "Others";
      categories[cat] += monthlyPrice;
      grandTotal += monthlyPrice;
    });

    const parsedData = Object.keys(categories).map((key, i) => ({
      name: key,
      value: parseFloat(categories[key].toFixed(2)),
      color: colors[i % colors.length],
    }));

    return {
      data: parsedData.filter((d) => d.value > 0),
      grandTotal,
    };
  }, [subscriptions]);

  const { data, grandTotal } = categoryTotals;

  // Calculate sector angles/percentages for solid SVG segments
  const pieSegments = useMemo(() => {
    let accumulatedPercent = 0;
    const cx = 75;
    const cy = 75;
    const r = 50; // radius of the pie

    return data.map((d) => {
      const percentage = grandTotal > 0 ? d.value / grandTotal : 0;
      const startPercent = accumulatedPercent;
      const endPercent = accumulatedPercent + percentage;
      accumulatedPercent = endPercent;

      return {
        ...d,
        percentage,
        startPercent,
        endPercent,
        cx,
        cy,
        r,
      };
    });
  }, [data, grandTotal]);

  return (
    <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 flex flex-col font-sans select-none relative overflow-hidden transition-all">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[#1d1d1f] tracking-tight flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-[#0066cc]" />
            Category Allocation
          </h3>
          <p className={`${styles.mutedText} text-[10px] mt-0.5`}>
            Expense distribution across departments
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-16 text-center text-xs text-[#a1a1a6] font-normal leading-relaxed">
          No expenses to divide. Categories will unlock once tracking.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Solid SVG Pie */}
          <div className="relative w-40 h-40 shrink-0">
            <svg viewBox="0 0 150 150" className="w-full h-full overflow-visible">
              <circle cx="75" cy="75" r="50" fill="#f5f5f7" />
              {pieSegments.map((seg, i) => {
                const isHovered = hoveredIndex === i;
                const radius = isHovered ? seg.r + 4 : seg.r;

                // 100% full circle case
                if (seg.percentage > 0.999) {
                  return (
                    <circle
                      key={seg.name}
                      cx={seg.cx}
                      cy={seg.cy}
                      r={radius}
                      fill={seg.color.fill}
                      className="cursor-pointer transition-all duration-300 origin-center"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                }

                // Normal pie sector path
                const pathData = getSectorPath(seg.startPercent, seg.endPercent, seg.cx, seg.cy, radius);

                return (
                  <path
                    key={seg.name}
                    d={pathData}
                    fill={seg.color.fill}
                    className="cursor-pointer transition-all duration-300 origin-center"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>
          </div>

          {/* List Legends */}
          <div className="flex-1 space-y-2.5 w-full">
            {pieSegments.map((seg, i) => {
              const isHovered = hoveredIndex === i;
              return (
                <div
                  key={seg.name}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between p-1.5 rounded-xl transition cursor-pointer ${
                    isHovered
                      ? "bg-[#f5f5f7]"
                      : "hover:bg-[#f5f5f7]/50"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color.fill }}
                    ></div>
                    <span className="text-xs font-medium text-[#6e6e73] truncate">
                      {seg.name}
                    </span>
                  </div>
                  <div className="text-right text-[10px] font-semibold text-[#1d1d1f] pl-2">
                    ${seg.value.toFixed(2)}
                    <span className="text-[#a1a1a6] font-normal pl-1.5">
                      ({Math.round(seg.percentage * 100)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryPieChart;
