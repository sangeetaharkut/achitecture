import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Next.js Feature-Based Architecture
        </h1>
        <p className="text-gray-600 mb-8 text-center max-w-2xl">
          A production-ready example implementing Domain-Driven Design with clean architecture patterns.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          <Link
            href="/products"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Products</h2>
            <p className="text-gray-600 text-sm">
              Browse products with discount calculations
            </p>
          </Link>
          
          <Link
            href="/api/products"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">API Docs</h2>
            <p className="text-gray-600 text-sm">
              Explore the REST API endpoints
            </p>
          </Link>
          
          <div className="p-6 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">Architecture</h2>
            <p className="text-gray-600 text-sm">
              Repository → Service → Actions → Hooks → Components
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">Features</h2>
            <p className="text-gray-600 text-sm">
              DDD, DI, Repository Pattern, Clean Code
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Read the documentation in ARCHITECTURE.md
          </p>
          <a
            href="https://github.com"
            className="text-blue-600 hover:underline text-sm"
          >
            View on GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
