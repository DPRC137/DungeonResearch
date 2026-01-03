import { MetricConfig, MarketData } from '../types';
import { RSI } from 'technicalindicators';

export const rsiDivergenceStrategy: MetricConfig = {
    id: 'rsi_14',
    name: 'RSI Heatmap',
    description: '14-day RSI (Red > 70, Green < 30)',
    chartType: 'Line',
    calculate: (data: MarketData[]) => {
        const closePrices = data.map(d => d.close);
        const rsiValues = RSI.calculate({
            values: closePrices,
            period: 14
        });

        // RSI output length is input length - period
        const offset = data.length - rsiValues.length;

        return rsiValues.map((val, i) => {
            const dataIndex = i + offset;
            const time = data[dataIndex].time;
            let color = '#d4d4d8'; // Default Zinc-300

            if (val > 70) color = '#ef4444'; // Red-500
            if (val < 30) color = '#22c55e'; // Green-500

            return {
                time,
                value: val,
                color
            };
        });
    },
    options: {
        priceScaleId: 'right', // or distinct scale?
        // Custom options for the Chart component to read
        horizontalLines: [
            { value: 70, color: '#ef4444', style: 1 }, // 1 = Solid, 2 = Dashed
            { value: 30, color: '#22c55e', style: 1 },
        ]
    }
};
