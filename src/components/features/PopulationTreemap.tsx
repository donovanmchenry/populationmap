'use client';

import { useRef, useEffect, useState } from 'react';
import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { schemeSet3 } from 'd3-scale-chromatic';
import { useTreemapData } from '@/hooks/useTreemapData';
import { useResponsive } from '@/hooks/useResponsive';
import { CountryPopulationData } from '@/types/population';
import { CountryTooltip } from './CountryTooltip';
import { formatPopulation } from '@/lib/population-calc';

interface Props {
  data: CountryPopulationData[];
}

export function PopulationTreemap({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { width, height } = useResponsive();
  const [hoveredCountry, setHoveredCountry] = useState<CountryPopulationData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Calculate treemap dimensions (with max sizes and padding)
  const treemapWidth = Math.min(width - 40, 1400);
  const treemapHeight = Math.min(height - 200, 800);

  const treemapData = useTreemapData(data, treemapWidth, treemapHeight);

  const colorScale = scaleOrdinal(schemeSet3);

  useEffect(() => {
    if (!svgRef.current || !treemapData) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const cells = svg
      .selectAll('g')
      .data(treemapData.leaves())
      .join('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Draw rectangles
    cells
      .append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => colorScale(d.data.name))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('rx', 4)
      .attr('opacity', 1)
      .style('cursor', 'pointer')
      .style('transition', 'opacity 0.2s')
      .on('mouseenter', function (event, d) {
        select(this).attr('opacity', 0.8);
        if (d.data.data) {
          setHoveredCountry(d.data.data);
          setTooltipPosition({ x: event.pageX, y: event.pageY });
        }
      })
      .on('mousemove', function (event) {
        setTooltipPosition({ x: event.pageX, y: event.pageY });
      })
      .on('mouseleave', function () {
        select(this).attr('opacity', 1);
        setHoveredCountry(null);
      });

    // Add country names
    cells
      .append('text')
      .attr('x', 6)
      .attr('y', 20)
      .attr('fill', '#000')
      .attr('font-size', d => {
        const width = d.x1 - d.x0;
        return Math.max(Math.min(width / 8, 16), 10);
      })
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text(d => {
        const width = d.x1 - d.x0;
        const name = d.data.name;
        // Truncate long names if cell is too small
        if (width < 80) return name.slice(0, 3);
        if (width < 150) return name.slice(0, 10);
        return name;
      });

    // Add population numbers
    cells
      .append('text')
      .attr('x', 6)
      .attr('y', 40)
      .attr('fill', '#333')
      .attr('font-size', d => {
        const width = d.x1 - d.x0;
        return Math.max(Math.min(width / 12, 14), 8);
      })
      .attr('pointer-events', 'none')
      .text(d => {
        if (d.data.data) {
          const width = d.x1 - d.x0;
          const formatted = formatPopulation(d.data.data.population);
          // Show abbreviated version for small cells
          if (width < 100) {
            const millions = Math.floor(d.data.data.population / 1000000);
            return `${millions}M`;
          }
          return formatted;
        }
        return '';
      });
  }, [treemapData, colorScale]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full flex items-center justify-center">
      <svg
        ref={svgRef}
        width={treemapWidth}
        height={treemapHeight}
        className="bg-gray-50 rounded-lg shadow-lg"
      />
      {hoveredCountry && (
        <CountryTooltip country={hoveredCountry} position={tooltipPosition} />
      )}
    </div>
  );
}
