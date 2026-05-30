import * as styles from "../styles/common";

function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue"
}) {
  const isRose = color === "rose";
  const badgeClass = isRose 
    ? "bg-[#ff3b30]/10 text-[#cc2f26]" 
    : "bg-[#0066cc]/10 text-[#0066cc]";

  return (
    <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 font-sans flex flex-col justify-between h-[120px] select-none">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-widest block">
            {title}
          </span>
          <h3 className="text-2xl font-bold text-[#1d1d1f] tracking-tight mt-1">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`p-2 rounded-xl ${badgeClass} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="text-[10px] font-semibold text-[#a1a1a6]">
        {subtitle}
      </div>
    </div>
  );
}

export default StatsCard;
