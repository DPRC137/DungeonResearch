import { MetricConfig, MarketData } from '../types';

export const athRiskStrategy: MetricConfig = {
    id: 'ath_risk',
    name: 'ATH Drawdown Risk',
    description: 'Score from 0 (deep drawdown) to 100 (near ATH)',
    chartType: 'MultiLine',
    calculate: (data: MarketData[]) => {
        const ratios: number[] = [];
        const result: { time: string; risk: number | null; price: number }[] = [];
        let rollingATH = -Infinity;

        for (let i = 0; i < data.length; i++) {
            const currentPrice = data[i].close;
            if (currentPrice > rollingATH) {
                rollingATH = currentPrice;
            }

            const currentRatio = currentPrice / rollingATH;
            ratios.push(currentRatio);

            let riskScore: number | null = null; // Filter early noise by defaulting to null

            if (i >= 30) {
                let countHigher = 0;
                // Look strictly at past days (0 to i-1)
                for (let j = 0; j < i; j++) {
                    if (ratios[j] > currentRatio) {
                        countHigher++;
                    }
                }
                riskScore = (1 - (countHigher / i)) * 100;
            }

            result.push({
                time: data[i].time,
                risk: riskScore,
                price: currentPrice
            });
        }

        return result;
    },
    options: {
        lines: [
            {
                type: 'Area',
                key: 'risk',
                priceScaleId: 'right',
                lineColor: '#ef5350',
                topColor: 'rgba(239, 83, 80, 0.4)',
                bottomColor: 'rgba(239, 83, 80, 0.0)',
                autoscaleInfoProvider: () => ({
                    priceRange: {
                        minValue: 0,
                        maxValue: 100,
                    },
                    margins: {
                        above: 0,
                        below: 0,
                    },
                }),
                priceLines: [
                    { value: 80, color: '#ef5350', lineStyle: 2, lineWidth: 1, title: 'High Risk' },
                    { value: 20, color: '#4caf50', lineStyle: 2, lineWidth: 1, title: 'Low Risk' }
                ]
            },
            {
                type: 'Line',
                key: 'price',
                priceScaleId: 'left',
                color: '#B2B5BE',
                lineWidth: 2,
                crosshairMarkerVisible: false
            }
        ]
    }
};
