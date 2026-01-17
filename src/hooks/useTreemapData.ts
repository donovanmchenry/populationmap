'use client';

import { useMemo } from 'react';
import { hierarchy, treemap } from 'd3-hierarchy';
import { CountryPopulationData, TreemapNode } from '@/types/population';

/**
 * Hook to transform population data into D3 treemap layout
 */
export function useTreemapData(
  data: CountryPopulationData[],
  width: number,
  height: number
) {
  return useMemo(() => {
    if (!data || data.length === 0) return null;

    // Create root node with children
    const root: TreemapNode = {
      name: 'World',
      value: 0,
      children: data.map(country => ({
        name: country.countryName,
        value: country.population,
        data: country,
      })),
    };

    // Create hierarchy and calculate values
    const hierarchyData = hierarchy(root)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create treemap layout
    const treemapLayout = treemap<TreemapNode>()
      .size([width, height])
      .padding(2)
      .round(true);

    // Apply layout
    return treemapLayout(hierarchyData);
  }, [data, width, height]);
}
