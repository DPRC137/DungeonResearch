export type ChartType = 'Candlestick' | 'Line' | 'Histogram' | 'Area' | 'MultiLine';

export interface MarketData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface MetricResult {
    time: string;
    value?: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    color?: string;
    signal?: 'bull' | 'bear';
    // Allow for other properties if needed by specific chart types
    [key: string]: any;
}

export interface MetricConfig {
    id: string;
    name: string;
    description: string;
    chartType: ChartType;
    // Takes raw market data -> returns Chart-ready data
    calculate: (rawData: MarketData[]) => MetricResult[];
    // Optional: Overlay configurations or other options
    options?: any;
}
