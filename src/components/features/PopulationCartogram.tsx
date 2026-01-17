'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { CountryPopulationData } from '@/types/population';
import { CountryTooltip } from './CountryTooltip';
import { getCountryPosition } from '@/lib/geographic-positions';
import { getFlagUrl } from '@/lib/country-flags';
import { getCountryCoordinates } from '@/lib/country-coordinates';
import { FlickeringGrid } from '@/components/ui/flickering-grid';

interface Props {
  data: CountryPopulationData[];
}

export function PopulationCartogram({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const initializedRef = useRef(false);
  const [hoveredCountry, setHoveredCountry] = useState<CountryPopulationData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Initialize map only once
  useEffect(() => {
    if (!svgRef.current || !data.length || initializedRef.current) return;
    initializedRef.current = true;

    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create zoom container
    const g = svg.append('g');

    // Create geographic projection (Natural Earth projection looks nice)
    const projection = d3.geoNaturalEarth1()
      .scale(width / 6)
      .translate([width / 2, height / 2]);

    // Prepare data with positions and radii
    interface Node extends d3.SimulationNodeDatum {
      countryData: CountryPopulationData;
      radius: number;
      targetX: number;
      targetY: number;
    }

    const nodes: Node[] = [];

    data.forEach(countryData => {
      const coords = getCountryCoordinates(countryData.countryCode);
      if (!coords) return;

      // Project lat/lon to screen coordinates
      const projected = projection([coords.lon, coords.lat]);
      if (!projected) return;

      const [targetX, targetY] = projected;

      // Calculate radius based on population (square root for area proportionality)
      const radius = Math.sqrt(countryData.population / 1000000) * 2;

      nodes.push({
        countryData,
        radius,
        targetX,
        targetY,
        x: targetX,
        y: targetY
      });
    });

    // Create force simulation to prevent overlaps
    const simulation = d3.forceSimulation(nodes)
      .force('collision', d3.forceCollide<Node>().radius(d => d.radius + 2).strength(0.9))
      .force('x', d3.forceX<Node>(d => d.targetX).strength(0.1))
      .force('y', d3.forceY<Node>(d => d.targetY).strength(0.1))
      .stop();

    // Run simulation synchronously
    for (let i = 0; i < 300; i++) {
      simulation.tick();
    }

    // Calculate the width of one "world" in pixels for wrapping
    const worldWidth = projection([180, 0])![0] - projection([-180, 0])![0];

    // Now render the countries at their simulated positions
    // Draw each country three times (left, center, right) for seamless wrapping
    const longitudeOffsets = [-worldWidth, 0, worldWidth];

    nodes.forEach(node => {
      const countryData = node.countryData;
      const baseX = node.x!;
      const y = node.y!;
      const radius = node.radius;

      longitudeOffsets.forEach((xOffset, offsetIndex) => {
        const x = baseX + xOffset;

        // Create group for this country
        const countryGroup = g.append('g')
          .attr('transform', `translate(${x},${y})`)
          .attr('data-country', countryData.countryCode);

        // Create clipPath for circular flag (unique ID for each copy)
        const clipId = `clip-${countryData.countryCode}-${offsetIndex}`;
        svg.append('defs').append('clipPath')
          .attr('id', clipId)
          .append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', radius);

        // Circle background
        countryGroup.append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', radius)
          .attr('fill', '#27272a')
          .attr('stroke', '#3f3f46')
          .attr('stroke-width', 2)
          .attr('opacity', 0.95);

        // Flag image
        const flagUrl = getFlagUrl(countryData.countryCode);
        if (flagUrl) {
          countryGroup.append('image')
            .attr('xlink:href', flagUrl)
            .attr('x', -radius)
            .attr('y', -radius)
            .attr('width', radius * 2)
            .attr('height', radius * 2)
            .attr('clip-path', `url(#${clipId})`)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('opacity', 0.8);
        }

        // Hover overlay circle
        countryGroup.append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', radius)
          .attr('fill', 'transparent')
          .attr('stroke', 'transparent')
          .attr('stroke-width', 3)
          .attr('cursor', 'pointer')
          .on('mouseenter', function(event) {
            d3.select(this)
              .attr('stroke', '#e4e4e7')
              .attr('stroke-width', 4);
            setHoveredCountry(countryData);
            setTooltipPosition({ x: event.pageX, y: event.pageY });
          })
          .on('mousemove', function(event) {
            setTooltipPosition({ x: event.pageX, y: event.pageY });
          })
          .on('mouseleave', function() {
            d3.select(this)
              .attr('stroke', 'transparent')
              .attr('stroke-width', 3);
            setHoveredCountry(null);
          });

      // Country name (for larger countries)
      if (radius > 25) {
        countryGroup.append('text')
          .attr('x', 0)
          .attr('y', radius > 40 ? -radius * 0.7 : 0)
          .attr('text-anchor', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', Math.max(Math.min(radius / 4, 16), 10))
          .attr('font-weight', 'bold')
          .attr('pointer-events', 'none')
          .style('text-shadow', '0 0 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)')
          .text(countryData.countryName.length > 15 && radius < 50
            ? countryData.countryName.substring(0, 12) + '...'
            : countryData.countryName);
      }
      });
    });

    // Setup zoom behavior with wrapping
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        let transform = event.transform;

        // Calculate wrap threshold using the world width
        const wrapThreshold = worldWidth * transform.k;

        // Check if we need to wrap horizontally
        if (transform.x > wrapThreshold / 2) {
          // Wrapped too far right, reset to left
          transform.x -= wrapThreshold;
          svg.call(zoom.transform, transform);
        } else if (transform.x < -wrapThreshold / 2) {
          // Wrapped too far left, reset to right
          transform.x += wrapThreshold;
          svg.call(zoom.transform, transform);
        }

        g.attr('transform', transform);
      });

    svg.call(zoom);

    console.log(`Countries rendered: ${nodes.length}/${data.length}`);

  }, [data.length]);

  if (!data || data.length === 0) {
    return (
      <div className="relative flex items-center justify-center h-screen">
        <FlickeringGrid
          className="absolute inset-0"
          squareSize={8}
          gridGap={12}
          flickerChance={0.3}
          color="rgb(63, 63, 70)"
          maxOpacity={0.15}
        />
        <p className="relative z-10 text-zinc-400 text-xl">Loading population data...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <FlickeringGrid
        className="absolute inset-0"
        squareSize={8}
        gridGap={12}
        flickerChance={0.3}
        color="rgb(63, 63, 70)"
        maxOpacity={0.15}
      />
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="relative z-10"
        style={{ cursor: 'move' }}
      />
      {hoveredCountry && (
        <CountryTooltip country={hoveredCountry} position={tooltipPosition} />
      )}
    </div>
  );
}
