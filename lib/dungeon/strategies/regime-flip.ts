import { MetricConfig, MarketData } from '../types';
import { SMA } from 'technicalindicators';

export const regimeFlipStrategy: MetricConfig = {
    id: 'regime_flip',
    name: 'Regime Flip',
    description: 'Proximity of 200 MA (Beta) vs 365 MA (Demarcation)',
    chartType: 'MultiLine',
    calculate: (data: MarketData[]) => {
        const closePrices = data.map(d => d.close);

        // Calculate 200 SMA (Beta)
        const sma200 = SMA.calculate({ period: 200, values: closePrices });

        // Calculate 365 SMA (Demarcation)
        const sma365 = SMA.calculate({ period: 365, values: closePrices });

        // Measurements
        // SMA output is shorter than input by (period - 1)
        // We align to the end of the data array

        // We must return data points where we have values.
        // The scarcity is determined by the 365 SMA (longest period).

        // Offset for 365 SMA
        const offset365 = data.length - sma365.length;

        // For 200 SMA, we need to match the index of 365 SMA
        // data[i + offset365] corresponds to sma365[i]
        // We need sma200 value at the same time.
        // sma200 starts at index (200-1) of raw data.
        // sma365 starts at index (365-1) of raw data.
        // So sma200 is "ahead" or "longer".
        // sma200 index for same time T is: T - 199.
        // sma365 index for time T is: T - 364.

        // Let's iterate based on the SHARED valid range (starting from 365th data point)
        const sharedData = [];

        // Align based on 365 (shorter result)
        for (let i = 0; i < sma365.length; i++) {
            const dataIndex = i + offset365;
            const time = data[dataIndex].time;

            const val365 = sma365[i];

            // Find corresponding 200 SMA value
            // sma200 has length L_200. sma365 has length L_365.
            // Difference in start measure is 365 - 200 = 165.
            // So sMA200 has 165 more points at the start.
            // The i-th point in sma365 corresponds to the (i + 165)-th point in sma200.
            const val200 = sma200[i + (365 - 200)];

            let signal: 'bull' | 'bear' | undefined;

            // Check for Crossover
            // Need previous values
            if (i > 0) {
                const prevVal365 = sma365[i - 1];
                const prevVal200 = sma200[i + (365 - 200) - 1];

                // Bullish Crossover: Yellow (200) crosses ABOVE White (365)
                if (prevVal200 <= prevVal365 && val200 > val365) {
                    signal = 'bull';
                    console.log('RegimeFlip: BULL Signal at', time);
                }
                // Bearish Crossover: Yellow (200) crosses BELOW White (365)
                else if (prevVal200 >= prevVal365 && val200 < val365) {
                    signal = 'bear';
                    console.log('RegimeFlip: BEAR Signal at', time);
                }
            }

            sharedData.push({
                time,
                price: data[dataIndex].close, // Add Price
                beta: val200,
                demarcation: val365,
                signal
            });
        }

        return sharedData;
    },
    options: {
        lines: [
            { key: 'price', color: '#71717a', title: 'Price', lineWidth: 1 }, // Zinc-500
            { key: 'beta', color: '#facc15', title: 'Beta (200 MA)', lineWidth: 2, showMarkers: true }, // Yellow-400
            { key: 'demarcation', color: '#ffffff', title: 'Demarcation (365 MA)', lineWidth: 2, style: 2 } // White, Dashed
        ]
    }
};
