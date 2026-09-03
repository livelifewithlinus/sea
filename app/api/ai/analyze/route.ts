import { NextResponse } from 'next/server';
import { analyzeDigits, type AnalysisInput, type AnalysisIntent } from '@/lib/ai/analysis';

const intents = new Set<AnalysisIntent>(['digit', 'even-odd', 'match-differ', 'over-under', 'sequence', 'streak', 'transition', 'backtest', 'report']);

function valid(body: unknown): body is AnalysisInput {
  if (!body || typeof body !== 'object') return false;
  const value = body as Partial<AnalysisInput>;
  return intents.has(value.intent as AnalysisIntent) && typeof value.symbol === 'string' && value.symbol.length <= 40 && typeof value.windowSize === 'number' && Number.isInteger(value.windowSize) && value.windowSize > 0 && value.windowSize <= 10000 && Number.isInteger(value.tickCount) && Array.isArray(value.digitCounts) && value.digitCounts.length === 10 && Array.isArray(value.digitPercentages) && value.digitPercentages.length === 10 && (value.question === undefined || typeof value.question === 'string');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!valid(body) || JSON.stringify(body).length > 20000) return NextResponse.json({ error: 'Invalid analysis payload.' }, { status: 400 });
    const text = await analyzeDigits(body);
    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis unavailable.';
    return NextResponse.json({ error: message.includes('OPENAI_API_KEY') ? message : 'Analysis unavailable right now.' }, { status: 503 });
  }
}
