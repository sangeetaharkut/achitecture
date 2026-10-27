/**
 * Heavy Product Analytics Dashboard Component
 * Multiple heavy third-party charting libraries loaded from CDN
 * NOW WITH: Proper error handling, timeouts, and Suspense support
 * Intentionally blocks rendering to create 5+ second LCP delay with CLS
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface ProductChartProps {
  productName: string;
  productRating?: number;
}

// OPTIMIZED: Generate table data lazily (doesn't block rendering)
const generateLargeTableData = () => {
  const data = [];
  for (let i = 0; i < 100; i++) { // Reduced from 1000 for better performance
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

// OPTIMIZED: Load script with timeout and error handling
const loadScriptWithTimeout = (
  src: string,
  timeout = 8000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Don't load if script already exists
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true; // FIXED: Changed from async: false to true (non-blocking!)
    
    const timeoutId = setTimeout(() => {
      script.onerror = null;
      script.onload = null;
      reject(new Error(`Script load timeout: ${src}`));
    }, timeout);

    script.onload = () => {
      clearTimeout(timeoutId);
      resolve();
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to load script: ${src}`));
    };

    document.head.appendChild(script);
  });
};

export function ProductChart({ productName, productRating = 4.5 }: ProductChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const areaChartRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableData] = useState(() => generateLargeTableData());

  useEffect(() => {
    const loadCharts = async () => {
      try {
        setError(null);
        setIsLoading(true);

        // OPTIMIZED: Load scripts in parallel with timeout
        await Promise.all([
          loadScriptWithTimeout('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js', 5000),
          loadScriptWithTimeout('https://cdn.plot.ly/plotly-2.26.0.min.js', 10000),
          loadScriptWithTimeout('https://d3js.org/d3.v7.min.js', 8000),
          loadScriptWithTimeout('https://cdn.jsdelivr.net/npm/vega@5.27.0/build/vega.min.js', 8000)
        ]);

        // OPTIMIZED: Render charts sequentially after all scripts loaded
        renderCharts();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading chart libraries:', error);
        setError(error instanceof Error ? error.message : 'Failed to load analytics');
        setIsLoading(false);
      }
    };

    const renderCharts = () => {
      // Render Doughnut Chart with Chart.js
      if (chartRef.current && (window as any).Chart) {
        // Clear previous content
        chartRef.current.innerHTML = '';
        const canvas = document.createElement('canvas');
        chartRef.current.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          try {
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
          } catch (err) {
            console.error('Error rendering doughnut chart:', err);
          }
        }
      }

      // Render Line Chart with Plotly
      if (lineChartRef.current && (window as any).Plotly) {
        try {
          const monthlyData = Array.from({ length: 12 }, (_, i) => ({ // Reduced from 36
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
            line: { color: '#ef4444', width: 2 },
          };

          const layout = {
            title: `${productName} - 12 Month Performance Trend`,
            xaxis: { title: 'Timeline' },
            yaxis: { title: 'Count' },
            height: 400,
            margin: { b: 50, l: 50, t: 50, r: 50 },
          };

          (window as any).Plotly.newPlot(lineChartRef.current, [trace1, trace2], layout, { responsive: true });
        } catch (err) {
          console.error('Error rendering line chart:', err);
        }
      }

      // Render Bar Chart with Plotly
      if (barChartRef.current && (window as any).Plotly) {
        try {
          const categoryData = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books'];
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
            margin: { b: 50, l: 50, t: 50, r: 50 },
          };

          (window as any).Plotly.newPlot(barChartRef.current, [trace], layout, { responsive: true });
        } catch (err) {
          console.error('Error rendering bar chart:', err);
        }
      }

      // Render Area Chart with Plotly
      if (areaChartRef.current && (window as any).Plotly) {
        try {
          const weeklyData = Array.from({ length: 12 }, (_, i) => ({ // Reduced from 52
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
            title: `${productName} - 12 Week Revenue vs Profit`,
            yaxis: { title: 'Amount ($)' },
            height: 400,
            margin: { b: 50, l: 50, t: 50, r: 50 },
          };

          (window as any).Plotly.newPlot(areaChartRef.current, [trace1, trace2], layout, { responsive: true });
        } catch (err) {
          console.error('Error rendering area chart:', err);
        }
      }
    };

    loadCharts();

    // Cleanup function: Remove scripts on unmount
    return () => {
      if (chartRef.current) chartRef.current.innerHTML = '';
      if (lineChartRef.current) lineChartRef.current.innerHTML = '';
      if (barChartRef.current) barChartRef.current.innerHTML = '';
      if (areaChartRef.current) areaChartRef.current.innerHTML = '';
    };
  }, [productName]);

  return (
    <div className="space-y-6">
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">⚠️ Analytics Loading Issue</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-red-600 hover:text-red-700 text-sm font-medium mt-2 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Doughnut Chart */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Customer Satisfaction Analytics</h3>
        {isLoading && <p className="text-gray-500 text-sm">📊 Loading customer feedback...</p>}
        <div ref={chartRef} className="w-full" style={{ minHeight: '300px' }}>
          {isLoading && <div className="animate-pulse h-full bg-gray-200 rounded"></div>}
        </div>
      </div>

      {/* 12-Month Line Chart - Optimized Plotly rendering */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">12-Month Performance Trend</h3>
        {isLoading && <p className="text-gray-500 text-sm">📈 Rendering performance data...</p>}
        <div ref={lineChartRef} className="w-full" style={{ minHeight: '400px' }}>
          {isLoading && <div className="animate-pulse h-full bg-gray-200 rounded"></div>}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Category Performance Breakdown</h3>
        {isLoading && <p className="text-gray-500 text-sm">📊 Rendering performance data...</p>}
        <div ref={barChartRef} className="w-full" style={{ minHeight: '400px' }}>
          {isLoading && <div className="animate-pulse h-full bg-gray-200 rounded"></div>}
        </div>
      </div>

      {/* Area Chart */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">12-Week Revenue vs Profit</h3>
        {isLoading && <p className="text-gray-500 text-sm">💰 Rendering financial data...</p>}
        <div ref={areaChartRef} className="w-full" style={{ minHeight: '400px' }}>
          {isLoading && <div className="animate-pulse h-full bg-gray-200 rounded"></div>}
        </div>
      </div>

      {/* Metrics Grid - Only render if not loading */}
      {!error && !isLoading && (
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Key Metrics</h3>
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
          ].map((metric, idx) => (
            <div key={idx} className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded border">
              <p className="text-xs text-gray-600 font-medium">{metric.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <p className="text-sm text-green-600 font-semibold mt-1">{metric.trend}</p>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Data Table - Only render if not loading */}
      {!error && !isLoading && (
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold">Date</th>
                <th className="px-4 py-2 text-left font-semibold">Sales</th>
                <th className="px-4 py-2 text-left font-semibold">Revenue</th>
                <th className="px-4 py-2 text-left font-semibold">Customers</th>
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
      )}
    </div>
  );
}
