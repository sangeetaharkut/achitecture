/**
 * Product Recommendations Component
 * Displays trending and recommended products
 */

'use client';

interface TrendingProduct {
  id: number;
  name: string;
  trend: string;
  growth: number;
}

export function HeavyProductRecommendations() {
  const mockRecommendations: TrendingProduct[] = [
    { id: 1, name: 'Wireless Headphones', trend: '📈 Hot Seller', growth: 45 },
    { id: 2, name: 'Laptop Stand', trend: '🔥 Trending', growth: 32 },
    { id: 3, name: 'USB-C Hub', trend: '⭐ Best Rated', growth: 28 },
    { id: 4, name: 'Phone Case', trend: '💫 Popular', growth: 22 },
  ];

  return (
    <div className="bg-linear-to-r from-blue-100 to-purple-100 rounded-lg border p-8 my-8 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Trending & Recommended</h2>
        <p className="text-gray-700 text-sm mt-2">Powered by AI-driven analytics</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {mockRecommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-3">{rec.trend.split(' ')[0]}</div>
            <h3 className="font-semibold text-gray-900">{rec.name}</h3>
            <p className="text-sm text-blue-600 font-bold mt-2">{rec.trend}</p>
            <div className="mt-4 bg-green-100 text-green-800 rounded p-2 text-center">
              <span className="text-lg font-bold">+{rec.growth}%</span>
              <p className="text-xs">growth</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="text-2xl font-bold text-blue-600">2.5M+</p>
          <p className="text-gray-600">Products Analyzed</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-purple-600">15K+</p>
          <p className="text-gray-600">Recommendations</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-pink-600">98%</p>
          <p className="text-gray-600">Accuracy Rate</p>
        </div>
      </div>
    </div>
  );
}
