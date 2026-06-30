import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

/**
 * Virtualized Table Component
 * Büyük listeler için performans optimizasyonu
 */
const VirtualizedTable = ({ 
  data, 
  renderRow, 
  rowHeight = 50,
  containerHeight = 600,
  overscan = 5,
}) => {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      style={{
        height: `${containerHeight}px`,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderRow(data[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualizedTable;

