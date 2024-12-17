import { Chart as ChartJS } from 'chart.js';

export const backgroundZonesPlugin = {
  id: 'backgroundZones',
  beforeDraw: (chart, args, options) => {
    const { ctx, chartArea, scales } = chart;
    const { zones } = options || { zones: [] };

    if (!chartArea || !zones) return;

    zones.forEach(zone => {
      const yMin = scales.y.getPixelForValue(zone.yMin);
      const yMax = scales.y.getPixelForValue(zone.yMax);
      
      ctx.fillStyle = zone.color;
      ctx.fillRect(
        chartArea.left,
        yMax,
        chartArea.right - chartArea.left,
        yMin - yMax
      );
    });
  }
};

ChartJS.register(backgroundZonesPlugin);