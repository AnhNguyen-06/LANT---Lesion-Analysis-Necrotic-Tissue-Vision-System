"use client";

import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  Legend,
  Line,
  ComposedChart
} from "recharts";
import { SnapshotLog } from "@/types/medical-schema";
import { TrendingDown, TrendingUp, Sparkles } from "lucide-react";

interface RecoveryChartProps {
  snapshots: SnapshotLog[];
}

export function RecoveryChart({ snapshots }: RecoveryChartProps) {
  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-oceanic-200 bg-azure-mist/30 text-xs text-dusk-500">
        Chưa có đủ dữ liệu chuỗi thời gian để vẽ biểu đồ phục hồi.
      </div>
    );
  }

  // Format chart data points
  const chartData = snapshots.map((s, idx) => ({
    name: `Ngày ${s.dayIndex}`,
    date: new Date(s.timestamp).toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" }),
    area: s.totalAreaCm2,
    whi: s.whiScore,
    red: s.rybMetrics.redPercent,
    yellow: s.rybMetrics.yellowPercent,
    black: s.rybMetrics.blackPercent,
    pink: s.rybMetrics.pinkPercent,
    deltaBase: s.deltaBasePercent,
    deltaPrev: s.deltaPrevPercent,
  }));

  const initialArea = snapshots[0].totalAreaCm2;
  const currentArea = snapshots[snapshots.length - 1].totalAreaCm2;
  const totalReductionPct = initialArea > 0 ? (((initialArea - currentArea) / initialArea) * 100).toFixed(1) : "0";
  const isProgressing = Number(totalReductionPct) >= 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-oceanic-200 bg-white p-3 shadow-clinical text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1 font-bold text-oceanic">
            <span>{data.name} ({data.date})</span>
            <span className="font-mono text-sapphire">{data.area} cm²</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Chỉ số WHI:</span>
            <span className="font-bold text-emerald-600">{data.whi} / 100</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Giảm so với ban đầu (ΔBase):</span>
            <span className={`font-bold ${data.deltaBase >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {data.deltaBase >= 0 ? '+' : ''}{data.deltaBase}%
            </span>
          </div>
          <div className="pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-1 text-[10px] text-slate-500">
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-medical-granulation" /> Mô đỏ: {data.red}%</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-medical-slough" /> Vảy vàng: {data.yellow}%</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-medical-necrotic" /> Hoại tử: {data.black}%</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-medical-epithelial" /> Rìa hồng: {data.pink}%</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-oceanic-100 bg-white p-5 shadow-sm space-y-4">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-oceanic">Tiến Trình Co Nhỏ Diện Tích (cm²) & Chỉ Số WHI</h3>
            <span className="rounded bg-oceanic-50 px-2 py-0.5 text-[10px] font-bold text-oceanic-700 border border-oceanic-200">
              RECOVERY CURVE
            </span>
          </div>
          <p className="text-[11px] text-dusk-500">Biểu đồ đối chiếu diện tích vật lý và chỉ số lành thương theo thời gian</p>
        </div>

        <div className="flex items-center gap-2 bg-azure-mist/60 px-3 py-1.5 rounded-xl border border-oceanic-200">
          {isProgressing ? (
            <TrendingDown className="h-4 w-4 text-emerald-600" />
          ) : (
            <TrendingUp className="h-4 w-4 text-red-600" />
          )}
          <span className="text-xs font-bold text-slate-800">
            Tổng giảm: <span className={isProgressing ? "text-emerald-600" : "text-red-600"}>{totalReductionPct}%</span> ({initialArea} → {currentArea} cm²)
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#002B8C" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#002B8C" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF4FF" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: "#3E5D8E", fontWeight: 600 }}
              axisLine={{ stroke: "#D9E5FD" }}
              tickLine={false}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 11, fill: "#002B8C", fontWeight: 600 }}
              axisLine={{ stroke: "#D9E5FD" }}
              tickLine={false}
              unit=" cm²"
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#10B981", fontWeight: 600 }}
              axisLine={{ stroke: "#D9E5FD" }}
              tickLine={false}
              unit=" pts"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={32}
              formatter={(value) => <span className="text-[11px] font-bold text-slate-700">{value === "area" ? "Diện Tích (cm²)" : "Chỉ Số WHI (0-100)"}</span>}
            />
            
            <ReferenceLine y={0.1} yAxisId="left" stroke="#10B981" strokeDasharray="3 3" label={{ value: "Khép Miệng Liền Sẹo", fill: "#10B981", fontSize: 10 }} />

            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="area" 
              name="area"
              stroke="#002B8C" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#areaGradient)" 
              dot={{ r: 4, fill: "#002B8C", strokeWidth: 2, stroke: "#FFFFFF" }}
              activeDot={{ r: 6, fill: "#0F52BA" }}
            />

            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="whi" 
              name="whi"
              stroke="#10B981" 
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#10B981" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
