import { MetricConfig, MarketData } from '../types';

export const priceActionStrategy: MetricConfig = {
    id: 'price_action',
    name: 'Price Action',
    description: 'Standard OHLC Candlesticks',
    chartType: 'Candlestick',
    calculate: (data: MarketData[]) => {
        return data.map(d => ({
            time: d.time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));
    }
};
