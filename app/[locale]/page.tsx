import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Home() {
  const t = useTranslations('home');
  const tNav = useTranslations('navigation');

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-4xl font-bold mb-4 text-center">
          {t('title')}
        </h1>
        <p className="text-gray-600 mb-2 text-center max-w-2xl">
          {t('subtitle')}
        </p>
        <p className="text-gray-500 mb-8 text-center max-w-2xl text-sm">
          {t('description')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          <Link
            href="/products"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{t('features.products.title')}</h2>
            <p className="text-gray-600 text-sm">
              {t('features.products.description')}
            </p>
          </Link>
          
          <a
            href="/api/products"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="text-xl font-semibold mb-2">{tNav('api')}</h2>
            <p className="text-gray-600 text-sm">
              Explore the REST API endpoints
            </p>
          </a>
          
          <div className="p-6 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">{t('features.architecture.title')}</h2>
            <p className="text-gray-600 text-sm">
              {t('features.architecture.description')}
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">{t('features.testing.title')}</h2>
            <p className="text-gray-600 text-sm">
              {t('features.testing.description')}
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Read the documentation in ARCHITECTURE.md
          </p>
          <a
            href="https://github.com/sangeetaharkut/achitecture"
            className="text-blue-600 hover:underline text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
