
type ProgressWidgetProps = {
  title: string;
  value: string | number;
  changeLabel?: string;
  progressPercent?: number;
  description?: string;
  highlightColor?: string;
  children?: React.ReactNode;
};

export default function ProgressWidget({
  title,
  value,
  changeLabel,
  progressPercent,
  description,
  highlightColor = "bg-blue-100 text-blue-600",
  children
}: ProgressWidgetProps) {
  return (
    <div className="rounded-3xl bg-white/80 shadow-glass px-9 py-7 flex flex-col min-h-[180px] border border-[#e6ecf7]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[1.22rem] font-bold text-gray-700 font-dmsans">{title}</span>
        {changeLabel && (
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${highlightColor}`}>{changeLabel}</span>
        )}
      </div>
      <div className="text-4xl font-extrabold text-primary font-dmsans leading-none">{value}</div>
      {description && <div className="text-[0.94rem] text-[#7c8ca2] mb-2">{description}</div>}
      {typeof progressPercent === "number" && (
        <div className="w-full h-2.5 rounded-full bg-[#e6f0fa] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8ecaf8] to-[#277fff] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
      {children}
    </div>
  );
}
