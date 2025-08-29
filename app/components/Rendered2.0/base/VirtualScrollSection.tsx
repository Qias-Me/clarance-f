/**
 * Virtual Scrolling Component for Large Sections
 * 
 * Optimizes rendering of sections with many fields by only rendering visible items
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { FieldConfig, FieldRenderer } from '../../fields/FieldRenderer';
import { usePerformanceMonitor } from '../../../hooks/usePerformanceMonitor';

interface VirtualScrollSectionProps {
  fields: FieldConfig[];
  itemHeight?: number;
  overscan?: number;
  className?: string;
  renderField: (field: FieldConfig, index: number) => React.ReactNode;
  onScroll?: (scrollTop: number) => void;
}

interface VisibleRange {
  startIndex: number;
  endIndex: number;
  offsetY: number;
}

export const VirtualScrollSection = memo<VirtualScrollSectionProps>(({
  fields,
  itemHeight = 80,
  overscan = 3,
  className = '',
  renderField,
  onScroll
}) => {
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({
    startIndex: 0,
    endIndex: 10,
    offsetY: 0
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const performanceMonitor = usePerformanceMonitor('VirtualScrollSection');
  
  // Calculate total height
  const totalHeight = fields.length * itemHeight;
  
  // Calculate visible range based on scroll position
  const calculateVisibleRange = useCallback((scrollTop: number, containerHeight: number) => {
    performanceMonitor.startMeasure('calculateRange');
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(fields.length, startIndex + visibleCount + overscan * 2);
    const offsetY = startIndex * itemHeight;
    
    performanceMonitor.endMeasure('calculateRange');
    
    return { startIndex, endIndex, offsetY };
  }, [itemHeight, overscan, fields.length, performanceMonitor]);
  
  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const containerHeight = containerRef.current.clientHeight;
    
    const newRange = calculateVisibleRange(scrollTop, containerHeight);
    
    // Only update if range actually changed
    setVisibleRange(prev => {
      if (prev.startIndex !== newRange.startIndex || prev.endIndex !== newRange.endIndex) {
        return newRange;
      }
      return prev;
    });
    
    if (onScroll) {
      onScroll(scrollTop);
    }
  }, [calculateVisibleRange, onScroll]);
  
  // Debounced scroll handler for better performance
  const debouncedScroll = useCallback(() => {
    let rafId: number;
    
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(handleScroll);
    };
  }, [handleScroll])();
  
  // Initial calculation on mount
  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const newRange = calculateVisibleRange(0, containerHeight);
      setVisibleRange(newRange);
    }
  }, [calculateVisibleRange]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const containerHeight = containerRef.current.clientHeight;
        const newRange = calculateVisibleRange(scrollTop, containerHeight);
        setVisibleRange(newRange);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateVisibleRange]);
  
  // Get visible fields
  const visibleFields = fields.slice(visibleRange.startIndex, visibleRange.endIndex);
  
  return (
    <div 
      ref={containerRef}
      className={`virtual-scroll-container ${className}`}
      style={{
        height: '100%',
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={debouncedScroll}
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          ref={scrollRef}
          style={{
            transform: `translateY(${visibleRange.offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleFields.map((field, localIndex) => {
            const globalIndex = visibleRange.startIndex + localIndex;
            return (
              <div
                key={field.id || globalIndex}
                style={{ height: itemHeight }}
                className="virtual-item"
              >
                {renderField(field, globalIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

VirtualScrollSection.displayName = 'VirtualScrollSection';

/**
 * Hook for using virtual scrolling with sections
 */
export function useVirtualScroll(
  items: any[],
  itemHeight = 80,
  containerHeight = 600
) {
  const [scrollTop, setScrollTop] = useState(0);
  const performanceMonitor = usePerformanceMonitor('useVirtualScroll');
  
  const visibleRange = React.useMemo(() => {
    performanceMonitor.startMeasure('calculateVisibleItems');
    
    const overscan = 3;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);
    
    performanceMonitor.endMeasure('calculateVisibleItems');
    
    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex),
      offsetY: startIndex * itemHeight,
      totalHeight: items.length * itemHeight
    };
  }, [scrollTop, items.length, itemHeight, containerHeight, performanceMonitor]);
  
  return {
    ...visibleRange,
    onScroll: setScrollTop
  };
}