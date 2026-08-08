import { NextResponse } from 'next/server';

export async function GET() {
  const backendHealthUrl = process.env.BACKEND_HEALTH_URL || 'http://localhost:4000/health';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(backendHealthUrl, {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ running: true, ...data }, { status: 200 });
    }
  } catch (err) {
    // Backend is offline or unreachable — handle gracefully without throwing 500
  }

  return NextResponse.json({ running: false, message: 'Backend API offline' }, { status: 200 });
}
