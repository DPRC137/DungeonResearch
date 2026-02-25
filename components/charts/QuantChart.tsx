'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, LineData, CandlestickSeries, LineSeries, AreaSeries, HistogramSeries } from 'lightweight-charts';
import { ChartType, MetricResult } from '@/lib/dungeon/types';
import { Camera } from 'lucide-react'; // Import Camera icon

interface QuantChartProps {
    data: MetricResult[];
    chartType: ChartType;
    title: string; // Add title prop
    options?: any;
}

export default function QuantChart({ data, chartType, title, options }: QuantChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<any> | null>(null);
    const extraSeriesRef = useRef<ISeriesApi<any>[]>([]);
    const avgLine = useRef<any>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;
        // ... (createChart logic omitted - careful not to break it if not replacing)
        // Wait, I can't partially replace across large blocks without context.
        // Let's rely on the previous tool call having updated the MultiLine block.
        // I need to update the REF initialization and the CLEANUP block of the SECOND useEffect.
    }, []); // This is the first useEffect. I can't touch it easily if I don't see it.

    // I will target the variable declaration at the top

    // And then target the cleanup block in the second useEffect.

    // Let's do declaration first.


    // ... (useEffect setup remains same, omitting for brevity in tool call if possible, but replace_file_content needs contiguous block)
    // Actually, I should use multi_replace or targeted replace to minimize code churn.
    // I will use replace_file_content for the whole file or large chunks if I need to change the signature.
    // Let's do it in chunks.

    // Chunk 1: Update Interface and Import
    // Chunk 2: Update Download Logic (filename, watermark size)
    // Chunk 3: Update Main Render (watermark CSS size, button icon)

    // Wait, I can't use multi_replace easily if I need to change the function signature and imports which are far apart.
    // I will use replace_file_content to update the whole component signature and imports first.

    // Actually, let's just use `replace_file_content` for the Props and Function line first.

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#d4d4d8', // zinc-300
            },
            grid: {
                vertLines: { color: '#27272a' }, // zinc-800
                horzLines: { color: '#27272a' },
            },
            // Initial size, will be updated by resize observer
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            timeScale: {
                borderColor: '#27272a',
                timeVisible: true,
            },
            rightPriceScale: {
                borderColor: '#27272a',
            },
            leftPriceScale: {
                borderColor: '#27272a',
            }
        });

        chartRef.current = chart;

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, []);

    // Update data and series type
    useEffect(() => {
        if (!chartRef.current) return;
        const chart = chartRef.current;

        // Robust Cleanup: Use a Set to ensure unique series removal
        const seriesToRemove = new Set<ISeriesApi<any>>();
        if (seriesRef.current) seriesToRemove.add(seriesRef.current);
        extraSeriesRef.current.forEach(s => seriesToRemove.add(s));

        seriesToRemove.forEach(s => {
            try {
                chart.removeSeries(s);
            } catch (e) {
                console.warn('Failed to remove series:', e);
            }
        });

        seriesRef.current = null;
        extraSeriesRef.current = [];

        if (data.length === 0) return;

        try {
            if (chartType === 'Candlestick') {
                const series = chart.addSeries(CandlestickSeries, {
                    upColor: '#22c55e',
                    downColor: '#ef4444',
                    borderVisible: false,
                    wickUpColor: '#22c55e',
                    wickDownColor: '#ef4444',
                });
                seriesRef.current = series;
                // Filter fields for strict CandlestickData
                const candleData = data.map(d => ({
                    time: d.time,
                    open: d.open!, // User defined strategy ensures these exist
                    high: d.high!,
                    low: d.low!,
                    close: d.close!
                }));
                series.setData(candleData as any); // Type assertion for lightweight-charts compatibility
            } else if (chartType === 'Area') {
                const series = chart.addSeries(AreaSeries, {
                    lineColor: options?.lineColor || '#E84142',
                    topColor: options?.topColor || 'rgba(232, 65, 66, 0.4)',
                    bottomColor: options?.bottomColor || 'rgba(232, 65, 66, 0.0)',
                    lineWidth: 2,
                    ...(options?.autoscaleInfoProvider ? { autoscaleInfoProvider: options.autoscaleInfoProvider } : {})
                });
                seriesRef.current = series;

                const areaData = data.map(d => ({
                    time: d.time,
                    value: d.value!
                }));

                series.setData(areaData as any);
            } else if (chartType === 'Line') {
                const series = chart.addSeries(LineSeries, {
                    color: '#8b5cf6', // Violet-500
                    lineWidth: 2,
                });
                seriesRef.current = series;

                const lineData = data.map(d => ({
                    time: d.time,
                    value: d.value!
                }));

                series.setData(lineData as any);

                // Apply options like horizontal lines
                if (options && options.horizontalLines) {
                    options.horizontalLines.forEach((line: any) => {
                        series.createPriceLine({
                            price: line.value,
                            color: line.color,
                            lineWidth: 1,
                            lineStyle: line.style || 2, // 2 = Dashed
                            axisLabelVisible: true,
                            title: '',
                        });
                    });
                }
            } else if (chartType === 'Histogram') {
                const series = chart.addSeries(HistogramSeries, {
                    color: '#d4d4d8', // Default color, will be overridden by data
                });
                seriesRef.current = series;

                const histogramData = data.map(d => ({
                    time: d.time,
                    value: d.value!,
                    color: d.color || '#d4d4d8'
                }));

                series.setData(histogramData as any);

                // Apply options like horizontal lines
                if (options && options.horizontalLines) {
                    options.horizontalLines.forEach((line: any) => {
                        series.createPriceLine({
                            price: line.value,
                            color: line.color,
                            lineWidth: 1,
                            lineStyle: line.style || 2,
                            axisLabelVisible: true,
                            title: '',
                        });
                    });
                }
            } else if (chartType === 'MultiLine') {
                if (options && options.lines && Array.isArray(options.lines)) {
                    // Track extra series for cleanup
                    options.lines.forEach((lineConfig: any, index: number) => {
                        let series: ISeriesApi<any>;

                        if (lineConfig.type === 'Area') {
                            series = chart.addSeries(AreaSeries, {
                                priceScaleId: lineConfig.priceScaleId || 'right',
                                lineColor: lineConfig.lineColor || lineConfig.color,
                                topColor: lineConfig.topColor,
                                bottomColor: lineConfig.bottomColor,
                                lineWidth: lineConfig.lineWidth || 2,
                                ...(lineConfig.autoscaleInfoProvider ? { autoscaleInfoProvider: lineConfig.autoscaleInfoProvider } : {})
                            });
                        } else if (lineConfig.type === 'Histogram') {
                            series = chart.addSeries(HistogramSeries, {
                                priceScaleId: lineConfig.priceScaleId || 'right',
                                color: lineConfig.color || '#d4d4d8',
                                priceFormat: lineConfig.priceFormat,
                                lastValueVisible: lineConfig.lastValueVisible ?? false,
                                priceLineVisible: lineConfig.priceLineVisible ?? false,
                            });
                            if (lineConfig.scaleMargins) {
                                chart.priceScale(lineConfig.priceScaleId || 'right').applyOptions({
                                    scaleMargins: lineConfig.scaleMargins,
                                    visible: lineConfig.visible !== false,
                                });
                            }
                        } else {
                            series = chart.addSeries(LineSeries, {
                                priceScaleId: lineConfig.priceScaleId || 'right',
                                color: lineConfig.color,
                                lineWidth: lineConfig.lineWidth || 2,
                                lineStyle: lineConfig.style || 1, // 1 = Solid
                                title: lineConfig.title || '',
                                lastValueVisible: lineConfig.lastValueVisible ?? false, // Disable horizontal extension line
                                priceLineVisible: lineConfig.priceLineVisible ?? false,
                                crosshairMarkerVisible: lineConfig.crosshairMarkerVisible ?? true,
                            });
                        }

                        // Track in extraSeriesRef
                        extraSeriesRef.current.push(series);

                        // Assign the FIRST series (index 0) or specific 'price' series to seriesRef.current
                        if (lineConfig.key === 'price' || (index === 0 && !seriesRef.current)) {
                            seriesRef.current = series;
                        }

                        // Filter out undefined/null values for the chart explicitly if needed
                        const seriesData = data.map(d => {
                            const point: any = {
                                time: d.time,
                                value: d[lineConfig.key]
                            };
                            if (lineConfig.colorKey && d[lineConfig.colorKey]) {
                                point.color = d[lineConfig.colorKey];
                            }
                            return point;
                        }).filter(d => d.value !== undefined && d.value !== null);

                        series.setData(seriesData as any);

                        // Attach price lines if provided
                        if (lineConfig.priceLines && Array.isArray(lineConfig.priceLines)) {
                            lineConfig.priceLines.forEach((pl: any) => {
                                series.createPriceLine({
                                    price: pl.value,
                                    color: pl.color,
                                    lineWidth: pl.lineWidth || 1,
                                    lineStyle: pl.lineStyle || 2,
                                    axisLabelVisible: true,
                                    title: pl.title || '',
                                });
                            });
                        }
                    });
                }
            }

            // Fit content
            chart.timeScale().fitContent();

            // Process Markers (Signals)
            // Find target series for markers (default to main seriesRef if not specified)
            let markerTargetSeries = seriesRef.current;

            // In MultiLine, check if any line has showMarkers: true
            if (chartType === 'MultiLine' && options && options.lines) {
                const markerLineIndex = options.lines.findIndex((l: any) => l.showMarkers);
                if (markerLineIndex !== -1 && extraSeriesRef.current[markerLineIndex]) {
                    // Note: extraSeriesRef might contain the main series too? 
                    // Wait, logic above pushes ALL created series to extraSeriesRef.
                    // So we can index directly.
                    markerTargetSeries = extraSeriesRef.current[markerLineIndex];
                } else {
                    // fall back to beta if not found? No, use default logic.
                    // But wait, extraSeriesRef order matches options.lines order exactly.
                    // So line index i -> extraSeriesRef[i].
                    if (markerLineIndex !== -1) {
                        markerTargetSeries = extraSeriesRef.current[markerLineIndex];
                    }
                }
            }

            if (markerTargetSeries) {
                const markers: any[] = [];
                data.forEach(d => {
                    if (d.signal) {
                        markers.push({
                            time: d.time,
                            // Standard: Bull = Green Arrow Up, position BelowBar (supporting).
                            // Bear = Red Arrow Down, position AboveBar (resisting).

                            color: d.signal === 'bull' ? '#22c55e' : '#ef4444',
                            shape: d.signal === 'bull' ? 'arrowUp' : 'arrowDown',
                            position: d.signal === 'bull' ? 'belowBar' : 'aboveBar',
                            text: d.signal.toUpperCase(),
                            size: 2,
                        });
                    }
                });
                if (typeof (markerTargetSeries as any).setMarkers === 'function') {
                    (markerTargetSeries as any).setMarkers(markers);
                }
            }

            // Dynamic Lines Logic (Removed per user request)
            /*
            const updateDynamicLines = () => {
                 // ... removed
            };
            chart.timeScale().subscribeVisibleLogicalRangeChange(updateDynamicLines);
            */

        } catch (e) {
            console.error("Error updating chart data:", e);
        }

    }, [data, chartType, options]);

    // Download Handler
    const handleDownload = () => {
        if (!chartRef.current) return;

        const canvas = chartRef.current.takeScreenshot();
        // Create a new canvas to composite everything
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = canvas.width;
        outputCanvas.height = canvas.height;

        const ctx = outputCanvas.getContext('2d');
        if (!ctx) return;

        // 1. Fill Background (Zinc-950)
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

        // 2. Draw Chart
        ctx.drawImage(canvas, 0, 0);

        // 3. Draw Watermark (Centered)
        const img = new Image();
        img.src = '/dungeon.svg';
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            // Draw watermark centered with opacity
            const width = outputCanvas.width;
            const height = outputCanvas.height;
            const logoWidth = width * 0.5;
            const logoHeight = (logoWidth * img.height) / img.width;
            const x = (width - logoWidth) / 2;
            const y = (height - logoHeight) / 2;

            ctx.save();
            ctx.globalAlpha = 0.1;
            ctx.drawImage(img, x, y, logoWidth, logoHeight);
            ctx.restore();

            // 4. Draw Overlays (Title, Ticker, Branding)
            ctx.save();
            ctx.fillStyle = '#d4d4d8'; // Zinc-300
            ctx.font = 'bold 24px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(title, 20, 40); // Indicator Name

            ctx.font = '14px monospace';
            ctx.fillStyle = '#71717a'; // Zinc-500
            ctx.fillText('DUNGEON RESEARCH', 20, 65);

            ctx.textAlign = 'right';
            ctx.font = 'bold 16px monospace';
            ctx.fillStyle = '#d4d4d8';
            ctx.fillText('BTC-USD', width - 20, 40);

            ctx.restore();

            // Trigger Download
            const url = outputCanvas.toDataURL('image/png');
            const a = document.createElement('a');
            const cleanTitle = title.replace(/\s+/g, '-').toLowerCase();
            a.download = `${cleanTitle}-dungeon-${Date.now()}.png`;
            a.href = url;
            a.click();
        };

        // Fallback if image fails (still draw text)
        img.onerror = () => {
            // Draw Overlays (Title, Ticker, Branding) without watermark
            const width = outputCanvas.width;
            ctx.save();
            ctx.fillStyle = '#d4d4d8';
            ctx.font = 'bold 24px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(title, 20, 40);

            ctx.font = '14px monospace';
            ctx.fillStyle = '#71717a';
            ctx.fillText('DUNGEON RESEARCH', 20, 65);

            ctx.textAlign = 'right';
            ctx.font = 'bold 16px monospace';
            ctx.fillStyle = '#d4d4d8';
            ctx.fillText('BTC-USD', width - 20, 40);
            ctx.restore();

            const url = outputCanvas.toDataURL('image/png');
            const a = document.createElement('a');
            const cleanTitle = title.replace(/\s+/g, '-').toLowerCase();
            a.download = `${cleanTitle}-dungeon-${Date.now()}.png`;
            a.href = url;
            a.click();
        }
    };

    return (
        <div ref={chartContainerRef} className="w-full h-full relative group">
            {/* Visual Watermark Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 z-0">
                <img src="/dungeon.svg" alt="watermark" className="w-1/2 object-contain grayscale" />
            </div>

            {/* Download Button */}
            <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-green-400 border border-zinc-800 rounded-md shadow-sm backdrop-blur-sm transition-all text-xs font-mono uppercase tracking-wider"
                    title="Export Chart Image"
                >
                    <Camera className="w-4 h-4" />
                    <span>Snapshot</span>
                </button>
            </div>
        </div>
    );
}
