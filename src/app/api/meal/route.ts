import { NextRequest, NextResponse } from 'next/server';
import { fetchMealFromNeis } from '@/lib/neis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const atptCode = searchParams.get('atpt') || 'J10';
  const schoolCode = searchParams.get('school');
  const ymd = searchParams.get('ymd');

  if (!schoolCode || !ymd) {
    return NextResponse.json(
      { error: 'school and ymd parameters are required' },
      { status: 400 }
    );
  }

  try {
    const meal = await fetchMealFromNeis({
      atptCode,
      schoolCode,
      ymd,
      apiKey: process.env.NEIS_API_KEY,
    });

    return NextResponse.json({ meal });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
