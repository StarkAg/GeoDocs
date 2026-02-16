import { NextRequest, NextResponse } from 'next/server';

const PDF_BACKEND = process.env.PDF_BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { district, taluk, hobli, village } = body;
    if (!district || !taluk || !hobli || !village) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: district, taluk, hobli, village' },
        { status: 400 }
      );
    }
    const res = await fetch(`${PDF_BACKEND}/api/get-pdf-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ district, taluk, hobli, village }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
