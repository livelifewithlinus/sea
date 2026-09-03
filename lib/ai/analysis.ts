import OpenAI from 'openai';

export type AnalysisIntent = 'digit' | 'even-odd' | 'match-differ' | 'over-under' | 'sequence' | 'streak' | 'transition' | 'backtest' | 'report';

export interface AnalysisInput {
  intent: AnalysisIntent;
  symbol: string;
  windowSize: number;
  tickCount: number;
  digitCounts: number[];
  digitPercentages: number[];
  lastDigit: number | null;
  question?: string;
}

const insufficient = 'Insufficient data for a reliable analysis.';

function client() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export function isAIConfigured() { return Boolean(process.env.OPENAI_API_KEY); }

export async function testAIConnection() {
  const openai = client();
  if (!openai) return { ok: false, error: 'AI analysis requires an OPENAI_API_KEY.' };
  try {
    await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'Reply with OK.' }], max_tokens: 3 });
    return { ok: true };
  } catch { return { ok: false, error: 'The AI connection test failed. Check the server configuration.' }; }
}

export async function analyzeDigits(input: AnalysisInput) {
  const openai = client();
  if (!openai) throw new Error('AI analysis requires an OPENAI_API_KEY.');
  if (input.tickCount < 10) return insufficient;
  const observed = JSON.stringify(input);
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    max_tokens: 500,
    messages: [
      { role: 'system', content: `You analyze digit-trading observations. Treat the JSON as observed/calculated data only. Never invent frequencies, probabilities, backtests, or outcomes. Do not claim prediction or trading advice. Clearly label estimates and hypotheses. If data is insufficient, reply exactly: ${insufficient} Keep the answer concise with headings: Observation, Caveat, Next step.` },
      { role: 'user', content: `Intent: ${input.intent}\nQuestion: ${input.question || 'Summarize the current pattern.'}\nObserved data: ${observed}` },
    ],
  });
  return response.choices[0]?.message?.content?.trim() || insufficient;
}

export const insufficientDataMessage = insufficient;
