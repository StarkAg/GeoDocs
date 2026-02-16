import { NextResponse } from 'next/server';

const PDF_BACKEND = process.env.PDF_BACKEND_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const res = await fetch(`${PDF_BACKEND}/health`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: 'error', message: 'Backend unreachable' }, { status: 503 });
  }
}
