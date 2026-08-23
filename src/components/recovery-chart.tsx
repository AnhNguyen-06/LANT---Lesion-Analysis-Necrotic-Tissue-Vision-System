"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { SnapshotLog } from "@/types/medical-schema";

interface RecoveryChartProps {
  snapshots: SnapshotLog[];
}

export function RecoveryChart({ snapshots }: RecoveryChartProps) {
  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-xs text-slate-400 font-sans border border-oceanic-100/70">
        Chưa có chuỗi dữ liệu phục hồi để vẽ đồ thị.
      </div>
    );
  }

  // Transform snapshot array for Recharts
  const chartData = snapshots.map((s) => ({
    label: `Ngày ${s.dayIndex}`,
    rawDay: s.dayIndex,
    timestamp: new Date(s.timestamp).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    areaCm2: s.totalAreaCm2,
    whiScore: s.whiScore,
    deltaBase: s.deltaBasePercent,
    deltaPrev: s.deltaPrevPercent,
    red: s.rybMetrics.redPercent,
    yellow: s.rybMetrics.yellowPercent,
    black: s.rybMetrics.blackPercent,
    pink: s.rybMetrics.pinkPercent,
    dressing: s.recommendation.primaryDressing,
  }));

  // Custom Rich Tooltip with unified font
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-2xl border border-oceanic-100 bg-white/95 backdrop-blur-md p-4 shadow-clinical space-y-2 text-xs font-sans max-w-xs z-50">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-oceanic font-heading">{data.label} ({data.timestamp})</span>
            <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
              data.whiScore >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              WHI: {data.whiScore}/100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 font-sans">Diện tích đo:</span>
              <p className="font-mono font-bold text-oceanic text-sm">{data.areaCm2} cm²</p>
            </div>
            <div>
              <span className="text-slate-500 font-sans">Thu nhỏ vs Ban đầu:</span>
              <p className="font-mono font-bold text-emerald-600 text-sm">
                {data.deltaBase > 0 ? `-${data.deltaBase}%` : `${data.deltaBase}%`}
              </p>
            </div>
          </div>

          {/* Mini RYB breakdown */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-600 block mb-1 font-heading">Tỷ lệ mô học:</span>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
              <span className="text-red-600">Đỏ: {data.red}%</span>
              <span className="text-amber-600">Vàng: {data.yellow}%</span>
              <span className="text-slate-900">Đen: {data.black}%</span>
              <span className="text-pink-600">Hồng: {data.pink}%</span>
            </div>
          </div>

          <div className="pt-1 text-[10px] text-dusk-600 bg-azure-mist/60 p-2 rounded-lg border border-oceanic-100/50 font-sans">
            <span className="font-bold">Gạc áp dụng:</span> {data.dressing}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl bg-white/95 p-7 shadow-clinical space-y-4 font-sans border border-oceanic-100/70">
      
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-oceanic font-heading">
            Đường biến thiên phục hồi <span className="font-editorial italic font-normal text-sapphire">chuỗi thời gian</span>
          </h3>
          <p className="text-[11px] text-dusk-500">
            Đối chiếu diện tích thực tế (cm²) và chỉ số sức khỏe vết thương (WHI)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-oceanic" />
            <span className="text-oceanic font-heading">Diện tích (cm²)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-heading">Điểm WHI (0-100)</span>
          </div>
        </div>
      </div>

      {/* Responsive Composed Recharts with Unified System Fonts */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#002B8C" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#002B8C" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            
            <XAxis 
              dataKey="label" 
              tick={{ fill: "#475569", fontSize: 11, fontFamily: "var(--font-poppins)", fontWeight: 500 }}
              axisLine={{ stroke: "#CBD5E1" }}
              tickLine={false}
            />

            {/* Left Y Axis for Area cm2 */}
            <YAxis 
              yAxisId="left"
              orientation="left"
              tick={{ fill: "#002B8C", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600 }}
              unit=" cm²"
              axisLine={{ stroke: "#CBD5E1" }}
              tickLine={false}
            />

            {/* Right Y Axis for WHI 0-100 */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fill: "#059669", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600 }}
              unit=" WHI"
              axisLine={{ stroke: "#CBD5E1" }}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Area Curve for Area cm2 */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="areaCm2"
              fill="url(#areaGradient)"
              stroke="#002B8C"
              strokeWidth={3}
              dot={{ r: 4, fill: "#002B8C", stroke: "#FFFFFF", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#0F52BA", stroke: "#FFFFFF", strokeWidth: 2 }}
            />

            {/* Line for WHI Score */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="whiScore"
              stroke="#10B981"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 4, fill: "#10B981", stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
        <span>Mốc khởi đầu: {chartData[0]?.areaCm2} cm²</span>
        <span className="text-emerald-700 font-bold">
          Tổng tỷ lệ co nhỏ: -{chartData[chartData.length - 1]?.deltaBase}%
        </span>
        <span>Lần quét gần nhất: {chartData[chartData.length - 1]?.areaCm2} cm²</span>
      </div>

    </div>
  );
}
