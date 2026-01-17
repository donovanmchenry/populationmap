'use client';

import { useEffect, useRef } from 'react';

interface FlickeringGridProps {
  className?: string;
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  maxOpacity?: number;
}

export function FlickeringGrid({
  className,
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = 'rgb(100, 100, 100)',
  maxOpacity = 0.2,
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const cellSize = squareSize + gridGap;
    const cols = Math.ceil(canvas.width / cellSize);
    const rows = Math.ceil(canvas.height / cellSize);

    // Initialize grid with random opacities
    const grid: number[][] = [];
    for (let i = 0; i < rows; i++) {
      grid[i] = [];
      for (let j = 0; j < cols; j++) {
        grid[i][j] = Math.random() * maxOpacity;
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          // Randomly flicker cells
          if (Math.random() < flickerChance) {
            grid[i][j] = Math.random() * maxOpacity;
          }

          // Draw square
          if (grid[i][j] > 0) {
            ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', `, ${grid[i][j]})`);
            ctx.fillRect(j * cellSize, i * cellSize, squareSize, squareSize);
          }
        }
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [squareSize, gridGap, flickerChance, color, maxOpacity]);

  return <canvas ref={canvasRef} className={className} />;
}
