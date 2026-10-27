'use client';

import { useEffect, useRef } from 'react';

interface SimpleChartsProps {
  productName: string;
  productRating?: number;
}

export function SimpleCharts({ productName, productRating = 4.5 }: SimpleChartsProps) {
  const doughnutRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Draw Doughnut Chart
    if (doughnutRef.current) {
      const canvas = doughnutRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 80;
        
        // Background
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw segments: Satisfied (75%), Neutral (15%), Unsatisfied (10%)
        const data = [
          { value: 0.75, color: '#22c55e', label: 'Satisfied' },
          { value: 0.15, color: '#fbbf24', label: 'Neutral' },
          { value: 0.10, color: '#ef4444', label: 'Unsatisfied' },
        ];

        let currentAngle = -Math.PI / 2;
        data.forEach(({ value, color }) => {
          const sliceAngle = value * 2 * Math.PI;
          
          // Outer arc
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
          ctx.lineTo(centerX, centerY);
          ctx.fillStyle = color;
          ctx.fill();
          
          // Inner circle (doughnut hole)
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius * 0.6, currentAngle, currentAngle + sliceAngle);
          ctx.lineTo(centerX + Math.cos(currentAngle) * radius * 0.6, centerY + Math.sin(currentAngle) * radius * 0.6);
          ctx.fillStyle = '#f9fafb';
          ctx.fill();
          
          currentAngle += sliceAngle;
        });

        // Title
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 16px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${productName} - Satisfaction`, canvas.width / 2, 20);
      }
    }

    // Draw Line Chart
    if (lineRef.current) {
      const canvas = lineRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Background
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
          const y = 40 + (i * (canvas.height - 80) / 5);
          ctx.beginPath();
          ctx.moveTo(40, y);
          ctx.lineTo(canvas.width - 10, y);
          ctx.stroke();
        }

        // Sample data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const salesData = [1000, 2200, 1800, 2500, 2100, 2800];
        const width = (canvas.width - 50) / months.length;
        const maxSales = 3000;

        // Draw line
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        months.forEach((_, i) => {
          const x = 50 + i * width + width / 2;
          const y = canvas.height - 30 - (salesData[i] / maxSales) * (canvas.height - 80);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#3b82f6';
        months.forEach((_, i) => {
          const x = 50 + i * width + width / 2;
          const y = canvas.height - 30 - (salesData[i] / maxSales) * (canvas.height - 80);
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = '#666';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        months.forEach((month, i) => {
          const x = 50 + i * width + width / 2;
          ctx.fillText(month, x, canvas.height - 5);
        });

        // Title
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 16px system-ui';
        ctx.fillText('12-Month Sales Trend', canvas.width / 2, 20);
      }
    }

    // Draw Bar Chart
    if (barRef.current) {
      const canvas = barRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Background
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books'];
        const values = [4500, 3200, 2800, 2100, 1500];
        const maxValue = 5000;
        const barWidth = (canvas.width - 60) / categories.length;

        // Draw bars
        ctx.fillStyle = '#8b5cf6';
        values.forEach((value, i) => {
          const x = 40 + i * barWidth + barWidth * 0.1;
          const barHeight = (value / maxValue) * (canvas.height - 80);
          const y = canvas.height - 30 - barHeight;
          ctx.fillRect(x, y, barWidth * 0.8, barHeight);
        });

        // Draw labels
        ctx.fillStyle = '#666';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        categories.forEach((cat, i) => {
          const x = 40 + i * barWidth + barWidth / 2;
          ctx.fillText(cat, x, canvas.height - 5);
        });

        // Title
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 16px system-ui';
        ctx.fillText('Category Performance', canvas.width / 2, 20);
      }
    }
  }, [productName]);

  return (
    <div className="space-y-6">
      {/* Doughnut Chart */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Customer Satisfaction</h3>
        <canvas
          ref={doughnutRef}
          width={500}
          height={250}
          className="w-full"
        />
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }}></div>
            <span>Satisfied (75%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fbbf24' }}></div>
            <span>Neutral (15%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Unsatisfied (10%)</span>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">12-Month Sales Trend</h3>
        <canvas
          ref={lineRef}
          width={600}
          height={300}
          className="w-full"
        />
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Category Performance</h3>
        <canvas
          ref={barRef}
          width={600}
          height={300}
          className="w-full"
        />
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: '$185,230', trend: '+12.5%' },
            { label: 'Units Sold', value: '23,456', trend: '+8.2%' },
            { label: 'Avg Rating', value: `${productRating}⭐`, trend: '+0.3' },
            { label: 'Conversion', value: '3.8%', trend: '+0.2%' },
          ].map((metric, idx) => (
            <div key={idx} className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded border">
              <p className="text-xs text-gray-600 font-medium">{metric.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <p className="text-sm text-green-600 font-semibold mt-1">{metric.trend}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
