/**
 * Página de Debug - Teste de Conexão com a API da EA
 *
 * Esta página é um Server Component assíncrono para testar
 * se a comunicação com a API do Pro Clubs está funcionando.
 */

import { searchClubByName, getPlatformDisplayName } from '@/lib/api-client';
import type { Platform } from '@/types/clubs-api';

// ============================================
// CONFIGURAÇÕES DE TESTE
// Altere estes valores para testar diferentes buscas
// ============================================

const PLATFORM: Platform = 'common-gen5';
const CLUB_NAME = 'Fera Enjaulada';

// ============================================
// PAGE COMPONENT
// ============================================

export default async function DebugPage() {
  let result: unknown;
  let error: string | null = null;
  let fetchDuration: number = 0;

  const startTime = Date.now();

  try {
    const response = await searchClubByName(PLATFORM, CLUB_NAME);
    fetchDuration = Date.now() - startTime;

    if (response.success) {
      result = response.data;
    } else {
      error = `API Error: ${response.error.message} (Code: ${response.error.code})`;
    }
  } catch (err) {
    fetchDuration = Date.now() - startTime;
    error = err instanceof Error ? err.message : 'Erro desconhecido';
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🔧 Debug - API Pro Clubs
          </h1>
          <p className="text-gray-400">
            Página de teste para validar a conexão com a API da EA Sports FC
          </p>
        </header>

        {/* Configurações */}
        <section className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-3">
            📋 Configurações do Teste
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Endpoint:</span>
              <code className="ml-2 px-2 py-1 bg-gray-700 rounded text-green-400">
                /allTimeLeaderboard/search
              </code>
            </div>
            <div>
              <span className="text-gray-400">Plataforma:</span>
              <code className="ml-2 px-2 py-1 bg-gray-700 rounded text-blue-400">
                {PLATFORM}
              </code>
              <span className="ml-2 text-gray-500 text-xs">
                ({getPlatformDisplayName(PLATFORM)})
              </span>
            </div>
            <div>
              <span className="text-gray-400">Nome do Clube:</span>
              <code className="ml-2 px-2 py-1 bg-gray-700 rounded text-yellow-400">
                {CLUB_NAME}
              </code>
            </div>
            <div>
              <span className="text-gray-400">Tempo de Resposta:</span>
              <code className="ml-2 px-2 py-1 bg-gray-700 rounded text-purple-400">
                {fetchDuration}ms
              </code>
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="mb-6">
          {error ? (
            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <h2 className="text-lg font-semibold text-red-400 mb-2">
                ❌ Erro na Requisição
              </h2>
              <p className="text-red-300 font-mono text-sm">{error}</p>
            </div>
          ) : (
            <div className="p-4 bg-green-900/50 border border-green-500 rounded-lg">
              <h2 className="text-lg font-semibold text-green-400 mb-2">
                ✅ Conexão Bem Sucedida
              </h2>
              <p className="text-green-300 text-sm">
                A API respondeu corretamente. Veja os dados abaixo.
              </p>
            </div>
          )}
        </section>

        {/* Resultado */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            📦 Resposta da API
          </h2>
          <div className="relative">
            <pre className="p-4 bg-gray-950 border border-gray-700 rounded-lg overflow-x-auto text-sm text-gray-300 max-h-[600px] overflow-y-auto">
              {error
                ? JSON.stringify({ error }, null, 2)
                : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </section>

        {/* Dicas */}
        <section className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-3">
            💡 Dicas
          </h2>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>
              • Altere as constantes <code className="text-yellow-400">PLATFORM</code> e{' '}
              <code className="text-yellow-400">CLUB_NAME</code> no topo do arquivo para testar diferentes buscas.
            </li>
            <li>
              • Plataformas disponíveis:{' '}
              <code className="text-blue-400">common-gen5</code> (PS5/Xbox Series/PC),{' '}
              <code className="text-blue-400">common-gen4</code> (PS4/Xbox One),{' '}
              <code className="text-blue-400">nx</code> (Switch)
            </li>
            <li>
              • Se a API retornar erro 403 ou CORS, pode ser necessário ajustar os headers em{' '}
              <code className="text-green-400">src/lib/api-client.ts</code>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
