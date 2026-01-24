import type { Metadata } from 'next';

// ============================================
// TYPES
// ============================================

interface ClubLayoutProps {
  children: React.ReactNode;
  params: Promise<{ clubId: string }>;
}

// ============================================
// METADATA GENERATION
// ============================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clubId: string }>;
}): Promise<Metadata> {
  const { clubId } = await params;

  // Note: We can't call the EA API server-side (IP blocking issues)
  // So we use a generic title with the club ID, and rely on the
  // client to update the document title if needed
  const title = `Clube #${clubId}`;
  const description = `Veja as estatísticas, elenco e histórico de partidas do clube no EA Sports FC Pro Clubs.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Clubs Tracker`,
      description,
      type: 'website',
      locale: 'pt_BR',
      siteName: 'Clubs Tracker',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Clubs Tracker`,
      description,
    },
  };
}

// ============================================
// LAYOUT COMPONENT
// ============================================

export default async function ClubLayout({ children, params }: ClubLayoutProps) {
  // Just pass through children - metadata is handled above
  return <>{children}</>;
}
