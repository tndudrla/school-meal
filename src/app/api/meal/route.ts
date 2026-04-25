import { NextRequest, NextResponse } from 'next/server';
import { fetchMealFromNeis } from '@/lib/neis';
import { getSchool } from '@/lib/schools';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ymd = searchParams.get('ymd');
  const schoolId = searchParams.get('schoolId');

  // 레거시 파라미터(atpt, school)도 계속 받아 외부 호환 유지.
  // 새 호출은 schoolId 만 보내면 됨.
  const legacyAtpt = searchParams.get('atpt');
  const legacySchool = searchParams.get('school');

  if (!ymd) {
    return NextResponse.json(
      { error: 'ymd parameter is required' },
      { status: 400 }
    );
  }

  const school = getSchool(schoolId);
  const atptCode = legacyAtpt ?? school.neis.atptCode;
  const schoolCode = legacySchool ?? school.neis.schoolCode;

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
