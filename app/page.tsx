'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { METRIC_REGISTRY } from '@/lib/dungeon/registry';
import { MarketData } from '@/lib/dungeon/types';
import QuantChart from '@/components/charts/QuantChart';
import { Activity, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const DEFAULT_TICKER = 'BTC-USD';

export default function DashboardPage() {
  const [selectedMetricId, setSelectedMetricId] = useState<string>(METRIC_REGISTRY[0].id);

  const selectedMetric = useMemo(() =>
    METRIC_REGISTRY.find(m => m.id === selectedMetricId) || METRIC_REGISTRY[0],
    [selectedMetricId]
  );

  // Market Data Query
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['marketData', DEFAULT_TICKER],
    queryFn: async () => {
      const res = await fetch(`/api/market-data?ticker=${DEFAULT_TICKER}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      return res.json() as Promise<MarketData[]>;
    }
  });

  // Calculate Metric Data
  const chartData = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return [];
    try {
      return selectedMetric.calculate(rawData);
    } catch (e) {
      console.error("Metric calculation failed:", e);
      return [];
    }
  }, [rawData, selectedMetric]);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-zinc-800 flex items-center px-6 justify-between flex-shrink-0 bg-zinc-950">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-serif tracking-widest text-zinc-300 font-bold uppercase">Dungeon Research</h1>
        </div>
        <div className="text-xs text-zinc-500 font-mono bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
          TICKER: <span className="text-zinc-300">{DEFAULT_TICKER}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-950/50 backdrop-blur-sm">
          <div className="p-4 uppercase text-[10px] font-bold text-zinc-500 tracking-wider mb-2 select-none">Metric Registry</div>
          <div className="flex flex-col gap-1 px-2">
            {METRIC_REGISTRY.map(metric => (
              <button
                key={metric.id}
                onClick={() => setSelectedMetricId(metric.id)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-all text-left font-mono",
                  selectedMetricId === metric.id
                    ? "bg-zinc-800 text-green-400 border border-zinc-700 shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent"
                )}
              >
                <span>{metric.name}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Stage */}
        <main className="flex-1 relative flex flex-col p-4">

          <div className="flex-1 w-full h-full rounded-xl border border-zinc-800 bg-zinc-900/20 shadow-inner overflow-hidden relative">
            {/* Metric Info Overlay */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none p-4 bg-zinc-950/20 backdrop-blur-xs rounded-lg border border-transparent">
              <h2 className="text-2xl font-bold text-zinc-100 font-mono tracking-tight">{selectedMetric.name}</h2>
              <p className="text-zinc-500 text-xs font-mono mt-1 max-w-md uppercase tracking-wide">{selectedMetric.description}</p>
            </div>

            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 z-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin w-8 h-8 border-2 border-zinc-700 border-t-green-500 rounded-full" />
                  <span className="text-xs text-zinc-500 font-mono tracking-widest animate-pulse">INITIALIZING QUANT ENGINE...</span>
                </div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center text-red-400 gap-2 bg-zinc-950/80 z-20">
                <AlertCircle className="w-5 h-5" />
                <span className="font-mono text-sm">CONNECTION LOST</span>
              </div>
            ) : (
              <QuantChart
                data={chartData}
                chartType={selectedMetric.chartType}
                title={selectedMetric.name}
                options={selectedMetric.options}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
