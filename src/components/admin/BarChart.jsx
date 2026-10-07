import { useState } from 'react';

/**
 * Bar chart sederhana dengan CSS
 * Props:
 * - data: [{ label, value, ...extras }]
 * - valueKey: key dari data yang mau di-chart (default: 'value')
 * - labelKey: key untuk label (default: 'label')
 * - color: warna bar (hex)
 * - height: tinggi area chart (default 200)
 * - formatValue: fn(value) → string untuk tooltip
 */
export default function BarChart({
  data = [],
  valueKey = 'value',
  labelKey = 'label',
  color = '#123A7A',
  height = 200,
  formatValue,
}) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (data.length === 0) {
    return (
      <div className="text-center text-xs text-benhur-700/60 py-8">
        Belum ada data
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d[valueKey]), 1);
  const labelStep = data.length > 15 ? Math.ceil(data.length / 10) : 1;

  return (
    <div className="w-full">
      <div
        className="flex items-end gap-1 md:gap-1.5 w-full"
        style={{ height: height + 30 }}
      >
        {data.map((d, i) => {
          const value = d[valueKey];
          const percent = (value / maxValue) * 100;
          const isHover = hoverIndex === i;
          const showLabel = i % labelStep === 0 || i === data.length - 1;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end h-full relative"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Tooltip */}
              {isHover && value > 0 && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-benhur-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                  {formatValue ? formatValue(value, d) : value}
                </div>
              )}

              {/* Bar */}
              <div
                className="w-full rounded-t border-2 border-benhur-900 transition-all"
                style={{
                  height: Math.max(percent, value > 0 ? 2 : 0) + '%',
                  minHeight: value > 0 ? 4 : 0,
                  background: isHover ? '#FFC93C' : color,
                }}
              />

              {/* Label bawah */}
              {showLabel && (
                <div className="text-[9px] md:text-[10px] font-bold text-benhur-700/60 mt-1 whitespace-nowrap rotate-0">
                  {d[labelKey]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}