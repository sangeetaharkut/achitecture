/**
 * Heavy Product Analytics Dashboard Component
 * Multiple heavy third-party charting libraries loaded from CDN
 * Intentionally blocks rendering to create 5+ second LCP delay with CLS
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface ProductChartProps {
  productName: string;
  productRating?: number;
}

// Extremely heavy CPU work with bounded memory to avoid Turbopack/runtime crashes
const generateHeavyAnalytics = (productName: string) => {
  let checksum = 0;
  
  // Large synchronous workload that keeps LCP high without allocating huge arrays
  for (let i = 1; i <= 18000000; i++) {
    const base = Math.sin(i) * Math.cos(i) * Math.log(i + 1);
    const mixed = base + Math.sqrt(i % 1000) + (productName.length % 7);
    checksum += (mixed * (i % 13)) / (1 + (i % 17));
  }

  return checksum;
};

// Generate large dataset for table rendering (creates DOM and CLS)
const generateLargeTableData = () => {
  const data = [];
  for (let i = 0; i < 1000; i++) {
    data.push({
      id: i,
      date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sales: Math.floor(Math.random() * 10000),
      revenue: Math.floor(Math.random() * 100000),
      customers: Math.floor(Math.random() * 500),
      rating: (Math.random() * 2 + 3).toFixed(2),
      status: ['active', 'pending', 'completed'][Math.floor(Math.random() * 3)],
    });
  }
  return data;
};

export function ProductChart({ productName, productRating = 4.5 }: ProductChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const areaChartRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tableData] = useState(() => generateLargeTableData());

  useEffect(() => {
    // Heavy computation BEFORE loading charts - blocks the main thread
    const analytics = generateHeavyAnalytics(productName);
    
    const loadScripts = async () => {
      try {
        // Load Chart.js (100+ KB) - synchronously
        await new Promise<void>((resolve) => {
          const chartScript = document.createElement('script');
          chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
          chartScript.async = false;
          chartScript.onload = () => resolve();
          document.head.appendChild(chartScript);
        });

        // Load Plotly (2.5+ MB!) - massive library, synchronously
        await new Promise<void>((resolve) => {
          const plotlyScript = document.createElement('script');
          plotlyScript.src = 'https://cdn.plot.ly/plotly-2.26.0.min.js';
          plotlyScript.async = false;
          plotlyScript.onload = () => resolve();
          document.head.appendChild(plotlyScript);
        });

        // Load D3.js (heavy DOM manipulation library)
        await new Promise<void>((resolve) => {
          const d3Script = document.createElement('script');
          d3Script.src = 'https://d3js.org/d3.v7.min.js';
          d3Script.async = false;
          d3Script.onload = () => resolve();
          document.head.appendChild(d3Script);
        });

        // Load Vega (additional charting library)
        await new Promise<void>((resolve) => {
          const vegaScript = document.createElement('script');
          vegaScript.src = 'https://cdn.jsdelivr.net/npm/vega@5.27.0/build/vega.min.js';
          vegaScript.async = false;
          vegaScript.onload = () => resolve();
          document.head.appendChild(vegaScript);
        });

        // Load Vega-Lite
        await new Promise<void>((resolve) => {
          const vegaLiteScript = document.createElement('script');
          vegaLiteScript.src = 'https://cdn.jsdelivr.net/npm/vega-lite@5.17.0/build/vega-lite.min.js';
          vegaLiteScript.async = false;
          vegaLiteScript.onload = () => resolve();
          document.head.appendChild(vegaLiteScript);
        });

        // Render Doughnut Chart with Chart.js
        if (chartRef.current && (window as any).Chart) {
          const canvas = document.createElement('canvas');
          chartRef.current.appendChild(canvas);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            new (window as any).Chart(ctx, {
              type: 'doughnut',
              data: {
                labels: ['Satisfied (75%)', 'Neutral (15%)', 'Unsatisfied (10%)'],
                datasets: [
                  {
                    data: [75, 15, 10],
                    backgroundColor: [
                      'rgba(34, 197, 94, 0.9)',
                      'rgba(251, 191, 36, 0.9)',
                      'rgba(239, 68, 68, 0.9)',
                    ],
                    borderWidth: 2,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { position: 'bottom' },
                  title: {
                    display: true,
                    text: `${productName} - Customer Satisfaction`,
                    font: { size: 14, weight: 'bold' },
                  },
                },
              },
            });
          }
        }

        // Render Line Chart with Plotly (very heavy rendering)
        if (lineChartRef.current && (window as any).Plotly) {
          const monthlyData = Array.from({ length: 36 }, (_, i) => ({
            month: `M${i + 1}`,
            sales: Math.floor(Math.random() * 5000) + 1000,
            views: Math.floor(Math.random() * 50000) + 5000,
            rating: (Math.random() * 2 + 3).toFixed(1),
          }));

          const trace1 = {
            x: monthlyData.map(d => d.month),
            y: monthlyData.map(d => d.sales),
            name: 'Sales',
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#3b82f6', width: 3 },
            marker: { size: 8 },
          };

          const trace2 = {
            x: monthlyData.map(d => d.month),
            y: monthlyData.map(d => d.views),
            name: 'Views',
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#ef4444', width: 3 },
            marker: { size: 8 },
          };

          const trace3 = {
            x: monthlyData.map(d => d.month),
            y: monthlyData.map(d => parseFloat(d.rating) * 1000),
            name: 'Rating*1000',
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#10b981', width: 3 },
            marker: { size: 8 },
          };

          const layout = {
            title: `${productName} - 36 Month Performance Trend Analysis`,
            xaxis: { title: 'Timeline' },
            yaxis: { title: 'Count' },
            hovermode: 'x unified',
            plot_bgcolor: '#f9fafb',
            paper_bgcolor: '#ffffff',
            font: { size: 12 },
            height: 600,
          };

          (window as any).Plotly.newPlot(lineChartRef.current, [trace1, trace2, trace3], layout, { responsive: true });
        }

        // Render Bar Chart with Plotly
        if (barChartRef.current && (window as any).Plotly) {
          const categoryData = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty', 'Toys', 'Food'];
          const trace = {
            x: categoryData,
            y: categoryData.map(() => Math.floor(Math.random() * 5000) + 500),
            type: 'bar',
            marker: { color: '#8b5cf6' },
          };

          const layout = {
            title: `${productName} - Category Performance`,
            yaxis: { title: 'Sales Count' },
            height: 400,
          };

          (window as any).Plotly.newPlot(barChartRef.current, [trace], layout, { responsive: true });
        }

        // Render Area Chart with Plotly
        if (areaChartRef.current && (window as any).Plotly) {
          const weeklyData = Array.from({ length: 52 }, (_, i) => ({
            week: `W${i + 1}`,
            revenue: Math.floor(Math.random() * 10000) + 5000,
            profit: Math.floor(Math.random() * 5000) + 1000,
          }));

          const trace1 = {
            x: weeklyData.map(d => d.week),
            y: weeklyData.map(d => d.revenue),
            name: 'Revenue',
            fill: 'tozeroy',
            type: 'scatter',
          };

          const trace2 = {
            x: weeklyData.map(d => d.week),
            y: weeklyData.map(d => d.profit),
            name: 'Profit',
            fill: 'tozeroy',
            type: 'scatter',
          };

          const layout = {
            title: `${productName} - 52 Week Revenue vs Profit`,
            yaxis: { title: 'Amount ($)' },
            height: 400,
          };

          (window as any).Plotly.newPlot(areaChartRef.current, [trace1, trace2], layout, { responsive: true });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading chart libraries:', error);
        setIsLoading(false);
      }
    };

    loadScripts();
  }, [productName]);

  return (
    <div className="space-y-6">
      {/* Doughnut Chart */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Customer Satisfaction Analytics</h3>
        {isLoading && <p className="text-gray-500 text-sm">Loading analytics dashboard...</p>}
        <div ref={chartRef} className="w-full h-80">
          {isLoading && <div className="animate-pulse h-full bg-gray-200 rounded"></div>}
        </div>
      </div>

      {/* 36-Month Line Chart - Heavy Plotly rendering */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">36-Month Performance Trend</h3>
        {isLoading && <p className="text-gray-500 text-sm">Rendering interactive multi-series charts...</p>}
        <div ref={lineChartRef} className="w-full" style={{ minHeight: '600px' }}>
          {isLoading && <div className="animate-pulse h-full bg-gray-200 rounded"></div>}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Category Performance Breakdown</h3>
        {isLoading && <p className="text-gray-500 text-sm">Rendering performance data...</p>}
        <div ref={barChartRef} className="w-full" style={{ minHeight: '400px' }}>
          {isLoading && <div className="animate-pulse h-full bg-gray-200 rounded"></div>}
        </div>
      </div>

      {/* Area Chart */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">52-Week Revenue vs Profit</h3>
        {isLoading && <p className="text-gray-500 text-sm">Rendering financial data...</p>}
        <div ref={areaChartRef} className="w-full" style={{ minHeight: '400px' }}>
          {isLoading && <div className="animate-pulse h-full bg-gray-200 rounded"></div>}
        </div>
      </div>

      {/* Heavy Metrics Grid - Creates CLS as it renders */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Detailed Analytics Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: '$185,230', trend: '+12.5%' },
            { label: 'Units Sold', value: '23,456', trend: '+8.2%' },
            { label: 'Avg Rating', value: `${productRating}⭐`, trend: '+0.3' },
            { label: 'Return Rate', value: '2.1%', trend: '-0.5%' },
            { label: 'Customer NPS', value: '72', trend: '+5' },
            { label: 'Conversion', value: '3.8%', trend: '+0.2%' },
            { label: 'Repeat Purchase', value: '34%', trend: '+4%' },
            { label: 'Avg Order Value', value: '$87.50', trend: '+$12' },
            { label: 'Cart Abandonment', value: '28%', trend: '-3%' },
            { label: 'Pages/Session', value: '4.2', trend: '+0.8' },
            { label: 'Bounce Rate', value: '32%', trend: '-5%' },
            { label: 'Session Duration', value: '3m 42s', trend: '+45s' },
          ].map((metric, idx) => (
            <div key={idx} className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded border">
              <p className="text-xs text-gray-600 font-medium">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <p className="text-sm text-green-600 font-semibold mt-1">{metric.trend}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Large Data Table - Heavy DOM rendering creates CLS */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Transaction History (1000+ rows)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold">Date</th>
                <th className="px-4 py-2 text-left font-semibold">Sales</th>
                <th className="px-4 py-2 text-left font-semibold">Revenue</th>
                <th className="px-4 py-2 text-left font-semibold">Customers</th>
                <th className="px-4 py-2 text-left font-semibold">Rating</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{row.date}</td>
                  <td className="px-4 py-2">{row.sales}</td>
                  <td className="px-4 py-2">${row.revenue.toLocaleString()}</td>
                  <td className="px-4 py-2">{row.customers}</td>
                  <td className="px-4 py-2">{row.rating}⭐</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      row.status === 'active' ? 'bg-green-100 text-green-800' :
                      row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Heavy Content Sections - More CLS */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Reviews Summary */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Customer Reviews Distribution</h3>
          <div className="space-y-4">
            {[
              { stars: 5, percentage: 65, count: 1250 },
              { stars: 4, percentage: 20, count: 385 },
              { stars: 3, percentage: 10, count: 192 },
              { stars: 2, percentage: 3, count: 58 },
              { stars: 1, percentage: 2, count: 38 },
            ].map((rating) => (
              <div key={rating.stars}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{rating.stars}⭐ ({rating.count})</span>
                  <span className="text-gray-600">{rating.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${rating.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitive Analysis */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Competitive Price Analysis</h3>
          <div className="space-y-3">
            {[
              { competitor: 'Our Price', price: '$99.99', badge: 'Best' },
              { competitor: 'Competitor A', price: '$104.99', badge: '+5.0%' },
              { competitor: 'Competitor B', price: '$109.99', badge: '+10.0%' },
              { competitor: 'Competitor C', price: '$94.99', badge: '-5.0%' },
              { competitor: 'Competitor D', price: '$99.99', badge: 'Same' },
            ].map((item) => (
              <div key={item.competitor} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold">{item.competitor}</p>
                  <p className="text-gray-600 text-sm">{item.price}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  item.badge === 'Best' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Comparison Table - More CLS */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Feature Comparison with Competitors</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold">Feature</th>
                <th className="px-4 py-2 text-center font-semibold">Our Product</th>
                <th className="px-4 py-2 text-center font-semibold">Competitor A</th>
                <th className="px-4 py-2 text-center font-semibold">Competitor B</th>
                <th className="px-4 py-2 text-center font-semibold">Competitor C</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Warranty (Years)', ourProduct: '2', a: '1', b: '2', c: '1.5' },
                { feature: 'Battery Life (Hours)', ourProduct: '48', a: '36', b: '42', c: '40' },
                { feature: 'Water Resistant', ourProduct: '✓ IP68', a: '✓ IP65', b: '✓ IP67', c: '✗' },
                { feature: 'Quick Charge', ourProduct: '✓ 30min', a: '✗', b: '✓ 60min', c: '✓ 45min' },
                { feature: 'Wireless Charging', ourProduct: '✓', a: '✓', b: '✗', c: '✓' },
                { feature: 'Voice Control', ourProduct: '✓', a: '✓', b: '✓', c: '✗' },
                { feature: 'Noise Cancellation', ourProduct: '✓ ANC', a: '✓ ANC', b: '✗', c: '✓ Basic' },
                { feature: 'Connectivity', ourProduct: '5G', a: '4G', b: '5G', c: '4G' },
              ].map((row) => (
                <tr key={row.feature} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{row.feature}</td>
                  <td className="px-4 py-2 text-center bg-green-50">{row.ourProduct}</td>
                  <td className="px-4 py-2 text-center">{row.a}</td>
                  <td className="px-4 py-2 text-center">{row.b}</td>
                  <td className="px-4 py-2 text-center">{row.c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
