import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    revalidatePath('/', 'layout');
    return NextResponse.json({
      revalidated: true,
      message: 'Alle Preise werden jetzt aktualisiert.',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
