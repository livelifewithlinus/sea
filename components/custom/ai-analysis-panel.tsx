'use client';

import { useState } from 'react';
import { BrainCircuit, CheckCircle2, CircleAlert, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DigitStats } from '@/lib/types';

type Props = { symbol: string; windowSize: number; digitStats: DigitStats; lastDigit: number | null };

export function AIAnalysisPanel({ symbol, windowSize, digitStats, lastDigit }: Props) {
  const [connected, setConnected] = useState<boolean | null>(false);
  const [testing, setTesting] = useState(false);
  const [question, setQuestion] = useState('Summarize the current digit distribution.');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function checkStatus() {
    const response = await fetch('/api/ai/status');
    const data = await response.json();
    setConnected(Boolean(data.connected));
  }
  async function testConnection() {
    setTesting(true); setError('');
    try { const response = await fetch('/api/ai/test', { method: 'POST' }); const data = await response.json(); setConnected(Boolean(data.ok)); if (!data.ok) setError(data.error); }
    catch { setError('Could not reach the AI service.'); setConnected(false); } finally { setTesting(false); }
  }
  async function analyze() {
    setLoading(true); setError(''); setResult('');
    try {
      const response = await fetch('/api/ai/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'digit', symbol, windowSize, tickCount: digitStats.totalTicks, digitCounts: digitStats.counts, digitPercentages: digitStats.percentages, lastDigit, question: question.slice(0, 500) }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Analysis unavailable.'); setResult(data.text);
    } catch (err) { setError(err instanceof Error ? err.message : 'Analysis unavailable.'); } finally { setLoading(false); }
  }
  if (connected === null) void checkStatus();

  return <Card className="border-primary/20 shadow-sm">
    <CardHeader className="flex-row items-center justify-between space-y-0 pb-3"><CardTitle className="flex items-center gap-2 text-base"><BrainCircuit className="h-4 w-4 text-primary" />AI market notes</CardTitle><span className="flex items-center gap-1 text-xs text-muted-foreground">{connected ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />Connected</> : <><CircleAlert className="h-3.5 w-3.5" />API key required</>}</span></CardHeader>
    <CardContent className="space-y-3"><p className="text-xs leading-5 text-muted-foreground">AI interprets the observed window; it does not predict outcomes or place trades.</p>
      <div className="flex gap-2"><input aria-label="Analysis question" value={question} onChange={(event) => setQuestion(event.target.value)} className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /><Button size="sm" onClick={analyze} disabled={loading || digitStats.totalTicks < 10}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}<span className="sr-only">Analyze</span></Button></div>
      {digitStats.totalTicks < 10 && <p className="text-xs text-muted-foreground">Collect at least 10 ticks for analysis.</p>}
      {connected === false && <Button variant="outline" size="sm" onClick={testConnection} disabled={testing}>{testing && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}Test AI connection</Button>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{result && <div className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm leading-6">{result}</div>}
    </CardContent></Card>;
}
