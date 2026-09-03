import { NextResponse } from 'next/server';
import { testAIConnection } from '@/lib/ai/analysis';

export async function POST() {
  const result = await testAIConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
