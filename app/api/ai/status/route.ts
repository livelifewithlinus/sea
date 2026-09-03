import { NextResponse } from 'next/server';
import { isAIConfigured } from '@/lib/ai/analysis';

export function GET() { return NextResponse.json({ connected: isAIConfigured() }); }
