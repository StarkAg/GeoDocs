import { NextRequest, NextResponse } from 'next/server';

const PDF_BACKEND = process.env.PDF_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const taluk = searchParams.get('taluk');
    const hobli = searchParams.get('hobli');
    const village = searchParams.get('village');
    if (!district || !taluk || !hobli || !village) {
      return NextResponse.json(
        { success: false, error: 'Add query params: ?district=2&taluk=1&hobli=1&village=ALABALA' },
        { status: 400 }
      );
    }
    const url = new URL(`${PDF_BACKEND}/api/get-pdf-url`);
    url.searchParams.set('district', district);
    url.searchParams.set('taluk', taluk);
    url.searchParams.set('hobli', hobli);
    url.searchParams.set('village', village);
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'ngrok-skip-browser-warning': '1' },
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

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
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '1',
      },
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
