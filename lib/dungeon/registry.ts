import { priceActionStrategy } from './strategies/price-action';
import { rsiDivergenceStrategy } from './strategies/rsi-divergence';
import { regimeFlipStrategy } from './strategies/regime-flip';
import { MetricConfig } from './types';

export const METRIC_REGISTRY: MetricConfig[] = [
    priceActionStrategy,
    rsiDivergenceStrategy,
    regimeFlipStrategy,
];

export const getMetricById = (id: string): MetricConfig | undefined => {
    return METRIC_REGISTRY.find(m => m.id === id);
};
