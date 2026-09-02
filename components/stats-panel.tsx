"use client";

import { useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Warehouse,
  Container,
  MapPin,
  TrendingUp,
  Target,
} from "lucide-react";
import { TlcCenter } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";

interface StatsPanelProps {
  centers: TlcCenter[];
}

function formatNumber(n: number): string {
  return n.toLocaleString("ru-RU");
}

export default function StatsPanel({ centers }: StatsPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const total = centers.length;
  const active = centers.filter((c) => c.status === "Действующий").length;
  const building = centers.filter((c) => c.status === "Строится").length;
  const project = centers.filter((c) => c.status === "Проект").length;

  const totalWarehouse = centers.reduce(
    (sum, c) => sum + (c.warehouseArea ?? 0),
    0
  );
  const totalCapacity = centers.reduce((sum, c) => sum + (c.capacity ?? 0), 0);

  const regionCounts: Record<string, number> = {};
  for (const c of centers) {
    regionCounts[c.region] = (regionCounts[c.region] ?? 0) + 1;
  }
  const topRegions = Object.entries(regionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <Card
      size="sm"
      className="absolute bottom-4 left-4 z-[1000] w-72 overflow-hidden rounded-2xl stats-glow border-indigo-100/50"
    >
      <div className="gradient-panel-header px-4 py-2.5">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <span className="flex items-center gap-2 text-xs font-bold text-white drop-shadow-sm">
            <BarChart3 className="size-3.5" />
            Статистика сектора ТЛЦ
          </span>
          {collapsed ? (
            <ChevronUp className="size-3.5 text-white/80" />
          ) : (
            <ChevronDown className="size-3.5 text-white/80" />
          )}
        </button>
      </div>

      {!collapsed && (
        <CardContent className="space-y-3 p-4 gradient-stats-card">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center rounded-xl bg-gradient-to-b from-indigo-50 to-indigo-100/50 p-2.5 shadow-sm ring-1 ring-indigo-200/30">
              <span className="text-lg font-bold text-indigo-700">
                {formatNumber(total)}
              </span>
              <span className="text-[10px] text-indigo-500/80 leading-tight text-center font-medium">
                Всего
              </span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-gradient-to-b from-emerald-50 to-emerald-100/50 p-2.5 shadow-sm ring-1 ring-emerald-200/30">
              <span className="text-lg font-bold text-emerald-700">
                {formatNumber(active)}
              </span>
              <span className="text-[10px] text-emerald-500/80 leading-tight text-center font-medium">
                Действующих
              </span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-gradient-to-b from-amber-50 to-amber-100/50 p-2.5 shadow-sm ring-1 ring-amber-200/30">
              <span className="text-lg font-bold text-amber-700">
                {formatNumber(building)}
              </span>
              <span className="text-[10px] text-amber-500/80 leading-tight text-center font-medium">
                Строится
              </span>
            </div>
          </div>
          {project > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 px-3.5 py-2.5 shadow-sm ring-1 ring-slate-200/30">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Target className="size-3 text-slate-400" />
                Проект
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {formatNumber(project)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-violet-50 to-violet-100/50 px-3.5 py-2.5 shadow-sm ring-1 ring-violet-200/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Warehouse className="size-3.5 text-violet-500" />
              <span>Складской фонд</span>
            </div>
            <span className="text-sm font-semibold text-violet-700">
              {formatNumber(totalWarehouse)} м²
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-orange-50 to-orange-100/50 px-3.5 py-2.5 shadow-sm ring-1 ring-orange-200/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Container className="size-3.5 text-orange-500" />
              <span>Мощности</span>
            </div>
            <span className="text-sm font-semibold text-orange-700">
              {formatNumber(totalCapacity)} TEU
            </span>
          </div>
          {topRegions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold text-indigo-500/70 uppercase tracking-wider">
                <MapPin className="size-3" />
                <span>Регионы-лидеры</span>
              </div>
              <div className="space-y-1.5">
                {topRegions.map(([region, count], i) => (
                  <div
                    key={region}
                    className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-white/60"
                  >
                    <span className="flex items-center gap-1.5 text-muted-foreground truncate mr-2">
                      <span
                        className={`font-bold w-3.5 text-center text-[10px] ${i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-muted-foreground/50"}`}
                      >
                        {i + 1}
                      </span>
                      {region}
                    </span>
                    <span className="font-semibold tabular-nums text-foreground/80">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="text-[10px] text-muted-foreground/40 text-center pt-1 flex items-center justify-center gap-1">
            <TrendingUp className="size-3" />
            По отфильтрованным объектам
          </div>
        </CardContent>
      )}
    </Card>
  );
}
