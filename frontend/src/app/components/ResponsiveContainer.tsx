import { ReactNode, CSSProperties } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  variant?: 'default' | 'narrow' | 'wide';
  noPadding?: boolean;
  className?: string;
}

/**
 * Responsive Container Component
 * - Mobile (375px): Full width with 16px padding
 * - Tablet (768px): Centered with appropriate max-width
 * - Desktop (1440px): Centered with max-width based on variant
 */
export function ResponsiveContainer({ 
  children, 
  variant = 'default',
  noPadding = false,
  className = ''
}: ResponsiveContainerProps) {
  const getMaxWidth = () => {
    switch (variant) {
      case 'narrow':
        return '600px';
      case 'wide':
        return '1400px';
      default:
        return '1200px';
    }
  };

  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div 
        className="w-full"
        style={{
          maxWidth: getMaxWidth(),
          padding: noPadding ? '0' : '0 16px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: number;
  gap?: string;
  className?: string;
}

/**
 * Responsive Grid Component
 * Uses Tailwind classes for responsive columns
 */
export function ResponsiveGrid({ 
  children, 
  cols = 2,
  gap = '1rem',
  className = ''
}: ResponsiveGridProps) {
  // Tailwind responsive grid classes
  const gridClass = cols === 2 
    ? 'grid grid-cols-1 lg:grid-cols-2' 
    : cols === 3
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    : 'grid grid-cols-1';

  return (
    <div 
      className={`w-full ${gridClass} ${className}`}
      style={{ gap }}
    >
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: ReactNode;
  direction?: 'row' | 'column';
  breakpoint?: 'md' | 'lg';
  gap?: string;
  className?: string;
}

/**
 * Responsive Stack Component
 * Stacks vertically on mobile, horizontal on larger screens
 */
export function ResponsiveStack({
  children,
  direction = 'row',
  breakpoint = 'md',
  gap = '1rem',
  className = ''
}: ResponsiveStackProps) {
  const stackClass = breakpoint === 'md'
    ? 'flex flex-col md:flex-row'
    : 'flex flex-col lg:flex-row';

  return (
    <div 
      className={`${stackClass} ${className}`}
      style={{ gap }}
    >
      {children}
    </div>
  );
}
