import { MdxArticle } from '@/lib/components/common/MdxArticle';
import { getCustomPageMdx } from '@/lib/services/custom-pages';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh-TW' }];
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const mdxData = await getCustomPageMdx('steal-brainrot-surreal-adventure-game', locale);

  if (!mdxData) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <MdxArticle mdxData={mdxData} />
    </main>
  );
}
