import { MetricConfig, MarketData } from '../types';
import { RSI } from 'technicalindicators';

export const rsiDivergenceStrategy: MetricConfig = {
    id: 'rsi_14',
    name: 'RSI Heatmap',
    description: '14-day RSI + Price (Red > 70, Green < 30)',
    chartType: 'MultiLine',
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

            // Generate Heatmap colors
            let color = 'rgba(212, 212, 216, 0.2)'; // Faint Zinc-300 for neutral

            if (val > 70) color = 'rgba(239, 68, 68, 0.6)'; // Red-500
            if (val < 30) color = 'rgba(34, 197, 94, 0.6)'; // Green-500

            return {
                time,
                rsi: val,
                price: closePrices[dataIndex],
                heatmap: 1, // Constant value for the heatmap ribbon
                color, // We pass this color specifically for the heatmap
            };
        });
    },
    options: {
        lines: [
            {
                key: 'price',
                title: 'BTC-USD',
                type: 'Line',
                color: '#f59e0b', // Amber-500 for price
                priceScaleId: 'left',
                lineWidth: 1
            },
            {
                key: 'rsi',
                title: 'RSI(14)',
                type: 'Line',
                color: '#8b5cf6', // Violet-500
                priceScaleId: 'right', // Overlay RSI on the right scale
                lineWidth: 2,
                priceLines: [
                    { value: 70, color: '#ef4444', lineStyle: 2 }, // 2 = Dashed
                    { value: 30, color: '#22c55e', lineStyle: 2 },
                ]
            },
            {
                key: 'heatmap',
                title: '',
                type: 'Histogram',
                priceScaleId: 'heatmap_scale', // Give it a dedicated invisible scale
                scaleMargins: { top: 0.92, bottom: 0 }, // Pin strictly to the bottom 8%
                visible: false, // Don't show labels/axis on the actual scale
                priceFormat: {
                    type: 'volume'
                },
                lastValueVisible: false,
                priceLineVisible: false,
                colorKey: 'color' // Custom option parsed by our MultiLine handler
            }
        ]
    }
};
