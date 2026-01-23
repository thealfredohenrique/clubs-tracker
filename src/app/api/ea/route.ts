import { NextRequest, NextResponse } from 'next/server';

// Usar Edge Runtime - IPs diferentes dos servidores Node.js
export const runtime = 'edge';
// Preferir região mais próxima dos servidores da EA (EUA/Europa)
export const preferredRegion = ['iad1', 'fra1', 'lhr1'];

const EA_API_BASE_URL = 'https://proclubs.ea.com/api/fc';

/**
 * Headers que simulam uma requisição real do site da EA
 * A API parece validar esses headers para autenticação
 */
function getHeaders(): HeadersInit {
  return {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': 'https://proclubs.ea.com/',
    'Origin': 'https://proclubs.ea.com',
    'Host': 'proclubs.ea.com',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
  };
}

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
      headers: getHeaders(),
    });

    // Se não for OK, tentar retornar mais detalhes do erro
    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'No body');
      console.error(`EA API Error: ${response.status}`, errorBody);

      return NextResponse.json(
        {
          error: `EA API error: ${response.status} ${response.statusText}`,
          details: errorBody.substring(0, 500)
        },
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
    console.error('Fetch error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
