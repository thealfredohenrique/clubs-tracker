import { NextRequest, NextResponse } from 'next/server';

// Usar Edge Runtime - IPs diferentes dos servidores Node.js
export const runtime = 'edge';

const EA_API_BASE_URL = 'https://proclubs.ea.com/api/fc';

const DEFAULT_HEADERS: HeadersInit = {
  Accept: 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Referer: 'https://www.ea.com/',
  Origin: 'https://www.ea.com',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const endpoint = searchParams.get('endpoint');
  const platform = searchParams.get('platform');

  if (!endpoint || !platform) {
    return NextResponse.json(
      { error: 'Missing endpoint or platform parameter' },
      { status: 400 }
    );
  }

  // Construir URL da EA
  const eaUrl = new URL(`${EA_API_BASE_URL}${endpoint}`);

  // Passar todos os query params exceto 'endpoint'
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      eaUrl.searchParams.append(key, value);
    }
  });

  try {
    const response = await fetch(eaUrl.toString(), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `EA API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
