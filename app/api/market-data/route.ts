import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

// yahooFinance.suppressNotices(['yahooSurvey']);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');

    if (!ticker) {
        return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    try {
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 5);

        // yahoo-finance2 historical accepts string dates or Date objects? 
        // It accepts string dates in YYYY-MM-DD or ISO format, or Date objects usually.
        // period1 is required.

        const queryOptions = {
            period1: oneYearAgo.toISOString().split('T')[0],
            period2: today.toISOString().split('T')[0],
            interval: '1d' as const,
        };

        const result = await yahooFinance.chart(ticker, queryOptions);
        const quotes = result.quotes;

        // Format data for Lightweight Charts
        // Ensure all required fields are present and not null
        const formattedData = quotes.map((quote: any) => {
            // yahoo-finance2 returns Date objects for 'date'
            const timeStr = quote.date instanceof Date
                ? quote.date.toISOString().split('T')[0]
                : new Date(quote.date).toISOString().split('T')[0];

            return {
                time: timeStr,
                open: quote.open,
                high: quote.high,
                low: quote.low,
                close: quote.close,
                volume: quote.volume,
            };
        }).filter((item: any) =>
            item.open !== null &&
            item.high !== null &&
            item.low !== null &&
            item.close !== null
        );

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error('Yahoo Finance Error:', error);
        return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
    }
}
